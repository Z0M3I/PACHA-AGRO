import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppProvider } from './lib/store'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><AppProvider><App /></AppProvider></StrictMode>,
)

// Modo sin conexión (solo en la versión compilada).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* sin modo sin conexión */ }) })
}
