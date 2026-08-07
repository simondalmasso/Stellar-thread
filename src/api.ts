import type { CmpEncodeInput, CmpFrame } from './lib/cmp';
import type { MessageRecord, PropagationResult, TransmissionProof } from './lib/reality';

export class ApiError extends Error { constructor(message:string, public status:number, public correlationId?:string){super(message)} }
async function requestJson<T>(path:string, init?:RequestInit):Promise<T>{
  let response:Response; try{response=await fetch(path,{...init,headers:{accept:'application/json',...(init?.headers??{})}})}catch{throw new ApiError('Network unavailable. Nothing was persisted.',0)}
  const body=await response.json().catch(()=>({})) as {error?:string;correlationId?:string}; if(!response.ok)throw new ApiError(body.error??`API ${response.status}`,response.status,body.correlationId); return body as T;
}
export interface HealthResponse { status:string; persistence:'D1'|'UNAVAILABLE'; physicalTransmissionEnabled:boolean; environment:string; timestamp:string }
export interface ThreadSnapshot { id:string;targetId:string;createdAtUtc:string;updatedAtUtc:string;latestMessage:MessageRecord|null;latestProof:TransmissionProof|null;propagation:PropagationResult|null }
export interface EncodeResponse { data:{message:MessageRecord;frame:CmpFrame}; provenance:unknown }
export interface ProposalResponse { data:{id:string;messageId:string;targetId:string;status:'PROPOSAL_READY';createdAtUtc:string} }
export class ThreadRepository { async list():Promise<ThreadSnapshot[]>{return (await requestJson<{data:ThreadSnapshot[]}>('/api/v1/threads')).data} }
export class MessageRepository {
  async encode(input:CmpEncodeInput):Promise<EncodeResponse>{return requestJson<EncodeResponse>('/api/v1/messages/encode',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)})}
  async get(id:string){return requestJson<{data:{message:MessageRecord;frame:CmpFrame|null;proof:TransmissionProof|null}}>(`/api/v1/messages/${encodeURIComponent(id)}`)}
}
export class TransmissionRepository {
  async createProposal(message:MessageRecord){if(!message.payloadSha256)throw new ApiError('Encoded message has no payload hash',422);return requestJson<ProposalResponse>('/api/v1/transmissions/proposal',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messageId:message.id,targetId:message.targetId,encodingProfile:message.cmpProfile,payloadHash:message.payloadSha256})})}
  async getProof(id:string):Promise<TransmissionProof|null>{try{return (await requestJson<{data:TransmissionProof}>(`/api/v1/transmissions/${encodeURIComponent(id)}/proof`)).data}catch(error){if(error instanceof ApiError&&error.status===404)return null;throw error}}
}
export class PropagationRepository { async get(messageId:string):Promise<PropagationResult>{return (await requestJson<{data:PropagationResult}>(`/api/v1/messages/${encodeURIComponent(messageId)}/propagation`)).data} }
export class DatasetRepository { async getManifest(id:string){return requestJson(`/api/v1/datasets/${encodeURIComponent(id)}/manifest`)} }
export async function getHealth(){return requestJson<HealthResponse>('/api/v1/health')}
