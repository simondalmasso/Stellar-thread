import { emeRoundTripSeconds } from '../lib/astronomy';

export function MoonRelay() {
  const delay = emeRoundTripSeconds();
  return <section className="moon-card">
    <div className="panel-title"><span>MOON RELAY CHAT</span><span className="gate">OPERATOR GATE</span></div>
    <div className="moon-orbit"><div className="earth-dot"/><div className="beam"/><div className="moon-dot"/></div>
    <dl>
      <div><dt>Geometry</dt><dd>Earth → Moon → Earth</dd></div>
      <div><dt>Mean path</dt><dd>768,800 km</dd></div>
      <div><dt>Vacuum RTT</dt><dd>{delay.toFixed(3)} s</dd></div>
      <div><dt>RF state</dt><dd>NOT TRANSMITTED</dd></div>
      <div><dt>Facility</dt><dd>AWAITING AUTHORIZED STATION</dd></div>
    </dl>
    <button disabled>EXPORT STATION PACKAGE — FACILITY REQUIRED</button>
  </section>;
}
