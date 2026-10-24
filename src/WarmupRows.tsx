import './warmups.css';
import React from 'react';
import type{DayName,Exercise,WorkoutLog,WorkoutPatch}from './types';
import {idFor} from './client';
import {warmupSchedule} from './warmupSchedule';
export default function WarmupRows({exercise,userId,week,day,logs,save}:{exercise:Exercise;userId:string;week:number;day:DayName;logs:WorkoutLog[];save:(ex:Exercise,n:number,patch:WorkoutPatch)=>Promise<void>}){
 const prescribed=warmupSchedule[week-1]?.[day]||[];
 if(!prescribed.length)return null;
 const warmupExercise={...exercise,id:exercise.id+'-warmup'};
 return <div className="warmups">
   <div className="warmup-heading"><strong>Warm-up sets</strong><span>Prescribed program</span></div>
   <p className="warmup-note">These warm-ups are from your original workout plan and don't count toward working-set volume. You can log the weight and reps you actually complete.</p>
   <div className="row headings"><span>SET</span><span>LB</span><span>REPS</span><span>RPE</span><span>✓</span></div>
   {prescribed.map(([weight,reps],i)=>{
    const n=i+1;
    const log=logs.find(l=>l.id===idFor(userId,week,day,warmupExercise.id,n));
    return <div className="row warmup-row" key={n}>
      <b>W{n}</b>
      {(['weight','reps','rpe'] as const).map(field=>field==='rpe'?<select key={field} aria-label={exercise.name+' warm-up '+n+' RPE'} value={log?.rpe??''} onChange={e=>save(warmupExercise,n,{rpe:e.target.value===''?null:Number(e.target.value)})}><option value="">—</option>{Array.from({length:10},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select>:<input key={field} type="number" inputMode="decimal"
        aria-label={exercise.name+' warm-up '+n+' '+field}
        placeholder={field==='weight'?String(weight):String(reps)}
        value={log?.[field]??''}
        onChange={e=>save(warmupExercise,n,{[field]:e.target.value===''?null:Number(e.target.value)})}/>)}
      <button className={log?.done?'complete':'check'}
        onClick={()=>save(warmupExercise,n,{done:!log?.done,weight:log?.weight??weight,reps:log?.reps??reps})}
        aria-label={'Complete warm-up '+n}>✓</button>
    </div>
   })}
 </div>;
}
