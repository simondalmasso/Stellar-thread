export type CmpProfile =
  | 'CMP_BEACON'
  | 'CMP_MATH_BOOTSTRAP'
  | 'CMP_TEXT'
  | 'CMP_IMAGE'
  | 'CMP_AUDIO_SYMBOLIC'
  | 'CMP_REPLY_REQUEST'
  | 'CMP_EXPERIMENTAL';

export interface CmpEncodeInput {
  message: string;
  targetId: string;
  profile: CmpProfile;
  epochUtc?: string;
  repetition?: number;
}

export interface CmpFrame {
  version: 1;
  profile: CmpProfile;
  targetId: string;
  epochUtc: string;
  message: string;
  payloadHash: string;
  checksumHex: string;
  rawBitLength: number;
  encodedBitLength: number;
  fec: 'REPETITION_3';
  bits: string;
}

const PREAMBLE = new Uint8Array([0xd3, 0xa5, 0xc7, 0xf1]);
const PROFILE_IDS: Record<CmpProfile, number> = {
  CMP_BEACON: 1,
  CMP_MATH_BOOTSTRAP: 2,
  CMP_TEXT: 3,
  CMP_IMAGE: 4,
  CMP_AUDIO_SYMBOLIC: 5,
  CMP_REPLY_REQUEST: 6,
  CMP_EXPERIMENTAL: 255
};
const ID_PROFILES = Object.fromEntries(Object.entries(PROFILE_IDS).map(([k, v]) => [v, k])) as Record<number, CmpProfile>;

function concat(...arrays: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(arrays.reduce((n, a) => n + a.length, 0));
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

function u32(value: number): Uint8Array {
  const a = new Uint8Array(4);
  new DataView(a.buffer).setUint32(0, value >>> 0, false);
  return a;
}

function u64(value: bigint): Uint8Array {
  const a = new Uint8Array(8);
  new DataView(a.buffer).setBigUint64(0, value, false);
  return a;
}

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function fnv1a64Hex(bytes: Uint8Array): string {
  let hash = 0xcbf29ce484222325n;
  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, '0');
}

function bytesToBits(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(2).padStart(8, '0')).join('');
}

function bitsToBytes(bits: string): Uint8Array {
  if (bits.length % 8 !== 0) throw new Error('Bit length is not byte aligned');
  const out = new Uint8Array(bits.length / 8);
  for (let i = 0; i < out.length; i++) out[i] = Number.parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  return out;
}

export function repetition3Encode(bits: string): string {
  return [...bits].map(bit => bit.repeat(3)).join('');
}

export function repetition3Decode(bits: string): { bits: string; correctedTriples: number } {
  if (bits.length % 3 !== 0) throw new Error('Invalid repetition-3 length');
  let decoded = '';
  let correctedTriples = 0;
  for (let i = 0; i < bits.length; i += 3) {
    const triple = bits.slice(i, i + 3);
    const ones = [...triple].filter(v => v === '1').length;
    if (ones !== 0 && ones !== 3) correctedTriples++;
    decoded += ones >= 2 ? '1' : '0';
  }
  return { bits: decoded, correctedTriples };
}

export function encodeCmp1(input: CmpEncodeInput): CmpFrame {
  const encoder = new TextEncoder();
  const message = input.message.normalize('NFC');
  if (!message.trim()) throw new Error('Message is empty');
  const target = encoder.encode(input.targetId);
  const payload = encoder.encode(message);
  if (target.length > 255) throw new Error('Target id too long');
  if (payload.length > 65_535) throw new Error('Payload too large');
  const epochUtc = input.epochUtc ?? new Date().toISOString();
  const epochSeconds = BigInt(Math.floor(Date.parse(epochUtc) / 1000));
  if (epochSeconds < 0n) throw new Error('Invalid epoch');
  const header = concat(
    PREAMBLE,
    new Uint8Array([1, PROFILE_IDS[input.profile], input.repetition ?? 3, target.length]),
    u64(epochSeconds),
    target,
    u32(payload.length),
    payload
  );
  const checksum = crc32(header);
  const raw = concat(header, u32(checksum));
  const rawBits = bytesToBits(raw);
  return {
    version: 1,
    profile: input.profile,
    targetId: input.targetId,
    epochUtc,
    message,
    payloadHash: fnv1a64Hex(payload),
    checksumHex: checksum.toString(16).padStart(8, '0'),
    rawBitLength: rawBits.length,
    encodedBitLength: rawBits.length * 3,
    fec: 'REPETITION_3',
    bits: repetition3Encode(rawBits)
  };
}

export function decodeCmp1(encodedBits: string) {
  const decoded = repetition3Decode(encodedBits);
  const bytes = bitsToBytes(decoded.bits);
  if (bytes.length < 24 || !PREAMBLE.every((v, i) => bytes[i] === v)) throw new Error('CMP-1 preamble mismatch');
  if (bytes[4] !== 1) throw new Error('Unsupported CMP version');
  const profile = ID_PROFILES[bytes[5]];
  if (!profile) throw new Error('Unknown CMP profile');
  const targetLen = bytes[7];
  const epochSeconds = new DataView(bytes.buffer, bytes.byteOffset + 8, 8).getBigUint64(0, false);
  let cursor = 16;
  const targetBytes = bytes.slice(cursor, cursor + targetLen); cursor += targetLen;
  const payloadLength = new DataView(bytes.buffer, bytes.byteOffset + cursor, 4).getUint32(0, false); cursor += 4;
  const payload = bytes.slice(cursor, cursor + payloadLength); cursor += payloadLength;
  if (cursor + 4 !== bytes.length) throw new Error('CMP-1 frame length mismatch');
  const expected = new DataView(bytes.buffer, bytes.byteOffset + cursor, 4).getUint32(0, false);
  const actual = crc32(bytes.slice(0, cursor));
  if (expected !== actual) throw new Error(`CMP-1 checksum mismatch: expected ${expected.toString(16)}, got ${actual.toString(16)}`);
  const decoder = new TextDecoder('utf-8', { fatal: true });
  return {
    version: 1 as const,
    profile,
    repetition: bytes[6],
    targetId: decoder.decode(targetBytes),
    epochUtc: new Date(Number(epochSeconds) * 1000).toISOString(),
    message: decoder.decode(payload),
    payloadHash: fnv1a64Hex(payload),
    checksumHex: expected.toString(16).padStart(8, '0'),
    correctedTriples: decoded.correctedTriples
  };
}
