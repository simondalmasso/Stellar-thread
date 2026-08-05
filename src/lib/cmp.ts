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


export function sha256Hex(bytes: Uint8Array): string {
  const K = new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
  const rotr=(x:number,n:number)=>(x>>>n)|(x<<(32-n));
  const bitLength=bytes.length*8; const paddedLength=Math.ceil((bytes.length+9)/64)*64; const data=new Uint8Array(paddedLength); data.set(bytes);data[bytes.length]=0x80;
  const view=new DataView(data.buffer); view.setUint32(paddedLength-4,bitLength>>>0,false); view.setUint32(paddedLength-8,Math.floor(bitLength/0x100000000),false);
  let h=new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]); const w=new Uint32Array(64);
  for(let offset=0;offset<paddedLength;offset+=64){for(let i=0;i<16;i++)w[i]=view.getUint32(offset+i*4,false);for(let i=16;i<64;i++){const s0=rotr(w[i-15],7)^rotr(w[i-15],18)^(w[i-15]>>>3);const s1=rotr(w[i-2],17)^rotr(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0;}let[a,b,c,d,e,f,g,hh]=h;for(let i=0;i<64;i++){const S1=rotr(e,6)^rotr(e,11)^rotr(e,25),ch=(e&f)^(~e&g),t1=(hh+S1+ch+K[i]+w[i])>>>0,S0=rotr(a,2)^rotr(a,13)^rotr(a,22),maj=(a&b)^(a&c)^(b&c),t2=(S0+maj)>>>0;hh=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;}h=new Uint32Array([(h[0]+a)>>>0,(h[1]+b)>>>0,(h[2]+c)>>>0,(h[3]+d)>>>0,(h[4]+e)>>>0,(h[5]+f)>>>0,(h[6]+g)>>>0,(h[7]+hh)>>>0]);}
  return Array.from(h,x=>x.toString(16).padStart(8,'0')).join('');
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
    payloadHash: sha256Hex(payload),
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
    payloadHash: sha256Hex(payload),
    checksumHex: expected.toString(16).padStart(8, '0'),
    correctedTriples: decoded.correctedTriples
  };
}
