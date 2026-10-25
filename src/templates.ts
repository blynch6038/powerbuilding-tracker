import type {DayName} from './types';
export type ExerciseTemplate=readonly [name:string,sets:number,reps:string];
export const exerciseDays:ExerciseTemplate[][]=[
[['Barbell Bench Press',5,'5'],['Incline Dumbbell Press',3,'8–10'],['Close-Grip Bench Press',3,'6-8'],['Seated Cable Row',3,'10'],['Rope Triceps Pushdown',3,'12'],['Weighted Plank',3,'30-45 sec']],
[['Barbell Back Squat',4,'5'],['Hack Squat Machine',3,'8-10'],['Leg Press',3,'10'],['Seated Leg Curl',3,'12'],['Standing Calf Raise',3,'12–15'],['Cable Crunch',3,'12']],
[['Machine Chest Press',3,'10'],['Dumbbell Floor Press',3,'8'],['Seated Dumbbell Shoulder Press',3,'10'],['Cable Serratus Punch',3,'12/side'],['Overhead Triceps Extension',3,'12'],['RKC Plank',3,'20–30 sec']],
[['Conventional Deadlift',3,'4'],['Romanian Deadlift',2,'8'],['Chest-Supported Row',3,'10'],['Lying Leg Curl',3,'10'],['Back Extension',2,'12'],['Farmer Carry',3,'30 m']],
[['Barbell Bench Press (Volume)',4,'8'],['Paused Bench Press',3,'3'],['Flat Dumbbell Press',3,'10'],['Lat Pulldown',3,'10'],['Cable Chest Fly',2,'12'],['Pallof Press',3,'12/side']]
];
export const dayTitles:string[]=['Heavy Bench + Upper Strength','Squat + Lower Strength','Upper Body Accessories','Deadlift + Posterior Chain','Bench Volume + Upper Accessories'];
