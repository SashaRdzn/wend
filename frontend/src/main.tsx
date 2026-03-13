import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { applyTheme, getStoredTheme } from './theme'
import { CurtainReveal } from './CurtainReveal'
import './index.css'
import App from './App.tsx'
import { AdminPage } from './pages/AdminPage.tsx'
import { InvitePage } from './pages/InvitePage.tsx'

applyTheme(getStoredTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CurtainReveal>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/invite/:token" element={<InvitePage />} />
        </Routes>
      </CurtainReveal>
    </BrowserRouter>
  </StrictMode>,
)
