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

// Quando o DOM estiver carregado chamamos render() para montar a grade.
document.addEventListener("DOMContentLoaded", render);
