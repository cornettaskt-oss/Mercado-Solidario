const CACHE_NAME = 'mercsolidario-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './admin.html',
    './styles.css',
    './app.js',
    './admin.js',
    './manifest.json',
    './lion_lamb.png',
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching all assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Only intercept basic get requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Se não estiver no cache, pega da rede.
                return fetch(event.request).catch(() => {
                    // Fallback para index.html se falhar ao tentar pegar uma página (offline behavior)
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
