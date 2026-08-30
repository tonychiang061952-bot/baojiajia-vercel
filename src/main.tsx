import { StrictMode } from 'react'
import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleAuthProvider } from './auth/GoogleAuthProvider.tsx'

import { HelmetProvider } from 'react-helmet-async'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <GoogleAuthProvider>
        <App />
      </GoogleAuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
