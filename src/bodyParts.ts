// Classify the performed movement, not the original slot it replaced.
export const bodyParts=['Chest','Back','Shoulders','Biceps','Triceps','Quads','Hamstrings & Glutes','Calves','Core','Other'] as const;
export type BodyPart=typeof bodyParts[number];
export function primaryBodyPart(exerciseID:string):BodyPart {
 const movement=exerciseID.split('--sub--').slice(-1)[0].replace(/[^a-z0-9]+/gi,' ').trim().toLowerCase();
 if(/\bcalf\b/.test(movement))return 'Calves';
 if(/\b(plank|crunch|pallof|dead bug|bird dog|ab wheel|sit up|leg raise|hollow body|anti rotation)\b/.test(movement))return 'Core';
 if(/\b(leg curl|hamstring|deadlift|rack pull|good morning|glute|hip thrust|reverse hyperextension)\b/.test(movement))return 'Hamstrings & Glutes';
 if(/\b(squat|leg press|lunge|leg extension|belt squat)\b/.test(movement))return 'Quads';
 if(/\b(bicep|biceps|ez bar curl|hammer curl)\b/.test(movement))return 'Biceps';
 if(/\b(tricep|triceps|pushdown|rope pushdown|skull crusher|close grip|overhead.*extension)\b/.test(movement))return 'Triceps';
 if(/\b(shoulder|overhead press|landmine press|lateral raise|front raise|rear delt|serratus)\b/.test(movement))return 'Shoulders';
 if(/\b(row|pulldown|pull up|chin up|back extension|shrug)\b/.test(movement))return 'Back';
 if(/\b(bench|chest|incline.*press|flat.*press|pec deck|floor press|fly|dips|spoto|pin press|readiness single|goal attempt)\b/.test(movement))return 'Chest';
 return 'Other';
}
