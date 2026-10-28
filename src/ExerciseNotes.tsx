import React,{useEffect,useState} from 'react';
import {liveQuery} from 'dexie';
import {db} from './client';
import type {DayName,ExerciseNote} from './types';
export function ExerciseNotes({userId,week,day,exerciseId}:{userId:string;week:number;day:DayName;exerciseId:string}){
 const [notes,setNotes]=useState<ExerciseNote[]>([]),[draft,setDraft]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{const subscription=liveQuery(()=>db.notes.where('user_id').equals(userId).filter(n=>n.week===week&&n.day===day&&n.exercise_id===exerciseId).toArray()).subscribe({next:rows=>setNotes(rows.sort((a,b)=>a.created_at.localeCompare(b.created_at))),error:()=>setStatus('Notes could not be loaded. Try reopening this workout.')});return()=>subscription.unsubscribe()},[userId,week,day,exerciseId]);
 async function save(){const body=draft.trim();if(!body||body.length>2000||busy)return;setBusy(true);try{const row:ExerciseNote={id:crypto.randomUUID(),user_id:userId,week,day,exercise_id:exerciseId,body,created_at:new Date().toISOString(),dirty:1};await db.notes.add(row);setDraft('');setStatus('Note saved on device • pending sync')}catch{setStatus('Could not save. Your draft is kept.')}finally{setBusy(false)}}
 return <details className="exercise-notes"><summary>Exercise notes ({notes.length})</summary>{notes.map(n=><div key={n.id}><small>{new Date(n.created_at).toLocaleString()}{n.dirty?' · pending sync':''}</small><p style={{whiteSpace:'pre-wrap'}}>{n.body}</p></div>)}<label>Changes or other details<textarea maxLength={2000} value={draft} onChange={e=>setDraft(e.target.value)} rows={3}/></label><button type="button" disabled={busy||!draft.trim()} onClick={save}>{busy?'Saving…':'Add note'}</button><p role="status">{status}</p></details>
}
