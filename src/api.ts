import { encodeCmp1, type CmpEncodeInput } from './lib/cmp';
import { TARGETS } from './lib/targets';

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(path, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`${response.status}`);
    return await response.json() as T;
  } catch {
    return fallback;
  }
}

export async function encodeMessage(input: CmpEncodeInput) {
  try {
    const response = await fetch('/api/v1/messages/encode', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!response.ok) throw new Error(`encode ${response.status}`);
    return await response.json();
  } catch {
    return { data: encodeCmp1(input), provenance: { truthClass: 'DERIVED', source: 'browser CMP-1 fallback' } };
  }
}

export const targetFallback = { data: TARGETS, provenance: { truthClass: 'OFFICIAL_CATALOG', source: 'bundled snapshot' } };
