import React,{useEffect,useState} from 'react';
import {liveQuery} from 'dexie';
import {db} from './client';
import type {DayName,ExerciseNote} from './types';
const startingWeightPrefix='[PowerBuilder machine starting weight] ';

export function ExerciseNotes({userId,week,day,exerciseId}:{userId:string;week:number;day:DayName;exerciseId:string}){
 const [weightDraft,setWeightDraft]=useState('');
 const [entries,setEntries]=useState<ExerciseNote[]>([]),[draft,setDraft]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{const subscription=liveQuery(()=>db.notes.where('user_id').equals(userId).filter(n=>n.exercise_id===exerciseId&&(n.body.startsWith(startingWeightPrefix)||(n.week===week&&n.day===day))).toArray()).subscribe({next:rows=>setEntries(rows.sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at)||a.id.localeCompare(b.id))),error:()=>setStatus('Notes could not be loaded. Try reopening this workout.')});return()=>subscription.unsubscribe()},[userId,week,day,exerciseId]);
 const notes=entries.filter(n=>!n.body.startsWith(startingWeightPrefix));
 const savedWeight=entries.filter(n=>n.body.startsWith(startingWeightPrefix)).slice(-1)[0]?.body.slice(startingWeightPrefix.length);
 const startingWeight=savedWeight&&savedWeight!=='clear'?savedWeight:null;
 const validWeight=weightDraft.trim()!==''&&Number.isFinite(Number(weightDraft))&&Number(weightDraft)>=0&&Number(weightDraft)<=3000;
 async function save(body:string,onSaved:()=>void){if(!body||body.length>2000||busy)return;setBusy(true);try{const row:ExerciseNote={id:crypto.randomUUID(),user_id:userId,week,day,exercise_id:exerciseId,body,created_at:new Date().toISOString(),dirty:1};await db.notes.add(row);onSaved();setStatus('Note saved on device • pending sync')}catch{setStatus('Could not save. Your draft is kept.')}finally{setBusy(false)}}
 return <>{startingWeight!==null&&<p><strong>Machine starting weight · {startingWeight} lb</strong></p>}
 <details><summary>{startingWeight===null?'Machine starting weight':'Edit machine starting weight'}</summary>
 <label>Unloaded machine weight (lb)<input type="number" min="0" max="3000" step="any" inputMode="decimal" placeholder={startingWeight??''} value={weightDraft} onChange={e=>setWeightDraft(e.target.value)}/></label>
 <p>Enter the machine’s listed starting resistance. This is a reference for this exercise across weeks.</p>
 <button type="button" disabled={busy||!validWeight} onClick={()=>void save(startingWeightPrefix+Number(weightDraft),()=>setWeightDraft(''))}>Save starting weight</button>
 {startingWeight!==null&&<button type="button" disabled={busy} onClick={()=>void save(startingWeightPrefix+'clear',()=>setWeightDraft(''))}>Clear starting weight</button>}
 </details><p className="note-preview">{notes.length?'✎ '+notes[notes.length-1].body:'No exercise notes yet'}</p><details className="exercise-notes"><summary>Exercise notes ({notes.length})</summary>{notes.map(n=><div key={n.id}><small>{new Date(n.created_at).toLocaleString()}{n.dirty?' · pending sync':''}</small><p style={{whiteSpace:'pre-wrap'}}>{n.body}</p></div>)}<label>Changes or other details<textarea maxLength={2000} value={draft} onChange={e=>setDraft(e.target.value)} rows={3}/></label><button type="button" disabled={busy||!draft.trim()} onClick={()=>void save(draft.trim(),()=>setDraft(''))}>{busy?'Saving…':'Add note'}</button></details><p role="status">{status}</p></>
}

