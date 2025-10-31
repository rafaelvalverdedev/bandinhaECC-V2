// notifications.js
// ======================================================================
// Sistema de notificações Web Push API
// Solicita permissão e gerencia notificações do navegador
// ======================================================================

export const NotificationManager = {
    // Verifica se o navegador suporta notificações
    isSupported() {
        return 'Notification' in window && 'serviceWorker' in navigator;
    },

    // Retorna o status atual da permissão
    getPermissionStatus() {
        if (!this.isSupported()) return 'unsupported';
        return Notification.permission; // 'default', 'granted', 'denied'
    },

    // Solicita permissão ao usuário
    async requestPermission() {
        if (!this.isSupported()) {
            console.warn('Notificações não são suportadas neste navegador');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            console.warn('Usuário já negou permissão para notificações');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('✅ Permissão concedida!');
                this.savePermissionStatus(true);
                return true;
            } else {
                console.log('❌ Permissão negada');
                this.savePermissionStatus(false);
                return false;
            }
        } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            return false;
        }
    },

    // Salva status no localStorage
    savePermissionStatus(granted) {
        localStorage.setItem('notifications_permission', granted ? 'granted' : 'denied');
        localStorage.setItem('notifications_asked_at', new Date().toISOString());
    },

    // Verifica se já pediu permissão recentemente (evita pedir demais)
    shouldAskPermission() {
        const askedAt = localStorage.getItem('notifications_asked_at');
        if (!askedAt) return true;

        const daysSinceAsked = (Date.now() - new Date(askedAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceAsked > 7; // Só pede novamente após 7 dias
    },

    // Envia uma notificação simples
    async send(title, options = {}) {
        if (Notification.permission !== 'granted') {
            console.warn('Sem permissão para enviar notificações');
            return null;
        }

        const defaultOptions = {
            icon: '/icon-192.png', // Adicione um ícone ao seu projeto
            badge: '/badge-72.png',
            vibrate: [200, 100, 200],
            tag: 'musicas-app',
            requireInteraction: false,
            ...options
        };

        try {
            // Se houver Service Worker registrado, usa ele
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                return await registration.showNotification(title, defaultOptions);
            } else {
                // Fallback para notificação simples
                return new Notification(title, defaultOptions);
            }
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            return null;
        }
    },

    // Mostra banner de boas-vindas ao aceitar notificações
    async showWelcomeNotification() {
        await this.send('🎵 Notificações Ativadas!', {
            body: 'Você receberá atualizações sobre novas músicas e eventos.',
            icon: '/icon-192.png'
        });
    },

    // Exemplo: Notificar sobre nova música
    async notifyNewSong(songTitle) {
        await this.send('🎶 Nova Música Disponível!', {
            body: `"${songTitle}" foi adicionada à programação.`,
            icon: '/icon-192.png',
            data: { url: window.location.href }
        });
    },

    // Exemplo: Lembrete de evento
    async notifyUpcomingEvent(eventName, timeMinutes) {
        await this.send(`⏰ ${eventName} em ${timeMinutes} minutos`, {
            body: 'Clique para ver a programação completa',
            icon: '/icon-192.png',
            requireInteraction: true
        });
    }
};

// ======================================================================
// UI: Banner de solicitação de permissão
// ======================================================================

export function showNotificationBanner() {
    // Não mostra se já perguntou recentemente ou se não suporta
    if (!NotificationManager.isSupported() || !NotificationManager.shouldAskPermission()) {
        return;
    }

    // Não mostra se já tem permissão ou foi negada
    const status = NotificationManager.getPermissionStatus();
    if (status === 'granted' || status === 'denied') {
        return;
    }

    // Cria o banner
    const banner = document.createElement('div');
    banner.className = 'notification-banner';
    banner.innerHTML = `
        <div class="notification-banner__content">
            <div class="notification-banner__icon">🔔</div>
            <div class="notification-banner__text">
                <strong>Fique por dentro!</strong>
                <p>Receba notificações sobre novas músicas e eventos.</p>
            </div>
            <div class="notification-banner__actions">
                <button class="btn-allow">Permitir</button>
                <button class="btn-dismiss">Agora não</button>
            </div>
        </div>
    `;

    // Eventos dos botões
    const btnAllow = banner.querySelector('.btn-allow');
    const btnDismiss = banner.querySelector('.btn-dismiss');

    btnAllow.addEventListener('click', async () => {
        const granted = await NotificationManager.requestPermission();
        if (granted) {
            await NotificationManager.showWelcomeNotification();
        }
        banner.remove();
    });

    btnDismiss.addEventListener('click', () => {
        NotificationManager.savePermissionStatus(false);
        banner.remove();
    });

    // Adiciona ao body
    document.body.appendChild(banner);

    // Auto-remove após 15 segundos se não interagir
    setTimeout(() => {
        if (banner.parentElement) {
            banner.classList.add('fade-out');
            setTimeout(() => banner.remove(), 300);
        }
    }, 15000);
}

// ======================================================================
// Inicialização automática
// ======================================================================

// Aguarda 3 segundos após o carregamento da página para mostrar o banner
export function initNotifications() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(showNotificationBanner, 3000);
        });
    } else {
        setTimeout(showNotificationBanner, 3000);
    }
}