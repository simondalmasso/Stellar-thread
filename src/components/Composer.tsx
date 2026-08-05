import { useMemo, useState } from 'react';
import { encodeCmp1, type CmpFrame, type CmpProfile } from '../lib/cmp';
import type { Target } from '../lib/targets';
export function estimateCmpBits(message:string,targetId:string){return Math.max(1,(24+new TextEncoder().encode(targetId).length+new TextEncoder().encode(message).length)*8*3)}
export function Composer({target,onEncoded}:{target:Target;onEncoded:(frame:CmpFrame)=>void}){
 const[message,setMessage]=useState('Hola desde la Tierra. Este mensaje fue preparado con evidencia y paciencia.');const[profile,setProfile]=useState<CmpProfile>('CMP_TEXT');
 const estimate=useMemo(()=>estimateCmpBits(message,target.id),[message,target.id]);
 return <section className="composer-card" aria-label="Compositor de mensaje">
  <div className="composer-heading"><div><span>Nuevo mensaje para</span><strong>{target.displayName}</strong></div><span className="earth-status">EN LA TIERRA</span></div>
  <textarea value={message} maxLength={65535} onChange={e=>setMessage(e.target.value)} aria-label="Mensaje humano" placeholder="Escribí un mensaje…" />
  <div className="composer-controls"><label>Perfil CMP<select value={profile} onChange={e=>setProfile(e.target.value as CmpProfile)}><option>CMP_TEXT</option><option>CMP_MATH_BOOTSTRAP</option><option>CMP_BEACON</option><option>CMP_REPLY_REQUEST</option></select></label><span><b>{estimate.toLocaleString()}</b> bits codificados</span><button disabled={!message.trim()} onClick={()=>onEncoded(encodeCmp1({message,targetId:target.id,profile}))}>Codificar mensaje</button></div>
  <p>Codificar no transmite. Una propuesta, estación autorizada y prueba instrumental son pasos separados.</p>
 </section>
}
