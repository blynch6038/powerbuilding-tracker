import type {DayName,Exercise,WorkoutLog} from './types';
import {program} from './program';

export type Recommendation={weight:number|null;status:'plan'|'increase'|'hold'|'caution'|'none';reason:string;previous:string|null;isBenchGoal:boolean};
const benchGoalIds=new Set(['barbell-bench-press','barbell-bench-press-volume']);
const isLoaded=(v:number|null):v is number=>v!==null&&Number.isFinite(v)&&v>0;
const roundTo=(value:number,step:number)=>Math.max(step,Math.round(value/step)*step);
const numericReps=(text:string):number|null=>{const match=text.match(/^\d+/);return match?Number(match[0]):null;};

export function recommendWeight(week:number,day:DayName,exercise:Exercise,allLogs:WorkoutLog[]):Recommendation{
 const bench=benchGoalIds.has(exercise.id);
 const prescribed=bench?exercise.target:null;
 // Week 10 is a fixed deload / readiness / max test. Never auto-escalate it.
 if(week===10)return {weight:prescribed,status:bench?'plan':'none',reason:bench?'Week 10 taper is fixed; do not increase the prescribed bench load.':'Week 10 recovery or max-test day: no automatic weight progression.',previous:null,isBenchGoal:bench};
 const daysBefore=allLogs.filter(x=>x.exercise_id===exercise.id&&x.week<week&&x.week>0&&x.user_id&&x.deleted_at===null);
 const lastWeek=Math.max(0,...daysBefore.map(x=>x.week));
 const latest=daysBefore.filter(x=>x.week===lastWeek&&x.day===day);
 // For a substituted exercise, the active ID includes its specific replacement name.
 // This intentionally keeps its progression independent of the original movement.
 if(!latest.length){
  return {weight:prescribed,status:bench?'plan':'none',reason:bench?'Follow the original 10-week bench progression. No earlier logged session exists.':'No completed previous session for this exercise. Start conservatively and log your results.',previous:null,isBenchGoal:bench};
 }
 const completed=latest.filter(x=>x.done&&isLoaded(x.weight)&&x.reps!==null);
 const required=program[lastWeek-1]?.workouts.find(w=>w.day===day)?.exercises.find(e=>e.id===exercise.id)?.sets??completed.length;
 const plannedReps=program[lastWeek-1]?.workouts.find(w=>w.day===day)?.exercises.find(e=>e.id===exercise.id)?.reps??exercise.reps;
 const requiredReps=numericReps(plannedReps);
 const maxRpe=Math.max(0,...latest.filter(x=>x.done&&x.rpe!==null&&x.rpe>=1&&x.rpe<=10).map(x=>x.rpe!));
 const finished=required>0&&completed.length>=required&&completed.every(x=>requiredReps===null||x.reps!>=requiredReps);
 const lastLoad=completed.length?completed.reduce((a,x)=>a+(x.weight||0),0)/completed.length:0;
 const previous=completed.length?`Week ${lastWeek}: ${roundTo(lastLoad,0.5)} lb × ${completed[0].reps} reps${maxRpe?`, max RPE ${maxRpe}`:''}`:null;
 if(!completed.length)return {weight:prescribed,status:bench?'caution':'none',reason:'The previous session has no completed loaded sets. Review your log before progressing.',previous,isBenchGoal:bench};
 if(!finished||maxRpe>=10){
  return {weight:bench?Math.min(prescribed??lastLoad,roundTo(lastLoad,5)):roundTo(lastLoad,5),status:'caution',reason:!finished?'Previous session was incomplete or below prescribed reps; hold or reduce and reassess.':'Previous session reached RPE 10. Do not increase until you have more reps in reserve.',previous,isBenchGoal:bench};
 }
 if(bench){
  if(maxRpe>=9)return {weight:Math.min(prescribed??lastLoad,roundTo(lastLoad,5)),status:'hold',reason:'High exertion (RPE 9): consider maintaining the previous load rather than forcing progression.',previous,isBenchGoal:true};
  return {weight:prescribed,status:'plan',reason:maxRpe===0?'No valid RPE recorded. Follow the programmed bench target and monitor technique.':'Completed prescribed reps without maximal exertion. Follow the original bench target; no extra weight added.',previous,isBenchGoal:true};
 }
 // Never infer 1RM or load progression from holds, distances or zero-weight movements.
 if(!numericReps(exercise.reps)||!isLoaded(lastLoad))return {weight:null,status:'none',reason:'Time/distance/bodyweight movements need a manual load choice.',previous,isBenchGoal:false};
 if(maxRpe===0)return {weight:roundTo(lastLoad,5),status:'hold',reason:'No valid RPE recorded. Repeat the prior weight until effort is logged.',previous,isBenchGoal:false};
 if(maxRpe>=9)return {weight:roundTo(lastLoad,5),status:'hold',reason:'High RPE: repeat this weight rather than increasing.',previous,isBenchGoal:false};
 if(maxRpe>=8)return {weight:roundTo(lastLoad,5),status:'hold',reason:'RPE 8: maintain the weight and confirm solid form/recovery before progressing.',previous,isBenchGoal:false};
 const step=lastLoad<=50?2.5:5;
 return {weight:roundTo(lastLoad+step,step),status:'increase',reason:`All planned reps completed at RPE ${maxRpe}. Consider a small ${step} lb increase if equipment allows.`,previous,isBenchGoal:false};
}
