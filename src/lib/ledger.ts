import type { CmpFrame } from './cmp';
import type { MessageRecord, TransmissionProof } from './reality';
const KEY='stellar-thread-reality-v2-ledger';
interface StorageLike { getItem(key:string):string|null; setItem(key:string,value:string):void }
const storage=():StorageLike|null=>((globalThis as unknown as {localStorage?:StorageLike}).localStorage??null);
export interface LedgerSnapshot { version:2; messages:MessageRecord[]; proofs:TransmissionProof[] }
const empty=():LedgerSnapshot=>({version:2,messages:[],proofs:[]});
export function loadLedger():LedgerSnapshot { try { const raw=storage()?.getItem(KEY); return raw?JSON.parse(raw) as LedgerSnapshot:empty(); } catch { return empty(); } }
export function saveLedger(value:LedgerSnapshot){try{storage()?.setItem(KEY,JSON.stringify(value));}catch{/* Browser fallback remains non-fatal; D1 is authoritative in deployed mode. */}}
export function recordEncodedMessage(frame:CmpFrame,targetId:string,text:string):MessageRecord {
 const now=new Date().toISOString(); const current=loadLedger();
 const record:MessageRecord={id:`msg-${crypto.randomUUID()}`,threadId:`thread-${targetId}`,targetId,text,state:'ENCODED',cmpProfile:frame.profile,cmpVersion:'CMP-1',payloadSha256:frame.payloadHash,encodedBits:frame.encodedBitLength,createdAtUtc:now,updatedAtUtc:now,proposalId:null,transmissionId:null,truthClass:'DERIVED'};
 current.messages.unshift(record); saveLedger(current); return record;
}
export function addProof(proof:TransmissionProof){const current=loadLedger();current.proofs=current.proofs.filter(x=>x.transmissionId!==proof.transmissionId);current.proofs.unshift(proof);saveLedger(current)}
