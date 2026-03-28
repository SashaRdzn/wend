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

### Вариант A — всё на Render (один сервис)

Один Web Service: и API, и статика из `frontend/dist`.

1. **Root Directory:** `backend`.
2. **Build Command:** `npm install && npm run build` (собирает фронт и ставит зависимости бэкенда).
3. **Start Command:** `npm start` (`NODE_ENV=production`, раздача `frontend/dist`).
4. **Environment:** `MONGODB_URI`, `ADMIN_PASSWORD`, `HOST=0.0.0.0`, `PORT` (Render задаёт сам).

### Вариант B — фронт на Vercel, API на Render (у вас так)

Два разных URL: браузер с Vercel ходит на API по **полному URL** (CORS уже настроен в `backend/src/index.ts`: по умолчанию разрешён запрос с любого `Origin`, либо задайте **`CORS_ORIGIN`** списком доменов Vercel).

**Render (только бэкенд):**

1. **Root Directory:** `backend`.
2. **Build Command:** `npm install` — сборка фронта не обязательна (не тратим время на `npm run build` в `../frontend`).
3. **Start Command:** `npm run start:api` — без раздачи SPA, только Express + `/api`.
4. **Environment:** `MONGODB_URI`, `ADMIN_PASSWORD`, `PORT` (как задаёт Render). `HOST` на `0.0.0.0` уже выставляет скрипт `start:api`.

**Vercel (фронт):**

1. Подключите репозиторий, **Root Directory** — `frontend` (или корень, если билд из корня).
2. **Build:** `npm run build` (или через Nx/Vercel defaults).
3. В **Environment Variables** (Production / Preview):

   `VITE_API_URL` = `https://<ваш-сервис>.onrender.com`  

   без слэша в конце. Тогда `frontend/src/apiUrl.ts` подставит этот URL ко всем запросам `/api/...`.

4. После смены URL бэкенда пересоберите деплой на Vercel.

Локально проверка «как на Vercel»: `frontend/.env.example` → `.env.local` с `VITE_API_URL`, затем `npm run build && npm run preview`.

### MongoDB Atlas + Render (ошибка TLS / `alert number 80`)

- В Atlas → **Network Access**: разрешите **`0.0.0.0/0`** (или временно для проверки).
- Строка подключения: драйвер **Node.js**, пароль без спецсимволов или **URL-encoded** в URI.
- В коде включён обход типичной проблемы **IPv6 + TLS** (`dns.setDefaultResultOrder('ipv4first')` в `mongoDb.ts`).

Если подключение всё ещё падает — проверьте версию Node на Render (лучше **20+**) и что URI скопирован целиком (`mongodb+srv://...`).

### Локальная сборка как на сервере

```bash
npm install --prefix frontend
npm run build --prefix frontend
npm install --prefix backend
cd backend && npm start
```

Откройте порт из лога (по умолчанию 4000): сайт и `/api` с одного origin.
