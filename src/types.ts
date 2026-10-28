export type DayName='Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday';
export type TabName='Today'|'Program'|'Progress'|'Settings';
export interface Exercise {id:string;name:string;sets:number;reps:string;target:number|null;originalName?:string;originalReps?:string}
export interface Workout {day:DayName;title:string;exercises:Exercise[]}
export interface TrainingWeek {week:number;workouts:Workout[]}
export interface WorkoutLog {id:string;user_id:string;week:number;day:DayName;exercise_id:string;set_number:number;weight:number|null;reps:number|null;rpe:number|null;done:boolean;updated_at:string;deleted_at:string|null;dirty:0|1}
export type WorkoutPatch=Partial<Pick<WorkoutLog,'weight'|'reps'|'rpe'|'done'>>;
export type WarmupSet=readonly [weight:number,reps:number];

export interface ExerciseSubstitution {id:string;user_id:string;week:number;day:DayName;exercise_id:string;replacement:string;updated_at:string;dirty:0|1}

export interface ExerciseNote {id:string;user_id:string;week:number;day:DayName;exercise_id:string;body:string;created_at:string;dirty:0|1}
