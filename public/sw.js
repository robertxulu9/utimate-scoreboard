const CACHE_NAME = "ultimate-leaderboard-v1"
const urlsToCache = ["/", "/manifest.json", "/icon-192x192.jpg", "/icon-512x512.jpg"]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Background sync for game data
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync-game-data") {
    event.waitUntil(syncGameData())
  }
})

async function syncGameData() {
  // Sync game data when connection is restored
  try {
    const gameData = await getStoredGameData()
    if (gameData) {
      // Sync with server if needed
      console.log("Syncing game data:", gameData)
    }
  } catch (error) {
    console.error("Failed to sync game data:", error)
  }
}

async function getStoredGameData() {
  // Get game data from IndexedDB or localStorage
  return null // Placeholder for actual implementation
}
