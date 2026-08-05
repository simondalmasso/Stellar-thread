import type { Provenance } from './truth.js';

export interface Target {
  id: string;
  displayName: string;
  hostStar: string;
  planetName: string;
  raDeg: number;
  decDeg: number;
  distanceLightYears: number;
  exoplanetStatus: 'CONFIRMED';
  rationale: string[];
  score: number;
  provenance: Provenance;
}

const processedAt = '2026-08-05T15:00:00.000Z';
const sourceUrl = 'https://exoplanetarchive.ipac.caltech.edu/';

export const TARGETS: Target[] = [
  { id: 'proxima-b', displayName: 'PROXIMA B', hostStar: 'Proxima Centauri', planetName: 'Proxima Centauri b', raDeg: 217.4292, decDeg: -62.6795, distanceLightYears: 4.2465, exoplanetStatus: 'CONFIRMED', rationale: ['Nearest confirmed exoplanet host', 'Short round-trip horizon', 'Extensive prior observation context'], score: 0.93, provenance: { truthClass: 'OFFICIAL_CATALOG', source: 'NASA Exoplanet Archive / SIMBAD cross-check', sourceUrl, processedAt, transformation: 'Curated target snapshot; distance converted from parsecs where applicable', version: 'targets-2026.08.05', freshness: 'CACHED', limitations: ['Static snapshot; refresh through catalog adapter before operational scheduling'] } },
  { id: 'gj-273-b', displayName: 'GJ 273 B', hostStar: 'GJ 273', planetName: 'GJ 273 b', raDeg: 111.8521, decDeg: 5.2275, distanceLightYears: 12.2, exoplanetStatus: 'CONFIRMED', rationale: ['Nearby confirmed planet', 'Historical directed transmission context', 'Observable from both hemispheres'], score: 0.84, provenance: { truthClass: 'OFFICIAL_CATALOG', source: 'NASA Exoplanet Archive / Sónar Calling context', sourceUrl, processedAt, transformation: 'Curated target snapshot', version: 'targets-2026.08.05', freshness: 'CACHED', limitations: ['No claim of habitability'] } },
  { id: 'ross-128-b', displayName: 'ROSS 128 B', hostStar: 'Ross 128', planetName: 'Ross 128 b', raDeg: 176.9376, decDeg: 0.7993, distanceLightYears: 11.03, exoplanetStatus: 'CONFIRMED', rationale: ['Nearby quiet M dwarf', 'Low declination supports broad facility visibility'], score: 0.82, provenance: { truthClass: 'OFFICIAL_CATALOG', source: 'NASA Exoplanet Archive', sourceUrl, processedAt, transformation: 'Curated target snapshot', version: 'targets-2026.08.05', freshness: 'CACHED', limitations: ['Stellar quietness is relative and model-dependent'] } },
  { id: 'teegarden-b', displayName: 'TEEGARDEN B', hostStar: "Teegarden's Star", planetName: "Teegarden's Star b", raDeg: 43.2538, decDeg: 16.8813, distanceLightYears: 12.5, exoplanetStatus: 'CONFIRMED', rationale: ['Nearby confirmed planet', 'Favorable declination for many northern facilities'], score: 0.79, provenance: { truthClass: 'OFFICIAL_CATALOG', source: 'NASA Exoplanet Archive', sourceUrl, processedAt, transformation: 'Curated target snapshot', version: 'targets-2026.08.05', freshness: 'CACHED', limitations: ['Target properties remain subject to updated orbital solutions'] } },
  { id: 'trappist-1-e', displayName: 'TRAPPIST-1 E', hostStar: 'TRAPPIST-1', planetName: 'TRAPPIST-1 e', raDeg: 346.6224, decDeg: -5.0413, distanceLightYears: 40.66, exoplanetStatus: 'CONFIRMED', rationale: ['Confirmed compact multi-planet system', 'High scientific interest', 'Large existing observation corpus'], score: 0.77, provenance: { truthClass: 'OFFICIAL_CATALOG', source: 'NASA Exoplanet Archive', sourceUrl, processedAt, transformation: 'Curated target snapshot', version: 'targets-2026.08.05', freshness: 'CACHED', limitations: ['Zone-habitable placement does not establish habitability'] } },
  { id: 'lhs-1140-b', displayName: 'LHS 1140 B', hostStar: 'LHS 1140', planetName: 'LHS 1140 b', raDeg: 11.2472, decDeg: -15.2715, distanceLightYears: 48.9, exoplanetStatus: 'CONFIRMED', rationale: ['Confirmed rocky-planet candidate for atmospheric study', 'Southern visibility'], score: 0.72, provenance: { truthClass: 'OFFICIAL_CATALOG', source: 'NASA Exoplanet Archive', sourceUrl, processedAt, transformation: 'Curated target snapshot', version: 'targets-2026.08.05', freshness: 'CACHED', limitations: ['Physical characterization is under active scientific revision'] } }
];

export function getTarget(id: string): Target | undefined { return TARGETS.find(t => t.id === id); }
