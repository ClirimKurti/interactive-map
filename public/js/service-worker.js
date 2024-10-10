const CACHE_NAME = 'interactive-map-v1';
const urlsToCache = [       
    '/',
    '/wp-content/plugins/interactive-map/public/css/style.css',
    '/wp-content/plugins/interactive-map/public/js/map-display.js',
    'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js',
    // Add more static assets or pages you want to cache
];

// Install event - caching the application shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serving cached assets if available, else fetching from the network
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('tile.openstreetmap.org')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    return response || fetch(event.request).then((fetchResponse) => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                });
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then((response) => response || fetch(event.request))
        );
    }
});

// Activate event - removing old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});