/**
 * Service Worker - Europe Travel Guide v3.0
 * Strategy: Network First with Aggressive Cache Busting
 * Build: 2026-04-02-v3
 */

// ==================== 版本控制 ====================
const CACHE_VERSION = 'v3';
const BUILD_TIMESTAMP = '20260402-1830';
const CACHE_NAME = `travel-${CACHE_VERSION}-${BUILD_TIMESTAMP}`;
const STATIC_CACHE = `travel-static-${CACHE_VERSION}`;
const DATA_CACHE = `travel-data-${CACHE_VERSION}`;
const CDN_CACHE = `travel-cdn-${CACHE_VERSION}`;

// 核心檔案 - 離線必須可用
const CORE_ASSETS = [
    './',
    './index.html',
    './css/app.css',
    './js/app.js',
    './js/modules/db.js',
    './js/modules/gps.js',
    './js/modules/map.js',
    './js/modules/reminder.js',
    './js/modules/time.js',
    './js/modules/offline.js',
    './js/modules/ai-guide.js',
    './js/modules/i18n.js',
    './js/modules/profile.js',
    './js/modules/ai-router.js',
    './js/modules/planner.js',
    './js/modules/content-engine.js',
    './js/modules/cms-admin.js',
    './data/trip-info.js',
    './data/itinerary.js',
    './data/attractions.js'
];

// CDN 資源
const CDN_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600&display=swap',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// ==================== 安裝階段 ====================
self.addEventListener('install', event => {
    console.log('[SW] Installing v3...');
    
    // 立即啟用，不等待
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            console.log('[SW] Caching core assets...');
            return cache.addAll(CORE_ASSETS).catch(err => {
                console.error('[SW] Cache failed:', err);
            });
        })
    );
});

// ==================== 啟用階段 ====================
self.addEventListener('activate', event => {
    console.log('[SW] Activating v3...');
    
    // 清理所有舊快取
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // 刪除所有不包含當前版本的快取
                    if (!cacheName.includes(CACHE_VERSION)) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Claiming clients...');
            // 立即控制所有頁面
            return self.clients.claim();
        }).then(() => {
            // 通知所有客戶端已更新
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        version: CACHE_VERSION,
                        build: BUILD_TIMESTAMP
                    });
                });
            });
        })
    );
});

// ==================== 網路請求攔截 ====================
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 1. 導航請求 (HTML 頁面) - Network First
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request, { cache: 'no-cache' })
                .then(response => {
                    // 成功取得新版，更新快取
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then(cache => {
                        cache.put(request, clone);
                    });
                    return response;
                })
                .catch(() => {
                    // 離線時使用快取
                    console.log('[SW] Offline, serving cached page');
                    return caches.match(request).then(response => {
                        if (response) return response;
                        return caches.match('./index.html');
                    });
                })
        );
        return;
    }
    
    // 2. JS/CSS/JSON 檔案 - Network First with Cache Fallback
    if (url.pathname.match(/\.(js|css|json)$/)) {
        event.respondWith(
            fetch(request, { cache: 'no-cache' })
                .then(response => {
                    if (!response || response.status !== 200) {
                        throw new Error('Bad response');
                    }
                    // 更新快取
                    const clone = response.clone();
                    caches.open(DATA_CACHE).then(cache => {
                        cache.put(request, clone);
                    });
                    return response;
                })
                .catch(() => {
                    // 網路失敗，使用快取
                    return caches.match(request).then(response => {
                        if (response) {
                            console.log('[SW] Serving cached:', url.pathname);
                            return response;
                        }
                        // 完全沒有快取
                        return new Response('/* Offline - No cached version */', {
                            headers: { 'Content-Type': 'application/javascript' }
                        });
                    });
                })
        );
        return;
    }
    
    // 3. CDN 資源 (Leaflet, 字體) - Cache First
    if (url.hostname.includes('unpkg.com') || url.hostname.includes('googleapis.com')) {
        event.respondWith(
            caches.match(request).then(response => {
                if (response) return response;
                
                return fetch(request).then(response => {
                    if (!response || response.status !== 200) return response;
                    
                    const clone = response.clone();
                    caches.open(CDN_CACHE).then(cache => {
                        cache.put(request, clone);
                    });
                    return response;
                });
            })
        );
        return;
    }
    
    // 4. 圖片 - Cache First
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request).then(response => {
                if (response) return response;
                return fetch(request).then(response => {
                    if (!response || response.status !== 200) return response;
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
    
    // 5. 其他請求 - Network First
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});

// ==================== 背景同步 ====================
self.addEventListener('sync', event => {
    console.log('[SW] Background sync:', event.tag);
    if (event.tag === 'sync-data') {
        event.waitUntil(syncAllData());
    }
});

async function syncAllData() {
    console.log('[SW] Syncing all data...');
}

// ==================== 推送通知 ====================
self.addEventListener('push', event => {
    const data = event.data?.json() || {};
    
    const options = {
        body: data.body || 'Europe Travel 通知',
        icon: './icons/icon-192x192.png',
        badge: './icons/badge-72x72.png',
        tag: data.tag || 'default',
        requireInteraction: false,
        data: data.data || {}
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'TravelMind AI', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            if (clientList.length > 0) {
                const client = clientList[0];
                client.focus();
                client.postMessage({
                    type: 'NOTIFICATION_CLICK',
                    data: event.notification.data
                });
            } else {
                clients.openWindow('./');
            }
        })
    );
});

// ==================== 訊息處理 ====================
self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_VERSION,
            build: BUILD_TIMESTAMP
        });
    }
    
    if (event.data === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(name => caches.delete(name)));
        }).then(() => {
            event.ports[0].postMessage({ cleared: true });
        });
    }
});
