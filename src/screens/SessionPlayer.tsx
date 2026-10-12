import { useEffect, useMemo, useRef, useState } from 'react'
import { EXERCISES, type Workout } from '../data'
import { Button, Ring } from '../components/ui'
import { Icon } from '../components/Icon'

type Step = { blockIdx: number; set: number; type: 'work' | 'rest' }

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination); o.frequency.value = 880
    g.gain.setValueAtTime(0.2, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    o.start(); o.stop(ctx.currentTime + 0.4)
    navigator.vibrate?.(200)
  } catch { /* audio unavailable */ }
}

export default function SessionPlayer({ workout, weightKg, onClose, onComplete }: { workout: Workout; weightKg: number; onClose: () => void; onComplete: (kcal: number) => void }) {
  const steps = useMemo(() => {
    const out: Step[] = []
    workout.blocks.forEach((b, bi) => {
      for (let s = 1; s <= b.sets; s++) {
        out.push({ blockIdx: bi, set: s, type: 'work' })
        const last = bi === workout.blocks.length - 1 && s === b.sets
        if (b.rest && !last) out.push({ blockIdx: bi, set: s, type: 'rest' })
      }
    })
    return out
  }, [workout])

  const [i, setI] = useState(0)
  const [left, setLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)
  const startRef = useRef(Date.now())

  const step = steps[i]
  const block = workout.blocks[step?.blockIdx ?? 0]
  const ex = EXERCISES[block.ex]
  const timedWork = step?.type === 'work' && ex.timed
  const total = step?.type === 'rest' ? block.rest : timedWork ? block.reps : 0

  // reset timer on step change; rests auto-start
  useEffect(() => {
    if (!step) return
    setLeft(total)
    setRunning(step.type === 'rest')
  }, [i]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!running || total === 0) return
    const t = setInterval(() => setLeft((l) => l - 1), 1000)
    return () => clearInterval(t)
  }, [running, total])

  useEffect(() => {
    if (running && total > 0 && left <= 0) { beep(); next() }
  }, [left]) // eslint-disable-line react-hooks/exhaustive-deps

  const kcal = useMemo(() => {
    // MET-weighted average over elapsed minutes
    const avgMet = workout.blocks.reduce((a, b) => a + EXERCISES[b.ex].met, 0) / Math.max(1, workout.blocks.length)
    return Math.round((avgMet * 3.5 * weightKg) / 200 * (elapsed / 60))
  }, [elapsed, weightKg, workout])

  function next() {
    if (i >= steps.length - 1) { setDone(true); setRunning(false); return }
    setI(i + 1)
  }

  const progress = (i + 1) / steps.length

  if (done) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-primary-container p-6 text-on-primary-container">
        <div className="pop max-w-sm text-center">
          <div className="mx-auto mb-6 grid size-24 place-items-center rounded-full bg-primary text-on-primary"><Icon name="check" className="size-12" /></div>
          <h2 className="text-4xl font-semibold">Workout done!</h2>
          <p className="mt-2 opacity-80">{workout.title}</p>
          <div className="my-8 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-surface/70 p-4"><div className="text-3xl font-semibold">{fmt(elapsed)}</div><div className="text-sm">duration</div></div>
            <div className="rounded-3xl bg-surface/70 p-4"><div className="text-3xl font-semibold">{kcal}</div><div className="text-sm">kcal burned</div></div>
          </div>
          <Button className="w-full" onClick={() => onComplete(kcal)}>Save & finish</Button>
        </div>
      </div>
    )
  }

  const isRest = step.type === 'rest'
  const nextBlock = isRest ? workout.blocks[steps[i + 1]?.blockIdx ?? step.blockIdx] : null

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-500 ${isRest ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface'}`}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-8 pt-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { if (confirm('End this workout? Progress will not be saved.')) onClose() }} className="grid size-12 place-items-center rounded-full hover:bg-on-surface/8" aria-label="Close"><Icon name="close" /></button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-on-surface/10"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress * 100}%` }} /></div>
          <span className="w-12 text-right text-sm tabular-nums opacity-70">{fmt(elapsed)}</span>
        </div>

        <div key={i} className="rise flex flex-1 flex-col items-center justify-center text-center">
          {isRest ? (
            <>
              <p className="text-sm font-medium uppercase tracking-widest opacity-70">Rest</p>
              <div className="my-6"><Ring value={left / total} size={240} stroke={16} color="var(--color-tertiary)"><span className="text-6xl font-semibold tabular-nums">{fmt(left)}</span></Ring></div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setLeft((l) => l + 15)}>+15s</Button>
                <Button variant="outline" onClick={() => setRunning(!running)}><Icon name={running ? 'pause' : 'play'} className="size-5" /></Button>
              </div>
              {nextBlock && <p className="mt-8 opacity-80">Up next: <b>{EXERCISES[nextBlock.ex].name}</b></p>}
            </>
          ) : (
            <>
              <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-medium text-on-secondary-container">{ex.muscle} · Set {step.set} of {block.sets}</span>
              <h2 className="mt-4 text-4xl font-semibold leading-tight">{ex.name}</h2>
              <p className="mt-3 max-w-xs text-on-surface-variant">{ex.cue}</p>
              <div className="my-8">
                {timedWork ? (
                  <Ring value={left / total} size={220} stroke={14}><span className="text-5xl font-semibold tabular-nums">{fmt(left)}</span></Ring>
                ) : (
                  <div className="grid size-52 place-items-center rounded-full bg-primary-container text-on-primary-container"><div><div className="text-7xl font-semibold">{block.reps}</div><div className="text-sm">reps</div></div></div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          {timedWork && <Button variant="tonal" className="flex-1" onClick={() => setRunning(!running)}><Icon name={running ? 'pause' : 'play'} className="size-5" />{running ? 'Pause' : 'Start'}</Button>}
          <Button variant={isRest ? 'outline' : 'filled'} className="flex-1" onClick={next}>
            {isRest ? <><Icon name="skip" className="size-5" />Skip rest</> : <><Icon name="check" className="size-5" />{timedWork ? 'Done' : 'Set complete'}</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
