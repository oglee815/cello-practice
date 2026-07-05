const CACHE_NAME = 'cello-practice-v5';
const SAMPLE_FILES = [
  '1도','1레','1미','1파','1솔','1라','1시',
  '2도','2레','2미','2파','2솔','2라','2시',
  '3도','3레','3미','3파','3솔'
].map(n => './audio/trimmed/' + encodeURIComponent(n) + '.mp3');
const ASSETS = ['./', './index.html', './manifest.json', ...SAMPLE_FILES];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // HTML/내비게이션은 네트워크 우선 (실패 시 캐시)
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  // 그 외(오디오, manifest 등)는 캐시 우선
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy));
      return res;
    }))
  );
});
