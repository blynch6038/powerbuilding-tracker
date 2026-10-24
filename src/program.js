import {exerciseDays,dayTitles} from './templates';
export const benchHeavy=[155,160,165,170,175,180,185,190,195,135];
export const benchVolume=[135,140,145,150,150,155,155,160,145,0];
export const weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const heavyScheme=[[5,5],[5,5],[5,4],[5,4],[5,3],[5,3],[4,3],[3,2],[3,1],[3,3]];
const volumeScheme=[[4,8],[4,8],[4,7],[4,6],[4,6],[4,5],[3,5],[3,4],[3,3],[0,0]];
export const program=Array.from({length:10},(_,i)=>({week:i+1,workouts:exerciseDays.map((items,j)=>({
 day:weekdays[j],title:dayTitles[j],
 exercises:items.filter((_,k)=>!(i===9&&j===4&&k===0)).map(([name,s,r],k)=>{
 let target=null;
 if(j===0&&k===0){[s,r]=heavyScheme[i];target=benchHeavy[i]}
 if(j===4&&k===0){[s,r]=volumeScheme[i];target=benchVolume[i]}
 if(i>=8&&!(j===0&&k===0))s=Math.max(1,s-1);
 return {id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name,sets:s,reps:String(r),target}
 })
}))}));
export const maxTest={week:10,day:'Saturday',title:'225 lb Bench Max Test',warmups:[[45,10],[95,5],[135,3],[165,2],[185,1],[205,1],[225,1]]};
