import { useEffect, useState } from 'react'

const DURATION_MS = 2500

export function CurtainReveal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const start = requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpen(true))
    })
    const t = setTimeout(() => setDone(true), DURATION_MS + 100)
    return () => {
      cancelAnimationFrame(start)
      clearTimeout(t)
    }
  }, [])

  if (done) return <>{children}</>

  return (
    <>
      <div
        className={`curtains fixed inset-0 z-[100] flex ${open ? 'curtains-open' : ''}`}
        aria-hidden
      >
        <div
          className="curtain-panel curtain-left h-full w-1/2 bg-moss"
        />
        <div
          className="curtain-panel curtain-right h-full w-1/2 bg-moss"
        />
      </div>
      {children}
    </>
  )
}
