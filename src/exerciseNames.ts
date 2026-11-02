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
  'pec deck fly':'Pec Deck Fly',
  'cable biceps curl':'Cable Bicep Curl',
  'cable bicep curl':'Cable Bicep Curl'
 };
 return aliases[name.trim().toLowerCase().replace(/-/g,' ').replace(/\s+/g,' ')]||name.trim().replace(/\b[a-z][a-z0-9]*/gi,word=>['ez','trx','rdl','rpe'].includes(word.toLowerCase())?word.toUpperCase():word[0].toUpperCase()+word.slice(1).toLowerCase());
}
