import firstImage from './assets/pictures/first.jpg'
import { WEDDING_DATE } from './weddingConstants'

function formatHeroDate(d: Date) {
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const y = d.getFullYear()
  return `${day} | ${month} | ${y}`
}

export function OpeningHero() {
  return (
    <section
      className="relative isolate flex min-h-[100svh] w-full shrink-0 flex-col"
      aria-label="Титульный экран приглашения"
    >
      <img
        src={firstImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-cream/90 via-cream/20 to-cream/95"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="text-center font-serif text-[13px] tracking-[0.42em] text-ink sm:text-sm sm:tracking-[0.48em]">
          {formatHeroDate(WEDDING_DATE)}
        </p>

        <div className="mt-16 flex flex-col items-center text-center sm:mt-24">
          <h2 className="font-display text-[2.75rem] leading-none text-moss sm:text-6xl md:text-7xl">
            Wedding Day
          </h2>
          <p className="mt-3 font-serif text-[13px] lowercase tracking-[0.12em] text-ink/75 sm:text-sm">
            it&apos;s our
          </p>
        </div>

        <div className="mt-auto flex flex-col">
          <div className="mb-10 self-end text-right font-serif text-[11px] font-medium leading-relaxed tracking-[0.28em] text-ink sm:mb-14 sm:text-xs sm:tracking-[0.32em]">
            <div>ВЛАДИМИР</div>
            <div className="my-1 font-display text-2xl tracking-normal text-sage sm:text-3xl">
              &
            </div>
            <div>ЕЛИЗАВЕТА</div>
          </div>

          <a
            href="#calendar"
            className="mx-auto flex flex-col items-center gap-1 pb-2 text-ink/45 transition hover:text-ink/70"
            aria-label="К календарю и деталям"
          >
            <span className="text-[10px] uppercase tracking-[0.35em]">далее</span>
            <svg
              className="h-5 w-5 animate-bounce"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
