// Punto di ingresso: stili e interfaccia.
import './styles/main.css';
import './styles/libro.css';
import './ui/app.js';

// app installabile e utilizzabile senza rete (solo nella versione pubblicata)
if (import.meta.env.PROD && 'serviceWorker' in navigator && window.isSecureContext) {
  addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
}
