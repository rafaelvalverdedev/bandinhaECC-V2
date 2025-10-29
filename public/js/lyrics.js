// lyrics.js
// ======================================================================
// Controla o modal de letras. Busca a letra no array global LETRAS (presumido
// vindo do arquivo letras-musicas.js) e a mostra ao usuário.
// ======================================================================

/*
  Importamos o objeto state para acessar a faixa atual (state.currentTrack).
  Não importamos funções do player para evitar dependências desnecessárias.
*/
import { state } from './state.js';

// Elementos DOM usados pelo modal de letra
const btnLetra = document.getElementById("btn-letra");
const letraModal = document.getElementById("letra-modal");
const btnCloseLetra = document.getElementById("btn-close-letra");
const letraTitle = document.getElementById("letra-title");
const letraText = document.getElementById("letra-text");

/**
 * getLetraPorNumeroETitulo(pagina, titulo)
 *
 * Procura dentro da estrutura LETRAS (array de grupos) a música que
 * corresponda à página e ao título (case-insensitive).
 *
 * Observação: o formato esperado de LETRAS é:
 * [
 *   { grupo: "Algum Grupo", cancões: [ { pagina: 12, titulo: "Nome", letra: ["linha1", "linha2"] }, ... ] },
 *   ...
 * ]
 *
 * Retorna o objeto da música ou null se não encontrar.
 */
function getLetraPorNumeroETitulo(pagina, titulo) {
    // Normalizamos o título para lowercase e sem espaços extras
    const tituloNormalizado = titulo.trim().toLowerCase();

    // Percorremos cada grupo (caso exista)
    for (const grupo of LETRAS) {
        // Procuramos uma música no array grupo.cancoes que satisfaça as condições
        const musica = grupo.cancoes.find(c =>
            c.pagina === pagina &&
            c.titulo.trim().toLowerCase() === tituloNormalizado
        );
        if (musica) return musica; // retornamos quando encontrar
    }
    return null; // se chegar até aqui, não encontrou
}

/**
 * Ao clicar em "Ver Letra":
 * - verificamos se existe uma faixa selecionada (state.currentTrack)
 * - se existir, buscamos a letra e mostramos no modal
 */
btnLetra.addEventListener("click", () => {
    // Se não houver faixa selecionada, nada a fazer.
    if (!state.currentTrack) return;

    // Pegamos a página e título da faixa atual
    const pagina = state.currentTrack.page;
    const titulo = state.currentTrack.title;

    // Buscamos a música correspondente
    const musica = getLetraPorNumeroETitulo(pagina, titulo);

    if (musica) {
        // Se encontrou, preenchermos o título e o conteúdo (juntamos o array de linhas)
        letraTitle.textContent = musica.titulo;
        // musica.letra é um array de strings; usamos join("\n") para preservar quebras de linha
        letraText.textContent = musica.letra.join("\n");
    } else {
        // Caso não encontre, mostramos mensagem amigável
        letraTitle.textContent = "Letra não encontrada";
        letraText.textContent = "";
    }

    // Exibimos o modal e evitamos scroll no body
    letraModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Garantimos que o modal esteja rolado para o topo
    letraModal.scrollTop = 0;
    letraText.scrollTop = 0;
});

// Botão para fechar o modal de letra
btnCloseLetra.addEventListener("click", () => {
    letraModal.classList.add("hidden");
    document.body.style.overflow = "";
});
