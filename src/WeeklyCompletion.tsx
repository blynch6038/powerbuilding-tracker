import React,{useState} from 'react';
import {weeklyCompletion,type WeeklySet} from './weeklyCompletion';
import type {DayName,WorkoutLog,ExerciseSubstitution,WorkoutPatch} from './types';
import {recommendWeight} from './recommendations';
import {primaryBodyPart} from './bodyParts';
import {isFarmerCarry} from './loadConvention';
type Props={week:number;day:DayName;userId:string;logs:WorkoutLog[];choices:ExerciseSubstitution[];save:(set:WeeklySet,patch:WorkoutPatch)=>Promise<void>};
const label=(d:string)=>'Day '+(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(d)+1);
const compound=(s:WeeklySet)=>/bench|squat|deadlift|romanian/i.test(s.exercise.name);
export default function WeeklyCompletion({week,day,userId,logs,choices,save}:Props){
 const summary=weeklyCompletion(week,day,userId,logs,choices);
 const [selected,setSelected]=useState<string[]>([]),[mode,setMode]=useState(false),[minutes,setMinutes]=useState(15);
 const available=summary.open.filter(s=>s.day!==day&&!logs.some(r=>r.id===s.key&&r.deleted_at));
 const chosen=available.filter(s=>selected.includes(s.key));
 const dayOrder=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
 const nearbyParts=new Set(summary.sets.filter(s=>Math.abs(dayOrder.indexOf(s.day)-dayOrder.indexOf(day))<=1).map(s=>primaryBodyPart(s.exercise.id)));
 const suggest=()=>setSelected(available.filter(s=>!compound(s)&&!nearbyParts.has(primaryBodyPart(s.exercise.id))).slice(0,Math.floor(minutes/3)).map(s=>s.key));
 const own=logs.filter(r=>r.user_id===userId);
 return <section className="exercise"><h3>Week {week} · Training completion</h3><h2>{summary.percent}%</h2><progress max={Math.max(1,summary.planned)} value={summary.completed}/><p>{summary.completed} / {summary.planned} working sets · {summary.remaining} remaining</p>
 {Array.from(new Set(summary.sets.map(s=>s.day))).map(d=>{const rows=summary.sets.filter(s=>s.day===d);return <div key={d}>{label(d)}: {rows.filter(s=>s.status==='completed').length}/{rows.length} <progress max={rows.length} value={rows.filter(s=>s.status==='completed').length}/></div>})}
 <details open={mode||undefined}><summary>Catch-up sets · {available.length} from earlier days</summary><p>{summary.future.length} future sets are not overdue. {summary.skipped.length} intentionally skipped. Catch-up work keeps its original workout assignment.</p>
 <label>Available minutes <input type="number" min="0" max="120" value={minutes} onChange={e=>setMinutes(Math.max(0,Math.min(120,Number(e.target.value))))}/></label><button onClick={suggest}>Suggest accessory sets</button>
 <p>Estimate: {chosen.reduce((n,s)=>n+(compound(s)?5:3),0)} minutes, excluding setup/warm-up. Suggestions exclude heavy lifts and muscle groups scheduled within one day. Check recovery before adding any sets.</p>
 {!mode&&available.map(s=><label key={s.key} style={{display:'block'}}><input type="checkbox" checked={selected.includes(s.key)} onChange={e=>setSelected(v=>e.target.checked?[...v,s.key]:v.filter(k=>k!==s.key))}/> {label(s.day)} · {s.exercise.name} · Set {s.setNumber}</label>)}
 {!mode&&summary.skipped.map(s=><div key={s.key}>{label(s.day)} · {s.exercise.name} · Set {s.setNumber} — skipped <button onClick={()=>void save(s,{skipped:false,done:false}).catch(e=>alert(String(e)))}>Reopen</button></div>)}<button disabled={!chosen.length&&!mode} onClick={()=>setMode(!mode)}>{mode?'Return to selection':'Start catch-up workout'}</button>
 {mode&&chosen.map(s=><CatchUpSet key={s.key} set={s} logs={own} today={day} save={save}/>)}
 {mode&&!chosen.length&&<p>No selected open sets remain.</p>}</details></section>;
}
function CatchUpSet({set:s,logs,today,save}:{set:WeeklySet;logs:WorkoutLog[];today:DayName;save:Props['save']}){
 const row=logs.find(r=>r.id===s.key);
 const guidance=recommendWeight(s.week,today,s.exercise,logs);
 const [weight,setWeight]=useState(String(row?.weight??s.exercise.target??guidance.weight??'')),[reps,setReps]=useState(String(row?.reps??(isFarmerCarry(s.exercise.id)?50:/^\d+$/.test(s.exercise.reps)?s.exercise.reps:''))),[rpe,setRpe]=useState(String(row?.rpe??'')),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 return <div className="exercise"><b>{s.exercise.name} · {label(s.day)} · Set {s.setNumber}</b><p>Prescribed {s.exercise.reps} · {guidance.weight??'Choose'} lb guidance</p><label>Weight (lb)<input type="number" value={weight} onChange={e=>setWeight(e.target.value)}/></label><label>{isFarmerCarry(s.exercise.id)?'Yards':'Actual count'}<input type="number" value={reps} onChange={e=>setReps(e.target.value)}/></label><label>RPE<input type="number" min="1" max="10" step=".5" value={rpe} onChange={e=>setRpe(e.target.value)}/></label><button disabled={busy||weight===''||reps===''} onClick={async()=>{setBusy(true);try{await save(s,{weight:Number(weight),reps:Number(reps),rpe:rpe===''?null:Number(rpe),done:true})}catch(e){setError(String(e))}finally{setBusy(false)}}}>Complete original set</button><button disabled={busy} onClick={async()=>{setBusy(true);try{await save(s,{skipped:true,done:false})}catch(e){setError(String(e))}finally{setBusy(false)}}}>Skip intentionally</button>{error&&<p role="alert">{error}</p>}</div>;
}
export function WeeklyAdherence({userId,logs,choices}:{userId:string;logs:WorkoutLog[];choices:ExerciseSubstitution[]}){
 const latest=Math.max(0,...logs.filter(r=>r.user_id===userId&&r.done&&!r.deleted_at).map(r=>r.week));
 return <section className="exercise"><h3>Weekly training adherence</h3>{Array.from({length:latest},(_,i)=>{const s=weeklyCompletion(i+1,'Saturday',userId,logs,choices);return <div key={i}>Week {i+1}: {s.percent}% ({s.completed}/{s.planned}) <progress max={100} value={s.percent}/></div>})}</section>;
}
