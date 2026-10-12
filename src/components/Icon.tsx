import type { ReactNode } from 'react'

const paths: Record<string, ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  dumbbell: <path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  food: <path d="M7 3v8a2 2 0 0 0 4 0V3M9 11v10M17 3c-2 2-2 6 0 8v10" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />,
  steps: <path d="M8 3c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5zM6 16h4v3a2 2 0 0 1-4 0zM16 7c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5zM14 20h4" />,
  fire: <path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 3-5 5-5 8a7 7 0 0 0 7 7z" />,
  play: <path d="M7 4l13 8-13 8z" />,
  pause: <path d="M7 4h3v16H7zM14 4h3v16h-3z" />,
  check: <path d="M4 12l5 5L20 6" />,
  close: <path d="M5 5l14 14M19 5 5 19" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  skip: <path d="M5 4l10 8-10 8zM19 5v14" />,
  water: <path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z" />,
  scale: <path d="M4 5h16v14H4zM8 9a4 4 0 0 1 8 0M12 9l1.5-2" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  spark: <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />,
}

export function Icon({ name, className = 'size-6' }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  )
}
