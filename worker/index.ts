import { z } from 'zod';
import { encodeCmp1 } from '../src/lib/cmp';
import { emeRoundTripSeconds, replyHorizon } from '../src/lib/astronomy';
import { TARGETS, getTarget } from '../src/lib/targets';
import { classifyCandidate, canTransitionAutomatically } from '../src/lib/candidate';

interface Fetcher { fetch(request: Request): Promise<Response> }
interface Env { ASSETS: Fetcher; APP_ENV: string; ALLOW_PHYSICAL_TRANSMISSION: string }
type ExportedHandler<E> = { fetch(request: Request, env: E): Promise<Response> };
const json = (data: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(data, null, 2), { ...init, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...init.headers } });
const now = () => new Date().toISOString();
const provenance = (truthClass: string, source: string, limitations: string[] = []) => ({ truthClass, source, processedAt: now(), transformation: 'API serialization', version: 'api-v1', freshness: 'CURRENT', limitations });

const encodeSchema = z.object({
  message: z.string().min(1).max(65535),
  targetId: z.string().min(1).max(255),
  profile: z.enum(['CMP_BEACON','CMP_MATH_BOOTSTRAP','CMP_TEXT','CMP_IMAGE','CMP_AUDIO_SYMBOLIC','CMP_REPLY_REQUEST','CMP_EXPERIMENTAL']),
  epochUtc: z.string().datetime().optional(),
  repetition: z.number().int().min(1).max(255).optional()
});
const proposalSchema = z.object({ messageId: z.string().min(1), targetId: z.string().min(1), encodingProfile: z.string().min(1), payloadHash: z.string().min(8), startUtc: z.string().datetime().optional(), durationSeconds: z.number().positive().optional() });
const reviewSchema = z.object({ state: z.string(), reviewer: z.string().min(1), notes: z.string().max(5000).optional() });

function route(path: string, method: string) { return `${method} ${path}`; }
async function parseJson(request: Request) { try { return await request.json(); } catch { throw new Error('Invalid JSON'); } }
function error(message: string, status = 400) { return json({ error: message, timestamp: now() }, { status }); }

const observations = [{ id: 'obs-bl-demo-001', targetId: 'proxima-b', sourceType: 'RECORDED_AUTHENTIC', station: 'Breakthrough Listen archive reference', status: 'METADATA_ONLY', observedAt: '2019-04-29T00:00:00.000Z', provenance: provenance('RECORDED_AUTHENTIC','Breakthrough Listen Open Data Archive',['No multi-gigabyte file bundled; import adapter validates external manifests']) }];
const candidates = [{ id: 'SYN-20260805-0007', targetId: 'proxima-b', state: 'UNCLASSIFIED_EVENT', frequencyHz: 1420398000, bandwidthHz: 2.79, driftHzPerSecond: 0.42, snrDb: 18.7, repeated: false, stations: ['synthetic-node-a'], evidence: { targetAngularConsistency: .95, temporalWindowConsistency: .2, dopplerConsistency: .84, repetitionConsistency: .1, modulationSimilarity: .4, multiStationConfidence: .1, rfiRejectionConfidence: .92 }, provenance: provenance('SYNTHETIC','Deterministic CI vector',['Not astronomical','Not extraterrestrial']) }];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      switch (route(url.pathname, request.method)) {
        case 'GET /api/v1/health': return json({ status: 'ok', service: 'stellar-thread', environment: env.APP_ENV, physicalTransmissionEnabled: env.ALLOW_PHYSICAL_TRANSMISSION === 'true', timestamp: now() });
        case 'GET /api/v1/targets': return json({ data: TARGETS, provenance: provenance('OFFICIAL_CATALOG','Bundled NASA Exoplanet Archive target snapshot',['Refresh before operational scheduling']) });
        case 'GET /api/v1/threads': return json({ data: TARGETS.map(t => ({ id: `thread-${t.id}`, targetId: t.id, status: 'DRAFT', transmission: 'AWAITING_AUTHORIZED_FACILITY', candidates: 0, ...replyHorizon(now(), t.distanceLightYears) })), provenance: provenance('DERIVED','Stellar-thread thread engine') });
        case 'POST /api/v1/threads': { const body = await parseJson(request) as { targetId?: string }; const target = getTarget(body.targetId ?? ''); if (!target) return error('Unknown target',404); return json({ data: { id: crypto.randomUUID(), targetId: target.id, status: 'DRAFT', createdAt: now() }, provenance: provenance('DERIVED','Stellar-thread') }, { status: 201 }); }
        case 'POST /api/v1/messages/encode': { const input = encodeSchema.parse(await parseJson(request)); if (!getTarget(input.targetId) && input.targetId !== 'moon') return error('Unknown target',404); const frame = encodeCmp1(input); return json({ data: frame, provenance: provenance('DERIVED','CMP-1 encoder',['FEC profile is repetition-3 for demonstrator reliability, not a final facility waveform']) }); }
        case 'POST /api/v1/transmissions/proposal': { const input = proposalSchema.parse(await parseJson(request)); const target = getTarget(input.targetId); if (!target) return error('Unknown target',404); const proposal = { schemaVersion: 1, messageId: input.messageId, target: { name: target.displayName, raDeg: target.raDeg, decDeg: target.decDeg, distanceLightYears: target.distanceLightYears }, encodingProfile: input.encodingProfile, payloadHash: input.payloadHash, carrierPlan: { status: 'FACILITY_DEFINED' }, modulationPlan: { status: 'FACILITY_DEFINED' }, repetitionPlan: { status: 'SCIENTIFIC_REVIEW_REQUIRED' }, startUtc: input.startUtc ?? null, durationSeconds: input.durationSeconds ?? 0, regulatoryApproval: { status: 'MISSING' }, facilityApproval: { status: 'MISSING' }, ownerApproval: { status: 'MISSING' }, execution: { status: 'BLOCKED', reason: 'Physical RF gate' }, provenance: provenance('DERIVED','Transmission proposal generator') }; return json({ data: proposal }, { status: 201 }); }
        case 'GET /api/v1/observatories': return json({ data: [{ id:'distributed-demo', name:'Cosmic Listener reference node', sourceType:'LIVE_DISTRIBUTED_NODE', state:'OFFLINE', capabilities:['RFI catalog','control-source observation','protocol demonstration'] }], provenance: provenance('UNAVAILABLE','No authorized live observatory connected') });
        case 'GET /api/v1/observations': return json({ data: observations });
        case 'POST /api/v1/observations/import': return json({ data: { id: crypto.randomUUID(), status:'VALIDATION_PENDING', receivedAt: now() }, provenance: provenance('HUMAN_REVIEW','Import intake') }, { status: 202 });
        case 'GET /api/v1/candidates': return json({ data: candidates });
        case 'GET /api/v1/signals/live': {
          const stream = new ReadableStream({ start(controller) { const enc = new TextEncoder(); const send = () => controller.enqueue(enc.encode(`event: signal\ndata: ${JSON.stringify({ id: crypto.randomUUID(), truthClass:'SYNTHETIC', label:'SYNTHETIC TEST STREAM', timestamp:now(), frequencyHz:1420398000 + Math.round(Math.random()*30), snrDb:8 + Math.random()*3 })}\n\n`)); send(); const timer=setInterval(send,5000); setTimeout(()=>{clearInterval(timer);controller.close()},25000); } });
          return new Response(stream,{ headers:{'content-type':'text/event-stream','cache-control':'no-cache','connection':'keep-alive'} });
        }
        case 'GET /api/v1/archive/search': return json({ data: [], adapter: { provider:'Breakthrough Listen Open Data Archive', status:'METADATA_ADAPTER_READY', query:Object.fromEntries(url.searchParams) }, provenance: provenance('UNAVAILABLE','Upstream archive query is intentionally not proxied without an explicit import manifest',['Large files may be gigabytes']) });
        case 'GET /api/v1/moon/geometry': return json({ data: { model:'MEAN_DISTANCE_DEMONSTRATOR', distanceKm:384400, roundTripSeconds:emeRoundTripSeconds(), state:'DERIVED', operationalEphemerisRequired:true }, provenance: provenance('DERIVED','Mean lunar distance calculation',['Use JPL/Horizons or facility ephemeris for an actual session']) });
        case 'GET /api/v1/sources': return json({ data: [{id:'nasa-exoplanet-archive',truthClass:'OFFICIAL_CATALOG'},{id:'breakthrough-listen',truthClass:'RECORDED_AUTHENTIC'},{id:'cosmic-listener-ci',truthClass:'SYNTHETIC'}] });
      }
      const targetMatch = url.pathname.match(/^\/api\/v1\/targets\/([^/]+)$/);
      if (request.method === 'GET' && targetMatch) { const target=getTarget(targetMatch[1]); return target?json({data:target}):error('Target not found',404); }
      const transmissionMatch = url.pathname.match(/^\/api\/v1\/transmissions\/([^/]+)$/);
      if (request.method === 'GET' && transmissionMatch) return json({ data: { id: transmissionMatch[1], status:'NOT_FOUND_OR_NOT_EXECUTED', physicalTransmissionExecuted:false }, provenance: provenance('UNAVAILABLE','No transmission ledger entry') }, { status:404 });
      const candidateMatch = url.pathname.match(/^\/api\/v1\/candidates\/([^/]+)$/);
      if (request.method === 'GET' && candidateMatch) { const c=candidates.find(x=>x.id===candidateMatch[1]); return c?json({data:{...c,computedState:classifyCandidate(c.evidence,c.repeated)}}):error('Candidate not found',404); }
      const reviewMatch = url.pathname.match(/^\/api\/v1\/candidates\/([^/]+)\/review$/);
      if (request.method === 'POST' && reviewMatch) { const input=reviewSchema.parse(await parseJson(request)); if (input.state==='CONFIRMED_EXTRATERRESTRIAL' || !canTransitionAutomatically(input.state as never)) return error('CONFIRMED_EXTRATERRESTRIAL requires external scientific process and cannot be set by this API',409); return json({ data:{ candidateId:reviewMatch[1], review:input, reviewedAt:now(), truthClass:'HUMAN_REVIEW' } },{status:201}); }
      return error('Route not found',404);
    } catch (cause) {
      if (cause instanceof z.ZodError) return error(cause.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '),422);
      return error(cause instanceof Error ? cause.message : 'Unhandled error',500);
    }
  }
} satisfies ExportedHandler<Env>;
