// service-worker.js
// ======================================================================
// Service Worker para notificações push
// Coloque este arquivo na RAIZ do seu projeto (mesmo nível do index.html)
// ======================================================================

const CACHE_NAME = 'musicas-app-v1';

// Evento de instalação
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    self.skipWaiting();
});

// Evento de ativação
self.addEventListener('activate', (event) => {
    console.log('Service Worker ativado');
    event.waitUntil(self.clients.claim());
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
    console.log('Notificação clicada:', event.notification.tag);
    
    event.notification.close();

    // Abre ou foca na aba da aplicação
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Se já houver uma aba aberta, foca nela
                for (let client of clientList) {
                    if (client.url.includes(self.registration.scope) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Caso contrário, abre uma nova aba
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// Fechar notificação
self.addEventListener('notificationclose', (event) => {
    console.log('Notificação fechada:', event.notification.tag);
});

// Push event (para quando implementar servidor push)
self.addEventListener('push', (event) => {
    console.log('Push recebido:', event);
    
    let data = { title: 'Nova Notificação', body: 'Você tem uma atualização!' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        data: data.data || {},
        tag: data.tag || 'notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});