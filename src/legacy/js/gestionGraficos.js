/**
 * @module  gestionGraficos
 * @fileoverview Módulo para la gestion de los gráficos generados.
 * @version      Solidar.3
 * @author       José Luis García (SOM Madrid)
 * @copyright
 * 
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
*/
import TCB from "./TCB.js";

function gestionGraficos( accion) {
    switch (accion) {
      case "Inicializa":
        inicializaEventos();
        break;
      case "Valida":
        return valida();
      case "Prepara":
        return prepara();

    }
  }

function inicializaEventos() {

}

function valida() {
    return true;
}

function prepara() {
    TCB.graficos.gestionGraficos_ConsumosVersusGeneracion("graf_1");
    TCB.graficos.gestionGraficos_BalanceEnergia("graf_2", "graf_3");
    return true;
}
export {gestionGraficos}