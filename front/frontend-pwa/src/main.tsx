import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ShopInfoProvider } from './context/ShopInfoContext'


const GOOGLE_CLIENT_ID = "841107781554-3ocfsr9et0oqd5jiqj8l2gl142g9d1m5.apps.googleusercontent.com";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ShopInfoProvider>
        <App />
      </ShopInfoProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
})

