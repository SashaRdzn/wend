import { WEDDING_DATE } from './weddingConstants'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

function buildMonthCells(year: number, monthIndex: number): (number | null)[] {
  const first = new Date(year, monthIndex, 1)
  const mondayBased = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < mondayBased; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

function HeartMark() {
  return (
    <span className="calendar-heart mt-0.5 flex justify-center" aria-hidden>
      <svg
        className="h-5 w-5 drop-shadow-md sm:h-6 sm:w-6"
        viewBox="0 0 24 24"
        fill="none"
      >
        <defs>
          <linearGradient id="weddingHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="55%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
        <path
          fill="url(#weddingHeartGrad)"
          d="M12 21s-7-4.35-9.5-9.5C.5 8.5 3 5 7 5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 4 0 6.5 3.5 4.5 6.5C19 16.65 12 21 12 21z"
        />
      </svg>
    </span>
  )
}

export function WeddingCalendar() {
  const y = WEDDING_DATE.getFullYear()
  const monthIndex = WEDDING_DATE.getMonth()
  const weddingDay = WEDDING_DATE.getDate()
  const cells = buildMonthCells(y, monthIndex)
  const title = `${MONTH_NAMES[monthIndex]} ${y}`

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-ink/10 bg-white/70 p-5 shadow-sm backdrop-blur sm:max-w-lg sm:p-8">
      <div className="mb-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-sage sm:text-xs sm:tracking-[0.4em]">
          сохраните дату
        </p>
        <h2 className="mt-2 font-display text-2xl text-champagne sm:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-ink/60">
          {weddingDay.toString().padStart(2, '0')}.{String(monthIndex + 1).padStart(2, '0')}.{y}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-medium text-ink/45 sm:text-xs">
        {WEEKDAYS.map((d) => (
          <div key={d} className="pb-2">
            {d}
          </div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={`relative flex min-h-[2.5rem] items-center justify-center sm:min-h-[3rem] ${
              day === null ? '' : ''
            }`}
          >
            {day === null ? null : day === weddingDay ? (
              <div className="flex min-h-[3.25rem] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 via-white to-sage/20 px-2 py-1 ring-2 ring-rose-300/80 shadow-[0_6px_24px_rgba(251,113,133,0.22)] sm:min-h-[3.75rem] sm:px-3">
                <span className="text-sm font-semibold tabular-nums text-moss sm:text-base">
                  {day}
                </span>
                <HeartMark />
              </div>
            ) : (
              <span className="tabular-nums text-ink/55">{day}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
