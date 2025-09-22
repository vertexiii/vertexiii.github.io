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

const CACHE = 'VERTEX_CACHE';

// precache index page
const PRECACHE_URLS = [
    '/',
    '/index.html'
];
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

// adds listener to all network requests
self.addEventListener('fetch', event => {
    if (event.request.url.includes('content.jsonc')) {
        event.respondWith(fetch(event.request)); // always fetch fresh content.jsonc
        return;
    } else {
        event.respondWith((async () => {
            const cache = await caches.open(CACHE);
            const cachedResponse = await cache.match(event.request);

            try {
                const networkResponse = await fetch(event.request);
                const serverContent = await networkResponse.clone().text();
                const cachedContent = cachedResponse ? await cachedResponse.text() : null;

                // update cache if response differs from cached version
                if (!cachedResponse || serverContent !== cachedContent) {
                    await cache.put(event.request, networkResponse.clone());
                    console.log('Cache updated for:', event.request.url);
                }

                return networkResponse;
            } catch {
                // network failed → serve cached response if available
                if (cachedResponse) return cachedResponse;
            }
        })());
    }
});
