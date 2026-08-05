import type { Target } from './targets.js';
const DEG = Math.PI / 180;
export interface AimPointEstimate { raDeg: number; decDeg: number; epochYear: number; uncertaintyArcsec: number; method: string; limitations: string[] }
export function estimateAimPoint(target: Target, epochYear: number): AimPointEstimate {
  const years = epochYear - target.astrometryEpochYear;
  const decRad = target.decDeg * DEG;
  const cosDec = Math.max(0.05, Math.cos(decRad));
  const raDeg = ((target.raDeg + (target.pmRaMasYr * years) / 3_600_000 / cosDec) % 360 + 360) % 360;
  const decDeg = Math.max(-90, Math.min(90, target.decDeg + (target.pmDecMasYr * years) / 3_600_000));
  const limitations = ['Linear proper-motion propagation; not a planetary orbital ephemeris'];
  let uncertaintyArcsec = target.positionUncertaintyMas / 1000 + Math.abs(years) * 0.01;
  if (target.radialVelocityKmS === null) { uncertaintyArcsec += Math.abs(years) * 0.05; limitations.push('Radial velocity unavailable; uncertainty expanded'); }
  return { raDeg, decDeg, epochYear, uncertaintyArcsec, method: 'linear-space-motion-v1', limitations };
}
export function cartesianPosition(target: Target, epochYear = target.astrometryEpochYear): [number, number, number] {
  const aim = estimateAimPoint(target, epochYear);
  const ra = aim.raDeg * DEG, dec = aim.decDeg * DEG, r = target.distanceLightYears;
  return [r * Math.cos(dec) * Math.cos(ra), r * Math.cos(dec) * Math.sin(ra), r * Math.sin(dec)];
}
