import { useEffect, useMemo, useState } from 'react';
import type { CmpProfile } from '../lib/cmp';
import type { Target } from '../lib/targets';
export function estimateCmpBits(message:string,targetId:string){return Math.max(1,(24+new TextEncoder().encode(targetId).length+new TextEncoder().encode(message).length)*8*3)}
const draftKey=(targetId:string)=>`stellar-thread-local-draft:${targetId}`;
export function Composer({target,onEncode,persistenceReady}:{target:Target;onEncode:(message:string,profile:CmpProfile)=>Promise<void>;persistenceReady:boolean}){
 const[message,setMessage]=useState('');const[profile,setProfile]=useState<CmpProfile>('CMP_TEXT');const[busy,setBusy]=useState(false);
 useEffect(()=>{setMessage(localStorage.getItem(draftKey(target.id))??'')},[target.id]);
 useEffect(()=>{if(message)localStorage.setItem(draftKey(target.id),message);else localStorage.removeItem(draftKey(target.id))},[message,target.id]);
 const estimate=useMemo(()=>estimateCmpBits(message,target.id),[message,target.id]);
 const submit=async()=>{if(!message.trim()||!persistenceReady)return;setBusy(true);try{await onEncode(message,profile);setMessage('')}finally{setBusy(false)}};
 return <section className="composer-card" aria-label="Compositor de mensaje">
  <div className="composer-heading"><div><span>Nuevo mensaje para</span><strong>{target.displayName}</strong></div><span className="earth-status">LOCAL DRAFT · NOT PERSISTED</span></div>
  <textarea value={message} maxLength={65535} onChange={e=>setMessage(e.target.value)} aria-label="Mensaje humano" placeholder="Escribí un mensaje…" />
  <div className="composer-controls"><label>Perfil CMP<select value={profile} onChange={e=>setProfile(e.target.value as CmpProfile)}><option>CMP_TEXT</option><option>CMP_MATH_BOOTSTRAP</option><option>CMP_BEACON</option><option>CMP_REPLY_REQUEST</option></select></label><span><b>{estimate.toLocaleString()}</b> bits estimados</span><button disabled={!message.trim()||busy||!persistenceReady} onClick={submit}>{busy?'Persistiendo…':'Codificar y persistir'}</button></div>
  <p>{persistenceReady?'La codificación se guarda mediante Worker/D1. Codificar no transmite.':'D1 no está confirmado. El texto permanece sólo como draft local y no se presenta como persistido.'}</p>
 </section>
}
