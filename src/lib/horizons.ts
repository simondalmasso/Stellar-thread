import { sha256Hex } from './cmp.js';
import { SPEED_OF_LIGHT_M_S } from './reality.js';
export interface HorizonsPlanInput { startUtc:string;stationLatDeg:number;stationLonDeg:number;stationElevationM:number;frequencyHz:number }
export interface HorizonsGeometry { azimuthDeg:number;elevationDeg:number;rangeKm:number;rangeRateKmS:number;oneWayLightSeconds:number;roundTripLightSeconds:number;expectedDopplerHz:number }
export function buildHorizonsUrl(input:HorizonsPlanInput){
 const start=new Date(input.startUtc);if(!Number.isFinite(start.getTime()))throw new Error('Invalid startUtc');const stop=new Date(start.getTime()+60_000);
 const params=new URLSearchParams({format:'json',COMMAND:"'301'",EPHEM_TYPE:"'OBSERVER'",CENTER:"'coord@399'",COORD_TYPE:"'GEODETIC'",SITE_COORD:`'${input.stationLonDeg},${input.stationLatDeg},${input.stationElevationM/1000}'`,START_TIME:`'${start.toISOString()}'`,STOP_TIME:`'${stop.toISOString()}'`,STEP_SIZE:"'1 m'",QUANTITIES:"'4,20'",RANGE_UNITS:"'KM'",TIME_DIGITS:"'SECONDS'",CSV_FORMAT:"'YES'"});
 return `https://ssd.jpl.nasa.gov/api/horizons.api?${params}`;
}
export function parseHorizonsObserver(raw:string,frequencyHz:number):HorizonsGeometry|null{
 const match=raw.match(/\$\$SOE\s*\n([^\n]+)\n/);if(!match)return null;const numeric=match[1].split(',').map(v=>Number(v.trim())).filter(Number.isFinite);if(numeric.length<4)return null;const [azimuthDeg,elevationDeg,rangeKm,rangeRateKmS]=numeric.slice(-4);const expectedDopplerHz=-(rangeRateKmS*1000/SPEED_OF_LIGHT_M_S)*frequencyHz;return {azimuthDeg,elevationDeg,rangeKm,rangeRateKmS,oneWayLightSeconds:rangeKm*1000/SPEED_OF_LIGHT_M_S,roundTripLightSeconds:2*rangeKm*1000/SPEED_OF_LIGHT_M_S,expectedDopplerHz};
}
export function horizonsSnapshotHash(raw:string){return sha256Hex(new TextEncoder().encode(raw))}
