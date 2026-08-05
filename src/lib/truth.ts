export type TruthClass =
  | 'OFFICIAL_CATALOG'
  | 'DERIVED'
  | 'LIVE_OBSERVATORY'
  | 'RECORDED_AUTHENTIC'
  | 'SYNTHETIC'
  | 'HUMAN_REVIEW'
  | 'STALE'
  | 'UNAVAILABLE';

export interface Provenance {
  truthClass: TruthClass;
  source: string;
  sourceUrl?: string;
  observedAt?: string;
  processedAt: string;
  transformation: string;
  version: string;
  hash?: string;
  freshness: 'CURRENT' | 'CACHED' | 'STALE' | 'UNKNOWN';
  limitations: string[];
}

export function mayDisplayLive(provenance: Provenance, now = Date.now()): boolean {
  if (provenance.truthClass !== 'LIVE_OBSERVATORY' || !provenance.observedAt) return false;
  const age = now - Date.parse(provenance.observedAt);
  return Number.isFinite(age) && age >= 0 && age <= 30_000;
}

export function truthLabel(provenance: Provenance): string {
  if (provenance.truthClass === 'LIVE_OBSERVATORY') {
    return mayDisplayLive(provenance) ? 'LIVE' : 'LIVE HEARTBEAT LOST';
  }
  return provenance.truthClass.replaceAll('_', ' ');
}
