import { useState } from 'react'
import { buildWorkout, DAY_NAMES, EXERCISES, FOODS, phaseFor, PHASES, type Workout } from '../data'
import { calorieTarget, emptyDay, programPos, proteinTarget, stepKcal, todayKey, type AppState, type DayLog, type Profile } from '../store'
import { BarChart, Button, Card, inputCls, LineChart, Ring } from '../components/ui'
import { Icon } from '../components/Icon'
import { ProfileForm } from './Onboarding'

interface Ctx {
  state: AppState
  profile: Profile
  today: DayLog
  updateToday: (fn: (d: DayLog) => DayLog) => void
  startWorkout: (w: Workout) => void
}

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening' }

function lastNDays(n: number) {
  return Array.from({ length: n }, (_, k) => { const d = new Date(); d.setDate(d.getDate() - (n - 1 - k)); return d })
}

function streak(state: AppState, goal: number) {
  let s = 0
  for (let k = 0; k < 365; k++) {
    const d = new Date(); d.setDate(d.getDate() - k)
    const log = state.days[todayKey(d)]
    const hit = log && (log.done.length > 0 || log.steps >= goal)
    if (hit) s++
    else if (k > 0) break
  }
  return s
}

function StepControl({ ctx }: { ctx: Ctx }) {
  const [val, setVal] = useState('')
  const add = (n: number) => ctx.updateToday((d) => ({ ...d, steps: Math.max(0, d.steps + n) }))
  return (
    <div className="mt-4 flex gap-2">
      {[500, 1000, 2500].map((n) => <button key={n} onClick={() => add(n)} className="h-10 flex-1 rounded-full bg-surface/60 text-sm font-medium">+{n >= 1000 ? `${n / 1000}k` : n}</button>)}
      <input inputMode="numeric" value={val} onChange={(e) => setVal(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => { if (e.key === 'Enter' && val) { ctx.updateToday((d) => ({ ...d, steps: Number(val) })); setVal('') } }} placeholder="Set" className="h-10 w-20 rounded-full bg-surface/60 px-3 text-sm outline-none" />
    </div>
  )
}

export function Home({ ctx }: { ctx: Ctx }) {
  const { profile, today, state } = ctx
  const pos = programPos(profile.startDate)
  const phase = phaseFor(pos.week)
  const w = buildWorkout(pos.week, pos.dayIdx)
  const doneToday = today.done.includes(w.id)
  const eaten = today.food.reduce((a, f) => a + f.kcal, 0)
  const target = calorieTarget(profile)
  const burned = today.burned + stepKcal(today.steps, profile.weightKg)
  const st = streak(state, profile.stepGoal)
  const mins = w.blocks.reduce((a, b) => a + (EXERCISES[b.ex].equip === 'treadmill' ? b.reps : b.sets * (45 + b.rest)), 0)

  return (
    <div className="space-y-4">
      <header className="rise pt-2">
        <p className="text-on-surface-variant">{greeting()},</p>
        <h1 className="text-3xl font-semibold">{profile.name}</h1>
      </header>

      <Card tone="primary" className="rise relative overflow-hidden">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/10" />
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Week {pos.week} of 12 · {phase.name}</span>
          <span className="flex items-center gap-1"><Icon name="fire" className="size-4" />{st} day streak</span>
        </div>
        <div className="mt-3 flex gap-1">{Array.from({ length: 12 }, (_, k) => <div key={k} className={`h-1.5 flex-1 rounded-full ${k < pos.week ? 'bg-primary' : 'bg-primary/15'}`} />)}</div>
        {pos.finished && <p className="mt-3 text-sm font-medium">Program complete! Keep repeating Week 12 or reset your start date in Profile.</p>}
      </Card>

      <Card tone={w.kind === 'rest' ? 'high' : 'low'} className="rise">
        <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Today · {DAY_NAMES[pos.dayIdx]}</p>
        <h2 className="mt-1 text-2xl font-semibold">{w.title}</h2>
        {w.kind === 'rest' ? (
          <p className="mt-2 text-on-surface-variant">Recovery day. Go for an easy walk and hit your step goal.</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-on-surface-variant">{w.blocks.length} exercises · ~{Math.round(mins / 60)} min</p>
            <div className="mt-3 flex flex-wrap gap-2">{w.blocks.map((b) => <span key={b.ex} className="rounded-lg border border-outline-variant px-2 py-1 text-xs">{EXERCISES[b.ex].name}</span>)}</div>
            <Button className="mt-4 w-full" variant={doneToday ? 'tonal' : 'filled'} onClick={() => ctx.startWorkout(w)}>
              <Icon name={doneToday ? 'check' : 'play'} className="size-5" />{doneToday ? 'Completed · Do again' : 'Start workout'}
            </Button>
          </>
        )}
      </Card>

      <Card tone="tertiary" className="rise">
        <div className="flex items-center gap-5">
          <Ring value={today.steps / profile.stepGoal} size={110} color="var(--color-tertiary)">
            <div><Icon name="steps" className="mx-auto size-5" /><div className="text-lg font-semibold tabular-nums">{today.steps.toLocaleString()}</div></div>
          </Ring>
          <div>
            <p className="text-sm opacity-80">Steps today</p>
            <p className="text-2xl font-semibold">{Math.round((today.steps / profile.stepGoal) * 100)}%</p>
            <p className="text-sm opacity-80">of {profile.stepGoal.toLocaleString()} · {(today.steps * 0.00075).toFixed(1)} km</p>
          </div>
        </div>
        <StepControl ctx={ctx} />
      </Card>

      <div className="rise grid grid-cols-2 gap-4">
        <Card><p className="text-sm text-on-surface-variant">Calories left</p><p className="text-3xl font-semibold">{target - eaten + burned}</p><p className="text-xs text-on-surface-variant">{eaten} eaten · {burned} burned</p></Card>
        <Card>
          <p className="text-sm text-on-surface-variant">Water</p>
          <p className="text-3xl font-semibold">{today.water}<span className="text-base font-normal">/8</span></p>
          <div className="mt-1 flex gap-1">
            <button aria-label="Less water" onClick={() => ctx.updateToday((d) => ({ ...d, water: Math.max(0, d.water - 1) }))} className="grid size-8 place-items-center rounded-full bg-surface-high"><Icon name="minus" className="size-4" /></button>
            <button aria-label="More water" onClick={() => ctx.updateToday((d) => ({ ...d, water: d.water + 1 }))} className="grid size-8 place-items-center rounded-full bg-primary text-on-primary"><Icon name="water" className="size-4" /></button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function Program({ ctx }: { ctx: Ctx }) {
  const pos = programPos(ctx.profile.startDate)
  const [week, setWeek] = useState(pos.week)
  const [open, setOpen] = useState<number | null>(pos.dayIdx)
  const phase = phaseFor(week)
  const allDone = new Set(Object.values(ctx.state.days).flatMap((d) => d.done))
  return (
    <div className="space-y-4">
      <h1 className="pt-2 text-3xl font-semibold">Program</h1>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
        {Array.from({ length: 12 }, (_, k) => k + 1).map((n) => (
          <button key={n} onClick={() => setWeek(n)} className={`h-9 shrink-0 rounded-lg border px-4 text-sm font-medium transition ${n === week ? 'border-transparent bg-secondary-container text-on-secondary-container' : 'border-outline-variant'}`}>
            {n === week && '✓ '}Wk {n}
          </button>
        ))}
      </div>
      <Card tone="primary">
        <p className="text-sm font-medium">{phase.name} · Weeks {phase.weeks[0]}–{phase.weeks[1]}</p>
        <p className="opacity-80">{phase.note}. Rest {phase.rest}s between sets.</p>
        <div className="mt-3 flex gap-1">{PHASES.map((p) => <div key={p.name} className={`h-1.5 flex-1 rounded-full ${p === phase ? 'bg-primary' : 'bg-primary/20'}`} />)}</div>
      </Card>
      <div className="space-y-2">
        {DAY_NAMES.map((dn, d) => {
          const w = buildWorkout(week, d)
          const done = allDone.has(w.id)
          const isToday = week === pos.week && d === pos.dayIdx
          return (
            <div key={d} className={`overflow-hidden rounded-3xl ${isToday ? 'bg-surface-high ring-2 ring-primary' : 'bg-surface-low'}`}>
              <button onClick={() => setOpen(open === d ? null : d)} className="flex w-full items-center gap-4 p-4 text-left">
                <div className={`grid size-11 place-items-center rounded-2xl text-sm font-semibold ${done ? 'bg-primary text-on-primary' : w.kind === 'rest' ? 'bg-surface-highest' : 'bg-primary-container text-on-primary-container'}`}>{done ? <Icon name="check" className="size-5" /> : dn}</div>
                <div className="flex-1"><p className="font-medium">{w.title}</p><p className="text-xs capitalize text-on-surface-variant">{w.kind}{isToday ? ' · today' : ''}</p></div>
              </button>
              {open === d && w.kind !== 'rest' && (
                <div className="space-y-2 px-4 pb-4">
                  {w.blocks.map((b) => {
                    const e = EXERCISES[b.ex]
                    const cardio = e.equip === 'treadmill'
                    return (
                      <div key={b.ex} className="flex items-center justify-between rounded-2xl bg-surface p-3">
                        <div><p className="text-sm font-medium">{e.name}</p><p className="text-xs text-on-surface-variant">{e.cue}</p></div>
                        <span className="ml-3 shrink-0 text-sm font-semibold text-primary">{cardio ? `${Math.round(b.reps / 60)} min` : `${b.sets}×${e.timed ? `${b.reps}s` : b.reps}`}</span>
                      </div>
                    )
                  })}
                  <Button className="w-full" variant="tonal" onClick={() => ctx.startWorkout(w)}><Icon name="play" className="size-5" />Start</Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Progress({ ctx, addWeight }: { ctx: Ctx; addWeight: (kg: number) => void }) {
  const { state, profile } = ctx
  const [kg, setKg] = useState('')
  const days = lastNDays(7)
  const stepsData = days.map((d) => ({ label: DAY_NAMES[(d.getDay() + 6) % 7][0], v: state.days[todayKey(d)]?.steps ?? 0 }))
  const kcalData = days.map((d) => ({ label: DAY_NAMES[(d.getDay() + 6) % 7][0], v: (state.days[todayKey(d)]?.food ?? []).reduce((a, f) => a + f.kcal, 0) }))
  const weights = state.weights.slice(-12)
  const totalWorkouts = Object.values(state.days).reduce((a, d) => a + d.done.length, 0)
  const start = state.weights[0]?.kg ?? profile.weightKg
  const current = state.weights.at(-1)?.kg ?? profile.weightKg
  const toGo = Math.max(0, start - profile.goalWeightKg)
  const pct = toGo ? (start - current) / toGo : 0
  const bmi = current / (profile.heightCm / 100) ** 2
  const n = Number(kg)
  return (
    <div className="space-y-4">
      <h1 className="pt-2 text-3xl font-semibold">Progress</h1>
      <div className="grid grid-cols-3 gap-3">
        {[[totalWorkouts, 'workouts'], [`${(start - current).toFixed(1)}`, 'kg lost'], [bmi.toFixed(1), 'BMI']].map(([a, b]) => (
          <Card key={b} className="!p-4 text-center"><p className="text-2xl font-semibold">{a}</p><p className="text-xs text-on-surface-variant">{b}</p></Card>
        ))}
      </div>
      <Card>
        <div className="flex items-baseline justify-between"><h3 className="font-medium">Weight</h3><span className="text-sm text-on-surface-variant">Goal {profile.goalWeightKg} kg · {Math.round(Math.max(0, Math.min(1, pct)) * 100)}%</span></div>
        <LineChart points={weights.map((w) => w.kg)} goal={profile.goalWeightKg} />
        <div className="flex gap-2">
          <input type="number" step="0.1" value={kg} onChange={(e) => setKg(e.target.value)} placeholder="Today's weight (kg)" className={`${inputCls} !h-12`} />
          <Button disabled={!(n >= 30 && n <= 300)} onClick={() => { addWeight(n); setKg('') }}><Icon name="plus" className="size-5" /></Button>
        </div>
      </Card>
      <Card><h3 className="mb-3 font-medium">Steps · last 7 days</h3><BarChart data={stepsData} goal={profile.stepGoal} color="var(--color-primary)" /></Card>
      <Card><h3 className="mb-3 font-medium">Calories eaten · last 7 days</h3><BarChart data={kcalData} color="var(--color-outline)" /><p className="mt-2 text-xs text-on-surface-variant">Target {calorieTarget(profile)} kcal/day</p></Card>
    </div>
  )
}

export function Nutrition({ ctx }: { ctx: Ctx }) {
  const { profile, today } = ctx
  const [name, setName] = useState('')
  const [kcal, setKcal] = useState('')
  const [prot, setProt] = useState('')
  const eaten = today.food.reduce((a, f) => a + f.kcal, 0)
  const protein = today.food.reduce((a, f) => a + f.p, 0)
  const target = calorieTarget(profile)
  const pTarget = proteinTarget(profile)
  const burned = today.burned + stepKcal(today.steps, profile.weightKg)
  const add = (f: { name: string; kcal: number; p: number }) => ctx.updateToday((d) => ({ ...d, food: [...d.food, { ...f, id: crypto.randomUUID?.() ?? String(Date.now()) }] }))
  const over = eaten > target + burned
  return (
    <div className="space-y-4">
      <h1 className="pt-2 text-3xl font-semibold">Nutrition</h1>
      <Card className="flex items-center gap-5">
        <Ring value={eaten / (target + burned)} size={130} color={over ? 'var(--color-error)' : 'var(--color-primary)'}>
          <div><div className="text-2xl font-semibold">{Math.abs(target + burned - eaten)}</div><div className="text-xs text-on-surface-variant">{over ? 'kcal over' : 'kcal left'}</div></div>
        </Ring>
        <div className="flex-1 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-on-surface-variant">Target</span><b>{target}</b></div>
          <div className="flex justify-between"><span className="text-on-surface-variant">+ Burned</span><b>{burned}</b></div>
          <div className="flex justify-between"><span className="text-on-surface-variant">− Eaten</span><b>{eaten}</b></div>
          <div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Protein</span><b>{protein}/{pTarget}g</b></div>
            <div className="mt-1 h-2 rounded-full bg-surface-highest"><div className="h-full rounded-full bg-tertiary" style={{ width: `${Math.min(100, (protein / pTarget) * 100)}%` }} /></div>
          </div>
        </div>
      </Card>
      <div>
        <h3 className="mb-2 px-1 text-sm font-medium text-on-surface-variant">Quick add</h3>
        <div className="flex flex-wrap gap-2">{FOODS.map((f) => <button key={f.name} onClick={() => add(f)} className="h-8 rounded-lg border border-outline-variant px-3 text-xs font-medium active:bg-secondary-container">{f.name} · {f.kcal}</button>)}</div>
      </div>
      <Card>
        <h3 className="mb-3 font-medium">Custom food</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Food name" className={`${inputCls} !h-12`} />
        <div className="mt-2 flex gap-2">
          <input type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} placeholder="kcal" className={`${inputCls} !h-12`} />
          <input type="number" value={prot} onChange={(e) => setProt(e.target.value)} placeholder="protein g" className={`${inputCls} !h-12`} />
          <Button disabled={!name.trim() || !(Number(kcal) > 0)} onClick={() => { add({ name: name.trim(), kcal: Math.round(Number(kcal)), p: Math.max(0, Math.round(Number(prot) || 0)) }); setName(''); setKcal(''); setProt('') }}><Icon name="plus" className="size-5" /></Button>
        </div>
      </Card>
      <Card>
        <h3 className="mb-2 font-medium">Today's log</h3>
        {today.food.length === 0 ? <p className="py-4 text-center text-sm text-on-surface-variant">Nothing logged yet.</p> : (
          <ul className="divide-y divide-outline-variant/50">
            {today.food.map((f) => (
              <li key={f.id} className="flex items-center gap-3 py-2">
                <div className="flex-1"><p className="text-sm font-medium">{f.name}</p><p className="text-xs text-on-surface-variant">{f.p}g protein</p></div>
                <span className="text-sm font-semibold">{f.kcal}</span>
                <button aria-label="Remove" onClick={() => ctx.updateToday((d) => ({ ...d, food: d.food.filter((x) => x.id !== f.id) }))} className="grid size-9 place-items-center rounded-full text-on-surface-variant hover:bg-surface-high"><Icon name="trash" className="size-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export function ProfileScreen({ ctx, onSave, onReset }: { ctx: Ctx; onSave: (p: Profile) => void; onReset: () => void }) {
  const [saved, setSaved] = useState(false)
  return (
    <div className="space-y-4">
      <h1 className="pt-2 text-3xl font-semibold">Profile</h1>
      <Card className="flex items-center gap-4">
        <div className="grid size-14 place-items-center rounded-full bg-primary text-xl font-semibold text-on-primary">{ctx.profile.name[0]?.toUpperCase()}</div>
        <div><p className="font-medium">{ctx.profile.name}</p><p className="text-sm text-on-surface-variant">{calorieTarget(ctx.profile)} kcal · {proteinTarget(ctx.profile)}g protein daily</p></div>
      </Card>
      <ProfileForm key={JSON.stringify(ctx.profile)} initial={ctx.profile} cta={saved ? 'Saved' : 'Save changes'} onSave={(p) => { onSave(p); setSaved(true); setTimeout(() => setSaved(false), 1500) }} />
      <Button variant="text" className="w-full !text-error" onClick={() => { if (confirm('Erase all data and start over?')) onReset() }}>Reset all data</Button>
    </div>
  )
}

export { emptyDay }
export type { Ctx }
