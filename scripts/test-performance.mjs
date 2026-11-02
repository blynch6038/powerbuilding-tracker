import assert from 'node:assert/strict';
import {build} from 'esbuild';
const built=await build({entryPoints:['src/performance.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {plates,estimatedMax,previousSession,loaded,setVolume,weeklyProgress,benchPlan}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
assert.deepEqual(plates(135),{result:[{plate:45,count:1}],remainder:0});assert.equal(plates(137).remainder,2);assert.deepEqual(plates(45).result,[]);assert.equal(plates(40),null);assert.equal(plates(NaN),null);
assert.equal(estimatedMax(225,1),225);assert.equal(estimatedMax(135,8),171);assert.equal(estimatedMax(135,11),null);assert.equal(estimatedMax(0,8),null);
const row={id:'a',user_id:'test',week:1,day:'Monday',exercise_id:'barbell-bench-press',set_number:1,weight:135,reps:8,rpe:8,done:true,deleted_at:null,updated_at:'2030-01-01',dirty:0};
const rows=[row,{...row,id:'b',week:2,weight:140},{...row,id:'c',week:3,weight:145},{...row,id:'d',week:2,exercise_id:'other',weight:200},{...row,id:'e',week:2,deleted_at:'deleted',weight:300}];
assert.deepEqual(previousSession(rows,row.exercise_id,3,'Monday').map(l=>l.id),['b']);assert.equal(loaded(row),true);assert.equal(loaded({...row,exercise_id:row.exercise_id+'-warmup'}),false);assert.equal(loaded({...row,deleted_at:'deleted'}),false);
assert.equal(loaded({...row,done:false,weight:999}),false);
assert.equal(loaded({...row,weight:null}),false);
// Corrections replace chart values; removed exercises have no remaining progress series.
const corrected=[{...row,weight:125}, {...row,id:'removed',exercise_id:'paused-bench-press',deleted_at:'deleted',weight:300}];
assert.deepEqual(corrected.filter(loaded).map(l=>[l.exercise_id,l.weight]),[['barbell-bench-press',125]]);
console.log('Performance math passed: plate balance and remainder, estimate limits, program chronology, exercise isolation, deleted and warm-up exclusion.');


const dumbbell={...row,exercise_id:'incline-dumbbell-press',weight:45,reps:10};
assert.equal(setVolume(dumbbell),900);
assert.equal(setVolume({...row,weight:45,reps:10}),450);
assert.equal(setVolume({...dumbbell,exercise_id:'incline-dumbbell-press--sub--incline-barbell-press'}),450);
assert.equal(setVolume({...row,exercise_id:'seated-cable-row--sub--single-arm-dumbbell-row',weight:45,reps:10}),900);
for(const patch of [{done:false},{deleted_at:'today'},{weight:0},{weight:null}])assert.equal(setVolume({...dumbbell,...patch}),0);
assert.equal(setVolume({...dumbbell,exercise_id:'farmer-carry'}),0);

const supported={...row,week:1,day:'Thursday',exercise_id:'chest-supported-row',weight:40,reps:10};
assert.equal(setVolume(supported),800);
assert.equal(setVolume({...supported,exercise_id:'chest-supported-row--sub--machine-row'}),400);
assert.equal(setVolume({...supported,exercise_id:'chest-supported-row--sub--single-arm-dumbbell-row'}),800);

const units=await build({entryPoints:['src/loadConvention.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {weightUnit,isFarmerCarry}=await import('data:text/javascript;base64,'+Buffer.from(units.outputFiles[0].text).toString('base64'));
assert.equal(weightUnit('farmer-carry'),'lb per hand');
assert.equal(isFarmerCarry('farmer-carry'),true);
assert.equal(isFarmerCarry('farmer-carry--sub--trap-bar-carry'),false);
assert.equal(weightUnit('farmer-carry--sub--trap-bar-carry'),'lb');

assert.equal(estimatedMax(185,4),209);
assert.equal(estimatedMax(157.5,5),183);
assert.equal(estimatedMax(225.9,1),225);
assert.equal(estimatedMax(150,2),160); // avoid floating-point 159.999... before truncation
const chartBench={...row,weight:185,reps:4,rpe:8};
const chartDB={...row,id:'db',exercise_id:'incline-dumbbell-press',weight:45,reps:10,rpe:7.5};
const chartTimed={...row,id:'hold',week:2,exercise_id:'weighted-plank',weight:0,reps:30,rpe:6};
const chartNoise=[{...row,id:'foreign',user_id:'other',weight:999,rpe:10},{...row,id:'draft',week:3,done:false},{...row,id:'deleted',week:4,deleted_at:'today'},{...row,id:'warm',exercise_id:row.exercise_id+'-warmup',weight:999,rpe:10},{...row,id:'unknown',exercise_id:'unknown-exercise',rpe:10}];
assert.deepEqual(weeklyProgress([chartTimed,chartDB,chartBench,...chartNoise],row.user_id),[{week:1,benchLoad:185,estimatedMax:209,volume:1640,averageRPE:7.75},{week:2,benchLoad:null,estimatedMax:null,volume:null,averageRPE:6}]);
assert.deepEqual(weeklyProgress([chartBench],'other'),[]);
assert.deepEqual(weeklyProgress([],'test'),[]);
assert.equal(weeklyProgress([{...chartBench,weight:150}],row.user_id)[0].estimatedMax,170);
console.log('Weekly progress passed: whole-number estimates without rounding up, exact integer boundaries, volume/RPE parity, current edits, missing weeks, account isolation and excluded rows.');

const heavyAndVolume=weeklyProgress([chartBench,{...chartBench,id:'volume-bench',day:'Friday',exercise_id:'barbell-bench-press-volume',weight:190,reps:8},{...chartBench,id:'substitute',exercise_id:'barbell-bench-press--sub--dumbbell-bench-press',weight:250}],row.user_id);
assert.equal(heavyAndVolume[0].benchLoad,190);
assert.equal(weeklyProgress([{...chartBench,weight:182.5}],row.user_id)[0].benchLoad,182.5);
assert.equal(weeklyProgress([{...chartBench,week:2,weight:175},chartBench],row.user_id)[1].benchLoad,175);

assert.deepEqual(benchPlan('test').map(point=>point.weight),[155,160,165,170,175,180,185,190,195,225]);
const benchChoice={id:'choice',user_id:'test',week:2,day:'Monday',exercise_id:'barbell-bench-press',replacement:'Dumbbell Bench Press',updated_at:'today',dirty:0};
assert.equal(benchPlan('test',[benchChoice])[1].weight,140);
assert.equal(benchPlan('other',[benchChoice])[1].weight,160);
assert.equal(benchPlan('test',[benchChoice,{...benchChoice,id:'volume-choice',day:'Friday',exercise_id:'barbell-bench-press-volume'}])[1].weight,null);
