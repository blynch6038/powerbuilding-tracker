// Dumbbell entries store one dumbbell's weight and repetitions per arm.
// Resolve substitutions first so a barbell replacing a dumbbell exercise stays a total load.
export function isDumbbellExercise(idOrName:string):boolean {
 const movement=idOrName.split('--sub--').slice(-1)[0].replace(/-/g,' ').trim().toLowerCase();
 return /\bdumbbells?\b/i.test(movement)||movement==='chest supported row';
}
export const volumeMultiplier=(idOrName:string)=>isDumbbellExercise(idOrName)?2:1;
export const isFarmerCarry=(idOrName:string)=>idOrName.split('--sub--').slice(-1)[0].replace(/-/g,' ').trim().toLowerCase()==='farmer carry';
export const weightUnit=(idOrName:string)=>isFarmerCarry(idOrName)?'lb per hand':isDumbbellExercise(idOrName)?'lb per dumbbell':'lb';
