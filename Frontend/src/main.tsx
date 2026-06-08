import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from '@asgardeo/auth-react'

const asgardeoConfig = {
  signInRedirectURL: import.meta.env.VITE_ASGARDEO_REDIRECT_URL || 'http://localhost:5173',
  signOutRedirectURL: import.meta.env.VITE_ASGARDEO_REDIRECT_URL || 'http://localhost:5173',
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID || '',
  baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL || '',
  scope: ['openid', 'profile', 'email'],
  storage: 'localStorage' as const
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider config={asgardeoConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
)
