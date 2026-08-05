import { z } from 'zod';
import { encodeCmp1, sha256Hex } from '../src/lib/cmp';
import { TARGETS, getTarget } from '../src/lib/targets';
import {
  computePropagation,
  validateTransmissionProof,
  type TransmissionProof,
} from '../src/lib/reality';
import { VOYAGER_CONTROL } from '../src/lib/authentic';

interface Fetcher {
  fetch(request: Request): Promise<Response>;
}
interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta?: unknown;
}
interface D1Prepared {
  bind(...values: unknown[]): D1Prepared;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
interface D1Database {
  prepare(query: string): D1Prepared;
  batch(statements: D1Prepared[]): Promise<D1Result[]>;
}
interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  APP_ENV?: string;
  ALLOW_PHYSICAL_TRANSMISSION?: string;
  OPERATOR_API_TOKEN?: string;
  BUILD_SOURCE_SHA?: string;
  BUILD_TREE_SHA?: string;
  BUILD_TIME_UTC?: string;
  BUILD_WORKFLOW_RUN_ID?: string;
  DEPLOYMENT_ID?: string;
}
type ExportedHandler<E> = { fetch(request: Request, env: E): Promise<Response> };

const json = (data: unknown, init: ResponseInit = {}, correlationId?: string) =>
  new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(correlationId ? { 'x-correlation-id': correlationId } : {}),
      ...init.headers,
    },
  });
const now = () => new Date().toISOString();
const provenance = (truthClass: string, source: string, limitations: string[] = []) => ({
  truthClass,
  source,
  processedAt: now(),
  transformation: 'API serialization',
  version: 'reality-v2-api',
  freshness: 'CURRENT',
  limitations,
});

const encodeSchema = z.object({
  message: z.string().min(1).max(65_535),
  targetId: z.string().min(1).max(255),
  profile: z.enum([
    'CMP_BEACON',
    'CMP_MATH_BOOTSTRAP',
    'CMP_TEXT',
    'CMP_IMAGE',
    'CMP_AUDIO_SYMBOLIC',
    'CMP_REPLY_REQUEST',
    'CMP_EXPERIMENTAL',
  ]),
  epochUtc: z.string().datetime().optional(),
  repetition: z.literal(3).optional(),
});
const proposalSchema = z.object({
  messageId: z.string().min(1),
  targetId: z.string().min(1),
  encodingProfile: z.string().min(1),
  payloadHash: z.string().regex(/^[a-f0-9]{64}$/i),
  startUtc: z.string().datetime().nullable().optional(),
  durationSeconds: z.number().nonnegative().optional(),
}).passthrough();
const proofSchema = z.object({
  messageId: z.string().min(1),
  targetId: z.string().min(1),
  status: z.literal('TRANSMITTED_PROOFED'),
  transmittedAtUtc: z.string().datetime(),
  transmissionEndUtc: z.string().datetime().nullable().optional(),
  stationId: z.string().min(1),
  facilityName: z.string().min(1),
  operatorId: z.string().min(1),
  frequencyHz: z.number().positive().nullable(),
  bandwidthHz: z.number().positive().nullable(),
  modulationProfile: z.string().nullable(),
  bitrate: z.number().positive().nullable(),
  beamType: z.enum(['ISOTROPIC', 'DIRECTIONAL', 'UNKNOWN']),
  beamWidthDeg: z.number().positive().max(180).nullable(),
  payloadSha256: z.string().regex(/^[a-f0-9]{64}$/i),
  waveformSha256: z.string().regex(/^[a-f0-9]{64}$/i).nullable(),
  proofArtifactSha256: z.string().regex(/^[a-f0-9]{64}$/i),
  authorizationRefs: z.array(z.string().min(1)).min(1),
  limitations: z.array(z.string()).default([]),
});
const reviewSchema = z.object({
  state: z.enum([
    'RFI_LIKELY',
    'NATURAL_SOURCE_LIKELY',
    'UNCLASSIFIED_EVENT',
    'TECHNOSIGNATURE_CANDIDATE',
    'REPEAT_DETECTED',
    'MULTI_STATION_COINCIDENCE',
    'EXTERNAL_CONFIRMATION_PENDING',
    'REJECTED',
  ]),
  notes: z.string().max(5_000).optional(),
});

class PublicError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}
async function requestBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new PublicError('Invalid JSON', 400);
  }
}
function isOperator(request: Request, env: Env) {
  if (!env.OPERATOR_API_TOKEN) return false;
  return request.headers.get('authorization') === `Bearer ${env.OPERATOR_API_TOKEN}`;
}
const memoryRate = new Map<string, { count: number; reset: number }>();
function rateLimited(request: Request, limit = 30) {
  const key = request.headers.get('cf-connecting-ip') ?? 'local';
  const current = Date.now();
  const value = memoryRate.get(key);
  if (!value || value.reset < current) {
    memoryRate.set(key, { count: 1, reset: current + 60_000 });
    return false;
  }
  value.count += 1;
  return value.count > limit;
}
async function findMessage(env: Env, id: string) {
  return env.DB
    ? env.DB.prepare('SELECT * FROM messages WHERE id=?').bind(id).first<Record<string, unknown>>()
    : null;
}
async function findProof(env: Env, id: string) {
  if (!env.DB) return null;
  const row = await env.DB
    .prepare('SELECT proof_json FROM transmission_proofs WHERE id=? OR message_id=? ORDER BY created_at_utc DESC LIMIT 1')
    .bind(id, id)
    .first<{ proof_json: string }>();
  return row ? (JSON.parse(row.proof_json) as TransmissionProof) : null;
}
async function storeEncodedMessage(
  env: Env,
  record: Record<string, unknown>,
  frame: ReturnType<typeof encodeCmp1>,
) {
  if (!env.DB) return;
  const frameJson = JSON.stringify(frame);
  const frameSha256 = sha256Hex(new TextEncoder().encode(frameJson));
  await env.DB.batch([
    env.DB
      .prepare('INSERT OR IGNORE INTO threads(id,target_id,created_at_utc,updated_at_utc) VALUES(?,?,?,?)')
      .bind(record.threadId, record.targetId, record.createdAtUtc, record.createdAtUtc),
    env.DB
      .prepare('INSERT INTO messages(id,thread_id,target_id,text,state,cmp_profile,cmp_version,payload_sha256,encoded_bits,created_at_utc,updated_at_utc,truth_class) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(
        record.id,
        record.threadId,
        record.targetId,
        record.text,
        record.state,
        record.cmpProfile,
        'CMP-1',
        record.payloadSha256,
        record.encodedBits,
        record.createdAtUtc,
        record.createdAtUtc,
        'DERIVED',
      ),
    env.DB
      .prepare('INSERT INTO cmp_frames(id,message_id,frame_json,frame_sha256,created_at_utc) VALUES(?,?,?,?,?)')
      .bind(`frame-${crypto.randomUUID()}`, record.id, frameJson, frameSha256, record.createdAtUtc),
  ]);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    const correlationId = crypto.randomUUID();
    if (rateLimited(request)) {
      return json({ error: 'Rate limit exceeded', correlationId }, { status: 429 }, correlationId);
    }

    try {
      const route = `${request.method} ${url.pathname}`;
      switch (route) {
        case 'GET /api/v1/health':
          return json({
            status: 'ok',
            service: 'stellar-thread',
            environment: env.APP_ENV ?? 'unknown',
            persistence: env.DB ? 'D1' : 'UNAVAILABLE',
            physicalTransmissionEnabled: false,
            timestamp: now(),
          }, {}, correlationId);

        case 'GET /api/v1/build':
          return json({
            data: {
              sourceSha: env.BUILD_SOURCE_SHA ?? 'UNAVAILABLE',
              treeSha: env.BUILD_TREE_SHA ?? 'UNAVAILABLE',
              buildTimeUtc: env.BUILD_TIME_UTC ?? 'UNAVAILABLE',
              workflowRunId: env.BUILD_WORKFLOW_RUN_ID ?? null,
              deploymentId: env.DEPLOYMENT_ID ?? null,
              environment: env.APP_ENV ?? 'unknown',
            },
            provenance: provenance('DERIVED', 'Build environment', [
              'Fields marked UNAVAILABLE were not injected at deploy time',
            ]),
          }, {}, correlationId);

        case 'GET /api/v1/targets':
          return json({
            data: TARGETS,
            provenance: provenance('OFFICIAL_CATALOG', 'Versioned NASA/Gaia/SIMBAD seed snapshot', [
              'Refresh before operational scheduling',
            ]),
          }, {}, correlationId);

        case 'GET /api/v1/threads': {
          const data = env.DB
            ? (await env.DB.prepare('SELECT * FROM threads ORDER BY updated_at_utc DESC LIMIT 100').all()).results ?? []
            : TARGETS.map((target) => ({ id: `thread-${target.id}`, target_id: target.id, state: 'NO_MESSAGE' }));
          return json({ data, persistence: env.DB ? 'D1' : 'READ_ONLY_FALLBACK' }, {}, correlationId);
        }

        case 'POST /api/v1/messages/encode': {
          const input = encodeSchema.parse(await requestBody(request));
          if (!getTarget(input.targetId)) throw new PublicError('Unknown target', 404);
          const frame = encodeCmp1(input);
          const createdAtUtc = now();
          const record = {
            id: `msg-${crypto.randomUUID()}`,
            threadId: `thread-${input.targetId}`,
            targetId: input.targetId,
            text: frame.message,
            state: 'ENCODED',
            cmpProfile: frame.profile,
            payloadSha256: frame.payloadHash,
            encodedBits: frame.encodedBitLength,
            createdAtUtc,
          };
          await storeEncodedMessage(env, record, frame);
          return json({
            data: { message: record, frame },
            provenance: provenance('DERIVED', 'CMP-1 encoder', ['Encoding is not transmission']),
          }, { status: 201 }, correlationId);
        }

        case 'POST /api/v1/transmissions/proposal': {
          const input = proposalSchema.parse(await requestBody(request));
          if (!getTarget(input.targetId)) throw new PublicError('Unknown target', 404);
          if (env.DB && !(await findMessage(env, input.messageId))) throw new PublicError('Message not found', 404);
          const createdAtUtc = now();
          const proposal = {
            ...input,
            id: `tx-${crypto.randomUUID()}`,
            status: 'PROPOSAL_READY',
            execution: {
              status: 'BLOCKED',
              reason: 'Facility, operator, regulatory and owner approvals absent',
            },
            createdAtUtc,
          };
          if (env.DB) {
            await env.DB.batch([
              env.DB
                .prepare('INSERT INTO transmission_proposals(id,message_id,target_id,proposal_json,status,created_at_utc) VALUES(?,?,?,?,?,?)')
                .bind(proposal.id, input.messageId, input.targetId, JSON.stringify(proposal), proposal.status, createdAtUtc),
              env.DB
                .prepare('UPDATE messages SET state=?,updated_at_utc=? WHERE id=?')
                .bind('PROPOSAL_READY', createdAtUtc, input.messageId),
            ]);
          }
          return json({
            data: proposal,
            provenance: provenance('DERIVED', 'Transmission proposal generator'),
          }, { status: 201 }, correlationId);
        }

        case 'GET /api/v1/observatories':
          return json({
            data: [],
            state: 'NO AUTHORIZED LIVE OBSERVATORY CONNECTED',
            provenance: provenance('UNAVAILABLE', 'No observatory heartbeat'),
          }, {}, correlationId);

        case 'GET /api/v1/observations':
          return json({
            data: [{
              id: VOYAGER_CONTROL.id,
              targetId: 'voyager-1',
              sourceType: 'RECORDED_AUTHENTIC',
              classification: VOYAGER_CONTROL.classification,
              extraterrestrial: false,
              observedAtUtc: VOYAGER_CONTROL.observedAtUtc,
            }],
          }, {}, correlationId);

        case 'POST /api/v1/observations/import':
          if (!isOperator(request, env)) throw new PublicError('Operator authorization required', 401);
          return json({
            data: { id: `obs-${crypto.randomUUID()}`, status: 'VALIDATION_PENDING', receivedAtUtc: now() },
          }, { status: 202 }, correlationId);

        case 'GET /api/v1/candidates':
          return json({
            data: [{
              id: 'voyager-human-control',
              state: 'CONFIRMED_TECHNOLOGICAL',
              classification: 'HUMAN_TECHNOLOGICAL_CONTROL',
              extraterrestrial: false,
              truthClass: 'RECORDED_AUTHENTIC',
            }],
          }, {}, correlationId);

        case 'GET /api/v1/signals/live': {
          let interval: ReturnType<typeof setInterval> | undefined;
          let timeout: ReturnType<typeof setTimeout> | undefined;
          let closed = false;
          const clean = () => {
            if (interval) clearInterval(interval);
            if (timeout) clearTimeout(timeout);
            interval = undefined;
            timeout = undefined;
          };
          const stream = new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              const send = () => {
                if (closed) return;
                try {
                  controller.enqueue(encoder.encode(
                    `event: signal\ndata: ${JSON.stringify({
                      id: crypto.randomUUID(),
                      truthClass: 'SYNTHETIC',
                      label: 'SYNTHETIC TEST STREAM',
                      timestamp: now(),
                      frequencyHz: 1_420_398_000,
                    })}\n\n`,
                  ));
                } catch {
                  closed = true;
                  clean();
                }
              };
              send();
              interval = setInterval(send, 5_000);
              timeout = setTimeout(() => {
                closed = true;
                clean();
                try { controller.close(); } catch { /* already cancelled */ }
              }, 25_000);
            },
            cancel() {
              closed = true;
              clean();
            },
          });
          return new Response(stream, {
            headers: {
              'content-type': 'text/event-stream',
              'cache-control': 'no-cache',
              'x-truth-class': 'SYNTHETIC',
              'x-correlation-id': correlationId,
            },
          });
        }

        case 'GET /api/v1/archive/search':
          return json({
            data: [{
              id: VOYAGER_CONTROL.id,
              title: VOYAGER_CONTROL.title,
              truthClass: 'RECORDED_AUTHENTIC',
              classification: 'HUMAN_TECHNOLOGICAL_CONTROL',
            }],
            coverageState: 'ONE VERIFIED CONTROL MANIFEST',
          }, {}, correlationId);

        case 'GET /api/v1/moon/geometry':
          if (url.searchParams.get('mode') === 'ephemeris') {
            return json({
              data: {
                state: 'EPHEMERIS_DERIVED_PLAN',
                adapter: 'JPL Horizons API',
                status: 'INPUT_REQUIRED',
                required: ['startUtc', 'stationLatDeg', 'stationLonDeg', 'stationElevationM', 'frequencyHz'],
                physicalControl: false,
              },
              provenance: provenance('UNAVAILABLE', 'JPL Horizons adapter contract', [
                'No network request without complete planning input',
              ]),
            }, {}, correlationId);
          }
          return json({
            data: {
              state: 'MEAN_DISTANCE_DEMONSTRATOR',
              distanceKm: 384_400,
              roundTripSeconds: (2 * 384_400_000) / 299_792_458,
              operationalEphemerisRequired: true,
            },
            provenance: provenance('DERIVED', 'Mean lunar distance fallback'),
          }, {}, correlationId);

        case 'GET /api/v1/sources':
          return json({
            data: [
              { id: 'nasa-exoplanet-archive', truthClass: 'OFFICIAL_CATALOG' },
              { id: 'breakthrough-listen-voyager', truthClass: 'RECORDED_AUTHENTIC' },
              { id: 'synthetic-ci', truthClass: 'SYNTHETIC' },
            ],
          }, {}, correlationId);
      }

      const targetMatch = url.pathname.match(/^\/api\/v1\/targets\/([^/]+)$/);
      if (request.method === 'GET' && targetMatch) {
        const value = getTarget(targetMatch[1]);
        if (!value) throw new PublicError('Target not found', 404);
        return json({ data: value }, {}, correlationId);
      }

      const messageMatch = url.pathname.match(/^\/api\/v1\/messages\/([^/]+)$/);
      if (request.method === 'GET' && messageMatch) {
        const value = await findMessage(env, messageMatch[1]);
        if (!value) throw new PublicError(env.DB ? 'Message not found' : 'Persistence unavailable', env.DB ? 404 : 503);
        return json({ data: value }, {}, correlationId);
      }

      const propagationMatch = url.pathname.match(/^\/api\/v1\/messages\/([^/]+)\/propagation$/);
      if (request.method === 'GET' && propagationMatch) {
        const message = await findMessage(env, propagationMatch[1]);
        if (!message) throw new PublicError(env.DB ? 'Message not found' : 'Persistence unavailable', env.DB ? 404 : 503);
        const target = getTarget(String(message.target_id));
        if (!target) throw new PublicError('Target not found', 404);
        const proof = await findProof(env, propagationMatch[1]);
        return json({ data: computePropagation(proof, target, Date.now()) }, {}, correlationId);
      }

      const proofMatch = url.pathname.match(/^\/api\/v1\/transmissions\/([^/]+)\/proof$/);
      if (request.method === 'GET' && proofMatch) {
        const value = await findProof(env, proofMatch[1]);
        if (!value) throw new PublicError(env.DB ? 'Transmission proof not found' : 'Persistence unavailable', env.DB ? 404 : 503);
        return json({ data: value }, {}, correlationId);
      }

      const operatorProofMatch = url.pathname.match(/^\/api\/v1\/operator\/transmissions\/([^/]+)\/proof$/);
      if (request.method === 'POST' && operatorProofMatch) {
        if (!isOperator(request, env)) throw new PublicError('Operator authorization required', 401);
        if (!env.DB) throw new PublicError('D1 persistence unavailable', 503);
        const parsed = proofSchema.parse(await requestBody(request));
        const proof: TransmissionProof = {
          ...parsed,
          transmissionId: operatorProofMatch[1],
          transmissionEndUtc: parsed.transmissionEndUtc ?? null,
          truthClass: 'HUMAN_REVIEW',
          source: 'Authorized operator evidence',
        };
        const errors = validateTransmissionProof(proof);
        if (errors.length) throw new PublicError(errors.join('; '), 422);
        const message = await findMessage(env, proof.messageId);
        if (!message) throw new PublicError('Message not found', 404);
        if (String(message.target_id) !== proof.targetId) throw new PublicError('Proof target does not match message target', 409);
        if (String(message.payload_sha256) !== proof.payloadSha256) throw new PublicError('Proof payload hash does not match encoded message', 409);
        await env.DB.batch([
          env.DB
            .prepare('INSERT INTO transmission_proofs(id,message_id,target_id,status,proof_json,transmitted_at_utc,payload_sha256,proof_artifact_sha256,created_at_utc) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET proof_json=excluded.proof_json,status=excluded.status,transmitted_at_utc=excluded.transmitted_at_utc,proof_artifact_sha256=excluded.proof_artifact_sha256')
            .bind(
              proof.transmissionId,
              proof.messageId,
              proof.targetId,
              proof.status,
              JSON.stringify(proof),
              proof.transmittedAtUtc,
              proof.payloadSha256,
              proof.proofArtifactSha256,
              now(),
            ),
          env.DB
            .prepare('UPDATE messages SET state=?,transmission_id=?,updated_at_utc=? WHERE id=?')
            .bind('TRANSMITTED_PROOFED', proof.transmissionId, now(), proof.messageId),
        ]);
        return json({
          data: proof,
          propagation: computePropagation(proof, getTarget(proof.targetId)!, Date.now()),
        }, { status: 201 }, correlationId);
      }

      const datasetMatch = url.pathname.match(/^\/api\/v1\/datasets\/([^/]+)\/manifest$/);
      if (request.method === 'GET' && datasetMatch) {
        if (datasetMatch[1] !== VOYAGER_CONTROL.id) throw new PublicError('Dataset not found', 404);
        return json({ data: VOYAGER_CONTROL }, {}, correlationId);
      }

      const reviewMatch = url.pathname.match(/^\/api\/v1\/candidates\/([^/]+)\/review$/);
      if (request.method === 'POST' && reviewMatch) {
        if (!isOperator(request, env)) throw new PublicError('Operator authorization required', 401);
        const input = reviewSchema.parse(await requestBody(request));
        const review = {
          id: `review-${crypto.randomUUID()}`,
          candidateId: reviewMatch[1],
          ...input,
          operatorId: 'authorized-operator',
          truthClass: 'HUMAN_REVIEW',
          reviewedAtUtc: now(),
        };
        if (env.DB) {
          await env.DB
            .prepare('INSERT INTO candidate_reviews(id,candidate_id,operator_id,state,notes,created_at_utc) VALUES(?,?,?,?,?,?)')
            .bind(review.id, review.candidateId, review.operatorId, review.state, review.notes ?? null, review.reviewedAtUtc)
            .run();
        }
        return json({ data: review }, { status: 201 }, correlationId);
      }

      throw new PublicError('Route not found', 404);
    } catch (cause) {
      if (cause instanceof z.ZodError) {
        return json({
          error: 'Validation failed',
          issues: cause.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
          correlationId,
        }, { status: 422 }, correlationId);
      }
      if (cause instanceof PublicError) {
        return json({ error: cause.message, correlationId }, { status: cause.status }, correlationId);
      }
      console.error('unhandled', correlationId, cause);
      return json({ error: 'Internal server error', correlationId }, { status: 500 }, correlationId);
    }
  },
} satisfies ExportedHandler<Env>;
