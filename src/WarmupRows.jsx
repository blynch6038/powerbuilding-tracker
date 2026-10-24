import React from 'react';
import {idFor} from './client';

const round5 = n => Math.max(45,Math.round(n/5)*5);
export function warmupSuggestion(exercise,index){
 const target=exercise.target;
 if(target==null || !Number.isFinite(target))return null;
 const fraction=[0,.50,.70,.85][index];
 return index===0?45:round5(target*fraction);
}
export default function WarmupRows({exercise,userId,week,day,logs,save}){
 const warmupExercise={...exercise,id:exercise.id+'-warmup'};
 const prescription=[10,5,3,1];
 return <div className="warmups">
  <div className="warmup-heading"><strong>Warm-up sets</strong><span>Before working sets</span></div>
  <p className="warmup-note">Gradually increase the load; these do not count toward working-set volume. Suggested weights are editable.</p>
  <div className="row headings"><span>SET</span><span>LB</span><span>REPS</span><span>RPE</span><span>✓</span></div>
  {prescription.map((rep,i)=>{
    const n=i+1;
    const log=logs.find(l=>l.id===idFor(userId,week,day,warmupExercise.id,n));
    const suggested=warmupSuggestion(exercise,i);
    return <div className="row warmup-row" key={n}>
      <b>W{n}</b>
      {['weight','reps','rpe'].map(field=><input key={field} type="number" inputMode="decimal"
       aria-label={exercise.name+' warm-up '+n+' '+field}
       placeholder={field==='weight'?(suggested===null?'—':String(suggested)):field==='reps'?String(rep):'—'}
       value={log?.[field]??''}
       onChange={e=>save(warmupExercise,n,{[field]:e.target.value===''?null:Number(e.target.value)})}/>)}
      <button className={log?.done?'complete':'check'} onClick={()=>save(warmupExercise,n,{done:!log?.done,weight:log?.weight??suggested,reps:log?.reps??rep})} aria-label={'Complete warm-up '+n}>✓</button>
    </div>
  })}
 </div>
}
