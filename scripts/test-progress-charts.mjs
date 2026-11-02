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
import {GoalProgress} from './src/PerformanceHUD';
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
const goal=renderToStaticMarkup(<GoalProgress logs={[row]}/>);assert.match(goal,/209 lb estimated max/);assert.doesNotMatch(goal,/209\\./);
console.log('Rendered progress passed: four summary charts, history updates, integer max labels, accessible data tables, account isolation and hidden empty metrics.');
`},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'}});
 const path=join(directory,'checks.cjs');await writeFile(path,built.outputFiles[0].text);
 process.stdout.write(execFileSync(process.execPath,[path],{encoding:'utf8'}));
}finally{await rm(directory,{recursive:true,force:true})}
