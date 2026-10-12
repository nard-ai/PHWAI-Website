export type Equip = 'none' | 'dumbbells' | 'pullup' | 'rowbar' | 'treadmill'

export interface Exercise {
  id: string
  name: string
  equip: Equip
  muscle: string
  cue: string
  timed?: boolean // seconds instead of reps
  met: number
}

// All exercises adapted for no bench: floor presses, standing work, bar hangs.
export const EXERCISES: Record<string, Exercise> = {
  gobletSquat: { id: 'gobletSquat', name: 'Goblet Squat', equip: 'dumbbells', muscle: 'Legs', cue: 'Hold one dumbbell at chest, sit back, chest tall.', met: 5 },
  floorPress: { id: 'floorPress', name: 'DB Floor Press', equip: 'dumbbells', muscle: 'Chest', cue: 'Lie on floor (no bench), press up, elbows touch floor softly.', met: 4 },
  bentRow: { id: 'bentRow', name: 'Bent-Over DB Row', equip: 'dumbbells', muscle: 'Back', cue: 'Hinge at hips, flat back, pull to ribs.', met: 4 },
  ohPress: { id: 'ohPress', name: 'Standing DB Press', equip: 'dumbbells', muscle: 'Shoulders', cue: 'Brace core, press overhead, no arching.', met: 4 },
  rdl: { id: 'rdl', name: 'DB Romanian Deadlift', equip: 'dumbbells', muscle: 'Hamstrings', cue: 'Soft knees, push hips back, feel the stretch.', met: 5 },
  lunge: { id: 'lunge', name: 'DB Reverse Lunge', equip: 'dumbbells', muscle: 'Legs', cue: 'Step back, both knees 90°, alternate legs.', met: 5 },
  curl: { id: 'curl', name: 'DB Curl', equip: 'dumbbells', muscle: 'Biceps', cue: 'Elbows pinned, slow on the way down.', met: 3 },
  floorTricep: { id: 'floorTricep', name: 'Lying DB Skull Crusher', equip: 'dumbbells', muscle: 'Triceps', cue: 'On floor, lower DBs beside head, extend.', met: 3 },
  deadHang: { id: 'deadHang', name: 'Dead Hang', equip: 'pullup', muscle: 'Grip / Back', cue: 'Hang relaxed, shoulders slightly engaged.', timed: true, met: 3 },
  negPullup: { id: 'negPullup', name: 'Negative Pull-up', equip: 'pullup', muscle: 'Back', cue: 'Jump to top, lower for 3–5 seconds.', met: 6 },
  hangKnee: { id: 'hangKnee', name: 'Hanging Knee Raise', equip: 'pullup', muscle: 'Core', cue: 'Raise knees to hips, no swinging.', met: 4 },
  invRow: { id: 'invRow', name: 'Row-Bar Inverted Row', equip: 'rowbar', muscle: 'Back', cue: 'Body straight, pull chest to bar.', met: 5 },
  barPushup: { id: 'barPushup', name: 'Incline Push-up (Row Bar)', equip: 'rowbar', muscle: 'Chest', cue: 'Hands on bar, body plank-straight.', met: 4 },
  plank: { id: 'plank', name: 'Plank', equip: 'none', muscle: 'Core', cue: 'Elbows under shoulders, squeeze glutes.', timed: true, met: 3 },
  gluteBridge: { id: 'gluteBridge', name: 'DB Glute Bridge', equip: 'dumbbells', muscle: 'Glutes', cue: 'DB on hips, drive through heels.', met: 3 },
  deadBug: { id: 'deadBug', name: 'Dead Bug', equip: 'none', muscle: 'Core', cue: 'Low back flat, opposite arm & leg extend.', met: 3 },
  walk: { id: 'walk', name: 'Treadmill Incline Walk', equip: 'treadmill', muscle: 'Cardio', cue: '5–8% incline, brisk pace, no holding rails.', timed: true, met: 6 },
  intervals: { id: 'intervals', name: 'Treadmill Intervals', equip: 'treadmill', muscle: 'Cardio', cue: '1 min fast / 1 min easy.', timed: true, met: 8 },
}

export interface Block { ex: string; sets: number; reps: number; rest: number }
export interface Workout { id: string; title: string; kind: 'strength' | 'cardio' | 'rest'; blocks: Block[] }

export const PHASES = [
  { name: 'Foundation', weeks: [1, 4], note: 'Learn form, build habit', setAdd: 0, repAdd: 0, rest: 75 },
  { name: 'Build', weeks: [5, 8], note: 'More volume, shorter rest', setAdd: 1, repAdd: 2, rest: 60 },
  { name: 'Shred', weeks: [9, 12], note: 'Peak intensity & conditioning', setAdd: 1, repAdd: 4, rest: 45 },
]

export const phaseFor = (week: number) => PHASES.find((p) => week >= p.weeks[0] && week <= p.weeks[1]) ?? PHASES[2]

type Tpl = { title: string; kind: Workout['kind']; items: [string, number, number][] }
// Mon..Sun template
const WEEK_TEMPLATE: Tpl[] = [
  { title: 'Full Body A', kind: 'strength', items: [['gobletSquat', 3, 10], ['floorPress', 3, 10], ['invRow', 3, 8], ['gluteBridge', 3, 12], ['plank', 3, 30]] },
  { title: 'Cardio + Core', kind: 'cardio', items: [['walk', 1, 1200], ['hangKnee', 3, 8], ['deadBug', 3, 10]] },
  { title: 'Full Body B', kind: 'strength', items: [['rdl', 3, 10], ['ohPress', 3, 10], ['negPullup', 3, 4], ['lunge', 3, 8], ['deadHang', 3, 20]] },
  { title: 'Active Recovery', kind: 'rest', items: [] },
  { title: 'Upper Tone', kind: 'strength', items: [['barPushup', 3, 10], ['bentRow', 3, 10], ['curl', 2, 12], ['floorTricep', 2, 12], ['hangKnee', 3, 8]] },
  { title: 'Interval Burn', kind: 'cardio', items: [['intervals', 1, 900], ['gobletSquat', 2, 15], ['plank', 2, 40]] },
  { title: 'Rest Day', kind: 'rest', items: [] },
]

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function buildWorkout(week: number, dayIdx: number): Workout {
  const t = WEEK_TEMPLATE[dayIdx]
  const p = phaseFor(week)
  return {
    id: `w${week}d${dayIdx}`,
    title: t.title,
    kind: t.kind,
    blocks: t.items.map(([ex, sets, reps]) => {
      const e = EXERCISES[ex]
      const cardio = e.equip === 'treadmill'
      return {
        ex,
        sets: cardio ? 1 : sets + p.setAdd,
        reps: cardio ? reps + (week - 1) * 60 : e.timed ? reps + p.repAdd * 5 : reps + p.repAdd,
        rest: cardio ? 0 : p.rest,
      }
    }),
  }
}

export const FOODS = [
  { name: 'Oats (50g)', kcal: 190, p: 7 },
  { name: 'Eggs x2', kcal: 156, p: 13 },
  { name: 'Chicken breast (150g)', kcal: 248, p: 46 },
  { name: 'Greek yogurt (170g)', kcal: 100, p: 17 },
  { name: 'Rice, cooked (150g)', kcal: 195, p: 4 },
  { name: 'Banana', kcal: 105, p: 1 },
  { name: 'Salmon (120g)', kcal: 250, p: 25 },
  { name: 'Protein shake', kcal: 120, p: 24 },
  { name: 'Mixed salad', kcal: 60, p: 2 },
  { name: 'Almonds (30g)', kcal: 174, p: 6 },
]
