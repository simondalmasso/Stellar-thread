export interface CandidateEvidence {
  targetAngularConsistency: number;
  temporalWindowConsistency: number;
  dopplerConsistency: number;
  repetitionConsistency: number;
  modulationSimilarity: number;
  multiStationConfidence: number;
  rfiRejectionConfidence: number;
}

export type CandidateState =
  | 'NO_SOURCE'
  | 'OBSERVING'
  | 'RFI_LIKELY'
  | 'NATURAL_SOURCE_LIKELY'
  | 'UNCLASSIFIED_EVENT'
  | 'TECHNOSIGNATURE_CANDIDATE'
  | 'REPEAT_DETECTED'
  | 'MULTI_STATION_COINCIDENCE'
  | 'EXTERNAL_CONFIRMATION_PENDING'
  | 'CONFIRMED_TECHNOLOGICAL'
  | 'CONFIRMED_EXTRATERRESTRIAL'
  | 'REJECTED';

const clamp = (x: number) => Math.max(0, Math.min(1, x));

export function candidateResponseScore(e: CandidateEvidence): number {
  const factors = Object.values(e).map(clamp);
  return factors.reduce((a, b) => a * b, 1);
}

export function classifyCandidate(e: CandidateEvidence, repeated = false): CandidateState {
  if (e.rfiRejectionConfidence < 0.35) return 'RFI_LIKELY';
  const score = candidateResponseScore(e);
  if (e.multiStationConfidence >= 0.8 && repeated && score >= 0.12) return 'MULTI_STATION_COINCIDENCE';
  if (repeated && score >= 0.05) return 'REPEAT_DETECTED';
  if (score >= 0.02) return 'TECHNOSIGNATURE_CANDIDATE';
  return 'UNCLASSIFIED_EVENT';
}

export function canTransitionAutomatically(next: CandidateState): boolean {
  return next !== 'CONFIRMED_EXTRATERRESTRIAL';
}
