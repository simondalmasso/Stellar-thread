from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path
import hdf5plugin
import h5py
import numpy as np
PINNED_PARENT_SHA256='c9a9a54f4140e3754ffb2455fae4eeb2eb70c8207123116ee953e4fce15c36ac'
SOURCE_URL='http://blpd0.ssl.berkeley.edu/Voyager_data/Voyager1.single_coarse.fine_res.h5'
def sha(path:Path)->str:
 h=hashlib.sha256()
 with path.open('rb') as f:
  for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
 return h.hexdigest()
def canonical(value:object)->bytes:return json.dumps(value,sort_keys=True,separators=(',',':')).encode()
def write_json(path:Path,value:object)->str:
 text=json.dumps(value,separators=(',',':'))+'\n';path.write_text(text);return hashlib.sha256(text.encode()).hexdigest()
def build_preview(fragment:np.ndarray,parent_sha:str,npy_sha:str,source_manifest_sha:str)->dict:
 power=10*np.log10(np.maximum(fragment.astype(np.float64),1e-20))
 if fragment.shape[1]%48:raise ValueError('Authentic preview expects frequency channels divisible by 48')
 group=fragment.shape[1]//48;binned=power.reshape(power.shape[0],48,group).mean(axis=2);p5=float(np.percentile(binned,5));p995=float(np.percentile(binned,99.5));normalized=np.clip((binned-p5)/(p995-p5),0,1);values=np.rint(normalized*255).astype(np.uint8)
 return {'schemaVersion':1,'sourceTruth':'RECORDED_AUTHENTIC','viewTruth':'DERIVED_FROM_RECORDED_AUTHENTIC','classification':'HUMAN_TECHNOLOGICAL_CONTROL','extraterrestrial':False,'parentSha256':parent_sha,'npySha256':npy_sha,'sourceManifestSha256':source_manifest_sha,'sourceDimensions':[int(fragment.shape[0]),int(fragment.shape[1])],'previewDimensions':[int(values.shape[0]),int(values.shape[1])],'dtype':'uint8','transformation':{'input':'float32 linear power','step1':'10*log10(max(x,1e-20))','step2':f'mean contiguous groups of {group} frequency channels','normalization':'clip((x-p5)/(p99.5-p5),0,1) then round(255*x)','p5Db':p5,'p99_5Db':p995},'values':values.tolist()}
def main()->None:
 p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('--out',default='artifacts/authentic-voyager');a=p.parse_args();src=Path(a.source);out=Path(a.out);out.mkdir(parents=True,exist_ok=True);parent_hash=sha(src)
 if parent_hash!=PINNED_PARENT_SHA256:raise SystemExit(f'parent SHA mismatch: {parent_hash}')
 with h5py.File(src,'r') as h:
  ds=h['data'];arr=np.asarray(ds[:,0,:],dtype=np.float32);attrs={k:(v.item() if hasattr(v,'item') else str(v)) for k,v in h.attrs.items()};fch1=float(attrs.get('fch1',8421.386717353016));foff=float(attrs.get('foff',-2.7939677238464355e-6));target=8419.297028;idx=int(round((target-fch1)/foff));lo=max(0,idx-384);hi=min(arr.shape[1],idx+384);fragment=arr[:,lo:hi];npy_path=out/'voyager-control-waterfall.npy';np.save(npy_path,fragment);npy_sha=sha(npy_path);power=10*np.log10(np.maximum(fragment,1e-20));ridge=np.argmax(power,axis=1);times=np.arange(len(ridge))*float(attrs.get('tsamp',18.253611008));freqs=(fch1+(lo+ridge)*foff)*1e6;slope,intercept=np.polyfit(times,freqs,1)
 core={'schemaVersion':2,'truthClass':'RECORDED_AUTHENTIC','classification':'HUMAN_TECHNOLOGICAL_CONTROL','extraterrestrial':False,'sourceFile':src.name,'parentSha256':parent_hash,'sourceUrl':SOURCE_URL,'observedAtUtc':'2016-09-19T18:46:13.000Z','selection':{'frequencyStartMHz':fch1+lo*foff,'frequencyEndMHz':fch1+(hi-1)*foff,'timeIntegrations':int(fragment.shape[0]),'channels':int(fragment.shape[1])},'result':{'peakFrequencyHz':float(intercept),'driftHzPerSecond':float(slope),'peakSnrProxyDb':float(power.max()-np.median(power))},'limitations':['Known human spacecraft downlink','Derived frequency slice, not the full parent observation']};source_manifest_sha=hashlib.sha256(canonical(core)).hexdigest();preview=build_preview(fragment,parent_hash,npy_sha,source_manifest_sha);preview_sha=write_json(out/'voyager-control-preview.json',preview);result={**core,'derivedAssets':{'npy':{'file':'voyager-control-waterfall.npy','sha256':npy_sha,'dtype':'float32','dimensions':[int(fragment.shape[0]),int(fragment.shape[1])]},'preview':{'file':'voyager-control-preview.json','sha256':preview_sha,'dtype':'uint8','dimensions':preview['previewDimensions']}},'derivationManifestSha256':source_manifest_sha};write_json(out/'manifest.json',result);print(json.dumps(result))
if __name__=='__main__':main()
