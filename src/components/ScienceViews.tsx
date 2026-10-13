import type { CmpFrame } from '../lib/cmp';
import type { Target } from '../lib/targets';

export function SilenceMap({ targets }: { targets: Target[] }) {
  return <section className="science-card">
    <div className="panel-title"><span>SILENCE MAP</span><span className="truth truth-derived">DERIVED</span></div>
    <div className="silence-map">
      {targets.map((target, index) => <div key={target.id} title={`${target.displayName}: no authentic observation loaded`} style={{ opacity: .28 + index * .1 }}><b>{target.displayName}</b><span>0 verified observing hours</span></div>)}
    </div>
    <p className="microcopy">Zero does not mean silence in nature; it means no verified observation has been imported into this deployment.</p>
  </section>;
}

export function UniversalLanguageViewer({ frame }: { frame: CmpFrame | null }) {
  const bits = frame?.bits.slice(0, 192) ?? '1011001110100101110001111111000100000001000000110000001100001000';
  return <section className="science-card">
    <div className="panel-title"><span>UNIVERSAL LANGUAGE VIEWER</span><span>CMP-1</span></div>
    <div className="language-grid">
      <div className="prime-row"><span>2</span><span>3</span><span>5</span><span>7</span><span>11</span><span>13</span></div>
      <code>{bits.match(/.{1,8}/g)?.join(' ')}</code>
      <div className="geometry-demo"><i/><i/><i/><i/><i/></div>
    </div>
    <p className="microcopy">Bootstrap view: recognizable preamble, prime-number structure, binary definition, geometry and payload framing. It is not a claim that CMP-1 is universally decodable.</p>
  </section>;
}

export function TransmissionGate({ target, frame }: { target: Target; frame: CmpFrame | null }) {
  return <section className="science-card">
    <div className="panel-title"><span>TRANSMISSION EXPORT</span><span className="gate">BLOCKED BEFORE RF</span></div>
    <div className="gate-list">
      <div><b>Payload</b><span>{frame ? `${frame.payloadHash} / ENCODED` : 'MISSING'}</span></div>
      <div><b>Target</b><span>{target.displayName} / CATALOG SNAPSHOT</span></div>
      <div><b>Link budget</b><span>FACILITY PARAMETERS REQUIRED</span></div>
      <div><b>Regulatory review</b><span>MISSING</span></div>
      <div><b>Facility approval</b><span>MISSING</span></div>
      <div><b>Owner approval</b><span>MISSING</span></div>
      <div><b>Physical execution</b><span>NOT EXECUTED</span></div>
    </div>
  </section>;
}
