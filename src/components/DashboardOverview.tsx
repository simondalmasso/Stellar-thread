import { useMemo } from 'react';
import type { PropagationResult, TransmissionProof } from '../lib/reality';
import { CATALOG_META, type Target } from '../lib/targets';
import { VOYAGER_CONTROL } from '../lib/authentic';
import { UniverseView } from './UniverseView';

type SyncState = 'CHECKING' | 'D1' | 'ERROR' | 'STATIC';

function persistenceLabel(sync: SyncState) {
  if (sync === 'D1') return 'D1 CONFIRMED';
  if (sync === 'CHECKING') return 'CHECKING';
  if (sync === 'STATIC') return 'STATIC / READ-ONLY';
  return 'UNAVAILABLE';
}

export function DashboardMetrics({ target, proof, propagation, sync }: {
  target: Target;
  proof: TransmissionProof | null;
  propagation: PropagationResult;
  sync: SyncState;
}) {
  return <section className="dashboard-metrics" aria-label="System overview">
    <article className="dashboard-metric">
      <span>ACTIVE TARGET</span>
      <strong>{target.displayName}</strong>
      <small>{target.hostStar} · catalog snapshot</small>
    </article>
    <article className="dashboard-metric">
      <span>CATALOG DISTANCE</span>
      <strong>{target.distanceLightYears.toFixed(2)} ly</strong>
      <small>± {target.distanceUncertaintyLightYears.toFixed(3)} ly · cached estimate</small>
    </article>
    <article className="dashboard-metric">
      <span>TRANSMISSION EVIDENCE</span>
      <strong>{proof ? proof.status : 'NO PROOF'}</strong>
      <small>{proof ? (propagation.progress * 100).toFixed(2) + '% modeled path progress' : 'Prepared ≠ transmitted · no proof recorded'}</small>
    </article>
    <article className="dashboard-metric">
      <span>PERSISTENCE / RF GATE</span>
      <strong className={sync === 'D1' ? 'metric-confirmed' : 'metric-unavailable'}>{persistenceLabel(sync)}</strong>
      <small>RF/ÓPTICO BLOQUEADO</small>
    </article>
  </section>;
}

export function DashboardOverview({ target, targets, proof, propagation, reducedMotion, sync, clock, onSelectTarget }: {
  target: Target;
  targets: Target[];
  proof: TransmissionProof | null;
  propagation: PropagationResult;
  reducedMotion: boolean;
  sync: SyncState;
  clock: string;
  onSelectTarget: (id: string) => void;
}) {
  const cells = useMemo(() => VOYAGER_CONTROL.waterfall.flatMap((row, rowIndex) =>
    row.map((value, columnIndex) => ({ key: rowIndex + '-' + columnIndex, value }))), []);
  const persistenceStatus = persistenceLabel(sync);
  const persistenceDetail = sync === 'D1'
    ? 'D1 confirmed by health check and persisted thread read.'
    : sync === 'STATIC'
      ? 'No D1 binding in this free deployment. Message writes are disabled.'
      : sync === 'CHECKING'
        ? 'Waiting for the Worker health check.'
        : 'Health check failed. No write is reported as persisted.';
  const entries = [
    { key: 'CATALOG', status: 'CACHED', detail: CATALOG_META.id + ' · NASA Exoplanet Archive + Gaia DR3' },
    { key: 'CONTROL DATA', status: 'RECORDED', detail: VOYAGER_CONTROL.observedAtUtc + ' · human spacecraft downlink' },
    { key: 'PERSISTENCE', status: persistenceStatus, detail: persistenceDetail },
    { key: 'TRANSMISSION', status: 'CLOSED', detail: 'RF and optical transmission disabled; no hardware command path.' },
  ];

  return <section className="dashboard-home" aria-label="Scientific overview">
    <header className="dashboard-screen-head">
      <div className="dashboard-screen-title">
        <small>RADIO ASTRONOMY / PASSIVE OBSERVATION</small>
        <h1>MAPA VECTORIAL · EARTH → TARGET</h1>
        <p>Geometric catalog model. No live telescope feed and no spacecraft control.</p>
      </div>
      <div className="dashboard-mode">
        <span className="dashboard-mode-dot" />
        <strong>PASSIVE MODE</strong>
        <small>NO LIVE OBSERVATORY</small>
        <time>{clock}</time>
      </div>
      <label className="dashboard-mobile-target">TARGET
        <select aria-label="Select target" value={target.id} onChange={event => onSelectTarget(event.target.value)}>
          {targets.map(item => <option key={item.id} value={item.id}>{item.displayName}</option>)}
        </select>
      </label>
    </header>
    <section className="dashboard-map-frame" aria-label="Catalog sky map">
      <div className="dashboard-panel-head">
        <span>01 / CATALOG SKY MAP</span>
        <span>{CATALOG_META.id}</span>
      </div>
      <div className="dashboard-map-viewport">
        <div className="dashboard-map-badges">
          <span>SOURCE <b>EARTH</b></span>
          <span>TARGET <b>{target.displayName}</b></span>
        </div>
        <UniverseView targets={targets} selected={target} proof={proof} propagation={propagation} reducedMotion={reducedMotion} />
      </div>
      <p className="dashboard-map-caption">Catalog positions and modeled geometry only · not real-time tracking.</p>
    </section>
    <div className="dashboard-lower">
      <section className="dashboard-spectrum">
        <header className="dashboard-panel-head">
          <span>02 / DSP WATERFALL · VOYAGER 1 CONTROL</span>
          <span className="dashboard-spectrum-badge">REGISTRO AUTÉNTICO DERIVADO</span>
        </header>
        <div className="dashboard-waterfall" role="img" aria-label="Waterfall derivado de registro auténtico de control de Voyager 1; no es una captura en vivo" style={{ gridTemplateColumns: 'repeat(' + VOYAGER_CONTROL.previewDimensions[1] + ',minmax(0,1fr))', gridTemplateRows: 'repeat(' + VOYAGER_CONTROL.previewDimensions[0] + ',minmax(0,1fr))' }}>
          {cells.map(cell => <i key={cell.key} style={{ opacity: 0.08 + (cell.value / 255) * 0.92 }} />)}
        </div>
        <div className="dashboard-spectrum-meta">
          <span>{VOYAGER_CONTROL.observedAtUtc}</span>
          <span>{VOYAGER_CONTROL.centerFrequencyMHz.toFixed(6)} MHz</span>
          <span>{VOYAGER_CONTROL.previewDimensions[0]} × {VOYAGER_CONTROL.previewDimensions[1]}</span>
        </div>
        <p className="dashboard-signal-note">NO ES UNA CAPTURA EN VIVO · Known human spacecraft downlink, not an extraterrestrial signal.</p>
      </section>
      <section className="dashboard-log">
        <header className="dashboard-panel-head"><span>03 / REPRODUCIBLE EVENT LOG</span><span>UTC</span></header>
        {entries.map(entry => <article className="dashboard-log-entry" key={entry.key}>
          <span className="dashboard-log-key">{entry.key}</span>
          <span className={entry.status === 'CLOSED' || entry.status === 'UNAVAILABLE' || entry.status === 'STATIC / READ-ONLY' ? 'dashboard-log-status status-warning' : 'dashboard-log-status'}>{entry.status}</span>
          <p>{entry.detail}</p>
        </article>)}
      </section>
    </div>
  </section>;
}
