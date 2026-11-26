import type {DayName, Exercise, ExerciseSubstitution, WorkoutLog} from './types';
import {program} from './program';
import {resolveExercise} from './substitutions';

export interface WeeklySet { key:string; week:number; day:DayName; exercise:Exercise; setNumber:number; status:'completed'|'open'|'future'; }
export function weeklyCompletion(week:number, day:DayName, userId:string, logs:WorkoutLog[], choices:ExerciseSubstitution[]=[]){
 const days=program.find(w=>w.week===week)?.workouts??[];
 const current=days.findIndex(d=>d.day===day);
 const own=logs.filter(r=>r.user_id===userId&&!r.deleted_at);
 const sets:WeeklySet[]=days.flatMap((d,index)=>d.exercises.flatMap(original=>{
  const choice=choices.find(c=>c.user_id===userId&&c.week===week&&c.day===d.day&&c.exercise_id===original.id);
  const exercise=resolveExercise(original,choice?.replacement);
  return Array.from({length:exercise.sets},(_,n)=>{
   const setNumber=n+1;
   const done=own.some(r=>r.week===week&&r.day===d.day&&r.exercise_id===exercise.id&&r.set_number===setNumber&&r.done);
   const status:WeeklySet['status']=done?'completed':index>current?'future':'open';
   return {key:[userId,week,d.day,exercise.id,setNumber].join(':'),week,day:d.day,exercise,setNumber,status};
  });
 }));
 const completed=sets.filter(s=>s.status==='completed').length;
 return {sets,planned:sets.length,completed,remaining:sets.length-completed,percent:sets.length?Math.round(completed*100/sets.length):0,open:sets.filter(s=>s.status==='open'),future:sets.filter(s=>s.status==='future')};
}
