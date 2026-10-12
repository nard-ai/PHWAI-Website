import type { ReactNode } from 'react'

export function Card({ children, className = '', tone = 'low' }: { children: ReactNode; className?: string; tone?: 'low' | 'high' | 'primary' | 'tertiary' }) {
  const tones = {
    low: 'bg-surface-low',
    high: 'bg-surface-high',
    primary: 'bg-primary-container text-on-primary-container',
    tertiary: 'bg-tertiary-container text-on-tertiary-container',
  }
  return <div className={`rounded-[28px] p-5 ${tones[tone]} ${className}`}>{children}</div>
}

export function Ring({ value, size = 120, stroke = 12, color = 'var(--color-primary)', children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-surface-highest)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,0,0,1)' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

export function Button({ children, onClick, variant = 'filled', className = '', disabled }: { children: ReactNode; onClick?: () => void; variant?: 'filled' | 'tonal' | 'text' | 'outline'; className?: string; disabled?: boolean }) {
  const v = {
    filled: 'bg-primary text-on-primary hover:shadow-md',
    tonal: 'bg-secondary-container text-on-secondary-container',
    text: 'text-primary hover:bg-primary/8',
    outline: 'border border-outline text-primary',
  }
  return (
    <button disabled={disabled} onClick={onClick} className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-medium transition active:scale-[.97] disabled:opacity-40 ${v[variant]} ${className}`}>
      {children}
    </button>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block px-1 text-xs font-medium text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}

export const inputCls = 'h-14 w-full rounded-2xl border border-outline-variant bg-surface px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30'

export function BarChart({ data, goal, color = 'var(--color-primary)' }: { data: { label: string; v: number }[]; goal?: number; color?: string }) {
  const max = Math.max(goal ?? 0, ...data.map((d) => d.v), 1)
  return (
    <div className="relative flex h-36 items-end gap-2">
      {goal ? <div className="absolute inset-x-0 border-t border-dashed border-outline" style={{ bottom: `calc(${(goal / max) * 100}% * 0.82 + 20px)` }} /> : null}
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-28 w-full items-end">
            <div className="w-full rounded-t-lg rounded-b-sm transition-all" style={{ height: `${(d.v / max) * 100}%`, minHeight: d.v ? 4 : 2, background: goal && d.v >= goal ? 'var(--color-tertiary)' : color, opacity: d.v ? 1 : 0.25 }} />
          </div>
          <span className="text-[11px] text-on-surface-variant">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function LineChart({ points, goal }: { points: number[]; goal?: number }) {
  if (points.length < 2) return <p className="py-10 text-center text-sm text-on-surface-variant">Log at least two weigh-ins to see your trend.</p>
  const all = goal ? [...points, goal] : points
  const min = Math.min(...all) - 1
  const max = Math.max(...all) + 1
  const W = 300, H = 120
  const xy = points.map((p, i) => [(i / (points.length - 1)) * W, H - ((p - min) / (max - min)) * H])
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ')
  const gy = goal ? H - ((goal - min) / (max - min)) * H : 0
  return (
    <svg viewBox={`-6 -6 ${W + 12} ${H + 12}`} className="h-36 w-full">
      <defs>
        <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-primary)" stopOpacity=".3" />
          <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {goal ? <line x1={0} x2={W} y1={gy} y2={gy} stroke="var(--color-tertiary)" strokeDasharray="4 4" /> : null}
      <path d={`${d} L${W},${H} L0,${H}Z`} fill="url(#lg)" />
      <path d={d} fill="none" stroke="var(--color-primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {xy.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth={2} />)}
    </svg>
  )
}
