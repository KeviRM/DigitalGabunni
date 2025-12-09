import { useState, useEffect } from 'react';

import { pedidosApi } from '../api/axiosConfig';

import useAuth from './useAuth';

const VAPID_PUBLIC_KEY = 'BAfA5J72akeT3OJ7S0C-PdWyqliZ-qHS34IUjGtnJkbX-9tyuhFY2llXrl7kjXy_zIFQ958Ccp9eDbLDIgOg75U'; 
const SUBSCRIPTION_API_URL = '/api/v1/push/subscribe/';


function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const usePushNotification = () => {
    const { isAuthenticated, getAuthHeaders } = useAuth();
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);

    const subscribeToPush = async () => {
        if (!isAuthenticated) return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        try {
            // 1. Pedir permiso al usuario
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('Permiso de notificaciones denegado');
                return;
            }

            // 2. Obtener el registro del Service Worker
            const registration = await navigator.serviceWorker.ready;

            // 3. Crear la suscripción en el navegador
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
            
            // 4. Extraer claves y enviar al backend
            const p256dh = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(sub.getKey('p256dh')!))));
            const auth = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(sub.getKey('auth')!))));

            const payload = {
                endpoint: sub.endpoint,
                p256dh: p256dh,
                auth: auth
            };

            const AUTH_HEADERS = { headers: getAuthHeaders() };
            await pedidosApi.post(SUBSCRIPTION_API_URL, payload, AUTH_HEADERS);
            
            setSubscription(sub);
            console.log("Suscripción Push guardada en servidor.");

        } catch (error) {
            console.error("Error suscribiendo a Push:", error);
        }
    };

    return { subscribeToPush };
};

export default usePushNotification;