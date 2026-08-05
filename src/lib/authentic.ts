export const VOYAGER_CONTROL = {
 id:'voyager1-gbt-2016-control', title:'Voyager 1 downlink — technological control', truthClass:'RECORDED_AUTHENTIC' as const,
 classification:'HUMAN_TECHNOLOGICAL_CONTROL', extraterrestrial:false,
 source:'Berkeley SETI / Breakthrough Listen public Voyager exercise',
 parentFile:'Voyager1.single_coarse.fine_res.h5', parentSha256:'PENDING_CI_VERIFIED_DOWNLOAD',
 observedAtUtc:'2016-09-19T18:46:13.000Z', centerFrequencyMHz:8419.297028, driftHzPerSecond:-0.373093, snr:245.707984,
 channelWidthHz:2.793968, derivationManifestSha256:'PENDING_CI_DERIVATION',
 limitations:['UI preview uses published hit metadata until the CI-derived waterfall artifact is imported','Known human spacecraft downlink; not extraterrestrial'],
 waterfall:Array.from({length:18},(_,t)=>Array.from({length:48},(_,f)=>{const ridge=31-Math.round(t*.32);const d=Math.abs(f-ridge);return Math.max(0,Math.min(1,.05+(d<2?.88-d*.22:0)+((t*17+f*11)%23)/230));}))
};
