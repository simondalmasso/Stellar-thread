import { useMemo } from 'react';

export function Waterfall({ seed = 7, label = 'SYNTHETIC TEST' }: { seed?: number; label?: string }) {
  const cells = useMemo(() => Array.from({ length: 288 }, (_, i) => {
    const x = (i * 17 + seed * 31) % 97;
    const ridge = Math.abs((i % 24) - (8 + Math.floor(i / 24) * .55)) < 1.2;
    const level = ridge ? 0.92 : 0.12 + (x / 97) * 0.34;
    return level;
  }), [seed]);
  return <div className="waterfall-wrap">
    <div className="panel-title"><span>SPECTRUM / WATERFALL</span><span className="truth truth-synthetic">{label}</span></div>
    <div className="waterfall" role="img" aria-label="Waterfall de señal sintética de prueba">
      {cells.map((v, i) => <i key={i} style={{ opacity: v }} />)}
    </div>
    <div className="axis"><span>1420.398 MHz</span><span>Δf 2.79 Hz</span><span>18 s</span></div>
  </div>;
}
