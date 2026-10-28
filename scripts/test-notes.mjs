import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
// Exercise actual Dexie schema and synchronizer, replacing only remote HTTP with an account-filtered fixture.
let fail=false;const remote=new Map();
globalThis.__notesTestClient={from(table){let user;return {select(){return this},eq(_,id){user=id;return this},order(){return this},async range(){if(fail&&table==='exercise_notes')return {error:Error('offline')};return {data:table==='exercise_notes'?[...remote.values()].filter(n=>n.user_id===user):[]}},async upsert(row){if(fail)return {error:Error('offline')};if(!remote.has(row.id))remote.set(row.id,row);return {error:null}}}},rpc(){throw Error('Notes must not write set logs')}};
Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});
const built=await build({entryPoints:['src/client.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'mock-transport',setup(b){b.onResolve({filter:/^@supabase\/supabase-js$/},()=>({path:'mock',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const createClient=()=>globalThis.__notesTestClient;'}))}}]});
const {db,synchronize}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
await db.delete();
const legacy=new Dexie('powerbuilding-workouts-v1');legacy.version(2).stores({logs:'id,user_id,dirty,[user_id+week+day]',substitutions:'id,user_id,dirty'});await legacy.open();
await legacy.table('logs').put({id:'preserved-set',user_id:'history-owner',week:1,day:'Monday',dirty:0,weight:155});legacy.close();
await db.open();assert.equal((await db.logs.get('preserved-set')).weight,155);
const uid='alice',row={id:crypto.randomUUID(),user_id:uid,week:2,day:'Thursday',exercise_id:'conventional-deadlift--sub--trap-bar-deadlift',body:'Raised handles; changed stance.',created_at:new Date().toISOString(),dirty:1};
await db.notes.add(row);db.close();await db.open();assert.equal((await db.notes.get(row.id)).body,row.body);
fail=true;await assert.rejects(synchronize(uid));assert.equal((await db.notes.get(row.id)).dirty,1);
fail=false;await synchronize(uid);await synchronize(uid);assert.equal(remote.size,1);assert.equal((await db.notes.get(row.id)).dirty,0);
const other={...row,id:crypto.randomUUID(),user_id:'bob',body:'Other account',dirty:1};await db.notes.add(other);await synchronize(uid);assert.equal(remote.size,1);assert.equal((await db.notes.get(other.id)).dirty,1);
// Another device's append is pulled without overwriting or collapsing either entry.
const second={...row,id:crypto.randomUUID(),body:'Second-device detail'};delete second.dirty;remote.set(second.id,second);await synchronize(uid);assert.equal(await db.notes.where('user_id').equals(uid).count(),2);
assert.equal((await db.notes.get(row.id)).body,row.body);await db.delete();
console.log('Note sync tests passed: IndexedDB restart, failed upload retention, idempotent retry, account filtering, two-device append preservation.');
