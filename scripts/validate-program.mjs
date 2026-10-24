import {build} from 'esbuild';
import assert from 'node:assert/strict';
const output=await build({entryPoints:['src/program.ts'],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'});
const url='data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].text).toString('base64');
const {program}=await import(url);
assert.equal(program.length,10,'Expected 10 training weeks');
for (const [index,week] of program.entries()){
 assert.equal(week.week,index+1);
 assert.equal(week.workouts.length,5,'Each week must have five workout days');
 for(const workout of week.workouts){
  assert.ok(workout.day&&workout.title);
  for(const ex of workout.exercises){
   assert.ok(ex.name&&Number.isInteger(ex.sets)&&ex.sets>=0, 'Invalid exercise set count');
   assert.ok(typeof ex.reps==='string'&&ex.reps.length>0);
   assert.ok(ex.target===null||(Number.isFinite(ex.target)&&ex.target>=0));
  }
 }
}
assert.equal(program[0].workouts[0].exercises[0].sets,5);
assert.equal(program[9].workouts.at(-1).title,'225 lb Bench Max Test');
assert.ok(!program[9].workouts.some(w=>w.exercises.some(e=>e.name==='Barbell Bench Press (Volume)')));
console.log('Validated 10 weeks, 50 workouts, and all exercise prescriptions.');
