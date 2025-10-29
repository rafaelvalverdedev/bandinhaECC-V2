// utils.js
// ======================================================================
// Este arquivo guarda funções auxiliares (chamadas "utils").
// Elas podem ser usadas em vários lugares do projeto.
// ======================================================================

/**
 * A função resolveUrl() serve para garantir que o caminho do arquivo de áudio
 * (ou qualquer outro recurso) seja sempre uma URL válida e completa.
 * 
 * Por exemplo:
 * - Se o caminho for "audios/musica1.mp3", ela transforma em "http://seusite.com/audios/musica1.mp3"
 * - Se o caminho já for "https://", ela apenas retorna o mesmo valor.
 * 
 * Isso evita erros quando o navegador tenta encontrar o arquivo.
 */
export function resolveUrl(url) {
    // Se o parâmetro 'url' estiver vazio (undefined ou null),
    // ou já começar com "http://" ou "https://", não precisa alterar nada.
    if (!url || /^https?:\/\//i.test(url)) return url;

    // Caso contrário, criamos uma nova URL absoluta baseada na página atual.
    // O replace(/^\/+/, "") serve para remover possíveis barras extras no início (ex: "//musica.mp3")
    return new URL(url.replace(/^\/+/, ""), window.location.href).toString();
}
