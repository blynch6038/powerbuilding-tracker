import {createClient} from '@supabase/supabase-js';
import Dexie,{type Table} from 'dexie';
import type {DayName,WorkoutLog,ExerciseSubstitution} from './types';
export const supabase=createClient('https://qfrkiymocabzwwdmomnq.supabase.co','sb_publishable_rifW_O3CX_xlF7uF48obQQ_bUP-qPC7',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
class WorkoutDB extends Dexie {
 logs!:Table<WorkoutLog,string>;
 substitutions!:Table<ExerciseSubstitution,string>;
 constructor(){super('powerbuilding-workouts-v1');this.version(1).stores({logs:'id,user_id,dirty,[user_id+week+day]'});
 this.version(2).stores({logs:'id,user_id,dirty,[user_id+week+day]',substitutions:'id,user_id,dirty'});}
}
export const db=new WorkoutDB();
export const idFor=(u:string,w:number,d:DayName,e:string,s:number):string=>[u,w,d,e,s].join(':');
let syncing=false;
export async function synchronize(userId:string):Promise<number|undefined>{
 if(syncing||!navigator.onLine)return;
 syncing=true;
 try{
  const pendingSubs=await db.substitutions.where('dirty').equals(1).filter(x=>x.user_id===userId).toArray();
  for(const row of pendingSubs){
   const {dirty,...payload}=row;
   const {error}=await supabase.from('exercise_substitutions').upsert(payload,{onConflict:'id'});
   if(error)throw error;
   const local=await db.substitutions.get(row.id);
   if(local?.updated_at===row.updated_at)await db.substitutions.update(row.id,{dirty:0});
  }
  const pending=await db.logs.where('dirty').equals(1).filter(x=>x.user_id===userId).toArray();
  for(const item of pending){
   const{dirty,...p}=item;
   const{data,error}=await supabase.rpc('sync_set_log',{p_id:p.id,p_week:p.week,p_day:p.day,p_exercise_id:p.exercise_id,p_set_number:p.set_number,p_weight:p.weight,p_reps:p.reps,p_rpe:p.rpe,p_done:p.done,p_updated_at:p.updated_at});
   if(error)throw error;
   if(data==='conflict')throw new Error('A newer copy exists in the cloud. Local edits were preserved; export a backup before resolving.');
   const current=await db.logs.get(item.id);
   if(current?.updated_at===item.updated_at)await db.logs.update(item.id,{dirty:0});
  }
  const{data,error}=await supabase.from('set_logs').select('*').eq('user_id',userId).limit(10000);
  if(error)throw error;
  for(const row of data||[]){
   const local=await db.logs.get(row.id);
   if(!local||(!local.dirty&&row.updated_at>local.updated_at)){
    await db.logs.put({...row,dirty:0} as WorkoutLog);
   }
  }
  const {data:remoteSubs,error:subErr}=await supabase.from('exercise_substitutions').select('*').eq('user_id',userId).limit(10000);
  if(subErr)throw subErr;
  for(const row of remoteSubs||[]){
   const local=await db.substitutions.get(row.id);
   if(!local||(!local.dirty&&row.updated_at>local.updated_at))await db.substitutions.put({...row,dirty:0} as ExerciseSubstitution);
  }
  return pending.length+pendingSubs.length;
 }finally{syncing=false;}
}
