const CACHE_NAME = 'cello-practice-v2';
const SAMPLE_FILES = [
  '1도','1레','1미','1파','1솔','1라','1시',
  '2도','2레','2미','2파','2솔','2라','2시',
  '3도','3레','3미','3파','3솔'
].map(n => './audio/trimmed/' + encodeURIComponent(n) + '.mp3');
const ASSETS = ['./index.html', './manifest.json', ...SAMPLE_FILES];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
