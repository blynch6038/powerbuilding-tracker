import {build} from 'esbuild';
import assert from 'node:assert/strict';
async function importSource(entry){
 const out=await build({entryPoints:[entry],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'});
 return import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'));
}
const {program}=await importSource('src/program.ts');
const {warmupSchedule}=await importSource('src/warmupSchedule.ts');
const days=['Monday','Tuesday','Wednesday','Thursday','Friday'];
// Independent prescription fixtures transcribed from the Excel WEEK 01–10 sheets.
// Each tuple is [exercise id, sets, repetitions]. The order is the workbook's exercise order.
const normal=[
 [['barbell-bench-press',5,'5'],['incline-dumbbell-press',3,'8'],['close-grip-bench-press',3,'6'],['seated-cable-row',3,'10'],['rope-triceps-pushdown',3,'12'],['weighted-plank',3,'30 sec']],
 [['barbell-back-squat',4,'5'],['hack-squat-machine',3,'8–10'],['leg-press',3,'10'],['seated-leg-curl',3,'12'],['standing-calf-raise',3,'12–15'],['cable-crunch',3,'12']],
 [['machine-chest-press',3,'10'],['dumbbell-floor-press',3,'8'],['seated-dumbbell-shoulder-press',3,'10'],['cable-serratus-punch',3,'12/side'],['overhead-triceps-extension',3,'12'],['rkc-plank',3,'20–30 sec']],
 [['conventional-deadlift',3,'4'],['romanian-deadlift',2,'8'],['chest-supported-row',3,'10'],['lying-leg-curl',3,'10'],['back-extension',2,'12'],['farmer-carry',3,'30 m']],
 [['barbell-bench-press-volume',4,'8'],['paused-bench-press',3,'3'],['flat-dumbbell-press',3,'10'],['lat-pulldown',3,'10'],['cable-chest-fly',2,'12'],['pallof-press',3,'12/side']]
];
const benchHeavy=[[5,5,155],[5,5,160],[5,4,165],[5,4,170],[5,3,175],[5,3,180],[4,3,185],[3,2,190],[3,1,195]];
const benchVolume=[[4,8,135],[4,8,140],[4,7,145],[4,6,150],[4,6,150],[4,5,155],[3,5,155],[3,4,160],[3,3,145]];
const warmups=[
 {Monday:[[45,10],[95,5],[115,3]],Friday:[[45,10],[95,5]]},
 {Monday:[[45,10],[95,5],[115,3]],Friday:[[45,10],[95,5]]},
 {Monday:[[45,10],[95,5],[135,3]],Friday:[[45,10],[95,5]]},
 {Monday:[[45,10],[95,5],[135,3]],Friday:[[45,10],[95,5]]},
 {Monday:[[45,10],[95,5],[135,3]],Friday:[[45,10],[95,5]]},
 {Monday:[[45,10],[95,5],[135,3],[155,1]],Friday:[[45,10],[95,5],[135,2]]},
 {Monday:[[45,10],[95,5],[135,3],[155,1]],Friday:[[45,10],[95,5],[135,2]]},
 {Monday:[[45,10],[95,5],[135,3],[165,1]],Friday:[[45,10],[95,5],[135,2]]},
 {Monday:[[45,10],[95,5],[135,3],[165,1]],Friday:[[45,10],[95,5],[135,2]]},
 {Monday:[[45,10],[95,5],[115,5]],Saturday:[[45,10],[95,5],[135,3],[165,2],[185,1]]}
];
const week10=[
 [['barbell-bench-press',3,'3',135],['seated-cable-row',2,'10',null],['rope-triceps-pushdown',2,'10',null]],
 [['barbell-back-squat',2,'5',null],...normal[1].slice(1).map(([id,,reps])=>[id,0,reps,null])],
 [['recovery-mobility',1,'15 min',null]],
 [['conventional-deadlift',2,'4',null],...normal[3].slice(1).map(([id,,reps])=>[id,0,reps,null])],
 [['barbell-bench-press-max-test',0,'Warm-up',null],['readiness-single',1,'1',205],['goal-attempt',1,'1',225]]
];
assert.equal(program.length,10);
assert.equal(warmupSchedule.length,10);
let count=0;
for(let i=0;i<10;i++){
 const w=program[i];assert.equal(w.week,i+1);
 assert.equal(w.workouts.length,5);
 for(let j=0;j<5;j++){
  const workout=w.workouts[j];
  assert.equal(workout.day,i===9&&j===4?'Saturday':days[j],`Week ${i+1} day ${j+1} day ID`);
  const expected=i===9?week10[j]:normal[j].map(([id,originalSets,reps])=>{
   let sets=originalSets,target=null;
   if(j===0&&id==='barbell-bench-press'){sets=benchHeavy[i][0];reps=String(benchHeavy[i][1]);target=benchHeavy[i][2]}
   else if(j===4&&id==='barbell-bench-press-volume'){sets=benchVolume[i][0];reps=String(benchVolume[i][1]);target=benchVolume[i][2]}
   else if(i===8){sets=(j===1&&id==='barbell-back-squat')||(j===3&&['conventional-deadlift','back-extension'].includes(id))? (id==='back-extension'?2:(id==='barbell-back-squat'?3:2)):Math.max(1,sets-1)}
   if(i>=1&&j===2&&id==='rkc-plank'){sets=3;reps='10–12'}
   return [id,sets,reps,target];
  });
  const actual=workout.exercises.map(e=>[e.id,e.sets,e.reps,e.target]);
  assert.deepEqual(actual,expected,`Workbook mismatch: Week ${i+1}, Day ${j+1} (${workout.day})`);
  const ids=workout.exercises.map(e=>e.id);
  assert.equal(new Set(ids).size,ids.length,'Duplicate exercise IDs');
  for(const id of ids)assert.equal(id.replace(/^-+|-+$/g,''),id,'Exercise IDs cannot have outer dashes');
  count+=actual.length;
 }
 assert.deepEqual(warmupSchedule[i],warmups[i],`Week ${i+1} warm-up mismatch`);
}
for(let i=0;i<9;i++){
 const ex=program[i].workouts[2].exercises;
 assert.equal(ex[1].name,i===0?'Dumbbell Floor Press':'Dumbbell Chest Press');
 assert.equal(ex[5].name,i===0?'RKC Plank':'Cable Biceps Curl');
}
assert.equal(program[0].workouts[4].exercises[0].id,'barbell-bench-press-volume');
console.log(`Validated all 10 workbook weeks, 50 workout days, ${count} exercise prescriptions, all warm-ups, Week 9 taper, Week 10 max test and stable IDs.`);
