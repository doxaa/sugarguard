/* SugarGuard service worker — caches the app shell for offline/installable PWA.
   Network-first for API calls so subscription status is always fresh. */
const CACHE = 'sugarguard-v1';
const SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/config.js',
  './js/app-core.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(()=>{})));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // never cache Paystack or our functions — always go to network
  if (url.pathname.includes('/.netlify/functions') || url.host.includes('paystack')) {
    return; // let the browser handle it normally
  }
  // cache-first for the app shell, fall back to network
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
