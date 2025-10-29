// state.js
// ======================================================================
// Este arquivo guarda o estado compartilhado entre módulos.
// Em vez de exportar variáveis simples (que poderiam causar problemas
// em importações circulares), exportamos objetos mutáveis.
// ======================================================================

/**
 * rowById
 *
 * Mapa que associa o id da música (string/number) ao elemento DOM da linha.
 * - render.js preenche esse mapa quando cria as linhas na grade.
 * - player.js usa este mapa para adicionar/remover classes (por exemplo, "playing").
 */
export const rowById = new Map();

/**
 * state
 *
 * Objeto que guarda o track atual e outros estados globais eventualmente.
 * Usamos um objeto para que diferentes módulos possam ler e escrever
 * a propriedade 'currentTrack' e a referência seja a mesma entre módulos.
 */
export const state = {
    currentTrack: null // será preenchido com o objeto da faixa quando o usuário abrir o modal
};
