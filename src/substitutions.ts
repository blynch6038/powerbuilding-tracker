import type{Exercise}from './types';
const groups:Record<string,string[]>={
 'Barbell Bench Press':['Dumbbell Bench Press','Smith Machine Bench Press','Machine Chest Press','Floor Press'],
 'Barbell Bench Press (Volume)':['Dumbbell Bench Press','Smith Machine Bench Press','Machine Chest Press'],
 'Barbell Bench Press (Max Test)':['Dumbbell Bench Press','Smith Machine Bench Press'],
 'Incline Dumbbell Press':['Incline Barbell Press','Incline Machine Chest Press','Low-Incline Smith Press'],
 'Close-Grip Bench Press':['Close-Grip Smith Press','Weighted Dips','Neutral-Grip Dumbbell Press'],
 'Seated Cable Row':['Chest-Supported Row','Single-Arm Dumbbell Row','Machine Row'],
 'Rope Triceps Pushdown':['Straight-Bar Triceps Pushdown','Single-Arm Cable Pushdown','Triceps Dip Machine'],
 'Weighted Plank':['Bodyweight Plank','Dead Bug','Ab Wheel Rollout'],
 'Barbell Back Squat':['Safety-Bar Squat','Goblet Squat','Smith Machine Squat','Hack Squat Machine'],
 'Hack Squat Machine':['Leg Press','Front Squat','Smith Machine Squat','Belt Squat'],
 'Leg Press':['Hack Squat Machine','Belt Squat','Goblet Squat'],
 'Seated Leg Curl':['Lying Leg Curl','Standing Leg Curl','Nordic Hamstring Curl'],
 'Standing Calf Raise':['Seated Calf Raise','Leg Press Calf Raise','Single-Leg Calf Raise'],
 'Cable Crunch':['Machine Ab Crunch','Decline Sit-Up','Reverse Crunch'],
 'Machine Chest Press':['Dumbbell Bench Press','Smith Machine Chest Press','Cable Chest Press'],
 'Dumbbell Floor Press':['Flat Dumbbell Press','Close-Grip Bench Press','Machine Chest Press'],
 'Seated Dumbbell Shoulder Press':['Machine Shoulder Press','Standing Barbell Press','Landmine Press'],
 'Cable Serratus Punch':['Dumbbell Serratus Punch','Scapular Wall Slide','Cable Press'],
 'Overhead Triceps Extension':['Cable Overhead Triceps Extension','Dumbbell Skull Crusher','Rope Pushdown'],
 'RKC Plank':['Forearm Plank','Hollow-Body Hold','Dead Bug'],
 'Conventional Deadlift':['Trap-Bar Deadlift','Sumo Deadlift','Rack Pull'],
 'Romanian Deadlift (RDL)':['Dumbbell Romanian Deadlift','Single-Leg Romanian Deadlift','Good Morning'],
 'Chest-Supported Row':['Seated Cable Row','Machine Row','Incline Dumbbell Row'],
 'Lying Leg Curl':['Seated Leg Curl','Nordic Hamstring Curl','Standing Leg Curl'],
 'Back Extension':['Reverse Hyperextension','Bird Dog','Cable Pull-Through'],
 'Farmer Carry':['Suitcase Carry','Trap-Bar Carry','Heavy Dumbbell Carry'],
 'Paused Bench Press':['Spoto Press','Tempo Bench Press','Pin Press'],
 'Flat Dumbbell Press':['Machine Chest Press','Barbell Bench Press','Smith Machine Bench Press'],
 'Lat Pulldown':['Assisted Pull-Up','Machine High Row','Neutral-Grip Pulldown'],
 'Cable Chest Fly':['Pec Deck Fly','Dumbbell Fly','Low-to-High Cable Fly'],
 'Pallof Press':['Cable Anti-Rotation Hold','Side Plank','Half-Kneeling Pallof Press'],
 'Recovery / Mobility':['Easy Walking','Stationary Cycling','Mobility Flow']
};
export function alternativeExercises(exercise:Exercise):string[]{
 const options=groups[exercise.name]||['Dumbbell Variation','Machine Variation','Cable Variation'];
 return [exercise.name,...options];
}
