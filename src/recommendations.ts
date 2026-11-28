import type {DayName,Exercise,WorkoutLog} from './types';
import {resolveExercise} from './substitutions';
import {program} from './program';
import {canonicalExerciseName} from './exerciseNames';
import {isDumbbellExercise} from './loadConvention';

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
 const dayOrder=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
 const movement=(id:string)=>{const key=id.split('--sub--').slice(-1)[0];return key==='conventional-deadlift'?'trap bar deadlift':key==='standing-calf-raise'?'machine seated calf raise':canonicalExerciseName(key.replace(/-/g,' ')).toLowerCase();};
 const matches=(id:string)=>bench?id===exercise.id:movement(id)===movement(exercise.id);
 const daysBefore=allLogs.filter(x=>matches(x.exercise_id)&&x.week>0&&(x.week<week||x.week===week&&dayOrder.indexOf(x.day)<dayOrder.indexOf(day))&&x.user_id&&x.deleted_at===null);
 const usable=daysBefore.filter(x=>x.done&&isLoaded(x.weight)&&x.reps!==null);
 const lastWeek=Math.max(0,...usable.map(x=>x.week));
 const lastDay=dayOrder[Math.max(-1,...usable.filter(x=>x.week===lastWeek).map(x=>dayOrder.indexOf(x.day)))];
 const priorId=usable.filter(x=>x.week===lastWeek&&x.day===lastDay).sort((a,b)=>b.updated_at.localeCompare(a.updated_at))[0]?.exercise_id;
 const latest=daysBefore.filter(x=>x.week===lastWeek&&x.day===lastDay&&x.exercise_id===priorId);
 if(!latest.length){
  return {weight:prescribed,status:bench?'plan':'none',reason:bench?'Follow the original 10-week bench progression. No earlier logged session exists.':'No completed previous session for this exercise. Start conservatively and log your results.',previous:null,isBenchGoal:bench};
 }
 const completed=latest.filter(x=>x.done&&isLoaded(x.weight)&&x.reps!==null);
 const previousSlot=program[lastWeek-1]?.workouts.find(w=>w.day===lastDay)?.exercises.find(e=>e.id===priorId?.split('--sub--')[0]);
 const previousExercise=previousSlot?resolveExercise(previousSlot,exercise.name):exercise;
 const required=previousExercise.sets;
 const plannedReps=previousExercise.reps;
 const requiredReps=numericReps(plannedReps);
 const maxRpe=Math.max(0,...latest.filter(x=>x.done&&x.rpe!==null&&x.rpe>=1&&x.rpe<=10).map(x=>x.rpe!));
 const finished=required>0&&completed.length>=required&&completed.every(x=>requiredReps===null||x.reps!>=requiredReps);
 // Set number defines workout order; fetching or editing a row later must not change the baseline.
 const lastSet=completed.reduce<WorkoutLog|undefined>((last,row)=>!last||row.set_number>last.set_number?row:last,undefined);
 const lastLoad=lastSet?.weight??0;
 const previous=lastSet?`Week ${lastWeek}: ${lastLoad} lb × ${lastSet.reps} ${/\byd\b/i.test(exercise.reps)?'yd':'reps'} (last completed set ${lastSet.set_number})${maxRpe?`, max RPE ${maxRpe}`:''}`:null;
 if(!completed.length)return {weight:prescribed,status:bench?'caution':'none',reason:'The previous session has no completed loaded sets. Review your log before progressing.',previous,isBenchGoal:bench};
 const priorLoad=dumbbell?lastLoad:roundTo(lastLoad,5);
 if(!finished||maxRpe>=10){
  return {weight:bench?Math.min(prescribed??lastLoad,roundTo(lastLoad,5)):priorLoad,status:'caution',reason:!finished?'Previous session was incomplete or below prescribed reps; hold or reduce and reassess.':'Previous session reached RPE 10. Do not increase until you have more reps in reserve.',previous,isBenchGoal:bench};
 }
 if(bench){
  if(maxRpe>=9)return {weight:Math.min(prescribed??lastLoad,roundTo(lastLoad,5)),status:'hold',reason:'High exertion (RPE 9): consider maintaining the previous load rather than forcing progression.',previous,isBenchGoal:true};
  return {weight:prescribed,status:'plan',reason:maxRpe===0?'No valid RPE recorded. Follow the programmed bench target and monitor technique.':'Completed prescribed reps without maximal exertion. Follow the original bench target; no extra weight added.',previous,isBenchGoal:true};
 }
 // Never infer 1RM or load progression from holds, distances or zero-weight movements.
 if(/sec|min|\bm\b|\byd\b/i.test(exercise.reps)||!numericReps(exercise.reps)||!isLoaded(lastLoad))return {weight:null,status:'none',reason:'Time/distance/bodyweight movements need a manual load choice.',previous,isBenchGoal:false};
 if(maxRpe===0)return {weight:priorLoad,status:'hold',reason:'No valid RPE recorded. Repeat the prior weight until effort is logged.',previous,isBenchGoal:false};
 if(maxRpe>=9)return {weight:priorLoad,status:'hold',reason:'High RPE: repeat this weight rather than increasing.',previous,isBenchGoal:false};
 if(maxRpe>=8)return {weight:priorLoad,status:'hold',reason:'RPE 8: maintain the weight and confirm solid form/recovery before progressing.',previous,isBenchGoal:false};
 const dumbbell=isDumbbellExercise(exercise.id);
 const step=dumbbell?5:lastLoad<=50?2.5:5;
 const suggested=dumbbell?lastLoad+5:roundTo(lastLoad+step,step);
 return {weight:suggested,status:'increase',reason:`All planned reps completed at max RPE ${maxRpe}. Based on your last completed set (${lastLoad} lb), consider ${suggested} lb (${suggested-lastLoad} lb${dumbbell?' per dumbbell':''} increase) if equipment allows.`,previous,isBenchGoal:false};
}


