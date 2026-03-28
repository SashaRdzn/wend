# Wedding — приглашения и RSVP

Монорепозиторий: фронтенд (Vite + React) и бэкенд (Express + MongoDB).

## Установка

Из корня:

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

Скопируйте `backend/.env.example` → `backend/.env` и задайте **`MONGODB_URI`** (MongoDB Atlas или локальный MongoDB).

## Локальная разработка

| Команда | Описание |
|--------|----------|
| `npm run dev` | Фронт + API |
| `npm run dev:lan` | Доступ по сети (0.0.0.0) |

Переменные бэкенда: см. `backend/.env.example` (`MONGODB_URI`, `ADMIN_PASSWORD`, опционально `MONGODB_DB_NAME`).

## Продакшен

### Вариант A — всё на одном сервере (VPS и т.п.)

Сборка фронта + бэкенд, один процесс отдаёт API и статику:

```bash
npm run start:prod
```

из корня (см. `package.json`: собирается `frontend/dist`, затем `SERVE_SPA=1 npm start` в `backend`).

Вручную из `backend`: сначала `npm run build:all`, затем `npm run start:with-spa`.

### Вариант B — фронт на Vercel, API на Render (рекомендуется для Render)

**Render (только бэкенд, без фронта в этом сервисе):**

1. **Root Directory:** `backend`.
2. **Build Command:** `npm install` (или `npm ci`) — скрипт `build` в `backend` только ставит зависимости, **не** собирает фронт.
3. **Start Command:** `npm start` — слушает `0.0.0.0`, **не** раздаёт `frontend/dist`, пока не задано `SERVE_SPA=1`.
4. **Environment:** `MONGODB_URI`, `ADMIN_PASSWORD`, `PORT` (Render).

CORS для Vercel: по умолчанию ок; при необходимости **`CORS_ORIGIN`**.

Два разных URL: на Vercel задайте **`VITE_API_URL`** = URL вашего сервиса на Render.

**Vercel (фронт):** Root `frontend`, build `npm run build`, переменная **`VITE_API_URL`** = `https://<ваш-сервис>.onrender.com` без `/` в конце.

Локально «как на Vercel»: `frontend/.env.local` с `VITE_API_URL`, затем `npm run build && npm run preview`.

### MongoDB Atlas + Render (ошибка TLS / `alert number 80`)

- В Atlas → **Network Access**: разрешите **`0.0.0.0/0`** (или временно для проверки).
- Строка подключения: драйвер **Node.js**, пароль без спецсимволов или **URL-encoded** в URI.
- В коде включён обход типичной проблемы **IPv6 + TLS** (`dns.setDefaultResultOrder('ipv4first')` в `mongoDb.ts`).

Если **TLS alert 80** не проходит: пароль в URI должен быть **URL-encoded**; в Atlas попробуйте **стандартную** строку подключения (не `mongodb+srv`, а список хостов из «Connect»). На Render задайте **Node 20 LTS**. В коде — **повторные попытки** и `dns.setDefaultResultOrder('ipv4first')` без агрессивных TLS-опций драйвера.

### Локально: один origin (фронт + API)

```bash
npm run start:prod
```

из корня, либо соберите фронт и запустите `npm run start:with-spa` в `backend`.
