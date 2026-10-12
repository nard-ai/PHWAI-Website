# Home Workout & Fitness Tracker — Implementation Plan

## Goal
A mobile-first, fully functional fitness tracker (React 19 + Vite + Tailwind v4, single-page) for a **beginner** aiming at **fat loss + muscle tone** over a **locked-in 12-week (3-month) program**, with a **10,000 steps/day** target. Equipment: treadmill, dumbbells, pull-up bar, row bar. **No bench** — all moves standing, floor, or bar-based. Metric units. Data in localStorage with editable onboarding. Google Material 3–inspired UI with creative touches.

## Assumptions (defaults)
- Schedule: 5 training days/week (Mon/Tue/Thu/Fri/Sat), Wed + Sun active-rest (walk for steps). Sessions ~40–50 min.
- Program phases: Weeks 1–4 Foundation (3×10–12, 75s rest), Weeks 5–8 Build (3–4×10–12, 60s), Weeks 9–12 Burn (4×12–15 + finisher, 45s). Week 4 and 8 light deload.
- Splits: Upper Push+Core, Lower+Treadmill intervals, Pull (bar) + Core, Full-body circuit, Long treadmill/incline walk + mobility.

## Exercise library (no bench)
Dumbbell: goblet squat, RDL, reverse lunge, step-back lunge, standing shoulder press, floor press, bent-over row, renegade row, curls, hammer curls, overhead triceps extension, lateral raise, thrusters, farmer carry. Pull-up bar: negative pull-ups, dead hang, scapular pulls, hanging knee raises, band/assisted chin-ups. Row bar: bent-over barbell row, inverted row (if bar mounted low), deadlift, front squat, overhead press. Bodyweight: push-ups (incline→standard), plank, dead bug, glute bridge, mountain climbers. Treadmill: incline walk, intervals (1 min fast/2 min walk), steady LISS. Each entry: id, name, equipment, muscles, cues, beginner regression.

## App structure (`src/`)
- `App.tsx` — onboarding gate + bottom navigation (Dashboard, Workout, Progress, Nutrition, Profile).
- `data/exercises.ts`, `data/program.ts` (12-week generator from profile), `data/sampleData.ts` (seeded 3 weeks of history, weights, steps, meals).
- `store/useStore.ts` — React context + reducer persisted to `localStorage` key `fittrack:v1`, with version field and "reset / reload sample data" actions.
- `lib/calc.ts` — BMI, body fat (US Navy method: waist, neck, hip, height), BMR (Mifflin-St Jeor), TDEE, calorie target (TDEE −400), protein (1.8 g/kg), step calories.
- `components/` — Card, ProgressRing, StatChip, LineChart & BarChart (hand-built SVG, no deps), RestTimer, BottomNav, Sheet/modal, NumberStepper.
- `screens/`: Onboarding (name, age, sex, height, weight, measurements, goal, start date — editable later), Dashboard, Workout (today + session player), Progress, Nutrition, Profile/Settings.

## Features
- **Dashboard**: greeting, week X/12 progress bar + streak, today's workout card, steps ring (10,000 goal, quick +500/+1000/manual), calories in vs target, water, weight trend sparkline, rest-day banner.
- **Workout player**: exercise list with sets × reps × suggested kg; per-set check-off logging actual reps/kg; auto-start rest timer (circular countdown, ±15s, skip, vibrate/beep); cues + regression toggle; finish summary (volume, duration, est. kcal) saved to history. Swap exercise from same muscle group.
- **Cardio/Treadmill**: log duration, distance, speed, incline, steps; kcal estimate (MET); interval-guide timer.
- **Rest days**: scheduled active-rest with step goal + mobility checklist; user can mark any day as rest/skip and reshuffle the week.
- **Progress**: weight/body-fat/BMI line charts, measurements history table + add entry, weekly volume bar chart, steps bar chart (goal line at 10k), workout calendar heatmap, PRs.
- **Nutrition**: daily calorie & macro rings, meal log (breakfast/lunch/dinner/snacks) with quick-add food list (~30 common foods with kcal/macros) and custom entries, water tracker, 7-day history.
- **Profile**: edit onboarding data, goals, units display (metric), training days, export/import JSON, reset.

## Design
Material 3 feel: Google Sans–like typeface via "Google Sans"-alternative **Roboto Flex / Inter** from Google Fonts in `index.css`; tonal surfaces, 24px rounded cards, pill chips, FAB for quick log, Google four-color accents (blue workouts, green steps/nutrition, yellow streaks, red cardio). Enhancements: animated progress rings, gradient hero card, dark mode toggle, subtle transitions. Max width ~480px centered on desktop.

## Edge cases
Missing measurements → hide body-fat; dates by local day key `YYYY-MM-DD`; program beyond week 12 → "Program complete" with restart; corrupted localStorage → fall back to sample/onboarding; timer survives tab switch using timestamps.

## Verification
Run `pnpm build` once at the end to confirm compilation; manually walk onboarding → dashboard → complete a workout → check history/charts → reload to verify persistence.
