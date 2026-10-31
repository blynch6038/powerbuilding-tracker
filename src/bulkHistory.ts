import {program} from './program';
import {canonicalExerciseName,resolveExercise} from './substitutions';
import type {Exercise,ExerciseNote,ExerciseSubstitution,WorkoutLog,WorkoutPatch} from './types';
export interface HistoryDraft {before:WorkoutLog;missing:boolean;patch:WorkoutPatch;replacement:string;choiceBefore?:ExerciseSubstitution}
export interface BulkPlan {logs:WorkoutLog[];notes:ExerciseNote[];choices:ExerciseSubstitution[]}
export const historyId=(user:string,week:number,day:string,exercise:string,set:number)=>[user,week,day,exercise,set].join(':');
export function originalExercise(row:WorkoutLog):Exercise|undefined{return program[row.week-1]?.workouts.find(w=>w.day===row.day)?.exercises.find(e=>e.id===row.exercise_id.split('--sub--')[0].replace(/-warmup$/,''))}
export function recordedExerciseName(row:WorkoutLog):string{
 const ex=originalExercise(row),warmup=row.exercise_id.endsWith('-warmup');
 const name=row.exercise_id.includes('--sub--')?row.exercise_id.split('--sub--').slice(1).join('--sub--').replace(/-/g,' '):ex?.originalName||ex?.name||row.exercise_id.replace(/-/g,' ');
 return canonicalExerciseName(name.replace(/^flat dumbbell press$/i,'Dumbbell Chest Press'))+(warmup?' · warm-up':'');
}
export function changedDraft(draft:HistoryDraft):boolean{
 if(draft.replacement.trim()){
  const original=originalExercise(draft.before);
  if(original&&resolveExercise(original,draft.replacement.trim()).id!==draft.before.exercise_id)return true;
 }
 return Object.entries(draft.patch).some(([key,value])=>draft.before[key as keyof WorkoutPatch]!==value);
}
export function validateHistoryRow(row:WorkoutLog){
 if(row.weight!==null&&(!Number.isFinite(row.weight)||row.weight<0||row.weight>3000))throw Error('Weight must be between 0 and 3,000 lb.');
 if(row.reps!==null&&(!Number.isInteger(row.reps)||row.reps<0||row.reps>1000))throw Error('Reps must be a whole number between 0 and 1,000.');
 if(row.rpe!==null&&(!Number.isFinite(row.rpe)||row.rpe<1||row.rpe>10))throw Error('RPE must be between 1 and 10.');
 if(row.done&&(row.weight===null||row.reps===null||row.reps<1))throw Error('Completed sets need a weight (0 for bodyweight) and actual reps/count.');
}
const sameVersion=(a:WorkoutLog,b:WorkoutLog)=>['id','user_id','week','day','exercise_id','set_number','weight','reps','rpe','done','updated_at','deleted_at'].every(k=>a[k as keyof WorkoutLog]===b[k as keyof WorkoutLog]);
export function buildBulkPlan(user:string,drafts:HistoryDraft[],rows:WorkoutLog[],choices:ExerciseSubstitution[],now:string,uuid:()=>string):BulkPlan{
 if(!drafts.length||drafts.length>500)throw Error('Review between 1 and 500 changed sets at a time.');
 const planned=new Map<string,WorkoutLog>(),notes:ExerciseNote[]=[],newChoices=new Map<string,ExerciseSubstitution>(),seen=new Set<string>();
 for(const draft of drafts){
  const before=draft.before;
  if(before.user_id!==user||before.deleted_at||before.id!==historyId(user,before.week,before.day,before.exercise_id,before.set_number)||seen.has(before.id))throw Error('This batch contains an unavailable or duplicate set. Reload history.');
  if(draft.missing&&!originalExercise(before))throw Error('New entries must belong to a planned workout exercise.');
  seen.add(before.id);
  const existing=rows.find(r=>r.id===before.id);
  if(draft.missing?!!existing:!existing||!sameVersion(existing,before))throw Error('A set changed since you started editing. Discard that draft and review the latest history.');
  if(!changedDraft(draft))continue;
  let after:WorkoutLog={...before,...draft.patch,updated_at:now,dirty:1};
  const replacement=draft.replacement.trim();
  if(replacement){
   if(before.exercise_id.endsWith('-warmup'))throw Error('Change working exercises only; warm-up values can be edited separately.');
   const original=originalExercise(before);
   if(!original||replacement.length>100)throw Error('Choose a valid exercise name under 100 characters.');
   const target=resolveExercise(original,replacement);
   if(target.id!==before.exercise_id){
    after={...after,id:historyId(user,before.week,before.day,target.id,before.set_number),exercise_id:target.id};
    if(rows.some(r=>r.id===after.id)||planned.has(after.id))throw Error(`Week ${before.week}, ${before.day}, set ${before.set_number}: the replacement already has an entry. Edit that entry instead.`);
    const choiceId=[user,before.week,before.day,original.id].join(':');
    const choice=choices.find(c=>c.id===choiceId);
    if(choice?.updated_at!==draft.choiceBefore?.updated_at||choice?.replacement!==draft.choiceBefore?.replacement)throw Error('An exercise choice changed since editing began. Discard the affected drafts and reload.');
    const prior=newChoices.get(choiceId);
    if(prior&&prior.replacement!==replacement)throw Error('Choose one replacement exercise per workout slot.');
    newChoices.set(choiceId,{id:choiceId,user_id:user,week:before.week,day:before.day,exercise_id:original.id,replacement,updated_at:now,dirty:1});
    // Keep the original values and ID; only the corrected entry counts as complete.
    if(!draft.missing)planned.set(before.id,{...before,done:false,updated_at:now,dirty:1});
   }
  }
  validateHistoryRow(after);
  if(planned.has(after.id))throw Error('Two edits target the same set. Review the batch.');
  planned.set(after.id,after);
  notes.push({id:uuid(),user_id:user,week:after.week,day:after.day,exercise_id:after.exercise_id,created_at:now,dirty:1,body:`History correction · set ${before.set_number}\nBefore: ${recordedExerciseName(before)} · ${before.weight??'—'} lb × ${before.reps??'—'} · RPE ${before.rpe??'—'} · ${before.done?'completed':'incomplete'}${draft.missing?' (new entry)':''}\nAfter: ${recordedExerciseName(after)} · ${after.weight??'—'} lb × ${after.reps??'—'} · RPE ${after.rpe??'—'} · ${after.done?'completed':'incomplete'}${after.id!==before.id?'\nOriginal entry retained as incomplete to avoid counting both lifts.':''}`});
 }
 return {logs:[...planned.values()],notes,choices:[...newChoices.values()]};
}
