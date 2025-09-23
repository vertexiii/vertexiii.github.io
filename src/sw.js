/*
    Custom caching util

    Page requests resource 
        ↓ 
    Check cache → if exists, use it immediately 
        ↓ 
    Fetch from Server (async) 
        ↓ 
    Compare server response to the cached response
        ↓ 
    If different → update cache

    Also supports offline mode
*/

const CACHE_NAME = 'VERTEX_CACHE';

// precache index page
const PRECACHE_URLS = [
    '/',
    '/index.html'
];
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(CACHE => CACHE.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

// cleanup old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// adds listener to all network requests
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (url.pathname.endsWith('content.jsonc')) {
        event.respondWith(fetch(event.request)); // always fetch fresh content.jsonc
        return;
    } else if (PRECACHE_URLS.includes(url.pathname)) {
        // cache first for precached URLs
        event.respondWith(
            caches.match(event.request).then(cached => cached || fetch(event.request))
        );
        return;
    } else {
        // network first for everything else
        event.respondWith((async () => {
            try {
                const NETWORK_RESPONSE = await fetch(event.request);
                const CACHE = await caches.open(CACHE_NAME);
                CACHE.put(event.request, NETWORK_RESPONSE.clone());
                return NETWORK_RESPONSE;
            } catch {
                return caches.match(event.request); // fallback if offline
            }
        })());
    }
});
