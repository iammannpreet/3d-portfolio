import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/bruno-ace/latin-400.css'
import '@fontsource-variable/reem-kufi/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import 'lenis/dist/lenis.css'
import './styles/index.css'
import App from './App'

if (import.meta.env.DEV || new URLSearchParams(window.location.search).has('debug')) {
  void import('./debug')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
