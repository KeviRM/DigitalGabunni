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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registrado con éxito:', registration.scope);
      })
      .catch(err => {
        console.error('Fallo al registrar SW:', err);
      });
  });

}

