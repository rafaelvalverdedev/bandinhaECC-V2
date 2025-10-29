// player.js
// ======================================================================
// Controla o player de áudio e o modal do player.
// Este arquivo NÃO manipula a renderização da grade; apenas controla
// o comportamento do modal, do elemento <audio> e das classes "playing".
// ======================================================================

/*
  Importações:
  - resolveUrl: utilitário para garantir que a URL do áudio esteja correta.
  - rowById, state: objetos compartilhados para manipular classes no DOM e guardar track atual.
*/
import { resolveUrl } from './utils.js';
import { rowById, state } from './state.js';

/*
  Elementos DOM que o player manipula.
  - modal: backdrop/modal que envolve o player.
  - audio: elemento <audio> que reproduz as faixas.
  - btnClose: botão de fechar o modal.
  - trackTitle / trackMeta: onde mostramos título e meta-info.
  - letraModal: usado para esconder o modal de letra quando abrimos o player.
*/
const modal = document.getElementById("modal");
const audio = document.getElementById("audio");
const btnClose = document.getElementById("btnClose");
const trackTitle = document.getElementById("trackTitle");
const trackMeta = document.getElementById("trackMeta");
const letraModal = document.getElementById("letra-modal");

/**
 * openModal(track)
 *
 * Recebe um objeto 'track' (representando a música) e:
 * - atualiza o state.currentTrack
 * - preenche informações visuais (título, meta)
 * - seta a src do <audio> e tenta reproduzir
 * - adiciona a classe "playing" na linha correspondente
 */
export function openModal(track) {
    // Guardamos a referência da faixa no estado global
    state.currentTrack = track;

    // Atualiza o título do modal
    trackTitle.textContent = track.title;

    // Montamos um array com metadados (horário, tom, página)
    const meta = [];
    if (track.time) meta.push(`Horário: ${track.time}`);
    if (track.tone) meta.push(`Tom: ${track.tone}`);
    // Se não houver url, mostramos uma mensagem de que não há áudio
    if (track.page) meta.push(`Pág: ${track.page} ${track.url ? '' : '— Música ainda sem áudio —'}`);
    trackMeta.textContent = meta.join(" · ");

    // Ajustamos a fonte do áudio (garantir URL absoluta)
    audio.src = resolveUrl(track.url);

    // Tornamos o modal visível removendo a classe que o esconde
    modal.classList.remove("hidden");

    // Evitamos a rolagem do body enquanto o modal estiver aberto
    document.body.style.overflow = "hidden";

    // Pedimos para o elemento de áudio tocar.
    // audio.play() retorna uma Promise; tratamos com .then para reagir à reprodução iniciada.
    audio.play().then(() => {
        // Se houver uma linha associada a essa track no mapa, adicionamos a classe "playing".
        // O operador ? (optional chaining) protege caso não exista.
        rowById.get(track.id)?.classList.add("playing");
    }).catch((err) => {
        // Erros aqui podem ocorrer por políticas do navegador (ex: reprodução automática)
        // Apenas logamos para depuração — idealmente mostrar algo ao usuário.
        console.warn("Falha ao iniciar reprodução:", err);
    });

    // Sempre escondemos o modal de letra quando abrimos o player.
    // (Se a letra estiver aberta, ela foi construída para ser um modal separado.)
    if (letraModal) letraModal.classList.add("hidden");
}

/**
 * closeModal()
 *
 * Para a reprodução, reseta o tempo do áudio e fecha o modal.
 * Também remove a classe "playing" de todas as linhas.
 */
export function closeModal() {
    // Pausamos o áudio
    audio.pause();

    // Reseta o tempo para o início
    audio.currentTime = 0;

    // Esconde o modal
    modal.classList.add("hidden");

    // Restaura rolagem do body
    document.body.style.overflow = "";

    // Remove a classe "playing" de todas as linhas no mapa
    rowById.forEach(el => el.classList.remove("playing"));

    // Limpa a referência do track atual no state
    state.currentTrack = null;
}

/*
  Event listeners associados ao modal e ao áudio.
  - btnClose: fecha quando o usuário clica no botão.
  - modal click: fecha quando clica no backdrop (fora do conteúdo).
  - keydown (Escape): fecha via teclado.
  - audio events: ajustam classes quando play/ended ocorrem.
*/

// Quando o botão de fechar for clicado, chamamos closeModal.
btnClose.addEventListener("click", closeModal);

// Se o usuário clicar no backdrop (elemento modal), fechamos.
// Observação: o modal pode conter filhos; queremos somente fechar quando o alvo do clique for exatamente o backdrop.
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// Fechar com Escape — apenas se o modal estiver visível
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
});

// Quando o áudio começar a tocar, garantimos que a linha da faixa receba a classe "playing".
audio.addEventListener("play", () => {
    const track = state.currentTrack;
    if (track) rowById.get(track.id)?.classList.add("playing");
});

// Quando o áudio terminar (evento 'ended'), removemos a classe "playing".
audio.addEventListener("ended", () => {
    rowById.forEach(el => el.classList.remove("playing"));
});
