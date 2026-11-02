// Display aliases only: log IDs continue to identify their original program slots.
export function canonicalExerciseName(name:string):string {
 const aliases:Record<string,string>={
  'machine seated calf raise':'Machine Seated Calf Raise',
  'dumbbell chest press':'Dumbbell Chest Press',
  'flat dumbbell press':'Dumbbell Chest Press',
  'dumbbell floor press':'Dumbbell Chest Press',
  'forearm plank':'Forearm Plank',
  'rkc plank':'Forearm Plank',
  'trap bar deadlift':'Trap Bar Deadlift',
  'pec deck fly':'Pec Deck Fly'
 };
 return aliases[name.trim().toLowerCase().replace(/-/g,' ').replace(/\s+/g,' ')]||name;
}
