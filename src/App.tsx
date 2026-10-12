import { useState } from 'react'
import { emptyDay, todayKey, useAppState, type Profile } from './store'
import type { Workout } from './data'
import Onboarding from './screens/Onboarding'
import SessionPlayer from './screens/SessionPlayer'
import { Home, Nutrition, Program, Progress, ProfileScreen, type Ctx } from './screens/Tabs'
import { Icon } from './components/Icon'

const TABS = [
  { id: 'home', label: 'Today', icon: 'home' },
  { id: 'program', label: 'Program', icon: 'dumbbell' },
  { id: 'progress', label: 'Progress', icon: 'chart' },
  { id: 'food', label: 'Food', icon: 'food' },
  { id: 'profile', label: 'Profile', icon: 'user' },
] as const

export default function App() {
  const { state, setState, updateDay } = useAppState()
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('home')
  const [active, setActive] = useState<Workout | null>(null)

  const saveProfile = (p: Profile) =>
    setState((s) => ({ ...s, profile: p, weights: s.weights.length ? s.weights : [{ date: todayKey(), kg: p.weightKg }] }))

  if (!state.profile) return <Onboarding onDone={saveProfile} />

  const key = todayKey()
  const ctx: Ctx = {
    state,
    profile: state.profile,
    today: state.days[key] ?? emptyDay(),
    updateToday: (fn) => updateDay(key, fn),
    startWorkout: setActive,
  }

  const addWeight = (kg: number) =>
    setState((s) => {
      const weights = [...s.weights.filter((w) => w.date !== key), { date: key, kg }].sort((a, b) => a.date.localeCompare(b.date))
      return { ...s, weights, profile: s.profile && { ...s.profile, weightKg: kg } }
    })

  return (
    <div className="min-h-screen">
      <main key={tab} className="rise mx-auto max-w-md px-5 pb-32 pt-6">
        {tab === 'home' && <Home ctx={ctx} />}
        {tab === 'program' && <Program ctx={ctx} />}
        {tab === 'progress' && <Progress ctx={ctx} addWeight={addWeight} />}
        {tab === 'food' && <Nutrition ctx={ctx} />}
        {tab === 'profile' && <ProfileScreen ctx={ctx} onSave={saveProfile} onReset={() => { setState({ profile: null, days: {}, weights: [] }); setTab('home') }} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 bg-surface-high/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex h-20 max-w-md">
          {TABS.map((t) => {
            const on = t.id === tab
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-1 flex-col items-center justify-center gap-1">
                <span className={`grid h-8 w-16 place-items-center rounded-full transition-all duration-300 ${on ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant'}`}><Icon name={t.icon} className="size-5" /></span>
                <span className={`text-xs ${on ? 'font-semibold' : 'text-on-surface-variant'}`}>{t.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {active && (
        <SessionPlayer
          workout={active}
          weightKg={state.profile.weightKg}
          onClose={() => setActive(null)}
          onComplete={(kcal) => {
            updateDay(key, (d) => ({ ...d, done: d.done.includes(active.id) ? d.done : [...d.done, active.id], burned: d.burned + kcal }))
            setActive(null)
          }}
        />
      )}
    </div>
  )
}
