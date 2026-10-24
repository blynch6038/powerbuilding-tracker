import {createClient} from '@supabase/supabase-js';import Dexie from 'dexie';
export const supabase=createClient('https://qfrkiymocabzwwdmomnq.supabase.co','sb_publishable_rifW_O3CX_xlF7uF48obQQ_bUP-qPC7',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
export const db=new Dexie('powerbuilding-workouts-v1');db.version(1).stores({logs:'id,user_id,dirty,[user_id+week+day]'});
export const idFor=(u,w,d,e,s)=>[u,w,d,e,s].join(':');
let syncing=false;
export async function synchronize(userId){if(syncing||!navigator.onLine)return;syncing=true;try{
const pending=await db.logs.where('dirty').equals(1).filter(x=>x.user_id===userId).toArray();
for(const item of pending){const {dirty,...p}=item;const {data,error}=await supabase.rpc('sync_set_log',{p_id:p.id,p_week:p.week,p_day:p.day,p_exercise_id:p.exercise_id,p_set_number:p.set_number,p_weight:p.weight,p_reps:p.reps,p_rpe:p.rpe,p_done:p.done,p_updated_at:p.updated_at});if(error)throw error;if(data==='conflict')throw new Error('A newer copy exists in the cloud. Local edits were preserved; export a backup before resolving.');const current=await db.logs.get(item.id);if(current?.updated_at===item.updated_at)await db.logs.update(item.id,{dirty:0});}
const {data,error}=await supabase.from('set_logs').select('*').eq('user_id',userId).limit(10000);if(error)throw error;for(const row of data||[]){const local=await db.logs.get(row.id);if(!local||(!local.dirty&&row.updated_at>local.updated_at))await db.logs.put({...row,dirty:0});}
return pending.length;
}finally{syncing=false}}
