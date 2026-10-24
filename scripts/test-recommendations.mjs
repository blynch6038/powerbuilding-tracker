import {build} from 'esbuild';
import assert from 'node:assert/strict';
const output=await build({entryPoints:['src/recommendations.ts'],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'});
const {recommendWeight}=await import('data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].text).toString('base64'));
const uid='test-user';
function sets(day,id,count,weight,reps,rpe,done=true){return Array.from({length:count},(_,i)=>({id:uid+':1:'+day+':'+id+':'+(i+1),user_id:uid,week:1,day,exercise_id:id,set_number:i+1,weight,reps,rpe,done,updated_at:'2026-10-24T00:00:00Z',deleted_at:null,dirty:0}));}
const logs=[
 ...sets('Monday','barbell-bench-press',5,155,5,5),
 ...sets('Monday','close-grip-bench-press',3,95,6,10),
 ...sets('Monday','incline-dumbbell-press',3,70,8,8),
 ...sets('Monday','rope-triceps-pushdown',3,100,12,5),
 ...sets('Friday','barbell-bench-press-volume',4,135,8,3),
 ...sets('Friday','pallof-press',3,0,0,null,false)
];
const ex=(id,name,sets,reps,target=null)=>({id,name,sets,reps,target});
assert.equal(recommendWeight(2,'Monday',ex('barbell-bench-press','Barbell Bench Press',5,'5',160),logs).weight,160);
assert.equal(recommendWeight(2,'Friday',ex('barbell-bench-press-volume','Barbell Bench Press (Volume)',4,'8',140),logs).weight,140);
assert.equal(recommendWeight(2,'Monday',ex('close-grip-bench-press','Close-Grip Bench Press',3,'6'),logs).weight,95);
assert.equal(recommendWeight(2,'Monday',ex('incline-dumbbell-press','Incline Dumbbell Press',3,'8'),logs).weight,70);
assert.equal(recommendWeight(2,'Monday',ex('rope-triceps-pushdown','Rope Triceps Pushdown',3,'12'),logs).weight,105);
assert.equal(recommendWeight(2,'Friday',ex('pallof-press','Pallof Press',3,'12/side'),logs).weight,null);
assert.equal(recommendWeight(10,'Monday',ex('barbell-bench-press','Barbell Bench Press',3,'3',135),logs).weight,135);
console.log('Adaptive recommendation regression tests passed.');
