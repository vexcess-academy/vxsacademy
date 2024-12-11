importScripts("./sync-message.js");

const fetchListener = syncMessage.serviceWorkerFetchListener();

addEventListener("fetch", e => {
    if (fetchListener(e)) {
        return;
    }
    e.respondWith(fetch(e.request));
});

addEventListener("install", e => {
    e.waitUntil(self.skipWaiting());
});

addEventListener("activate", e => {
    e.waitUntil(self.clients.claim());
});