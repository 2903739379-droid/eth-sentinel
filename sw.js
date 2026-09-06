const CACHE='eth-sentinel-v1';
const CORE=['./','./index.html','./sw.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;if(r.mode==='navigate'){e.respondWith(caches.match('./index.html').then(cached=>{const net=fetch(r).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put('./index.html',res.clone()));return res}).catch(()=>cached);return cached||net}))}else if(new URL(r.url).origin===location.origin){e.respondWith(caches.match(r).then(c=>c||fetch(r)))}});