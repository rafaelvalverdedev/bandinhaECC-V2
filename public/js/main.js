// main.js
// ======================================================================
// Ponto de entrada da aplicação. Carrega (importa) os módulos necessários
// e inicializa a renderização quando o DOM estiver pronto.
// ======================================================================

/*
  Observações sobre imports:
  - Importamos render() explicitamente porque queremos chamá-lo.
  - Os módulos player.js e lyrics.js são importados apenas para que seus
    listeners e lógica sejam inicializados (eles registram event listeners
    no nível do módulo). Não precisamos dos seus exports aqui, por isso
    importamos sem vincular a variáveis.
*/
import { render } from './render.js';
import './player.js'; // inicializa listeners do player
import './lyrics.js';  // inicializa listeners do modal de letras

import { initNotifications, NotificationManager } from './notifications.js';

// Registra o Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('✅ Service Worker registrado:', registration.scope);
            return registration;
        } catch (error) {
            console.error('❌ Erro ao registrar Service Worker:', error);
            return null;
        }
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    // Renderiza a grade de músicas
    render();
    
    // Registra o Service Worker
    registerServiceWorker();
    
    // Inicializa sistema de notificações (mostra banner após 3s)
    initNotifications();
});

// ======================================================================
// EXEMPLO DE USO: Funções disponíveis globalmente para testes
// ======================================================================

// Disponibiliza o NotificationManager no console para testes
window.NotificationManager = NotificationManager;

// Exemplos que você pode testar no console do navegador:
// NotificationManager.send('Teste', { body: 'Esta é uma notificação de teste' });
// NotificationManager.notifyNewSong('Grande é o Senhor');
// NotificationManager.notifyUpcomingEvent('Culto da Família', 30);