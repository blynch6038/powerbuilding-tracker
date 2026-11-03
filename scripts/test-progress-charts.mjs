import {build} from 'esbuild';
import {writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

const directory=await mkdtemp(join(tmpdir(),'powerbuilder-progress-'));
try{
 const built=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
import ProgressCharts from './src/ProgressCharts';
import {GoalProgress,ExerciseProgress} from './src/PerformanceHUD';
import {primaryBodyPart} from './src/bodyParts';
const row={id:'bench',user_id:'test',week:1,day:'Monday',exercise_id:'barbell-bench-press',set_number:1,weight:185,reps:4,rpe:8,done:true,deleted_at:null,updated_at:'',dirty:0};
const db={...row,id:'db',exercise_id:'incline-dumbbell-press',weight:45,reps:10,rpe:7.5};
const render=logs=>renderToStaticMarkup(<ProgressCharts logs={logs} userId="test"/>);
assert.equal(render([]),'');
assert.equal(render([{...row,user_id:'other'}]),'');
assert.equal(render([{...row,done:false},{...db,deleted_at:'today'}]),'');
const html=render([row,db]);
for(const title of ['Bench progression','Bench estimated 1RM','Working volume','Average actual RPE'])assert.ok(html.includes(title));
assert.equal((html.match(/role="img"/g)||[]).length,4);
assert.equal((html.match(/View chart data/g)||[]).length,4);
assert.match(html,/185 lb/);assert.match(html,/<circle/);assert.match(html,/209 lb/);assert.doesNotMatch(html,/209\\.6|209\\.7|210 lb/);
assert.equal((render([db]).match(/role="img"/g)||[]).length,2);
const corrected=render([{...row,weight:150},db]);assert.match(corrected,/170 lb/);assert.doesNotMatch(corrected,/209 lb/);
const reference=render([{...row,weight:155},{...row,id:'week2',week:2,weight:165},{...row,id:'week3',week:3,weight:185}]);
assert.match(reference,/Current recorded weight: 185 lb · Week 3/);
assert.match(reference,/bench-plan-line/);
assert.equal((reference.match(/class="bench-plan-point"/g)||[]).length,10);
assert.equal((reference.match(/class="bench-actual-point"/g)||[]).length,3);
assert.match(reference,/Plan · Week 10: 225 lb/);
assert.doesNotMatch(reference,/Actual · Week (4|5|6|7|8|9|10):/);
assert.match(reference,/Chart legend/);
const goal=renderToStaticMarkup(<GoalProgress logs={[row]}/>);assert.match(goal,/209 lb estimated max/);assert.doesNotMatch(goal,/209\\./);
for(const [id,group] of [
 ['barbell-bench-press','Chest'],['incline-dumbbell-press','Chest'],['close-grip-bench-press','Triceps'],
 ['chest-supported-row','Back'],['seated-dumbbell-shoulder-press','Shoulders'],['barbell-back-squat','Quads'],
 ['standing-calf-raise--sub--machine-seated-calf-raise','Calves'],['romanian-deadlift','Hamstrings & Glutes'],
 ['rkc-plank--sub--cable-biceps-curl','Biceps'],['machine-chest-press--sub--seated-cable-row','Back'],
 ['rkc-plank--sub--forearm-plank','Core'],['unrecognized-movement','Other']
])assert.equal(primaryBodyPart(id),group);
const squat={...row,id:'squat',day:'Tuesday',exercise_id:'barbell-back-squat',weight:175,reps:5};
const back={...row,id:'back',exercise_id:'seated-cable-row',weight:100,reps:10};
const curl={...row,id:'curl',day:'Wednesday',exercise_id:'rkc-plank--sub--cable-biceps-curl',weight:100,reps:12};
const grouped=renderToStaticMarkup(<ExerciseProgress logs={[squat,db,back,row,curl,{...squat,id:'draft',exercise_id:'leg-press',done:false}]}/>);
assert.equal((grouped.match(/class="exercise-body-group"/g)||[]).length,4);
assert.equal((grouped.match(/role="img"/g)||[]).length,5);
assert.ok(grouped.indexOf('Chest exercise weights')<grouped.indexOf('Back exercise weights'));
assert.ok(grouped.indexOf('Back exercise weights')<grouped.indexOf('Biceps exercise weights'));
assert.ok(grouped.indexOf('Biceps exercise weights')<grouped.indexOf('Quads exercise weights'));
assert.ok(grouped.indexOf('Barbell Bench Press')<grouped.indexOf('Incline Dumbbell Press'));
assert.doesNotMatch(grouped,/Core exercise weights|Calves exercise weights|Leg Press/);
assert.match(grouped,/185 lb · Week 1/);
assert.match(grouped,/45 lb per dumbbell · Week 1/);
assert.equal(renderToStaticMarkup(<ExerciseProgress logs={[]}/>),'');
console.log('Rendered progress passed: four summary charts, history updates, integer max labels, accessible data tables, account isolation and hidden empty metrics.');
`},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'}});
 const path=join(directory,'checks.cjs');await writeFile(path,built.outputFiles[0].text);
 process.stdout.write(execFileSync(process.execPath,[path],{encoding:'utf8'}));
}finally{await rm(directory,{recursive:true,force:true})}
