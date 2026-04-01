/**
 * Service Worker - Europe Travel Guide
 * Strategy: Cache First (Offline Priority)
 * Version: 2.0
 */

const CACHE_NAME = 'europe-travel-v2';
const STATIC_CACHE = 'europe-static-v2';
const DATA_CACHE = 'europe-data-v2';

// 核心檔案 - 離線必須可用
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/css/app.css',
    '/js/app.js',
    '/js/modules/db.js',
    '/js/modules/gps.js',
    '/js/modules/map.js',
    '/js/modules/reminder.js',
    '/js/modules/time.js',
    '/js/modules/offline.js',
    '/data/trip-info.js',
    '/data/itinerary.js',
    '/data/attractions.js'
];

// CDN 資源
const CDN_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600&display=swap',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// ==================== INSTALL ====================
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    
    event.waitUntil(
        Promise.all([
            // 快取核心檔案
            caches.open(STATIC_CACHE).then(cache => {
                console.log('[SW] Caching core assets');
                return cache.addAll(CORE_ASSETS);
            }),
            // 快取 CDN 資源
            caches.open(DATA_CACHE).then(cache => {
                console.log('[SW] Caching CDN assets');
                return cache.addAll(CDN_ASSETS).catch(err => {
                    console.warn('[SW] Some CDN assets failed:', err);
                });
            })
        ]).then(() => {
            console.log('[SW] Install complete');
            return self.skipWaiting();
        })
    );
});

// ==================== ACTIVATE ====================
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => !name.includes('v2'))
                    .map(name => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            console.log('[SW] Activate complete');
            return self.clients.claim();
        })
    );
});

// ==================== FETCH ====================
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 1. 導航請求 (HTML) - Network First with Cache Fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // 更新快取
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then(cache => {
                        cache.put(request, clone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then(response => {
                        if (response) return response;
                        // 離線 fallback
                        return caches.match('/index.html');
                    });
                })
        );
        return;
    }
    
    // 2. API / 資料請求 - Cache First
    if (url.pathname.includes('/data/') || url.pathname.includes('.js')) {
        event.respondWith(
            caches.match(request).then(response => {
                if (response) {
                    // 背景更新
                    fetch(request).then(newResponse => {
                        caches.open(DATA_CACHE).then(cache => {
                            cache.put(request, newResponse.clone());
                        });
                    }).catch(() => {});
                    return response;
                }
                
                return fetch(request).then(response => {
                    const clone = response.clone();
                    caches.open(DATA_CACHE).then(cache => {
                        cache.put(request, clone);
                    });
                    return response;
                });
            })
        );
        return;
    }
    
    // 3. 靜態資源 (CSS, 字體, 圖片) - Cache First
    if (request.destination === 'style' || 
        request.destination === 'font' || 
        request.destination === 'image' ||
        url.pathname.includes('.css') ||
        url.pathname.includes('.js')) {
        
        event.respondWith(
            caches.match(request).then(response => {
                if (response) return response;
                
                return fetch(request).then(response => {
                    // 只快取成功的請求
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then(cache => {
                        cache.put(request, clone);
                    });
                    return response;
                });
            })
        );
        return;
    }
    
    // 4. 其他請求 - Network First
    event.respondWith(
        fetch(request).catch(() => {
            return caches.match(request);
        })
    );
});

// ==================== BACKGROUND SYNC ====================
self.addEventListener('sync', event => {
    if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
    }
    if (event.tag === 'sync-reminders') {
        event.waitUntil(syncReminders());
    }
});

async function syncFavorites() {
    // 未來可實作與 Supabase 同步
    console.log('[SW] Syncing favorites...');
}

async function syncReminders() {
    console.log('[SW] Syncing reminders...');
}

// ==================== PUSH NOTIFICATIONS ====================
self.addEventListener('push', event => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: data.tag || 'default',
        requireInteraction: data.requireInteraction || false,
        data: data.data || {}
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    const data = event.notification.data;
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            if (clientList.length > 0) {
                const client = clientList[0];
                client.focus();
                client.postMessage({
                    type: 'NOTIFICATION_CLICK',
                    data: data
                });
            } else {
                clients.openWindow('/');
            }
        })
    );
});

// ==================== MESSAGE HANDLING ====================
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
