// Dumbbell entries store one dumbbell's weight and repetitions per arm.
// Resolve substitutions first so a barbell replacing a dumbbell exercise stays a total load.
export function isDumbbellExercise(idOrName:string):boolean {
 const movement=idOrName.split('--sub--').slice(-1)[0].replace(/-/g,' ');
 return /\bdumbbells?\b/i.test(movement);
}
export const volumeMultiplier=(idOrName:string)=>isDumbbellExercise(idOrName)?2:1;
export const weightUnit=(idOrName:string)=>isDumbbellExercise(idOrName)?'lb per dumbbell':'lb';
