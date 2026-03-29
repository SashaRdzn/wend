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

const HEART_PALE_PINK = '#f5c6d6'

function HeartWithDay({
  day,
  onHeartClick,
}: {
  day: number
  onHeartClick?: () => void
}) {
  return (
    <button
      type="button"
      className="calendar-heart relative z-20 flex h-[3.25rem] w-[3.25rem] shrink-0 cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 sm:h-16 sm:w-16"
      onClick={onHeartClick}
      aria-label={`День свадьбы ${day}`}
    >
      {/*
        Важно: сердце в absolute не задаёт размер кнопки — без min размера кликабельна
        только узкая область цифры, клики по розовому сердцу не срабатывали.
      */}
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-12 w-12 -translate-x-1/2 -translate-y-1/2 sm:h-[3.75rem] sm:w-[3.75rem]"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          fill={HEART_PALE_PINK}
          d="M12 21s-7-4.35-9.5-9.5C.5 8.5 3 5 7 5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 4 0 6.5 3.5 4.5 6.5C19 16.65 12 21 12 21z"
        />
      </svg>
      <span className="relative z-[1] tabular-nums text-ink/55">{day}</span>
    </button>
  )
}

export function WeddingCalendar({
  onWeddingDayHeartClick,
}: {
  onWeddingDayHeartClick?: () => void
} = {}) {
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
            className={`relative z-0 flex min-h-[2.5rem] items-center justify-center sm:min-h-[3rem] ${
              day === null ? '' : ''
            }`}
          >
            {day === null ? null : day === weddingDay ? (
              <HeartWithDay day={day} onHeartClick={onWeddingDayHeartClick} />
            ) : (
              <span className="tabular-nums text-ink/55">{day}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
