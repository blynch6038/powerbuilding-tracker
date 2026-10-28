import {program} from './program';
import type {DayName} from './types';
export function readWorkoutSelection(user:string,storage?:Pick<Storage,'getItem'>):{week:number;day:DayName}{
 try{
  const saved=JSON.parse((storage??localStorage).getItem('powerbuilder:last-workout:'+user)||'null');
  if(Number.isInteger(saved?.week)&&saved.week>=1&&saved.week<=program.length&&program[saved.week-1].workouts.some(w=>w.day===saved.day))return {week:saved.week,day:saved.day};
 }catch{/* Unavailable or invalid preferences use the first workout. */}
 return {week:1,day:'Monday'};
}
export function rememberWorkoutSelection(user:string,week:number,day:DayName,storage?:Pick<Storage,'setItem'>):void{
 if(!Number.isInteger(week)||week<1||week>program.length)return;
 const validDay=program[week-1].workouts.some(w=>w.day===day)?day:program[week-1].workouts[0].day;
 try{(storage??localStorage).setItem('powerbuilder:last-workout:'+user,JSON.stringify({week,day:validDay}))}catch{/* Preferences must never block logging. */}
}
