from __future__ import annotations
import argparse, hashlib, json, math
from pathlib import Path
import hdf5plugin
import h5py
import numpy as np

PINNED_PARENT_SHA256='c9a9a54f4140e3754ffb2455fae4eeb2eb70c8207123116ee953e4fce15c36ac'
SOURCE_URL='http://blpd0.ssl.berkeley.edu/Voyager_data/Voyager1.single_coarse.fine_res.h5'
DB_QUANTUM=1e-6

def sha(path:Path)->str:
 h=hashlib.sha256()
 with path.open('rb') as f:
  for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
 return h.hexdigest()

def canonical(value:object)->bytes:return json.dumps(value,sort_keys=True,separators=(',',':')).encode()

def write_json(path:Path,value:object)->str:
 text=json.dumps(value,separators=(',',':'))+'\n';path.write_text(text);return hashlib.sha256(text.encode()).hexdigest()

def power_db_rows(fragment:np.ndarray)->list[list[float]]:
 # Scalar math plus fixed dB quantization prevents CPU-vectorized float32 log10
 # differences from changing a checked-in preview by one or more uint8 bins.
 return [[round(10.0*math.log10(max(float(value),1e-20)),6) for value in row]
         for row in fragment.tolist()]

def percentile_linear(values:list[float],q:float)->float:
 ordered=sorted(values)
 if not ordered:raise ValueError('Cannot calculate percentile of an empty preview')
 position=(len(ordered)-1)*q
 lower=math.floor(position);upper=math.ceil(position)
 if lower==upper:return ordered[lower]
 fraction=position-lower
 return round(ordered[lower]+(ordered[upper]-ordered[lower])*fraction,6)

def median_stable(values:list[float])->float:
 ordered=sorted(values);n=len(ordered)
 if n==0:raise ValueError('Cannot calculate median of an empty observation')
 if n%2:return ordered[n//2]
 return round((ordered[n//2-1]+ordered[n//2])/2,6)

def build_preview(fragment:np.ndarray,parent_sha:str,npy_sha:str,source_manifest_sha:str)->dict:
 if fragment.shape[1]%48:raise ValueError('Authentic preview expects frequency channels divisible by 48')
 group=fragment.shape[1]//48
 power=power_db_rows(fragment)
 binned=[[round(math.fsum(row[start:start+group])/group,6)
          for start in range(0,len(row),group)] for row in power]
 flattened=[value for row in binned for value in row]
 p5=percentile_linear(flattened,.05);p995=percentile_linear(flattened,.995)
 span=p995-p5
 if not math.isfinite(span) or span<=0:raise ValueError('Preview normalization span must be positive')
 values=[]
 for row in binned:
  rendered=[]
  for value in row:
   normalized=min(1.0,max(0.0,(value-p5)/span))
   # Explicit round-half-up; avoid NumPy's platform/vectorization-dependent path.
   rendered.append(int(math.floor(normalized*255.0+0.5)))
  values.append(rendered)
 return {'schemaVersion':1,'sourceTruth':'RECORDED_AUTHENTIC','viewTruth':'DERIVED_FROM_RECORDED_AUTHENTIC','classification':'HUMAN_TECHNOLOGICAL_CONTROL','extraterrestrial':False,'parentSha256':parent_sha,'npySha256':npy_sha,'sourceManifestSha256':source_manifest_sha,'sourceDimensions':[int(fragment.shape[0]),int(fragment.shape[1])],'previewDimensions':[int(fragment.shape[0]),48],'dtype':'uint8','transformation':{'input':'float32 linear power','step1':'10*log10(max(x,1e-20)), rounded to 1e-6 dB using scalar math','step2':f'mean contiguous groups of {group} frequency channels, rounded to 1e-6 dB','normalization':'linear p5/p99.5 interpolation over sorted binned values; clip to [0,1]; explicit round-half-up to uint8','p5Db':p5,'p99_5Db':p995},'values':values}

def main()->None:
 p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('--out',default='artifacts/authentic-voyager');a=p.parse_args();src=Path(a.source);out=Path(a.out);out.mkdir(parents=True,exist_ok=True);parent_hash=sha(src)
 if parent_hash!=PINNED_PARENT_SHA256:raise SystemExit(f'parent SHA mismatch: {parent_hash}')
 with h5py.File(src,'r') as h:
  ds=h['data'];arr=np.asarray(ds[:,0,:],dtype=np.float32);attrs={k:(v.item() if hasattr(v,'item') else str(v)) for k,v in h.attrs.items()};fch1=float(attrs.get('fch1',8421.386717353016));foff=float(attrs.get('foff',-2.7939677238464355e-6));target=8419.297028;idx=int(round((target-fch1)/foff));lo=max(0,idx-384);hi=min(arr.shape[1],idx+384);fragment=arr[:,lo:hi];npy_path=out/'voyager-control-waterfall.npy';np.save(npy_path,fragment);npy_sha=sha(npy_path)
  power=power_db_rows(fragment);ridge=[max(range(len(row)),key=row.__getitem__) for row in power];tsamp=float(attrs.get('tsamp',18.253611008));times=[i*tsamp for i in range(len(ridge))];freqs=[(fch1+(lo+peak)*foff)*1e6 for peak in ridge];xbar=math.fsum(times)/len(times);ybar=math.fsum(freqs)/len(freqs);den=math.fsum((x-xbar)**2 for x in times)
  if den<=0:raise ValueError('Insufficient time samples for drift fit')
  slope=math.fsum((x-xbar)*(y-ybar) for x,y in zip(times,freqs))/den;intercept=ybar-slope*xbar
  flat=[value for row in power for value in row]
 core={'schemaVersion':2,'truthClass':'RECORDED_AUTHENTIC','classification':'HUMAN_TECHNOLOGICAL_CONTROL','extraterrestrial':False,'sourceFile':src.name,'parentSha256':parent_hash,'sourceUrl':SOURCE_URL,'observedAtUtc':'2016-09-19T18:46:13.000Z','selection':{'frequencyStartMHz':fch1+lo*foff,'frequencyEndMHz':fch1+(hi-1)*foff,'timeIntegrations':int(fragment.shape[0]),'channels':int(fragment.shape[1])},'result':{'peakFrequencyHz':round(intercept,6),'driftHzPerSecond':round(slope,12),'peakSnrProxyDb':round(max(flat)-median_stable(flat),6)},'limitations':['Known human spacecraft downlink','Derived frequency slice, not the full parent observation','Scalar math and 1e-6 dB quantization stabilize cross-runner preview derivation']};source_manifest_sha=hashlib.sha256(canonical(core)).hexdigest();preview=build_preview(fragment,parent_hash,npy_sha,source_manifest_sha);preview_sha=write_json(out/'voyager-control-preview.json',preview);result={**core,'derivedAssets':{'npy':{'file':'voyager-control-waterfall.npy','sha256':npy_sha,'dtype':'float32','dimensions':[int(fragment.shape[0]),int(fragment.shape[1])]},'preview':{'file':'voyager-control-preview.json','sha256':preview_sha,'dtype':'uint8','dimensions':preview['previewDimensions']}},'derivationManifestSha256':source_manifest_sha};write_json(out/'manifest.json',result);print(json.dumps(result))
if __name__=='__main__':main()
