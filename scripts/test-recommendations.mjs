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


const forgexID='machine-chest-press--sub--forgex-wide-chest-press';
const oldMachine=sets('Wednesday','machine-chest-press',3,90,10,5);
const forgex=ex(forgexID,'FORGEX WIDE CHEST PRESS',3,'10');
assert.equal(recommendWeight(2,'Wednesday',forgex,oldMachine).previous,null);
const newMachine=sets('Wednesday',forgexID,3,140,10,6).map(r=>({...r,week:2}));
assert.match(recommendWeight(3,'Wednesday',forgex,[...oldMachine,...newMachine]).previous,/Week 2: 140/);

// Progress from the last completed working set, independent of row order or editing time.
const squat=ex('barbell-back-squat','Barbell Back Squat',4,'5');
const ramped=sets('Tuesday',squat.id,4,140,5,7).map((row,i)=>({...row,week:2,weight:[140,140,155,175][i]}));
const lastAdvice=recommendWeight(3,'Tuesday',squat,ramped);
assert.equal(lastAdvice.weight,180);
assert.match(lastAdvice.previous,/175 lb × 5 reps \(last completed set 4\)/);
assert.match(lastAdvice.reason,/last completed set \(175 lb\)/);
assert.equal(recommendWeight(3,'Tuesday',squat,[...ramped].reverse()).weight,180);
const editedEarlier=ramped.map(r=>({...r,updated_at:r.set_number===1?'2099-01-01':'2026-01-01'}));
assert.equal(recommendWeight(3,'Tuesday',squat,editedEarlier).weight,180);
const backoff=ramped.map(r=>({...r,weight:r.set_number===4?140:r.weight}));
assert.equal(recommendWeight(3,'Tuesday',squat,backoff).weight,145);
const ignored=[...ramped,{...ramped[3],id:'draft',set_number:5,weight:500,done:false},{...ramped[3],id:'deleted',set_number:6,weight:600,deleted_at:'deleted'},{...ramped[3],id:'warmup',exercise_id:squat.id+'-warmup',set_number:7,weight:700}];
assert.equal(recommendWeight(3,'Tuesday',squat,ignored).weight,180);
assert.equal(recommendWeight(3,'Tuesday',squat,ramped.map(r=>({...r,rpe:null}))).weight,175);
assert.equal(recommendWeight(3,'Tuesday',squat,ramped.map(r=>({...r,rpe:8}))).weight,175);
assert.equal(recommendWeight(3,'Tuesday',squat,ramped.map(r=>({...r,rpe:r.set_number===1?10:7}))).weight,175);
const partial=recommendWeight(3,'Tuesday',squat,ramped.slice(0,3));
assert.equal(partial.status,'caution');assert.equal(partial.weight,155);
const dbPress=ex('incline-dumbbell-press','Incline Dumbbell Press',3,'8');
const dbRamped=sets('Monday',dbPress.id,3,35,8,7).map((r,i)=>({...r,weight:[35,40,45][i]}));
assert.equal(recommendWeight(2,'Monday',dbPress,dbRamped).weight,47.5);
const varyingReps=ramped.map(r=>({...r,reps:r.set_number===4?6:5}));
assert.match(recommendWeight(3,'Tuesday',squat,varyingReps).previous,/175 lb × 6 reps/);
const benchRamp=sets('Monday','barbell-bench-press',5,135,5,9).map((r,i)=>({...r,weight:[135,145,155,165,175][i]}));
const bench=ex('barbell-bench-press','Barbell Bench Press',5,'5',180);
assert.equal(recommendWeight(2,'Monday',bench,benchRamp).weight,175);
assert.equal(recommendWeight(2,'Monday',bench,benchRamp.map(r=>({...r,rpe:7}))).weight,180);
assert.equal(recommendWeight(10,'Monday',{...bench,target:135},benchRamp).weight,135);
console.log('Last-set baselines passed: squat ramp 175→180, backoff order, edits, exclusions, RPE/completion checks, dumbbell increments, reps and bench plan protections.');
