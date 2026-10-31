import HUDDialog from './HUDDialog';
import React,{useEffect,useRef,useState} from 'react';
import type {DayName,Exercise,WorkoutLog,WorkoutPatch} from './types';
import {ExerciseNotes} from './ExerciseNotes';
import {program} from './program';
import {warmupSchedule} from './warmupSchedule';
import {recommendWeight} from './recommendations';
import {benchIDs,completed,estimatedMax,loaded,plates,position,previousSession} from './performance';
export function RestTimer({storageKey}:{storageKey:string}){
 const [deadline,setDeadline]=useState(()=>{try{return Number(localStorage.getItem(storageKey))||0}catch{return 0}}),[now,setNow]=useState(Date.now());const announced=useRef(false);
 function update(value:number){setDeadline(value);announced.current=false;try{localStorage.setItem(storageKey,String(value))}catch{/* timer still works in memory */}}
 useEffect(()=>{const tick=setInterval(()=>setNow(Date.now()),500);const start=()=>update(Date.now()+90000);window.addEventListener('powerbuilder:set-completed',start);return()=>{clearInterval(tick);window.removeEventListener('powerbuilder:set-completed',start)}},[storageKey]);
 const remaining=Math.max(0,Math.ceil((deadline-now)/1000));useEffect(()=>{if(deadline&&remaining===0&&!announced.current){announced.current=true;navigator.vibrate?.([100,60,100])}},[remaining,deadline]);
 return <div className="rest-hud"><div><small>REST</small><strong role="timer">{deadline?(remaining?`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`:'Ready'):'1:30'}</strong></div><button onClick={()=>update(Math.max(Date.now(),deadline)+30000)}>+30s</button><button onClick={()=>update(deadline&&remaining?0:Date.now()+90000)}>{deadline&&remaining?'Skip':'Start'}</button></div>;
}
export function WorkoutHUD({userId,week,day,exercises,logs,save,onSwap,onOverview}:{userId:string;week:number;day:DayName;exercises:Exercise[];logs:WorkoutLog[];save:(ex:Exercise,n:number,p:WorkoutPatch)=>Promise<void>;onSwap:(exerciseId:string)=>void;onOverview:()=>void}){
 const prescribedWarmups=warmupSchedule[week-1]?.[day]||[];
 const mainId=program[week-1]?.workouts.find(w=>w.day===day)?.exercises[0]?.id;
 const first=exercises.find(ex=>ex.id===mainId);
 const includeWarmups=first&&first.id.indexOf('--sub--')<0&&prescribedWarmups.length>0;
 const choices=includeWarmups?exercises.flatMap(ex=>ex.id===mainId?[{...ex,id:ex.id+'-warmup',name:ex.name+' warm-up',sets:prescribedWarmups.length},ex]:[ex]):exercises;
 const swipeY=useRef<number|null>(null);
 const [selected,setSelected]=useState<string|null>(null),[editing,setEditing]=useState<number|null>(null),[plateOpen,setPlateOpen]=useState(false),[failure,setFailure]=useState(''),[saving,setSaving]=useState(false);
 const rows=(ex:Exercise)=>logs.filter(l=>l.week===week&&l.day===day&&l.exercise_id===ex.id&&!l.deleted_at);
 const retired=(ex:Exercise,n:number)=>logs.some(l=>l.week===week&&l.day===day&&l.exercise_id===ex.id&&l.set_number===n&&!!l.deleted_at);
 const next=choices.find(ex=>Array.from({length:ex.sets},(_,i)=>i+1).some(n=>!retired(ex,n)&&!rows(ex).some(l=>l.set_number===n&&l.done)));
 const base=choices.find(e=>e.id===selected)||next||choices[0];
 const n=editing??(Array.from({length:base?.sets||0},(_,i)=>i+1).find(n=>!retired(base,n)&&!rows(base).some(l=>l.set_number===n&&l.done))??1);
 const pair=base?.id.endsWith('-warmup')?prescribedWarmups[n-1]:null;
 const exercise=base&&pair?{...base,target:pair[0],reps:String(pair[1])}:base;
 const row=exercise?rows(exercise).find(l=>l.set_number===n):undefined;
 const recommended=exercise?recommendWeight(week,day,exercise,logs).weight:null;
 const [weight,setWeight]=useState(''),[reps,setReps]=useState(''),[rpe,setRPE]=useState('');
 useEffect(()=>{setWeight(String(row?.weight??exercise?.target??recommended??''));setReps(String(row?.reps??(/^\d+$/.test(exercise?.reps||'')?exercise.reps:'')));setRPE(String(row?.rpe??''));setFailure('')},[exercise?.id,n,row?.updated_at]);
 if(!exercise)return null;
 const previous=previousSession(logs,exercise.id,week,day);const last=previous.find(l=>l.set_number===n)||previous[0];
 const done=rows(exercise).filter(l=>l.done&&l.set_number<=exercise.sets).length;const allDone=!next;
 async function commit(){setSaving(true);setFailure('');try{await save(exercise,n,{weight:Number(weight),reps:Number(reps),rpe:rpe?Number(rpe):null,done:true});setEditing(null);setSelected(null)}catch{setFailure('Could not save this set. Your entries are kept.')}finally{setSaving(false)}}
 const valid=weight.trim()!==''&&Number.isFinite(Number(weight))&&Number(weight)>=0&&Number(weight)<=3000&&/^\d+$/.test(reps)&&Number(reps)>0&&Number(reps)<=1000&&(!rpe||(Number(rpe)>=1&&Number(rpe)<=10));
 return <section className="hud"><div className="hud-heading"><div><small>WEEK {week} / {day}</small><h2>{allDone?'SESSION COMPLETE':exercise.name}</h2></div><button onClick={onOverview} aria-label="Workout overview">☰</button></div><div className="hud-tools"><button onClick={()=>onSwap(exercise.id.replace(/-warmup$/,''))}>⇄ Swap exercise</button><button onClick={()=>setPlateOpen(true)}>Plate calculator</button></div>
 <div className="set-ring" onTouchStart={e=>{swipeY.current=e.touches[0].clientY}} onTouchEnd={e=>{if(swipeY.current!==null&&swipeY.current-e.changedTouches[0].clientY>60)onOverview();swipeY.current=null}} role="img" aria-label={`${done} of ${exercise.sets} ${exercise.id.endsWith('-warmup')?'warm-up':'working'} sets complete`} style={{'--progress':`${exercise.sets?done/exercise.sets*100:0}%`} as React.CSSProperties}><div><small>{editing?'EDIT SET':'SET'}</small><strong>{n}</strong><span>OF {exercise.sets}</span></div></div>
 <p className="prescribed">Prescribed: {exercise.target!==null?`${exercise.target} lb · `:''}{exercise.sets} × {exercise.reps}</p>
 {last&&<p className="last-session">Last session · {last.weight??'—'} lb × {last.reps??'—'}{last.rpe!==null?` @ RPE ${last.rpe}`:''} · Week {last.week}</p>}
 <div className="hud-fields"><label>WEIGHT · LB<input type="number" inputMode="decimal" min="0" max="3000" value={weight} onChange={e=>setWeight(e.target.value)}/></label><label>ACTUAL REPS<input type="number" inputMode="numeric" min="1" max="1000" value={reps} onChange={e=>setReps(e.target.value)}/></label></div><label className="hud-rpe">RPE · optional<select value={rpe} onChange={e=>setRPE(e.target.value)}><option value="">Not logged</option>{Array.from({length:19},(_,i)=>1+i*.5).map(v=><option key={v}>{v}</option>)}</select></label>
 <div className="set-strip" aria-label="Tap a set to edit">{Array.from({length:exercise.sets},(_,i)=>i+1).map(number=>{const l=rows(exercise).find(l=>l.set_number===number);return <button disabled={retired(exercise,number)} key={number} className={number===n?'current':l?.done?'logged':''} onClick={()=>setEditing(number)}><b>{l?.done?'✓ ':''}Set {number}</b><small>{l?`${l.weight??'—'} × ${l.reps??'—'}`:'—'}</small></button>})}</div>
 <RestTimer storageKey={`rest:${userId}:${week}:${day}`}/><button className="primary log-set" disabled={!valid||saving||retired(exercise,n)} onClick={commit}>{saving?'Saving…':row?.done?'SAVE SET CHANGES':'LOG SET'}</button>{failure&&<p role="alert">{failure}</p>}
 <ExerciseNotes userId={userId} week={week} day={day} exerciseId={exercise.id}/>
 <label className="hud-rpe">Jump to exercise<select value={exercise.id} onChange={e=>{setSelected(e.target.value);setEditing(null)}}>{choices.map(ex=><option key={ex.id} value={ex.id}>{ex.name}</option>)}</select></label>
 {plateOpen&&<HUDDialog title="Plate calculator" onClose={()=>setPlateOpen(false)}><PlateCalculator initialWeight={Number(weight)}/></HUDDialog>}
 </section>;
}
export function WorkoutRecap({logs,week,day}:{logs:WorkoutLog[];week:number;day:DayName}){
 const current=logs.filter(l=>completed(l)&&l.week===week&&l.day===day);const previous=logs.filter(l=>completed(l)&&l.day===day&&l.week<week);const priorWeek=Math.max(...previous.map(l=>l.week));const old=previous.filter(l=>l.week===priorWeek);
 const volume=(rows:WorkoutLog[])=>rows.filter(loaded).reduce((a,l)=>a+l.weight!*l.reps!,0);const records=[...new Set(current.filter(loaded).filter(l=>l.weight!>Math.max(0,...logs.filter(x=>loaded(x)&&x.exercise_id===l.exercise_id&&position(x)<position(l)).map(x=>x.weight!))).map(l=>l.exercise_id))];
 return <section className="exercise recap"><small>SESSION RECAP · WORKING SETS</small><h2>{current.length} sets · {volume(current).toLocaleString()} lb × reps</h2><p>{old.length?`${volume(current)-volume(old)>=0?'+':''}${(volume(current)-volume(old)).toLocaleString()} volume vs Week ${priorWeek} · ${current.length-old.length>=0?'+':''}${current.length-old.length} sets`:'No earlier matching training day to compare.'}</p><p>{records.length} exercise load records against earlier program sessions.</p><small>Current session totals; partial sessions remain partial. Warm-ups, holds, distance and deleted sets excluded from volume.</small></section>;
}
export function GoalProgress({logs}:{logs:WorkoutLog[]}){const bench=logs.filter(l=>loaded(l)&&benchIDs.has(l.exercise_id));const last=Math.max(...bench.map(position));const current=bench.filter(l=>position(l)===last);const estimates=current.map(l=>estimatedMax(l.weight!,l.reps!)).filter((v):v is number=>v!==null);const estimate=estimates.length?Math.max(...estimates):null;const tested=bench.filter(l=>l.reps===1).map(l=>l.weight!);return <section className="hero"><small>BENCH GOAL · 225 LB</small><h2>{estimate?`${estimate.toFixed(1)} lb estimated max`:'No qualifying bench sets yet'}</h2><progress aria-label="Estimated bench goal progress" value={Math.min(estimate||0,225)} max={225}/><p>Heaviest recorded single: {tested.length?Math.max(...tested)+' lb':'—'}</p><small>Epley estimate from the latest program session, using 1–10 reps. An estimate is not a tested lift or a guarantee.</small></section>}
export function ExerciseProgress({logs}:{logs:WorkoutLog[]}){
 const ids=[...new Set(logs.filter(loaded).map(l=>l.exercise_id))];
 return <>{ids.map(id=>{const rows=logs.filter(l=>loaded(l)&&l.exercise_id===id);const weeks=[...new Set(rows.map(l=>l.week))].sort((a,b)=>a-b);const values=weeks.map(week=>({week,weight:Math.max(...rows.filter(l=>l.week===week).map(l=>l.weight!))}));const latest=values[values.length-1];const max=Math.max(...values.map(v=>v.weight),1);return <section className="exercise" key={id}><h3>{id.split('--sub--').slice(-1)[0].replace(/-/g,' ')}</h3><small>LATEST PROGRAM WEEK</small><h2>{latest.weight} lb · Week {latest.week}</h2><svg role="img" aria-label={`Weekly highest completed load: ${values.map(v=>`Week ${v.week}: ${v.weight} lb`).join(', ')}`} viewBox="0 0 360 110" style={{width:'100%',height:110}}><polyline fill="none" stroke="#ff781f" strokeWidth="3" points={values.map(v=>`${16+(v.week-1)*36},${90-v.weight/max*70}`).join(' ')}/>{values.map(v=><g key={v.week}><circle cx={16+(v.week-1)*36} cy={90-v.weight/max*70} r="4" fill="#ff781f"/><text x={16+(v.week-1)*36} y="108" textAnchor="middle" fill="#bbb" fontSize="10">W{v.week}</text></g>)}</svg></section>})}</>;
}

function PlateCalculator({initialWeight}:{initialWeight:number}){const [total,setTotal]=useState(String(Math.max(initialWeight||45,45))),[bar,setBar]=useState('45');const plate=total.trim()&&bar.trim()?plates(Number(total),Number(bar)):null;return <><p>Pounds · per side</p><label>Total barbell weight<input type="number" min="0" max="3000" value={total} onChange={e=>setTotal(e.target.value)}/></label><label>Bar weight<input type="number" min="0" value={bar} onChange={e=>setBar(e.target.value)}/></label>{plate?<><p>{plate.result.length?plate.result.map(p=>`${p.count} × ${p.plate} lb`).join(' + '):'Empty bar'}</p>{plate.remainder>0.001&&<p>Unmatched: {plate.remainder.toFixed(2)} lb total. Adjust the target or use smaller plates.</p>}</>:<p>Enter a valid total at least as heavy as the bar.</p>}<p>For barbells only. Confirm your bar weight and available plates. This calculator does not change your logged weight.</p></>}
