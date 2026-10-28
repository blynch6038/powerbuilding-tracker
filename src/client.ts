import {createClient} from '@supabase/supabase-js';
import Dexie,{type Table} from 'dexie';
import type {DayName,WorkoutLog,ExerciseSubstitution,ExerciseNote} from './types';
export const supabase=createClient('https://qfrkiymocabzwwdmomnq.supabase.co','sb_publishable_rifW_O3CX_xlF7uF48obQQ_bUP-qPC7',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
class WorkoutDB extends Dexie {
 logs!:Table<WorkoutLog,string>;
 notes!:Table<ExerciseNote,string>;
 substitutions!:Table<ExerciseSubstitution,string>;
 constructor(){super('powerbuilding-workouts-v1');this.version(1).stores({logs:'id,user_id,dirty,[user_id+week+day]'});
 this.version(2).stores({logs:'id,user_id,dirty,[user_id+week+day]',substitutions:'id,user_id,dirty'});
 this.version(3).stores({logs:'id,user_id,dirty,[user_id+week+day]',substitutions:'id,user_id,dirty',notes:'id,user_id,dirty'});}
}
export const db=new WorkoutDB();
export const idFor=(u:string,w:number,d:DayName,e:string,s:number):string=>[u,w,d,e,s].join(':');
export async function cloudRows<T>(table:'set_logs'|'exercise_substitutions'|'exercise_notes',userId:string):Promise<T[]>{
 const rows:T[]=[];
 for(let offset=0;;offset+=500){
  const {data,error}=await supabase.from(table).select('*').eq('user_id',userId).order('id').range(offset,offset+499);
  if(error)throw error;
  rows.push(...(data||[]) as T[]);
  if(!data||data.length<500)return rows;
 }
}
let syncing=false;
export async function synchronize(userId:string):Promise<number|undefined>{
 if(syncing||!navigator.onLine)return;
 syncing=true;
 try{
  // Pull first: a stale local pending record must not prevent the 96 imported Week 1 rows from appearing.
  const remote=await cloudRows<WorkoutLog>('set_logs',userId);
  let conflicts=0;
  for(const row of remote||[]){
   const local=await db.logs.get(row.id);
   // A never-completed blank form field is superseded by a completed cloud import.
   const emptyDraft=local?.dirty===1&&!local.done&&local.weight==null&&local.reps==null;
   if(!local||emptyDraft&&row.done||(!local.dirty&&row.updated_at>local.updated_at)){
    await db.logs.put({...row,dirty:0} as WorkoutLog);
   }else if(local.dirty&&row.updated_at>local.updated_at){
    conflicts++;
   }
  }
  const remoteSubs=await cloudRows<ExerciseSubstitution>('exercise_substitutions',userId);
  for(const row of remoteSubs||[]){
   const local=await db.substitutions.get(row.id);
   if(!local||(!local.dirty&&row.updated_at>local.updated_at))await db.substitutions.put({...row,dirty:0} as ExerciseSubstitution);
  }
  const remoteNotes=await cloudRows<ExerciseNote>('exercise_notes',userId);
  for(const row of remoteNotes)await db.notes.put({...row,dirty:0});
  const pendingNotes=await db.notes.where('dirty').equals(1).filter(x=>x.user_id===userId).toArray();
  for(const row of pendingNotes){
   const {dirty,...payload}=row;
   const {error}=await supabase.from('exercise_notes').upsert(payload,{onConflict:'id',ignoreDuplicates:true});
   if(error)throw error;
   await db.notes.update(row.id,{dirty:0});
  }
  // Upload after pull, without aborting the whole sync on an individual conflict.
  const pending=await db.logs.where('dirty').equals(1).filter(x=>x.user_id===userId).toArray();
  for(const item of pending){
   const{dirty,...p}=item;
   const{data,error}=await supabase.rpc('sync_set_log',{p_id:p.id,p_week:p.week,p_day:p.day,p_exercise_id:p.exercise_id,p_set_number:p.set_number,p_weight:p.weight,p_reps:p.reps,p_rpe:p.rpe,p_done:p.done,p_updated_at:p.updated_at});
   if(error)throw error;
   if(data==='conflict'){conflicts++;continue;}
   const current=await db.logs.get(item.id);
   if(current?.updated_at===item.updated_at)await db.logs.update(item.id,{dirty:0});
  }
  const pendingSubs=await db.substitutions.where('dirty').equals(1).filter(x=>x.user_id===userId).toArray();
  for(const row of pendingSubs){
   const {dirty,...payload}=row;
   const {error}=await supabase.from('exercise_substitutions').upsert(payload,{onConflict:'id'});
   if(error)throw error;
   const current=await db.substitutions.get(row.id);
   if(current?.updated_at===row.updated_at)await db.substitutions.update(row.id,{dirty:0});
  }
  if(conflicts)console.warn('Powerbuilding sync preserved pending local conflicts:',conflicts);
  return pending.length+pendingSubs.length;
 }finally{syncing=false;}
}
