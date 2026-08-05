import { useEffect, useMemo, useState } from 'react';
import { apiGet, targetFallback } from './api';
import { addLightTravelYears, replyHorizon } from './lib/astronomy';
import type { CmpFrame } from './lib/cmp';
import { TARGETS, type Target } from './lib/targets';
import { TruthBadge } from './components/TruthBadge';
import { Starfield } from './components/Starfield';
import { Waterfall } from './components/Waterfall';
import { Composer } from './components/Composer';
import { MoonRelay } from './components/MoonRelay';
import { SignalPassport } from './components/SignalPassport';
import { SilenceMap, TransmissionGate, UniversalLanguageViewer } from './components/ScienceViews';

const modes = ['CHAT','SKY','TRANSMIT','LISTEN','CANDIDATES','MOON RELAY','MESSAGE LAB','OBSERVATORIES','ARCHIVE','MISSION CONTROL'] as const;
type Mode = typeof modes[number];

function utcNow() { return new Date().toISOString().replace('T', ' ').replace('.000Z', ' UTC'); }

export default function App() {
  const [targets, setTargets] = useState<Target[]>(TARGETS);
  const [selectedId, setSelectedId] = useState(TARGETS[0].id);
  const [mode, setMode] = useState<Mode>('CHAT');
  const [clock, setClock] = useState(utcNow());
  const [frame, setFrame] = useState<CmpFrame | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => { apiGet('/api/v1/targets', targetFallback).then(r => setTargets(r.data)); }, []);
  useEffect(() => { const i = setInterval(() => setClock(utcNow()), 1000); return () => clearInterval(i); }, []);
  useEffect(() => setReducedMotion(matchMedia('(prefers-reduced-motion: reduce)').matches), []);
  const target = targets.find(t => t.id === selectedId) ?? targets[0];
  const horizon = useMemo(() => replyHorizon('2026-08-05T15:00:00.000Z', target.distanceLightYears), [target]);
  const wave = Math.min(4.4, target.distanceLightYears / 10);

  return <main className="app-shell">
    <header className="topbar">
      <div><strong>stellar thread</strong><small>REAL INTERSTELLAR MESSAGING & LISTENING CONSOLE</small></div>
      <div className="top-status"><span>LISTENING: 0 LIVE / 6 CATALOG TARGETS</span><span>{clock}</span></div>
    </header>
    <nav className="modebar" aria-label="Modos">
      {modes.map(m => <button key={m} className={m === mode ? 'active' : ''} onClick={() => setMode(m)}>{m}</button>)}
    </nav>

    <div className="dashboard">
      <aside className="targets-panel panel">
        <div className="panel-title"><span>TARGETS</span><span>{targets.length}</span></div>
        {targets.map(t => <button className={`target ${t.id === target.id ? 'selected' : ''}`} onClick={() => setSelectedId(t.id)} key={t.id}>
          <span><b>{t.displayName}</b><small>{t.distanceLightYears.toFixed(2)} ly</small></span><em>{Math.round(t.score * 100)}</em>
        </button>)}
        <div className="truth-note"><TruthBadge provenance={target.provenance} /><p>{target.provenance.source}</p></div>
      </aside>

      <section className="sky-panel panel">
        <div className="panel-title"><span>SKY / SIGNAL WAVEFRONT</span><span>c = 299,792.458 km/s</span></div>
        <Starfield target={target} waveRadius={wave} reducedMotion={reducedMotion} />
      </section>

      <aside className="thread-panel panel">
        <div className="panel-title"><span>THREAD — {target.displayName}</span><span>ASYNC</span></div>
        <div className="thread-object">
          <div className="thread-kicker">EARTH MESSAGE #001</div>
          <h2>{frame ? frame.message : 'No physical transmission has been executed.'}</h2>
          <dl>
            <div><dt>Status</dt><dd>{frame ? 'ENCODED' : 'DRAFT'}</dd></div>
            <div><dt>Transmission</dt><dd>AWAITING AUTHORIZED FACILITY</dd></div>
            <div><dt>Distance</dt><dd>{target.distanceLightYears.toFixed(2)} ly</dd></div>
            <div><dt>Arrival if sent now</dt><dd>{addLightTravelYears(new Date().toISOString(), target.distanceLightYears).slice(0,10)}</dd></div>
            <div><dt>Earliest reply</dt><dd>{horizon.firstReplyUtc.slice(0,10)}</dd></div>
            <div><dt>Listening window</dt><dd>CLOSED</dd></div>
            <div><dt>Candidates</dt><dd>0 AUTHENTIC / 1 SYNTHETIC</dd></div>
          </dl>
          {frame && <div className="hashbox"><span>PAYLOAD HASH</span><code>{frame.payloadHash}</code><span>{frame.encodedBitLength.toLocaleString()} bits · {frame.fec}</span></div>}
        </div>
      </aside>

      <section className="bottom-left panel"><Composer target={target} onEncoded={setFrame} /></section>
      <section className="bottom-center panel">
        {mode === 'MOON RELAY' ? <MoonRelay /> :
         mode === 'ARCHIVE' ? <SilenceMap targets={targets} /> :
         mode === 'MESSAGE LAB' ? <UniversalLanguageViewer frame={frame} /> :
         mode === 'TRANSMIT' ? <TransmissionGate target={target} frame={frame} /> :
         <Waterfall />}
      </section>
      <section className="bottom-right panel"><SignalPassport /></section>
    </div>
    <footer><span>NO FAKE LIVE · NO FAKE ET REPLY · PHYSICAL RF GATED</span><span>Truth Layer v1 · CMP-1 · Cost profile USD 0</span></footer>
  </main>;
}
