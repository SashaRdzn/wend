/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL бэкенда (Render), без завершающего слэша. Например https://wend-api.onrender.com */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.JPG' {
  const src: string
  export default src
}
