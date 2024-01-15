/**
 * @module  gestionResultados
 * @fileoverview Módulo para la gestion del balance de energia
 * @version      Solidar.3
 * @author       José Luis García (SOM Madrid)
 * @copyright
 * 
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
*/
import {optimizador} from "./optimizador.js";
import TCB from "./TCB.js";
import Consumo from "./Consumo.js";

import Balance from "./Balance.js";
import { calculaResultados } from "./calculaResultados.js";
import * as UTIL from "./Utiles.js";
import * as Idioma from "./Idioma.js";
import BaseSolar from "./BaseSolar.js";

/*global Tabulator, INDIVIDUAL*/


/** Es la función llamada desde el Wizard para la gestion de la ventana de balance de energía
 * 
 * @param {*} accion [Inicializa, Valida, Prepara, Importa, Exporta]
 * @param {*} datos En el caso de importacion los datos a importar
 * @returns {boolean} true si todo ha ido bien false si algo ha fallado
 */ 
async function gestionResultados( accion, datos) {
    let status;
    UTIL.debugLog("gestionResultados: " + accion);
    switch (accion) {
    case "Inicializa":
        status = inicializaEventos();
        break;
    case "Valida":
        status = valida();
        break;
    case "Prepara":
        status = await prepara();
        break;
    case "Importa":
        status = importa(datos);
        break;
    case "Exporta":
        status = exporta();
        break;
    }
    return status;
}

/**
 * Inicializa los eventos del módulo de gestionResultados
 */
function inicializaEventos() {

  muestraTablas();

}

/**
 * 
 * @param {JSON} datosImportar Es el objeto creado en gestionProyecto al leer el fichero solimp
 */
function importa(datosImportar) {

  TCB.consumo = new Consumo();
  TCB.consumoCreado = true;  
  
  UTIL.debugLog("Genera balance a partir de los datos importados");
  TCB.balance = new Balance(TCB.produccion, TCB.consumo, 100); //datosImportar.balance;
  TCB.balanceCreado = true;

}
/**
 * exporta los datos generados en este módulo
 */
function exporta() {

  TCB.datosProyecto.produccion = TCB.produccion;

}

/**
 * Función que se ejecuta antes de activar el panel de resultados
 * @returns {boolean} true si todo ha ido bien false si algo ha fallado
 */
async function prepara() {

  //desabilitamos la posibilidad de dar al boton siguiente mientras estamos preparando los resultados
  let cursorOriginal = document.body.style.cursor;
  document.body.style.cursor = "progress";
  document.getElementById('botonSiguiente').disabled = true;

    //Si ha habido algún cambio que requiera la ejecución del optimizador lo ejecutamos
    if (TCB.requiereOptimizador) {
  
      // Comprobamos que estan cargados todos los rendimientos. Es el flag rendimientoCreado de cada BaseSolar
      let waitLoop = 0;
      for (let base  of TCB.BaseSolar) {
        var sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
        if (!base.rendimientoCreado) {
          TCB._tablaBasesAsignadas.alert("Esperando datos PVGIS para base: " + base.nombreBaseSolar);
          if (TCB.importando) {
            //document.getElementById('importar').innerHTML = TCB.i18next.t("importarProyecto_MSG_importando");
          } else {
            document.getElementById('resultadosResumen').innerHTML = "Esperando PVGIS para base " + base.idBaseSolar;
          }

          while (!base.rendimientoCreado && waitLoop++ < TCB.tiempoEsperaPVGIS && base.rendimientoCreado !== "error") {
            document.getElementById('resultadosResumen').innerHTML = waitLoop + " seg. (max: " + TCB.tiempoEsperaPVGIS + ")";
            await sleep (1000);
          }
          if (base.rendimientoCreado === "error") {
            alert ("Error obteniendo datos de PVGIS");
            base.rendimientoCreado = false;
            document.getElementById('resultadosResumen').innerHTML = " ";
            TCB._tablaBasesAsignadas.clearAlert();
            return;
          }
          if (waitLoop >= TCB.tiempoEsperaPVGIS) {
            alert ("Tiempo de respuesta excesivo en la llamada a PVGIS");
            document.getElementById('resultadosResumen').innerHTML = " ";
            TCB._tablaBasesAsignadas.clearAlert();
            return;
          }
          document.getElementById('resultadosResumen').innerHTML = " ";
          TCB._tablaBasesAsignadas.clearAlert();
        }
      }
    
      // Se crea el objeto de consumo global de toda la configuración en caso de importación o si ha cambiado algo que requiere optimizador
      if (TCB.consumoCreado) {
        TCB.consumo = {};
        TCB.consumoCreado = false;
      }
      TCB.consumo = new Consumo();
      TCB.consumoCreado = true;  

      // Se ejecuta el optimizador para determinar la configuración inicial propuesta
      let pendiente = await optimizador (TCB.BaseSolar, TCB.consumo,  TCB.parametros.potenciaPanelInicio);
      if (pendiente > 0) {
        alert ("No es posible instalar los paneles necesarios.\nPendiente: "+
                UTIL.formatoValor("energia", pendiente)+ "\nContinuamos con el máximo número de paneles posible");
      }

      // Se realiza el cálculo de todas las variables de energia del sistema
      await calculaResultados();
      TCB.requiereOptimizador = false;
    }

    //Cada base ha sido asignada por el optimizador con el número de paneles óptimo o si es una importación con los paneles que se hubieran salvado en la simulacion previa. Mostramos esta asignación en la tabla
    TCB._tablaBasesAsignadas.clearData();
    for (let base of TCB.BaseSolar) {
      TCB._tablaBasesAsignadas.updateOrAddData([BaseSolar.getTabulatorRow("idBaseSolar", base.idBaseSolar)]);
    }
  
    // Se muestran en pantalla los resultados
    let status;
    if (TCB.balanceCreado) {
      muestraBalanceEnergia();
      muestraGraficos();
      status = true;
    } else {
      status = false;
    }

  //Volvemos a habilitar la secuencia del wizard
  document.getElementById('botonSiguiente').disabled = false;
  document.body.style.cursor = cursorOriginal;
  return status;

}

/**
 * La funcion que permite pasar al wizard al siguiente paso. En esta caso no hay nada que validar
 * @returns {boolean} Siempre true
 */
async function valida() {

  return true;
}
/**
 * Muestra la tabla de basesAsignadas
 */
function muestraTablas() {

  var infoIcon = function(){ return "<i class='fa fa-info-circle'></i>" };

  const divBasesAsignadas = document.getElementById("BasesAsignadas");
  TCB._tablaBasesAsignadas = TCB._tablaBasesAsignadas ?? new Tabulator( divBasesAsignadas, {
    columnDefaults: {headerTooltip: (e, col) => UTIL.hdrToolTip(e, col)},
    layout:"fitColumns", 
    index: "idBaseSolar", 
    columns:[
      {title: "Nombre", field:"nombreBaseSolar", hozAlign:"left"},
      {title: "KwH anual por kWp instalado", field: "unitarioTotal", hozAlign:"right", 
      formatter: "_formatoValor"},
      {title: "Max. kWp a instalar", field:"potenciaMaxima", hozAlign:"right", formatter: "_formatoValor"},
      {title: "Paneles", field:"paneles", hozAlign:"right", editor:"number",
        formatter: "_formatoValor", cellEdited: (cell) => nuevaInstalacion(cell),
        validator:["numeric", "min:0"]},
      {title:"Max. Paneles", field:"maxPaneles", hozAlign:"right", mutator:maxPaneles},
      {title: "Potencia por panel en kWp", field: "potenciaUnitaria", hozAlign:"right", 
        formatter: "_formatoValor", editor: "number", cellEdited: (cell) => nuevaInstalacion(cell),
        validator:["numeric", "min:0"]},
      {title: "Potencia disponible", hozAlign:"right", field: "potenciaTotal", formatter: "_formatoValor"},

      {field: "botonInfoBase", hozAlign: "center", titleFormatter: infoIcon, headerSort:false,
      formatter: infoIcon, width:40, cellClick: ((evt, cell) => UTIL.muestraAtributos( cell))}
    ]
  });
  TCB._tablaBasesAsignadas.on("tableBuilt", function(){
    Idioma.i18nTitulosTabla(TCB._tablaBasesAsignadas)});
}

var maxPaneles = function(value, data){
  return (data.potenciaMaxima / data.potenciaUnitaria).toFixed(0);
}
/**
 * Muestra en pantalla los resultados del balance de energía
 */
function muestraBalanceEnergia() {

    // Mostramos todos los campos
    UTIL.muestra("cMaximoAnual", UTIL.formatoValor('energia', TCB.consumo.cMaximoAnual));
    UTIL.muestra("potenciaTotal", UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal));
    UTIL.muestra("consumoDiario", UTIL.formatoValor('energia', TCB.consumo.cTotalAnual / 365));
    UTIL.muestra("produccionDiaria", UTIL.formatoValor('energia', TCB.produccion.pTotalAnual / 365));
    UTIL.muestra("consumoMensual", UTIL.formatoValor('energia', TCB.consumo.cTotalAnual / 12));
    UTIL.muestra("produccionMensual", UTIL.formatoValor('energia', TCB.produccion.pTotalAnual / 12));
    UTIL.muestra("cTotalAnual", UTIL.formatoValor('energia', TCB.consumo.cTotalAnual));
    UTIL.muestra("pTotalAnual", UTIL.formatoValor('energia', TCB.produccion.pTotalAnual));

    TCB.graficos.gestionResultados_BalanceResultados( "bar");

/*     UTIL.muestra("deficitAnual", UTIL.formatoValor('energia', TCB.balance.deficitAnual)); 
    UTIL.muestra("excedenteAnual", UTIL.formatoValor('energia', TCB.balance.excedenteAnual));

    UTIL.muestra("energiaFaltante%Consumo", UTIL.formatoValor('porciento', TCB.balance.deficitAnual / TCB.consumo.cTotalAnual * 100));
    UTIL.muestra("energiaSobrante%Produccion", UTIL.formatoValor('porciento', TCB.balance.excedenteAnual / TCB.produccion.pTotalAnual * 100)); */

    if (TCB.consumo.cTotalAnual / TCB.produccion.pTotalAnual < 0.8) {
      document.getElementById("Consumo%Produccion").style.color = 'red';
    } else {
      document.getElementById("Consumo%Produccion").style.color = 'black';
    }
    UTIL.muestra("Consumo%Produccion", UTIL.formatoValor('porciento',TCB.consumo.cTotalAnual / TCB.produccion.pTotalAnual * 100));
    UTIL.muestra("Produccion%Consumo", UTIL.formatoValor('porciento',TCB.produccion.pTotalAnual / TCB.consumo.cTotalAnual * 100));
    UTIL.muestra("ConsumoDiurno", UTIL.formatoValor('energia', TCB.balance.consumoDiurno)); 

    if (TCB.modoActivo !== INDIVIDUAL) {

      muestraTablaAsignacionZonasComunes();

    }
/*     let p_autoconsumo = (TCB.balance.autoconsumo / TCB.produccion.pTotalAnual) * 100;
    let p_autosuficiencia = (TCB.balance.autoconsumo / TCB.consumo.cTotalAnual) * 100;
    let autoConsumo =  UTIL.formatoValor('energia', TCB.balance.autoconsumo) + "->" + UTIL.formatoValor("porciento", p_autoconsumo);
    UTIL.muestra("autoconsumoMedioAnual", autoConsumo);
    UTIL.muestra("autosuficienciaMediaAnual", UTIL.formatoValor('porciento',p_autosuficiencia));
    UTIL.muestra("autosuficienciaMaxima", UTIL.formatoValor('porciento', p_autosuficiencia + 100 - p_autoconsumo)); */
    UTIL.muestra("fuenteInfoCO2", TCB.i18next.t("fuenteInfoCO2_LBL", {territorio : TCB.territorio}));
    UTIL.muestra("kgCO2AnualRenovable", UTIL.formatoValor('peso',TCB.CO2AnualRenovable));
    UTIL.muestra("kgCO2AnualNoRenovable", UTIL.formatoValor('peso',TCB.CO2AnualNoRenovable));

}

function muestraTablaAsignacionZonasComunes() {
  const _divZonasComunes = document.getElementById("cardZonasComunes");
  _divZonasComunes.style="display: block;";

  //Muestra la tarta de distribucion de consumo por grupo de uso
  TCB.graficos.gestionResultados_TartaGrupos( 'tartaGrupos');

//Muestra la tabla de zonas comunes en base a su uso para poder asignar un coefEnergia antes del reparto
  const _divAsignacionZonasComunes = document.getElementById("asignacionZonasComunes");
  _divAsignacionZonasComunes.innerHTML='';
  var _zTabla = document.createElement("Table");
  TCB.Participes.forEach( (finca) => {
    if (finca.grupo === "Zonas Comunes") {
          let row = _zTabla.insertRow(-1);
          let _zCell = row.insertCell(0);
          let _zLabel = document.createTextNode(finca.nombreFinca+"   ");
          _zCell.appendChild(_zLabel);
          let _zAsigna = row.insertCell(1);
          const _zInput = document.createElement("input");
          _zInput.type = 'number';
          _zInput.style.width = "100px";
          _zInput.style.textAlign = "right";
          _zInput.step = 0.001;
          _zInput.style.border = '1';
          _zInput.id = finca.idFinca;
          _zInput.value = finca.coefEnergia;
          _zInput.addEventListener('change', (evt) => {asignaEnergiaZonaComun(evt.target)});
          _zAsigna.appendChild(_zInput); 
    }
  })
  _divAsignacionZonasComunes.appendChild(_zTabla);
}
function asignaEnergiaZonaComun( evento) {
  //let _finca = TCB.Participes.find( (finca) => finca.idFinca === evento.id);
  const _f = UTIL.selectTCB('Participes', 'idFinca', evento.id)[0];
  _f.coefEnergia = parseFloat(evento.value);
}

/**
 * Muestra el grafico consumo - produccion en 3D
 */
function muestraGraficos() {
  TCB.graficos.gestionResultados_ConsumoGeneracion3D("graf_resumenBalance");
}

/**
 * Funcion para gestionar el evento generado por cambio de paneles o potenciaUnitaria en la tabla de bases
 * @param {Tabulator.cell} cell Celda que ha cambiado de valor
 * @param {string} propiedad Puede ser paneles o potenica unitaria
 */
function nuevaInstalacion (cell) {

  const activo = UTIL.setActivo(cell);
/* Determinamos si estan cambiando el número de paneles o la potencia unitaria de los mismos en base a la identificación del campo 
    con cell.getField que puede ser paneles o potenciaUnitaria */
  const propiedad = cell.getField(); 

    let tmpPotenciaUnitaria;
    let tmpPaneles;
    let baseActiva = activo.objeto;
    if (propiedad === 'paneles') { //Cambio paneles
        tmpPaneles = cell.getValue();
        tmpPotenciaUnitaria = baseActiva.instalacion.potenciaUnitaria;
    } else { //Cambio potenciaUnitaria
        tmpPaneles = baseActiva.instalacion.paneles;
        tmpPotenciaUnitaria = cell.getValue();
    }
    //Si la potencia instalada es superior a la permitida por la superficie disponible cancelamos el cambio
    if ((tmpPaneles * tmpPotenciaUnitaria) > baseActiva.potenciaMaxima) {
        alert (TCB.i18next.t('resultados_MSG_excesoPotencia'));
        cell.restoreOldValue();
    } else {
        baseActiva.instalacion.potenciaUnitaria = tmpPotenciaUnitaria;
        baseActiva.instalacion.paneles = tmpPaneles;
        TCB.totalPaneles = TCB.BaseSolar.reduce((a, b) => { 
          return a + b.instalacion.paneles }, 0);
        activo.tabla.updateData([BaseSolar.getTabulatorRow('idBaseSolar', baseActiva.idBaseSolar)]);
        cambioInstalacion(baseActiva);
        muestraBalanceEnergia();
    }
}

/**
 * Funcion a ejecutar cuando hay algún cambio de alguna instalación sea paneles o potenciaUnitaria
 * @returns {boolean} true si calculaResultados ha conseguido construir un Balance, false en caso contrario
 */
async function cambioInstalacion() {

    // Se realiza el cálculo de todas las variables de energia del sistema
    await calculaResultados();

    // Se muestran en pantalla los resultados
    if (TCB.balanceCreado) {
      muestraBalanceEnergia();
      muestraGraficos();
      return true;
    } else {
      return false;
    }
}

export {gestionResultados, muestraBalanceEnergia}