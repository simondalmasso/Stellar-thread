from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path
import h5py, numpy as np

def sha(path:Path)->str:
 h=hashlib.sha256()
 with path.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
 return h.hexdigest()

def main():
 p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('--out',default='artifacts/authentic-voyager');a=p.parse_args();src=Path(a.source);out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
 parent_hash=sha(src)
 with h5py.File(src,'r') as h:
  ds=h['data']; arr=np.asarray(ds[:,0,:],dtype=np.float32); attrs={k:(v.item() if hasattr(v,'item') else str(v)) for k,v in h.attrs.items()}
  # Public exercise's strongest published control region near 8419.297 MHz.
  fch1=float(attrs.get('fch1',8421.386717353016));foff=float(attrs.get('foff',-2.7939677238464355e-6));target=8419.297028
  idx=int(round((target-fch1)/foff));lo=max(0,idx-384);hi=min(arr.shape[1],idx+384);fragment=arr[:,lo:hi]
  np.save(out/'voyager-control-waterfall.npy',fragment)
  power=10*np.log10(np.maximum(fragment,1e-20));ridge=np.argmax(power,axis=1);times=np.arange(len(ridge))*float(attrs.get('tsamp',18.253611008));freqs=(fch1+(lo+ridge)*foff)*1e6;slope,intercept=np.polyfit(times,freqs,1)
 result={'schemaVersion':1,'truthClass':'RECORDED_AUTHENTIC','classification':'HUMAN_TECHNOLOGICAL_CONTROL','extraterrestrial':False,'sourceFile':src.name,'parentSha256':parent_hash,'sourceUrl':'http://blpd0.ssl.berkeley.edu/Voyager_data/Voyager1.single_coarse.fine_res.h5','observedAtUtc':'2016-09-19T18:46:13.000Z','selection':{'frequencyStartMHz':fch1+lo*foff,'frequencyEndMHz':fch1+(hi-1)*foff,'timeIntegrations':int(fragment.shape[0]),'channels':int(fragment.shape[1])},'result':{'peakFrequencyHz':float(intercept),'driftHzPerSecond':float(slope),'peakSnrProxyDb':float(power.max()-np.median(power))},'limitations':['Known human spacecraft downlink','Derived frequency slice, not the full parent observation']}
 raw=json.dumps(result,sort_keys=True,separators=(',',':')).encode();result['derivationManifestSha256']=hashlib.sha256(raw).hexdigest();(out/'manifest.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':main()
