# Wedding — приглашения и RSVP

Монорепозиторий: фронтенд (Vite + React) и бэкенд (Express + SQLite).

## Структура

```
wedding/
├── frontend/       # SPA: лендинг, приглашения, админка
├── backend/        # API: гости, RSVP, авторизация
├── package.json   # Скрипты запуска всего проекта
└── README.md
```

## Установка

Из корня репозитория:

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

## Команды

| Команда | Описание |
|--------|----------|
| `npm run dev` | Фронт и API локально (localhost) |
| `npm run dev:lan` | То же, но доступ по сети: фронт и API слушают на 0.0.0.0 |
| `npm run build` | Сборка фронтенда в `frontend/dist` |
| `npm run start` | Запуск только бэкенда (порт 4000) |
| `npm run start:prod` | Сборка фронта + запуск бэкенда с раздачей статики (один процесс) |
| `npm run preview` | Просмотр собранного фронта (после `build`) |
| `npm run preview:lan` | Просмотр сборки с доступом по сети |

### Запуск в локальной сети (dev:lan)

1. Установите зависимости (см. выше).
2. Из корня: `npm run dev:lan`.
3. В терминале будет указан адрес вида `http://192.168.x.x:5173` — откройте его с телефона/другого ПК в той же сети.
4. API доступен на том же хосте по порту 4000; фронт проксирует `/api` на бэкенд.

Переменные для бэкенда при необходимости:

- `PORT` — порт (по умолчанию 4000).
- `HOST=0.0.0.0` — уже задаётся скриптом `dev:lan`.
- `ADMIN_PASSWORD` — пароль входа в админку (по умолчанию `admin`).

## Деплой

1. **Один процесс (фронт + API)** — удобно для VPS:

   ```bash
   npm install
   npm install --prefix frontend
   npm install --prefix backend
   npm run start:prod
   ```

   Скрипт собирает `frontend/dist`, выставляет `NODE_ENV=production` и `HOST=0.0.0.0`, поднимает Express на `PORT` (по умолчанию **4000**). Сайт и `/api` с одного origin. В браузере: `http://<сервер>:4000`.

   Переменные: см. `backend/.env.example`. Минимум на проде задайте **`ADMIN_PASSWORD`**. База SQLite создаётся как `backend/wedding.sqlite` при первом запросе (файл в `.gitignore`).

2. **Раздельно**: статика из `frontend/dist` на CDN/nginx, API на отдельном хосте — тогда настройте CORS на бэкенде под домен фронта и базовый URL для `fetch('/api')` (потребуется правка фронта или reverse-proxy).

Перед выкладкой: `npm run build` в корне (или в `frontend`) — убедитесь, что сборка без ошибок.

### Render.com

1. **Корневая папка сервиса (Root Directory):** `backend`.
2. **Менеджер пакетов:** лучше **npm** (в настройках сервиса отключите принудительный Yarn, если есть). Тогда: **Build Command** `npm run build`, **Start Command** `npm start`.
3. Если Render по умолчанию вызывает `yarn build` / `yarn install`: в `backend/package.json` уже есть скрипт **`build`** — он собирает `../frontend` через `npm ci` и затем ставит зависимости бэкенда. Предупреждения Yarn про `package-lock.json` можно игнорировать или перейти на npm.
4. Переменные: `NODE_ENV=production`, `HOST=0.0.0.0`, обязательно **`ADMIN_PASSWORD`**. SQLite-файл на бесплатном плане эфемерный — для постоянных данных подключите [диск Render](https://render.com/docs/disks) и положите `wedding.sqlite` на диск (потребуется правка пути к БД в коде).

Опционально: в корне репозитория есть **`render.yaml`** — можно подключить как Blueprint.
