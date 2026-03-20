import { useEffect, useState } from 'react'

type Props = { value: number }

export function FlipDigit({ value }: Props) {
  const [displayed, setDisplayed] = useState(value)
  const [nextVal, setNextVal] = useState(value)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (value === displayed) return
    setNextVal(value)
    setFlipped(true)
  }, [value, displayed])

  const handleTransitionEnd = () => {
    if (!flipped) return
    setDisplayed(nextVal)
    setFlipped(false)
  }

  const d = Math.min(9, Math.max(0, displayed))
  const n = Math.min(9, Math.max(0, nextVal))

  return (
    <div className="flip-cube-cell">
      <div className="flip-cube">
        <div
          className={`flip-cube-inner ${flipped ? 'flip-cube-flipped' : ''}`}
          onTransitionEnd={handleTransitionEnd}
        >
          <div className="flip-face flip-face-front">
            <span className="flip-digit font-display font-semibold tabular-nums text-moss">
              {d}
            </span>
          </div>
          <div className="flip-face flip-face-back">
            <span className="flip-digit font-display font-semibold tabular-nums text-moss">
              {n}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
