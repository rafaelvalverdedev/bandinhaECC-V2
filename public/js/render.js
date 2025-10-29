// render.js
// ======================================================================
// Responsável por construir (renderizar) a grade de colunas e linhas
// com músicas e seções. Este módulo NÃO deve controlar o player diretamente,
// apenas dispara a ação de "abrir modal" (openModal) quando o ícone for clicado.
// ======================================================================

/*
  Importações:
  - rowById: mapa compartilhado para armazenar referências às linhas criadas no DOM.
  - openModal: função do player que abre o modal e inicia a reprodução.
*/
import { rowById } from './state.js';
import { openModal } from './player.js'; // usamos import apenas para chamar a função

/**
 * render()
 * Função principal do módulo: cria o HTML dentro do #grid com base na variável global COLUMNS.
 *
 * Observação:
 * - Este exemplo assume que as variáveis globais "COLUMNS" estão disponíveis (vindas de musicas.js).
 * - Toda manipulação do DOM acontece aqui: criação de elementos, classes, atributos, listeners.
 */
export function render() {
    // Obtemos o elemento que vai conter todo o grid (div com id="grid").
    const gridEl = document.getElementById("grid");

    // Limpamos o conteúdo atual (útil para re-render).
    gridEl.innerHTML = "";

    // Percorremos cada coluna (ex: dia / bloco).
    // COLUMNS é um array com objetos: { title: 'Sexta', items: [...] }
    COLUMNS.forEach((col) => {
        // Criamos a section que representa a coluna inteira.
        const colEl = document.createElement("section");
        colEl.className = "column";

        // Cabeçalho da coluna (nome do dia/seção)
        const head = document.createElement("div");
        head.className = "col-header";
        head.textContent = col.title; // texto do cabeçalho
        colEl.appendChild(head);

        // Percorremos os itens da coluna (pode ser 'section', 'note' ou 'music')
        col.items.forEach((it) => {
            // 1) Se for 'section' (ex: "PÁTIO", "PLENÁRIO") => renderizamos uma linha diferente
            if (it.type === "section") {
                const s = document.createElement("div");
                s.className = "section-row";
                // Usamos innerHTML para montar colunas internas (mais simples para layout).
                s.innerHTML = `
                    <div class="cell time">${it.time || ""}</div>
                    <div class="cell title">${it.label}</div>
                    <div class="cell right">${it.duration || ""}</div>
                    <div class="cell right">${it.pagHead}</div>
                `;
                colEl.appendChild(s);
                return; // passa para o próximo item
            }

            // 2) Se for 'note' => linha com estilo de nota
            if (it.type === "note") {
                const n = document.createElement("div");
                n.className = "note-row";
                n.innerHTML = `<div class="cell title-note">${it.label}</div>`;
                colEl.appendChild(n);
                return;
            }

            // 3) Caso contrário, tratamos como música
            const r = document.createElement("div");
            r.className = "row";
            // Atribuímos data-id para poder identificar depois (data-* é bom para dados no DOM)
            r.setAttribute("data-id", it.id);
            // Se não houver url, adicionamos a classe 'no-url' para estilizar diferente
            if (!it.url) r.classList.add("no-url");

            // Ícone de play — aqui colocamos SVG inline
            // Observe que estamos usando template literals para facilitar a leitura.
            const playIcon = `
                <span class="play-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21
                            21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM5 1C2.79086 1 1 2.79086 1
                            5V19C1 21.2091 2.79086 23 5 23H19C21.2091 23 23 21.2091 23
                            19V5C23 2.79086 21.2091 1 19 1H5Z"
                            fill="currentColor"/>
                        <path d="M16 12L10 16.3301V7.66987L16 12Z" fill="currentColor" />
                    </svg>
                </span>`;

            // Montamos o conteúdo do título. Se a música tiver "lyrics" mostramos a linha menor.
            const titleContent = it.lyrics
                ? `<div class="title-main">${it.title}</div>
                   <div class="title-lyrics">${it.lyrics}</div>`
                : `<div class="title-main">${it.title}</div>`;

            // Construímos o HTML da linha principal
            r.innerHTML = `
                <div class="cell time">${it.time}</div>
                <div class="cell titleContent">${playIcon} <span class="title-text">${titleContent}</span></div>
                <div class="cell right">${it.tone}</div>
                <div class="cell right">${it.page ?? ""}</div>
            `;

            // === 🔹 EVENTO DE CLIQUE NO DIV (linha inteira) ===
            // Ao clicar na linha, abre o modal de reprodução
            r.addEventListener("click", () => {
                // Chama a função que abre o player
                openModal(it);
            });

            // Guardamos a referência do elemento no mapa compartilhado rowById,
            // assim outros módulos podem encontrar a linha correspondente.
            rowById.set(it.id, r);

            // Inserimos a linha na coluna
            colEl.appendChild(r);
        });

        // No final, adicionamos a coluna inteira ao grid
        gridEl.appendChild(colEl);
    });
}
