import { useMemo, useState } from 'react';
import { encodeMessage } from '../api';
import type { CmpFrame, CmpProfile } from '../lib/cmp';
import type { Target } from '../lib/targets';

const profiles: CmpProfile[] = ['CMP_BEACON','CMP_MATH_BOOTSTRAP','CMP_TEXT','CMP_REPLY_REQUEST'];

export function Composer({ target, onEncoded }: { target: Target; onEncoded(frame: CmpFrame): void }) {
  const [message, setMessage] = useState('Hola desde la Tierra. Esta señal describe números, tiempo y nuestro origen.');
  const [profile, setProfile] = useState<CmpProfile>('CMP_TEXT');
  const [busy, setBusy] = useState(false);
  const estimate = useMemo(() => Math.max(1, new TextEncoder().encode(message).length * 8 * 3), [message]);
  async function submit() {
    setBusy(true);
    try {
      const result = await encodeMessage({ message, targetId: target.id, profile });
      onEncoded(result.data);
    } finally { setBusy(false); }
  }
  return <section className="composer">
    <div className="panel-title"><span>MESSAGE LAB / CMP-1</span><span className="gate">PREPARATION ONLY</span></div>
    <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={2048} aria-label="Mensaje humano" />
    <div className="composer-row">
      <select value={profile} onChange={e => setProfile(e.target.value as CmpProfile)} aria-label="Perfil CMP">
        {profiles.map(p => <option key={p}>{p}</option>)}
      </select>
      <span>{estimate.toLocaleString()} encoded bits</span>
      <button onClick={submit} disabled={busy || !message.trim()}>{busy ? 'ENCODING…' : 'ENCODE MESSAGE'}</button>
    </div>
    <p className="microcopy">No transmission is triggered. The output is a verifiable preparation artifact for operator review.</p>
  </section>;
}
