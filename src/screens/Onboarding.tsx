import { useState } from 'react'
import { Button, Field, inputCls } from '../components/ui'
import { Icon } from '../components/Icon'
import type { Profile } from '../store'
import { todayKey } from '../store'

// Start the program on the most recent Monday so weeks align with the template.
const lastMonday = () => {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return todayKey(d)
}

export const defaultProfile = (): Profile => ({
  name: '', sex: 'male', age: 30, heightCm: 175, weightKg: 80, goalWeightKg: 72, stepGoal: 10000, startDate: lastMonday(),
})

export function ProfileForm({ initial, onSave, cta }: { initial: Profile; onSave: (p: Profile) => void; cta: string }) {
  const [p, setP] = useState<Profile>(initial)
  const num = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => setP({ ...p, [k]: Number(e.target.value) })
  const valid = p.name.trim() && p.age >= 13 && p.age <= 100 && p.heightCm >= 120 && p.heightCm <= 230 && p.weightKg >= 30 && p.weightKg <= 300 && p.goalWeightKg >= 30 && p.stepGoal >= 1000
  return (
    <div className="space-y-4">
      <Field label="Name"><input className={inputCls} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder="Your name" /></Field>
      <div className="flex gap-2 rounded-full bg-surface-high p-1">
        {(['male', 'female'] as const).map((s) => (
          <button key={s} onClick={() => setP({ ...p, sex: s })} className={`h-10 flex-1 rounded-full text-sm font-medium capitalize transition ${p.sex === s ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'text-on-surface-variant'}`}>{s}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age"><input type="number" className={inputCls} value={p.age} onChange={num('age')} /></Field>
        <Field label="Height (cm)"><input type="number" className={inputCls} value={p.heightCm} onChange={num('heightCm')} /></Field>
        <Field label="Weight (kg)"><input type="number" step="0.1" className={inputCls} value={p.weightKg} onChange={num('weightKg')} /></Field>
        <Field label="Goal weight (kg)"><input type="number" step="0.1" className={inputCls} value={p.goalWeightKg} onChange={num('goalWeightKg')} /></Field>
        <Field label="Daily step goal"><input type="number" step="500" className={inputCls} value={p.stepGoal} onChange={num('stepGoal')} /></Field>
        <Field label="Program start"><input type="date" className={inputCls} value={p.startDate} onChange={(e) => setP({ ...p, startDate: e.target.value || p.startDate })} /></Field>
      </div>
      <div className="rounded-2xl bg-surface-high p-4 text-sm text-on-surface-variant">
        <b className="text-on-surface">Locked in:</b> Beginner · Fat loss + tone · 12 weeks · Treadmill, dumbbells, pull-up bar, row bar (no bench)
      </div>
      <Button className="w-full" disabled={!valid} onClick={() => onSave({ ...p, name: p.name.trim() })}>{cta}</Button>
    </div>
  )
}

export default function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [step, setStep] = useState(0)
  return (
    <div className="mx-auto min-h-screen max-w-md px-5 py-10">
      {step === 0 ? (
        <div className="rise flex min-h-[80vh] flex-col justify-between">
          <div>
            <div className="mb-8 grid size-16 place-items-center rounded-[22px] bg-primary text-on-primary"><Icon name="spark" className="size-8" /></div>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight">Twelve weeks.<br /><span className="text-primary">Your living room.</span></h1>
            <p className="mt-5 text-lg text-on-surface-variant">A beginner fat-loss and toning program built around the gear you actually own.</p>
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[['12', 'weeks'], ['5', 'sessions/wk'], ['10k', 'steps/day']].map(([a, b]) => (
                <div key={b} className="rounded-3xl bg-surface-high p-4"><div className="text-2xl font-semibold">{a}</div><div className="text-xs text-on-surface-variant">{b}</div></div>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={() => setStep(1)}>Get started</Button>
        </div>
      ) : (
        <div className="rise">
          <h2 className="mb-1 text-3xl font-semibold">About you</h2>
          <p className="mb-6 text-on-surface-variant">Used to set calorie and protein targets. Editable anytime.</p>
          <ProfileForm initial={defaultProfile()} onSave={onDone} cta="Start my program" />
        </div>
      )}
    </div>
  )
}
