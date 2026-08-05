export const VOYAGER_CONTROL = {
 id:'voyager1-gbt-2016-control', title:'Voyager 1 downlink — technological control', truthClass:'RECORDED_AUTHENTIC' as const,
 classification:'HUMAN_TECHNOLOGICAL_CONTROL', extraterrestrial:false,
 source:'Berkeley SETI / Breakthrough Listen public Voyager exercise',
 parentFile:'Voyager1.single_coarse.fine_res.h5', parentSha256:'c9a9a54f4140e3754ffb2455fae4eeb2eb70c8207123116ee953e4fce15c36ac',
 observedAtUtc:'2016-09-19T18:46:13.000Z', centerFrequencyMHz:8419.297027744021, driftHzPerSecond:-0.37410601541473354, snr:15.015602111816406,
 channelWidthHz:2.7939677238464355, derivationManifestSha256:'c335cf6c0f3dfd44ddf2867bffce457e191d581d5235aea2c80320c83ec65362',
 manifestPath:'data/authentic/voyager1-control-manifest.json',
 limitations:['UI preview is a compact visualization; the CI artifact contains the reproducible derived waterfall','Known human spacecraft downlink; not extraterrestrial'],
 waterfall:Array.from({length:18},(_,t)=>Array.from({length:48},(_,f)=>{const ridge=31-Math.round(t*.32);const d=Math.abs(f-ridge);return Math.max(0,Math.min(1,.05+(d<2?.88-d*.22:0)+((t*17+f*11)%23)/230));}))
};
