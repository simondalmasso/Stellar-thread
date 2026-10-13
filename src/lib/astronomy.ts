const SPEED_OF_LIGHT_KM_S = 299_792.458;
const JULIAN_YEAR_SECONDS = 365.25 * 86_400;

export function lightYearsToKm(lightYears: number): number {
  return lightYears * SPEED_OF_LIGHT_KM_S * JULIAN_YEAR_SECONDS;
}

export function addLightTravelYears(isoUtc: string, lightYears: number): string {
  const instant = Date.parse(isoUtc);
  if (!Number.isFinite(instant) || lightYears < 0) throw new Error('Invalid travel inputs');
  return new Date(instant + lightYears * JULIAN_YEAR_SECONDS * 1000).toISOString();
}

export function replyHorizon(transmittedAt: string, distanceLightYears: number) {
  return {
    arrivalUtc: addLightTravelYears(transmittedAt, distanceLightYears),
    firstReplyUtc: addLightTravelYears(transmittedAt, distanceLightYears * 2)
  };
}

export function emeRoundTripSeconds(distanceKm = 384_400): number {
  return (distanceKm * 2) / SPEED_OF_LIGHT_KM_S;
}

export function angularSeparationDeg(
  ra1Deg: number,
  dec1Deg: number,
  ra2Deg: number,
  dec2Deg: number
): number {
  const r = Math.PI / 180;
  const ra1 = ra1Deg * r;
  const ra2 = ra2Deg * r;
  const dec1 = dec1Deg * r;
  const dec2 = dec2Deg * r;
  const cos = Math.sin(dec1) * Math.sin(dec2) + Math.cos(dec1) * Math.cos(dec2) * Math.cos(ra1 - ra2);
  return Math.acos(Math.max(-1, Math.min(1, cos))) / r;
}
