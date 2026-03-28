# Wedding — приглашения и RSVP

Монорепозиторий: фронтенд (Vite + React) и бэкенд (Express + **SQLite**).

## Установка

Из корня:

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

Скопируйте `backend/.env.example` → `backend/.env`, задайте **`ADMIN_PASSWORD`**. База создаётся при старте (`backend/wedding.sqlite` или путь из **`SQLITE_PATH`**).

## Локальная разработка

| Команда | Описание |
|--------|----------|
| `npm run dev` | Фронт + API |
| `npm run dev:lan` | Доступ по сети (0.0.0.0) |

## Продакшен

### Вариант A — всё на одном сервере (VPS)

```bash
npm run start:prod
```

из корня. Или в `backend`: `npm run build:all`, затем `npm run start:with-spa`.

### Вариант B — фронт на Vercel / Cloudflare Pages, API на Render

**Render (только бэкенд):**

1. **Root Directory:** `backend`.
2. **Build Command:** `npm install && npm run build` (в `backend` это `npm ci`).
3. **Start Command:** `npm start`.
4. **Persistent Disk:** смонтировать, например, в **`/var/data`**. В **Environment** задать **`SQLITE_PATH=/var/data/wedding.sqlite`** — тогда файл БД переживает деплои.
5. Переменные: **`ADMIN_PASSWORD`**, **`PORT`** (Render), опционально **`CORS_ORIGIN`**.

**Фронт (Vercel и т.д.):** задайте **`VITE_API_URL`** = `https://<ваш-api>.onrender.com` без `/` в конце.

### Локально: один origin

```bash
npm run start:prod
```
