import type {WorkoutLog} from './types';
import {program} from './program';
import {volumeMultiplier} from './loadConvention';
export const benchIDs=new Set(['barbell-bench-press','barbell-bench-press-volume','readiness-single','goal-attempt']);
export const position=(r:Pick<WorkoutLog,'week'|'day'>)=>r.week*10+['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(r.day);
export const completed=(r:WorkoutLog)=>r.done&&!r.deleted_at&&!r.exercise_id.endsWith('-warmup');
export function loaded(r:WorkoutLog){const ex=program[r.week-1]?.workouts.find(w=>w.day===r.day)?.exercises.find(e=>e.id===r.exercise_id||r.exercise_id.startsWith(e.id+'--sub--'));const reps=r.exercise_id.endsWith('--sub--cable-biceps-curl')?'10–12':(r.exercise_id===ex?.id?ex?.originalReps||ex?.reps:ex?.reps);return completed(r)&&!!ex&&!!reps&&!/sec|min|\bm\b/i.test(reps)&&r.weight!==null&&r.weight>0&&Number.isFinite(r.weight)&&r.reps!==null&&r.reps>0&&Number.isFinite(r.reps);}
export function estimatedMax(weight:number,reps:number){return weight>0&&Number.isFinite(weight)&&Number.isInteger(reps)&&reps>=1&&reps<=10?Math.trunc(reps===1?weight:weight*(30+reps)/30):null;}
export const setVolume=(row:WorkoutLog):number=>loaded(row)?row.weight!*row.reps!*volumeMultiplier(row.exercise_id):0;
export interface WeeklyProgress {week:number;benchLoad:number|null;estimatedMax:number|null;volume:number|null;averageRPE:number|null}
export function weeklyProgress(logs:WorkoutLog[],userId:string):WeeklyProgress[]{
 const history=logs.filter(row=>row.user_id===userId&&completed(row)&&program[row.week-1]?.workouts.find(w=>w.day===row.day)?.exercises.some(ex=>row.exercise_id===ex.id||row.exercise_id.startsWith(ex.id+'--sub--')));
 return [...new Set(history.map(row=>row.week))].sort((a,b)=>a-b).map(week=>{
  const rows=history.filter(row=>row.week===week),weighted=rows.filter(loaded);
  const bench=weighted.filter(row=>benchIDs.has(row.exercise_id));
  const estimates=bench.map(row=>estimatedMax(row.weight!,row.reps!)).filter((value):value is number=>value!==null);
  const rpes=rows.map(row=>row.rpe).filter((rpe):rpe is number=>rpe!==null&&Number.isFinite(rpe)&&rpe>=1&&rpe<=10);
  return {week,benchLoad:bench.length?Math.max(...bench.map(row=>row.weight!)):null,estimatedMax:estimates.length?Math.max(...estimates):null,volume:weighted.length?weighted.reduce((total,row)=>total+setVolume(row),0):null,averageRPE:rpes.length?rpes.reduce((total,rpe)=>total+rpe,0)/rpes.length:null};
 });
}
export function previousSession(logs:WorkoutLog[],exercise:string,week:number,day:WorkoutLog['day']){const earlier=logs.filter(r=>completed(r)&&r.exercise_id===exercise&&position(r)<position({week,day}));const last=Math.max(...earlier.map(position));return earlier.filter(r=>position(r)===last).sort((a,b)=>a.set_number-b.set_number);}
export function plates(total:number,bar=45){if(!Number.isFinite(total)||!Number.isFinite(bar)||bar<0||total<bar||total>3000)return null;let remaining=(total-bar)/2;const result:{plate:number;count:number}[]=[];for(const plate of [45,35,25,10,5,2.5,1.25]){const count=Math.floor((remaining+1e-8)/plate);if(count){result.push({plate,count});remaining-=count*plate;}}return {result,remainder:remaining*2};}

