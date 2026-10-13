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
  repetition?: 3;
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

const PREAMBLE = new Uint8Array([0x2a, 0x33, 0x2a, 0x33]);
const PROFILE_IDS: Record<CmpProfile, number> = {
  CMP_BEACON: 1, CMP_MATH_BOOTSTRAP: 2, CMP_TEXT: 3, CMP_IMAGE: 4,
  CMP_AUDIO_SYMBOLIC: 5, CMP_REPLY_REQUEST: 6, CMP_EXPERIMENTAL: 255
};
const ID_PROFILES = Object.fromEntries(Object.entries(PROFILE_IDS).map(([k, v]) => [v, k])) as Record<number, CmpProfile>;

function concat(...parts: Uint8Array[]) {
  const size = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(size);
  let cursor = 0;
  for (const part of parts) { output.set(part, cursor); cursor += part.length; }
  return output;
}
function u32(value: number) { const data = new Uint8Array(4); new DataView(data.buffer).setUint32(0, value, false); return data; }
function u64(value: bigint) { const data = new Uint8Array(8); new DataView(data.buffer).setBigUint64(0, value, false); return data; }
function bytesToBits(bytes: Uint8Array) { return Array.from(bytes, byte => byte.toString(2).padStart(8, '0')).join(''); }
function bitsToBytes(bits: string) {
  if (bits.length % 8) throw new Error('Bit length is not byte aligned');
  const bytes = new Uint8Array(bits.length / 8);
  for (let i = 0; i < bytes.length; i++) bytes[i] = Number.parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  return bytes;
}
function rotr(x: number, n: number) { return (x >>> n) | (x << (32 - n)); }
export function sha256Hex(input: Uint8Array) {
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const bitLength = input.length * 8; const paddedLength = Math.ceil((input.length + 9) / 64) * 64; const data = new Uint8Array(paddedLength); data.set(input); data[input.length] = 0x80; const view = new DataView(data.buffer); view.setUint32(paddedLength - 4, bitLength >>> 0, false); view.setUint32(paddedLength - 8, Math.floor(bitLength / 2 ** 32), false);
  let h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a,h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
  for(let offset=0;offset<data.length;offset+=64){const w=new Uint32Array(64);for(let i=0;i<16;i++)w[i]=view.getUint32(offset+i*4,false);for(let i=16;i<64;i++){const s0=rotr(w[i-15],7)^rotr(w[i-15],18)^(w[i-15]>>>3);const s1=rotr(w[i-2],17)^rotr(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0}let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,h=h7;for(let i=0;i<64;i++){const S1=rotr(e,6)^rotr(e,11)^rotr(e,25);const ch=(e&f)^(~e&g);const t1=(h+S1+ch+K[i]+w[i])>>>0;const S0=rotr(a,2)^rotr(a,13)^rotr(a,22);const maj=(a&b)^(a&c)^(b&c);const t2=(S0+maj)>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0}h0=(h0+a)>>>0;h1=(h1+b)>>>0;h2=(h2+c)>>>0;h3=(h3+d)>>>0;h4=(h4+e)>>>0;h5=(h5+f)>>>0;h6=(h6+g)>>>0;h7=(h7+h)>>>0}
  return [h0,h1,h2,h3,h4,h5,h6,h7].map(x=>x.toString(16).padStart(8,'0')).join('');
}
function crc32(bytes: Uint8Array) { let crc = 0xffffffff; for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); } return (crc ^ 0xffffffff) >>> 0; }
export function repetition3Encode(bits: string) { return [...bits].map(bit => bit.repeat(3)).join(''); }
export function repetition3Decode(bits: string) {
  if (bits.length % 3) throw new Error('Encoded bit length must be divisible by 3');
  let decoded = '', correctedTriples = 0;
  for (let cursor = 0; cursor < bits.length; cursor += 3) { const triple = bits.slice(cursor, cursor + 3); const ones = [...triple].filter(bit => bit === '1').length; if (ones !== 0 && ones !== 3) correctedTriples++; decoded += ones >= 2 ? '1' : '0'; }
  return { bits: decoded, correctedTriples };
}

export function encodeCmp1(input: CmpEncodeInput): CmpFrame {
  const repetition = input.repetition ?? 3;
  if (repetition !== 3) throw new Error('CMP-1 currently supports repetition=3 only');
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
  const header = concat(PREAMBLE,new Uint8Array([1,PROFILE_IDS[input.profile],3,target.length]),u64(epochSeconds),target,u32(payload.length),payload);
  const checksum = crc32(header); const raw = concat(header, u32(checksum)); const rawBits = bytesToBits(raw);
  return {version:1,profile:input.profile,targetId:input.targetId,epochUtc,message,payloadHash:sha256Hex(payload),checksumHex:checksum.toString(16).padStart(8,'0'),rawBitLength:rawBits.length,encodedBitLength:rawBits.length*3,fec:'REPETITION_3',bits:repetition3Encode(rawBits)};
}

export function decodeCmp1(encodedBits: string) {
  const decoded = repetition3Decode(encodedBits); const bytes = bitsToBytes(decoded.bits);
  if (bytes.length < 24 || !PREAMBLE.every((v, i) => bytes[i] === v)) throw new Error('CMP-1 preamble mismatch');
  if (bytes[4] !== 1) throw new Error('Unsupported CMP version');
  const profile = ID_PROFILES[bytes[5]]; if (!profile) throw new Error('Unknown CMP profile');
  if (bytes[6] !== 3) throw new Error('Unsupported CMP-1 repetition profile');
  const targetLen = bytes[7]; const epochSeconds = new DataView(bytes.buffer, bytes.byteOffset + 8, 8).getBigUint64(0, false); let cursor = 16;
  const targetBytes = bytes.slice(cursor, cursor + targetLen); cursor += targetLen; const payloadLength = new DataView(bytes.buffer, bytes.byteOffset + cursor, 4).getUint32(0, false); cursor += 4; const payload = bytes.slice(cursor, cursor + payloadLength); cursor += payloadLength;
  if (cursor + 4 !== bytes.length) throw new Error('CMP-1 frame length mismatch');
  const expected = new DataView(bytes.buffer, bytes.byteOffset + cursor, 4).getUint32(0, false); const actual = crc32(bytes.slice(0, cursor));
  if (expected !== actual) throw new Error(`CMP-1 checksum mismatch: expected ${expected.toString(16)}, got ${actual.toString(16)}`);
  const decoder = new TextDecoder('utf-8', { fatal: true });
  return {version:1 as const,profile,repetition:3 as const,targetId:decoder.decode(targetBytes),epochUtc:new Date(Number(epochSeconds)*1000).toISOString(),message:decoder.decode(payload),checksumHex:expected.toString(16).padStart(8,'0'),correctedTriples:decoded.correctedTriples,payloadHash:sha256Hex(payload)};
}
