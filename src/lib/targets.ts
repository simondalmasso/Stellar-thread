import catalog from '../data/nearby-stars.generated.json' with { type: 'json' };
import type { Provenance } from './truth.js';

export interface Target {
  id: string; displayName: string; hostStar: string; planetName: string;
  catalogId: string; gaiaSourceId: string | null; hipId: string | null;
  raDeg: number; decDeg: number; distanceLightYears: number; distanceUncertaintyLightYears: number;
  apparentMagnitude: number; colorIndex: number | null; astrometryEpochYear: number;
  pmRaMasYr: number; pmDecMasYr: number; radialVelocityKmS: number | null; positionUncertaintyMas: number;
  exoplanetStatus: 'CONFIRMED'; rationale: string[]; score: number; provenance: Provenance;
}

type CatalogTarget = Omit<Target,'provenance'> & { limitations:string[] };
const sourceUrl = catalog.sources.map((source:{endpoint:string})=>source.endpoint).join(' | ');
const provenance = (limitations:string[]):Provenance => ({
  truthClass:'OFFICIAL_CATALOG',
  source:'NASA Exoplanet Archive + Gaia DR3 normalized versioned snapshot',
  sourceUrl,
  observedAt:`${catalog.epoch}-01-01T00:00:00.000Z`,
  processedAt:catalog.retrievedAt,
  transformation:'Versioned host-star normalization; planet and stellar fields kept distinct',
  version:catalog.catalogId,
  freshness:'CACHED',
  limitations,
});

export const TARGETS:Target[] = (catalog.targets as CatalogTarget[]).map(({limitations,...target})=>({...target,provenance:provenance(limitations)}));
export const CATALOG_META = {
  id:catalog.catalogId,
  retrievedAt:catalog.retrievedAt,
  epoch:catalog.epoch,
  sourceUrl,
  license:'NASA Exoplanet Archive / Gaia source attribution required',
  sha256:catalog.sha256,
  sources:catalog.sources,
};
export function getTarget(id:string){return TARGETS.find(target=>target.id===id)}
