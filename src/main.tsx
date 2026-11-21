import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Register lightweight offline Service Worker in web browsers (skipped inside native Capacitor APK)
if (
  'serviceWorker' in navigator &&
  window.location.protocol !== 'capacitor:' &&
  window.location.protocol !== 'file:' &&
  !(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
