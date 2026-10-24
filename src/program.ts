import{exerciseDays,dayTitles}from './templates';
import type{DayName,TrainingWeek}from './types';
export const benchHeavy=[155,160,165,170,175,180,185,190,195,135];
export const benchVolume=[135,140,145,150,150,155,155,160,145,0];
export const weekdays:DayName[]=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const heavyScheme=[[5,5],[5,5],[5,4],[5,4],[5,3],[5,3],[4,3],[3,2],[3,1],[3,3]];
const volumeScheme=[[4,8],[4,8],[4,7],[4,6],[4,6],[4,5],[3,5],[3,4],[3,3],[0,0]];

export const program:TrainingWeek[]=Array.from({length:10},(_,i)=>({week:i+1,workouts:exerciseDays.map((items,j)=>({day:weekdays[j],title:dayTitles[j],exercises:items.filter(([name])=>!(i===9&&name==='Barbell Bench Press (Volume)')).map(([name,initialSets,initialReps])=>{let s:number=initialSets;let r:string=initialReps;let target:number|null=null;if(name==='Barbell Bench Press'){[s,r]=[heavyScheme[i][0],String(heavyScheme[i][1])];target=benchHeavy[i]}if(name==='Barbell Bench Press (Volume)'){[s,r]=[volumeScheme[i][0],String(volumeScheme[i][1])];target=benchVolume[i]}if(i>=8&&name!=='Barbell Bench Press')s=Math.max(1,s-1);return{id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name,sets:s,reps:r,target}})}))}));
export const maxTest:{week:number;day:DayName;title:string;warmups:Array<[number,number]>}={week:10,day:'Saturday',title:'225 lb Bench Max Test',warmups:[[45,10],[95,5],[135,3],[165,2],[185,1],[205,1],[225,1]]};
