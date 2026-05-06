const CACHE_NAME = 'cineverse-v9-final';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => caches.delete(key))
            );
        }).then(() => {
            console.log('🎬 CineVerse: Service Worker retired and Cache cleared.');
            return self.registration.unregister();
        })
    );
});

// Always go to network to avoid stale code
self.addEventListener('fetch', (event) => {
    return;
});
