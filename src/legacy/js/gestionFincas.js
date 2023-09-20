/**
 * @module  gestionFincas
 * @fileoverview Módulo para la gestion de las fincas o unidades de consumo
 * @version      Solidar.3
 * @author       José Luis García (SOM Madrid)
 * @copyright
 * 
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
*/
import TCB from "./TCB.js";
import * as UTIL from "./Utiles.js";
import Finca from "./Finca.js";
import TipoConsumo from "./TipoConsumo.js";
import * as Idioma from "./Idioma.js";
/*global Tabulator */

// Estas variables son para cuando tengamos mas de un consumo en la tablaConsumos

const divFinca = document.getElementById('Finca');
var _tablaFinca;

/** Es la función llamada desde el Wizard para la gestion de la ventana de fincas
 * 
 * @param {String} accion [Inicializa, Valida, Prepara, Importa]
 * @param {JSON} datos En el caso de importacion de datos los datos a importar
 * @returns {boolean} true si todo ha ido bien false si algo ha fallado
 */ 

async function gestionFincas( accion, datos) {
  UTIL.debugLog("gestionConsumos: " + accion);
  let status;
  switch (accion) {
    case "Inicializa":
      status = await inicializaEventos();
      break;
    case "Valida":
      status =  await valida();
      break;
    case "Prepara":
      status = await prepara();
      break;
    case "Importa":
      status = importa(datos);
      break;
    case "Exporta":
      status = exporta(datos);
      break;
  }
  return status;
}

function inicializaEventos() { 

  muestraTablas();

  //Añadimos una nueva finca a la tabla para gestionar los consumos del colectivo que no estan directamente vinculados a los participes como podrían ser las zonas comunes
  document.getElementById("botonNuevaFinca").addEventListener("click", function(){
    const _finca = {
      idPuntoConsumo : TCB.PuntoConsumo[0].idPuntoConsumo,
      //PuntoConsumo: TCB.PuntoConsumo[0],
      nombreTipoConsumo: undefined,
      idFinca: (++TCB.idFinca).toFixed(0), 
      nombreFinca:"Nueva unidad",
      refcat:"N/A", 
      planta:"N/A", 
      puerta:"N/A", 
      uso:"por definir", 
      superficie:0, 
      participacion: 0,
      coefHucha: 0
    };

    const newFinca = new Finca(_finca);
    TCB.Finca.push(newFinca);
    TCB.requiereOptimizador = true;
    _tablaFinca.addRow(newFinca);

  });

  document.getElementById("botonDescargaFincas").addEventListener("click", function(){
    _tablaFinca.download("csv", "data.csv", {delimiter:";"});
  });

  document.getElementById("botonSubeFincas").addEventListener('click', async () => {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = () => {
      UTIL.debugLog("Importando datos desde: "+ input.files[0].name);
      importarFincas (input.files[0]);
      };
    input.click();
  });
  return true
}

function muestraTablas() {
  var numberMutator = function(value){
    //change age value into boolean, true if over the provided legal age
    if (typeof value === 'string') {
      return parseFloat(value.replace(",", "."))
    } else {
    return value
    }
  }

  _tablaFinca = new Tabulator(divFinca, {
    columnDefaults: {headerTooltip: (e, col) => UTIL.hdrToolTip(e, col)},
    selectable:true,
    //height: 430,
    layout:"fitColumns",
    groupBy:"nombreTipoConsumo",
    groupUpdateOnCellEdit:true,
    index: "idFinca", 
    columns:[ 
      {title:"idFinca", field:"idFinca"},
      {title: TCB.i18next.t("nombreFinca_LBL"), field:"nombreFinca", editor:"input", cellEdited: (cell) => cambioNombreFinca(cell)},
      {title:"RefCat", field:"refcat"},
      {title:TCB.i18next.t("planta_LBL"), field:"planta", hozAlign:"center"},
      {title:TCB.i18next.t("puerta_LBL"), field:"puerta", hozAlign:"center"},
      {title:TCB.i18next.t("uso_LBL"), field:"uso", hozAlign:"center", editor:"input"},
      {title:TCB.i18next.t("superficie_LBL"), field:"superficie", hozAlign:"right", topCalc:"sum", mutator:numberMutator, formatter: "_formatoValor",
        topCalcFormatter: "_formatoValor"},
      {title:TCB.i18next.t("participacion_LBL"), field:"participacion", hozAlign:"right", topCalc:"sum", mutator:numberMutator, formatter: "_formatoValor", 
        topCalcFormatter: "_formatoValor"},
      {title:TCB.i18next.t("nombreTipoConsumo_LBL"), 
        field:"nombreTipoConsumo", 
        editor:"list", 
        editorParams: function (){ return {values:TipoConsumo.selectNombreTipoConsumo()}}, 
        cellEdited: (cell) => cambioTipoConsumo(cell)},
      {title:TCB.i18next.t("coefHucha_LBL"), field:"coefHucha", editor:"number", hozAlign:"right", formatter: "_formatoValor", cellEdited: (cell) => cambioCondicionesHucha(cell), mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales},
      {title:TCB.i18next.t("cuotaHucha_LBL"), field:"cuotaHucha", editor:"number", hozAlign:"right", formatter: "_formatoValor", cellEdited: (cell) => cambioCondicionesHucha(cell), mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales}
    ],
  });
  /**
   * Definicion del header de grupo
   * value - the value all members of this group share
   * count - the number of rows in this group
   */
    _tablaFinca.setGroupHeader(function(value, count){
      console.log(value + "_" + count);
      let energiaAnualxTipo;
      let hdrmsg;
      let tipoActual = TCB.TipoConsumo.find( tipo => tipo.nombreTipoConsumo === value);
      if (tipoActual !== undefined) {
        energiaAnualxTipo = tipoActual.cTotalAnual * count;
        hdrmsg = "Tipo consumo " + value + " (" + count + " items) => " + UTIL.formatoValor('energia', energiaAnualxTipo);
      } else {
        hdrmsg = "Tipo consumo " + value + " (" + count + " items)";
      }
      return hdrmsg;
    });
}

function importa (datosImportar) {


  //En la version 3.1 no hay COLECTIVO y las fincas solo estaban estaban en Participe agrupadas por tipoConsumo
  let tFinca;
  if (datosImportar.version === "3.1") {
    for (let tc in datosImportar.Participes) {
      datosImportar.Participes[tc].forEach( (finca) => {
        tFinca = new Finca( finca);
        TCB.Finca.push( tFinca);
        TCB.Participes.push( tFinca);
      })
    }
  } else {
    //Aqui va el codigo de importar fincas de la version 3.2
    datosImportar.Finca.forEach( (finca) => {
      tFinca = new Finca(finca);
      TCB.Finca.push(tFinca);
      if (finca.enReparto) TCB.Participes.push(tFinca);
    })
  }
}

function exporta () {
  TCB.datosProyecto.Finca = TCB.Finca;
}

async function prepara() {
  // Habra que hacer esto por cada punto de consumo pero para Solidar.3 tenemos un solo PC.
  // Comprobamos que estan cargadas las fincas de cada punto de consumo
  let waitLoop = 0;
  UTIL.mensaje("accionFincas","finca_MSG_accionFincas");
  for (let punto of TCB.PuntoConsumo) {
    if (!punto.sinCatastro) {
      var sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
      if (!punto.fincasCargadas) {
        if (TCB.importando) {
          //document.getElementById('importar').innerHTML = TCB.i18next.t("importarProyecto_MSG_importando");
        } else {
          document.getElementById('fincasResumen').innerHTML = "Esperando Catastro para punto "+ punto.refcat;
        }
        while (!punto.fincasCargadas && waitLoop++ <= 30) {
          if (waitLoop == 30) {
            if (confirm("Tiempo de espera excesivo de catastro. Desea esperar?")) {
              waitLoop = 1;
            } else {
              return false;
            }
          }
          document.getElementById('fincasResumen').innerHTML += "<";
          await sleep (1000);
        }
      }
    }
  }
  _tablaFinca.setData(TCB.Finca); 
}

/**
 * Verifica que las fincas seleccionadas tienen tipoConsumo asignado y que al menos hay una seleccionada
 * @returns {boolean} true si todo ha ido bien false si algo ha fallado
 */
function valida() {

  // Limpiamos cualquier estructura previa de participes
  TCB.Participes = [];
  let alMenosUna = false;

  //Construimos la estructura participes como array de todas las fincas que tienen asignada un tipoConsumo
  for (let finca of TCB.Finca) {
    if (finca.nombreTipoConsumo !== undefined) {
        const _tc = TipoConsumo.findxNombre( finca.nombreTipoConsumo);
        if (_tc !== undefined) {
          finca.enReparto = true;
          alMenosUna = true;
          TCB.Participes.push( finca);
        } else {
          alert(TCB.i18next.t("finca_MSG_tipoConsumoDesconocido") + finca.nombreTipoConsumo);
          return false;
        }
    } else {
      finca.enReparto = false;
    }
  }

  if (alMenosUna) {
    return true;
  } else {
    alert (TCB.i18next.t("finca_MSG_noTipoConsumoAsignado"));
    return false;
  }
}

function cambioTipoConsumo(cell) {

  let actFinca;
  // Si no hay filas seleccionadas marcamos como seleccionada la fila activa
  if (_tablaFinca.getSelectedRows().length === 0) {
    _tablaFinca.selectRow([cell.getRow().getIndex()]);
  }

  //A todas las filas seleccionadas les pondremos el mismo nombreTipoConsumo
  var selectedData = _tablaFinca.getSelectedRows();
  selectedData.forEach ( row => {
    actFinca = TCB.Finca.find( (finca) => {return finca.idFinca === row.getData().idFinca});
    actFinca.nombreTipoConsumo = cell.getValue();
    row.update ({'nombreTipoConsumo': cell.getValue()});
    row.deselect();
  })

  //Habra que ejecutar el optimizador
  TCB.requiereOptimizador = true;
  return cell.getValue();
}

function cambioNombreFinca ( cell) {

  let fincaCambiada = TCB.Finca.find( obj => { return obj.idFinca === cell.getRow().getData().idFinca});
  fincaCambiada.nombreFinca = cell.getValue();
  return

}

function cambioCondicionesHucha ( cell) {
  const idFinca = cell.getRow().getIndex();
  let actFinca = TCB.Finca.find( (finca) => {return finca.idFinca === idFinca});
  if (cell.getField() === "coefHucha") actFinca.coefHucha = cell.getValue();
  if (cell.getField() === "cuotaHucha") actFinca.cuotaHucha = cell.getValue();
  Finca.actualiza_creaFinca ( actFinca);
  _tablaFinca.updateOrAddData([Finca.getTabulatorRow("idFinca", actFinca.idFinca)]);
}

function importarFincas (fichero) {

  let reader = new FileReader();
  return new Promise((resolve, reject) => {

    reader.onerror = (err) => {
      alert(TCB.i18next.t("precios_MSG_errorLecturaFicheroImportacion") + "\nReader.error: " + err);
      reject("...error de lectura");
    }

    reader.onload = (e) => {
      const text = e.target.result;
      const data = csvToArray(text, ";");
      for (let finca of data) {
        if (finca.nombreTipoConsumo === '') finca.nombreTipoConsumo = undefined;
        finca.participacion = parseFloat(finca.participacion);
        Finca.actualiza_creaFinca( finca);
      }
      TCB.requiereOptimizador = true;
      _tablaFinca.updateOrAddData(data);
    }
    reader.readAsText(fichero);
  });
}

function csvToArray(str, delimiter = ",") {
  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  try {
    var headers = str.slice(0, str.indexOf("\n")).split(delimiter);
    for (let i=0; i<headers.length; i++) headers[i] = headers[i].trim();
  } catch (e) {
    alert("Posible error de formato fichero de consumos\n" + str);
    return;
  }
  UTIL.debugLog("Cabecera CSV:", headers);
  let chk_headers = {idFinca: 'idFinca', Nombre: 'nombreFinca', RefCat: 'refcat', Planta: 'planta',	Puerta: 'puerta', 
            Uso: 'uso', Superficie: 'superficie', Participacion: 'participacion', 'Tipo consumo': 'nombreTipoConsumo'};

  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  let arr = [];
  rows.forEach( (row) => {
    if(row.length > 1) {
      const values = row.split(delimiter);
      const el = headers.reduce(function (object, header, index) {
        object[chk_headers[header]] = values[index].replace( /[\r\n]+/gm, "" );
        return object;
      }, {});
      arr.push(el);
    }
  })
  return arr;
}

export {gestionFincas}