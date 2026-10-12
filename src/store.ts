import { useEffect, useState } from 'react'

export interface Profile {
  name: string
  sex: 'male' | 'female'
  age: number
  heightCm: number
  weightKg: number
  goalWeightKg: number
  stepGoal: number
  startDate: string // ISO date
}

export interface FoodEntry { id: string; name: string; kcal: number; p: number }
export interface DayLog { steps: number; food: FoodEntry[]; water: number; done: string[]; burned: number }

export interface AppState {
  profile: Profile | null
  days: Record<string, DayLog>
  weights: { date: string; kg: number }[]
}

const KEY = 'fittrack-v1'
const initial: AppState = { profile: null, days: {}, weights: [] }

export const todayKey = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}

export const emptyDay = (): DayLog => ({ steps: 0, food: [], water: 0, done: [], burned: 0 })

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...initial, ...JSON.parse(raw) } : initial
  } catch {
    return initial
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* quota */ }
  }, [state])

  const updateDay = (key: string, fn: (d: DayLog) => DayLog) =>
    setState((s) => ({ ...s, days: { ...s.days, [key]: fn(s.days[key] ?? emptyDay()) } }))

  return { state, setState, updateDay }
}

// Program position (week 1..12, weekday 0=Mon)
export function programPos(startDate: string, now = new Date()) {
  const start = new Date(startDate + 'T00:00:00')
  const diff = Math.floor((new Date(todayKey(now) + 'T00:00:00').getTime() - start.getTime()) / 86400000)
  const dayNum = Math.max(0, diff)
  const week = Math.min(12, Math.floor(dayNum / 7) + 1)
  const dayIdx = (now.getDay() + 6) % 7
  return { week, dayIdx, dayNum, finished: dayNum >= 84 }
}

// Mifflin-St Jeor BMR, light activity, 20% deficit for fat loss
export function calorieTarget(p: Profile) {
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'male' ? 5 : -161)
  return Math.round((bmr * 1.375 * 0.8) / 10) * 10
}
export const proteinTarget = (p: Profile) => Math.round(p.weightKg * 1.6)
export const stepKcal = (steps: number, kg: number) => Math.round(steps * 0.0005 * kg)
