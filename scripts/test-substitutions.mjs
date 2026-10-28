import {build} from 'esbuild';
import assert from 'node:assert/strict';
const out=await build({stdin:{contents:"export {readWorkoutSelection,rememberWorkoutSelection} from './src/workoutSelection'; export {program} from './src/program'; export {resolveExercise,substitutionWeeks,alternativeExercises} from './src/substitutions';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const {readWorkoutSelection,rememberWorkoutSelection,program,resolveExercise,substitutionWeeks,alternativeExercises}=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'));
for(let week=1;week<=9;week++){
 const [floor,plank]=[program[week-1].workouts[2].exercises[1],program[week-1].workouts[2].exercises[5]];
 const chest=resolveExercise(floor),curl=resolveExercise(plank);
 assert.equal(chest.name,week===1?'Dumbbell Floor Press':'Dumbbell Chest Press');
 assert.equal(chest.id,week===1?'dumbbell-floor-press':'dumbbell-floor-press--sub--dumbbell-chest-press');
 assert.equal(chest.sets,week===9?2:3);assert.equal(chest.reps,'8');
 assert.equal(curl.id,week===1?'rkc-plank':'rkc-plank--sub--cable-biceps-curl');
 assert.equal(curl.sets,3);assert.equal(curl.reps,week===1?'20–30 sec':'10–12');
 assert.equal(resolveExercise(plank,'RKC Plank').id,'rkc-plank');
 assert.equal(resolveExercise(plank,'RKC Plank').reps,'20–30 sec');
 assert.equal(resolveExercise(floor,'Dumbbell Floor Press').id,'dumbbell-floor-press');
 assert(alternativeExercises(floor).includes('Dumbbell Chest Press'));
 assert(alternativeExercises(plank).includes('Cable Biceps Curl'));
}
const slot=program[1].workouts[2].exercises[5];
assert.deepEqual(substitutionWeeks(program,2,'Wednesday',slot.id,true),[2,3,4,5,6,7,8,9]);
assert.deepEqual(substitutionWeeks(program,4,'Wednesday',slot.id,false),[4]);
assert.deepEqual(substitutionWeeks(program,10,'Wednesday',slot.id,true),[]);
// Existing explicit choices, including a prior curl choice, retain their canonical log IDs.
assert.equal(resolveExercise(slot,'Cable Biceps Curl').id,'rkc-plank--sub--cable-biceps-curl');
assert.equal(resolveExercise(slot,'Dead Bug').id,'rkc-plank--sub--dead-bug');
assert.equal(resolveExercise(program[1].workouts[0].exercises[0],'Dumbbell Bench Press').target,null);
console.log('Substitution tests passed: defaults, original IDs, restoration, prescriptions and current/future scope.');

const preferences=new Map();const storage={getItem:k=>preferences.get(k)||null,setItem:(k,v)=>preferences.set(k,v)};
rememberWorkoutSelection('alice',10,'Saturday',storage);
assert.deepEqual(readWorkoutSelection('alice',storage),{week:10,day:'Saturday'});
assert.deepEqual(readWorkoutSelection('bob',storage),{week:1,day:'Monday'});
rememberWorkoutSelection('bob',9,'Friday',storage);
assert.deepEqual(readWorkoutSelection('alice',storage),{week:10,day:'Saturday'});
preferences.set('powerbuilder:last-workout:broken','{');
assert.deepEqual(readWorkoutSelection('broken',storage),{week:1,day:'Monday'});
preferences.set('powerbuilder:last-workout:broken',JSON.stringify({week:999,day:'Monday'}));
assert.deepEqual(readWorkoutSelection('broken',storage),{week:1,day:'Monday'});
const blocked={getItem:()=>{throw Error('storage disabled')},setItem:()=>{throw Error('storage disabled')}};
assert.deepEqual(readWorkoutSelection('alice',blocked),{week:1,day:'Monday'});
rememberWorkoutSelection('alice',2,'Wednesday',blocked);
console.log('Workout restoration tests passed: per-account persistence, valid Week 10 day, invalid/disabled storage.');
