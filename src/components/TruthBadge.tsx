import type { Provenance } from '../lib/truth';
import { truthLabel } from '../lib/truth';

export function TruthBadge({ provenance }: { provenance: Provenance }) {
  const label = truthLabel(provenance);
  return <span className={`truth truth-${provenance.truthClass.toLowerCase()}`} title={provenance.limitations.join(' · ')}>{label}</span>;
}
