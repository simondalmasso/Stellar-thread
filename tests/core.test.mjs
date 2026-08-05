import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeCmp1, decodeCmp1 } from '../.build-core/cmp.js';
import { emeRoundTripSeconds, replyHorizon } from '../.build-core/astronomy.js';
import { candidateResponseScore, canTransitionAutomatically } from '../.build-core/candidate.js';
import { mayDisplayLive } from '../.build-core/truth.js';

function flip(bits, indexes) {
  const chars = [...bits];
  for (const i of indexes) chars[i] = chars[i] === '1' ? '0' : '1';
  return chars.join('');
}

test('CMP-1 exact round trip', () => {
  const frame = encodeCmp1({ message: 'Hola universo', targetId: 'proxima-b', profile: 'CMP_TEXT', epochUtc: '2026-08-05T15:00:00.000Z' });
  const decoded = decodeCmp1(frame.bits);
  assert.equal(decoded.message, 'Hola universo');
  assert.equal(decoded.targetId, 'proxima-b');
  assert.equal(decoded.profile, 'CMP_TEXT');
});

test('CMP-1 repetition FEC repairs one flipped bit per triple', () => {
  const frame = encodeCmp1({ message: 'FEC', targetId: 'moon', profile: 'CMP_BEACON', epochUtc: '2026-08-05T15:00:00.000Z' });
  const damaged = flip(frame.bits, Array.from({ length: 24 }, (_, i) => i * 3));
  const decoded = decodeCmp1(damaged);
  assert.equal(decoded.message, 'FEC');
  assert.ok(decoded.correctedTriples >= 24);
});

test('CMP-1 reports unrecoverable corruption', () => {
  const frame = encodeCmp1({ message: 'checksum', targetId: 'moon', profile: 'CMP_BEACON', epochUtc: '2026-08-05T15:00:00.000Z' });
  const damaged = flip(frame.bits, [120, 121]);
  assert.throws(() => decodeCmp1(damaged));
});

test('EME round trip is about 2.56 seconds at mean distance', () => {
  assert.ok(Math.abs(emeRoundTripSeconds() - 2.564) < 0.01);
});

test('reply horizon doubles light travel time', () => {
  const h = replyHorizon('2026-01-01T00:00:00.000Z', 4);
  const years = (Date.parse(h.firstReplyUtc) - Date.parse('2026-01-01T00:00:00.000Z')) / (365.25 * 86400000);
  assert.ok(Math.abs(years - 8) < 0.001);
});

test('candidate score is multiplicative and automatic ET confirmation is forbidden', () => {
  const score = candidateResponseScore({ targetAngularConsistency: .9, temporalWindowConsistency: .8, dopplerConsistency: .7, repetitionConsistency: .6, modulationSimilarity: .5, multiStationConfidence: .4, rfiRejectionConfidence: .95 });
  assert.ok(score > 0 && score < 1);
  assert.equal(canTransitionAutomatically('CONFIRMED_EXTRATERRESTRIAL'), false);
});

test('LIVE label requires recent heartbeat', () => {
  const base = { truthClass: 'LIVE_OBSERVATORY', source: 'x', processedAt: '2026-08-05T15:00:00Z', observedAt: '2026-08-05T15:00:00Z', transformation: 'none', version: '1', freshness: 'CURRENT', limitations: [] };
  assert.equal(mayDisplayLive(base, Date.parse('2026-08-05T15:00:20Z')), true);
  assert.equal(mayDisplayLive(base, Date.parse('2026-08-05T15:01:00Z')), false);
});
