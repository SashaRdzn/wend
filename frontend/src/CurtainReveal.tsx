import { useEffect, useState } from 'react'

const DURATION_MS = 2500
const SEEN_KEY = 'wend-curtain-seen'

function readSeen(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function CurtainReveal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [overlayGone, setOverlayGone] = useState(readSeen)

  useEffect(() => {
    if (overlayGone) return
    const start = requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpen(true))
    })
    const t = setTimeout(() => {
      setOverlayGone(true)
      try {
        sessionStorage.setItem(SEEN_KEY, '1')
      } catch {
      }
    }, DURATION_MS + 100)
    return () => {
      cancelAnimationFrame(start)
      clearTimeout(t)
    }
  }, [overlayGone])

  return (
    <>
      {children}
      {!overlayGone ? (
        <div
          className={`curtains fixed inset-0 z-[100] flex ${open ? 'curtains-open' : ''}`}
          aria-hidden
        >
          <div className="curtain-panel curtain-left h-full w-1/2 bg-moss" />
          <div className="curtain-panel curtain-right h-full w-1/2 bg-moss" />
        </div>
      ) : null}
    </>
  )
}
