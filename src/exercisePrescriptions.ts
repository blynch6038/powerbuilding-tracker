import {exerciseDays} from './templates';
import {canonicalExerciseName} from './exerciseNames';

export type ExercisePrescription = {sets:number; reps:string};
const key = (name:string) => canonicalExerciseName(name).toLowerCase().replace(/-/g,' ').replace(/\s+/g,' ').trim();
export const exercisePrescriptions:Record<string,ExercisePrescription> = {};
for (const [name,sets,reps] of exerciseDays.flat()) {
 exercisePrescriptions[key(name)] = {sets,reps};
}
function prescribe(names:string[],sets:number,reps:string) {
 for (const name of names) exercisePrescriptions[key(name)] = {sets,reps};
}
prescribe(['Dumbbell Bench Press','Smith Machine Bench Press','Floor Press','Incline Barbell Press','Incline Machine Chest Press','Low-Incline Smith Press','Neutral-Grip Dumbbell Press','Machine Shoulder Press','Standing Barbell Press','Landmine Press','Front Squat','Smith Machine Squat','Belt Squat','Safety-Bar Squat','Goblet Squat'],3,'8–10');
prescribe(['Close-Grip Smith Press','Weighted Dips'],3,'6–8');
prescribe(['Single-Arm Dumbbell Row','Single-Arm Cable Pushdown','Dumbbell Serratus Punch','Scapular Wall Slide','Cable Press','Single-Leg Romanian Deadlift','Bird Dog','Half-Kneeling Pallof Press'],3,'10–12/side');
prescribe(['Machine Row','FORGEX WIDE CHEST PRESS','Smith Machine Chest Press','Cable Chest Press','Incline Dumbbell Row','Assisted Pull-Up','Machine High Row','Neutral-Grip Pulldown'],3,'10–12');
prescribe(['Straight-Bar Triceps Pushdown','Triceps Dip Machine','Cable Overhead Triceps Extension','Dumbbell Skull Crusher','Rope Pushdown','Cable Bicep Curl','Dumbbell Biceps Curl','EZ-Bar Curl'],3,'10–12');
prescribe(['Machine Seated Calf Raise','Leg Press Calf Raise','Single-Leg Calf Raise'],3,'12–15');
prescribe(['Bodyweight Plank','Forearm Plank','Hollow-Body Hold','Cable Anti-Rotation Hold','Side Plank'],3,'20–30 sec');
prescribe(['Weighted Plank'],3,'30–45 sec');
prescribe(['Dead Bug'],3,'10–12/side');
prescribe(['Ab Wheel Rollout','Machine Ab Crunch','Decline Sit-Up','Reverse Crunch'],3,'10–12');
prescribe(['Standing Leg Curl'],3,'12');
prescribe(['Nordic Hamstring Curl'],3,'6–8');
prescribe(['Trap Bar Deadlift','Sumo Deadlift','Rack Pull'],3,'4');
prescribe(['Dumbbell Romanian Deadlift','Good Morning'],2,'8–10');
prescribe(['Reverse Hyperextension','Cable Pull-Through'],2,'12');
prescribe(['Suitcase Carry','Trap-Bar Carry','Heavy Dumbbell Carry'],3,'30 m');
prescribe(['Spoto Press','Tempo Bench Press','Pin Press'],3,'3');
prescribe(['Pec Deck Fly','Dumbbell Fly','Low-to-High Cable Fly'],2,'12');
prescribe(['Readiness Single','Goal Attempt'],1,'1');
prescribe(['Barbell Bench Press (Max Test)'],0,'Warm-up');
prescribe(['Recovery / Mobility','Easy Walking','Stationary Cycling','Mobility Flow'],1,'15 min');

export function prescriptionForName(name:string):ExercisePrescription|undefined {
 return exercisePrescriptions[key(name)];
}
