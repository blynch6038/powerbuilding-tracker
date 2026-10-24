import type {DayName,Exercise,TrainingWeek,Workout} from './types';
import {exerciseDays,dayTitles} from './templates';
export const weekdays:DayName[]=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const heavy=[[5,5,155],[5,5,160],[5,4,165],[5,4,170],[5,3,175],[5,3,180],[4,3,185],[3,2,190],[3,1,195],[3,3,135]];
const volume=[[4,8,135],[4,8,140],[4,7,145],[4,6,150],[4,6,150],[4,5,155],[3,5,155],[3,4,160],[3,3,145]];
export const benchHeavy=heavy.map(x=>x[2]);
export const benchVolume=volume.map(x=>x[2]);
const idFor=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
function exercise(name:string,sets:number,reps:string,target:number|null=null):Exercise{return{id:idFor(name),name,sets,reps,target}}
function plannedDay(day:DayName,title:string,items:Exercise[]):Workout{return{day,title,exercises:items}}
function baseItems(i:number,j:number):Exercise[]{
 return exerciseDays[j].map(([name,sets,reps])=>{
  if(name==='Barbell Bench Press'){const h=heavy[i];return exercise(name,h[0],String(h[1]),h[2])}
  if(name==='Barbell Bench Press (Volume)'){const v=volume[i];return exercise(name,v[0],String(v[1]),v[2])}
  if(i===8){
    if(j===1&&name==='Barbell Back Squat')sets=3;
    else if(j===3&&name==='Conventional Deadlift')sets=2;
    else if(j===3&&name==='Back Extension')sets=2;
    else sets=Math.max(1,sets-1);
  }
  return exercise(name,sets,reps);
 });
}
export const program:TrainingWeek[]=Array.from({length:10},(_,i)=>{
 let workouts:Workout[] = weekdays.map((day,j)=>plannedDay(day,dayTitles[j],baseItems(i,j)));
 if(i===9){
  workouts=[
   plannedDay('Monday','Bench Deload',[
    exercise('Barbell Bench Press',3,'3',135),
    exercise('Seated Cable Row',2,'10'),
    exercise('Rope Triceps Pushdown',2,'10')]),
   plannedDay('Tuesday','Optional Easy Squat',[
    exercise('Barbell Back Squat',2,'5'),
    ...baseItems(0,1).slice(1).map(e=>({...e,sets:0}))]),
   plannedDay('Wednesday','Recovery & Mobility',[exercise('Recovery / Mobility',1,'15 min')]),
   plannedDay('Thursday','Optional Easy Deadlift',[
    exercise('Conventional Deadlift',2,'4'),
    ...baseItems(0,3).slice(1).map(e=>({...e,sets:0}))]),
   plannedDay('Saturday','225 lb Bench Max Test',[
    exercise('Barbell Bench Press (Max Test)',5,'Warm-up'),
    exercise('Readiness Single',1,'1',205),
    exercise('Goal Attempt',1,'1',225)])
  ];
 }
 return {week:i+1,workouts};
});
export const maxTest={week:10,day:'Saturday' as DayName,title:'225 lb Bench Max Test',warmups:[[45,10],[95,5],[135,3],[165,2],[185,1]] as Array<[number,number]>};
