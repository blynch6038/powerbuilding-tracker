import {db,cloudRows,supabase} from './client';
import {buildBulkPlan,type HistoryDraft} from './bulkHistory';
import type {ExerciseSubstitution,WorkoutLog} from './types';
export async function commitHistoryBatch(user:string,drafts:HistoryDraft[]){
 // Online preflight detects newer cloud edits before the local transaction.
 const [remoteRows,remoteChoices]=navigator.onLine?await Promise.all([cloudRows<WorkoutLog>('set_logs',user),cloudRows<ExerciseSubstitution>('exercise_substitutions',user)]):[[],[]];
 const {data,error}=await supabase.auth.getSession();
 if(error||data.session?.user.id!==user)throw Error('Your account changed. Sign in again before saving.');
 for(const draft of drafts){
  const remote=remoteRows.find(r=>r.id===draft.before.id);
  if(remote&&(draft.missing||remote.deleted_at||Date.parse(remote.updated_at)>Date.parse(draft.before.updated_at)))throw Error('Newer cloud history was found. Refresh history and review the affected drafts before saving.');
  if(draft.replacement){const original=draft.before.exercise_id.split('--sub--')[0];const remoteChoice=remoteChoices.find(c=>c.week===draft.before.week&&c.day===draft.before.day&&c.exercise_id===original);if(remoteChoice&&remoteChoice.updated_at>(draft.choiceBefore?.updated_at||''))throw Error('A newer exercise choice was found. Refresh history before saving.');}
 }
 return db.transaction('rw',db.logs,db.notes,db.substitutions,async()=>{
  const local=await db.logs.where('user_id').equals(user).toArray();
  const rows=new Map(remoteRows.map(r=>[r.id,r]));for(const row of local){const remote=rows.get(row.id);if(!remote||row.updated_at>=remote.updated_at)rows.set(row.id,row)}
  const choices=new Map(remoteChoices.map(c=>[c.id,c]));for(const c of await db.substitutions.where('user_id').equals(user).toArray()){const remote=choices.get(c.id);if(!remote||c.updated_at>=remote.updated_at)choices.set(c.id,c)}
  const plan=buildBulkPlan(user,drafts,[...rows.values()],[...choices.values()],new Date().toISOString(),()=>crypto.randomUUID());
  await db.logs.bulkPut(plan.logs);await db.notes.bulkPut(plan.notes);await db.substitutions.bulkPut(plan.choices);
  return {sets:plan.notes.length,exerciseChanges:plan.choices.length};
 });
}
