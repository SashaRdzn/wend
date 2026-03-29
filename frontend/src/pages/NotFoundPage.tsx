import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-lg">
        <img
          src="/404-meme.png"
          alt="404 — страница не найдена"
          className="w-full rounded-2xl shadow-lg shadow-ink/10"
          loading="eager"
        />
      </div>
      <Link
        to="/"
        className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full border border-ink/10 bg-white/80 px-8 py-3 text-sm font-medium text-champagne shadow-sm transition hover:bg-sand/50 active:scale-[0.98]"
      >
        На главную
      </Link>
    </div>
  )
}
