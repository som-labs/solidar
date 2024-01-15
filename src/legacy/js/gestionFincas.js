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
//import * as Idioma from "./Idioma.js";
/*global Tabulator, COMUNIDAD */

// Estas variables son para cuando tengamos mas de un consumo en la tablaConsumos

const divFinca = document.getElementById('Finca');
var _tablaFinca;

var seleccionaTodoVisible = [
  {
      label:"Seleccionar todo visible",
      action:function(e, cell){
        cell.getTable().selectRow(cell.getTable().getRows("active"));
      }
  },
];

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

  //Con el boton Nueva Finca añadimos una nueva finca a la tabla para gestionar los consumos del colectivo que no estan directamente vinculados a los participes como podrían ser las zonas comunes. En el modo COMUNIDAD se añade al mismo punto de cosnumo de la finca que estuviera seleccionada en ese momento.
  document.getElementById("botonNuevaFinca").addEventListener("click", creaNuevaFinca);

  document.getElementById("botonDescargaFincas").addEventListener("click", function(){
    _tablaFinca.download("csv", "data.csv", {delimiter:";"});
  });

  document.getElementById("botonSubeFincas").addEventListener('click', async () => {
/*     let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    //_tablaFinca.alert("Cargando fichero CSV de Fincas");
    input.onchange = () => async function() {
      UTIL.debugLog("Importando datos desde: "+ input.files[0].name); */

      await importarFincas (); //input.files[0]);
      //_tablaFinca.clearAlert();
/*       };
    input.click(); */
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
    height: 800,
    //layout:"fitColumns",
    maxHeight:"100%",
    layout:"fitColumns", 
    resizable:"header",

    //responsiveLayout:"collapse",
    groupBy:["idPuntoConsumo", "nombreTipoConsumo"],
    groupUpdateOnCellEdit:true,
    selectableRangeMode:"click",
    index: "idFinca",
    groupHeader:[
      function(value, count){ 
          const pconsumo = UTIL.selectTCB('PuntoConsumo', 'idPuntoConsumo', value)[0]; //TCB.PuntoConsumo.find( (pc) => {return pc.idPuntoConsumo === value});
          return pconsumo.direccion + "<span style='color:#d00; margin-left:10px;'>(" + count + " fincas)</span>";
      },
      function(value, count){
        let energiaAnualxTipo;
        let hdrmsg;
        let tipoActual = UTIL.selectTCB('TipoConsumo', 'nombreTipoConsumo', value)[0]; //TCB.TipoConsumo.find( tipo => tipo.nombreTipoConsumo === value);
        console.log(tipoActual);
        if (tipoActual !== undefined) {
          energiaAnualxTipo = tipoActual.cTotalAnual * count;
          hdrmsg = "Tipo consumo " + value + " (" + count + " fincas) => " + UTIL.formatoValor('energia', energiaAnualxTipo);
        } else {
          hdrmsg = "Tipo consumo " + value + " (" + count + " fincas)";
        }
        console.log(hdrmsg);
        return hdrmsg;
      },
    ], 
    columns:[
      {title:"idPuntoConsumo", field:"idPuntoConsumo", download: true, visible:false}, 
      {title:"idFinca", field:"idFinca", visible:true, contextMenu:seleccionaTodoVisible},
      {title: TCB.i18next.t("nombreFinca_LBL"), field:"nombreFinca", editor:"input", cellEdited: (cell) => cambioNombreFinca(cell), titleDownload:"nombreFinca", headerFilter:"input"},
      {title:"RefCat", field:"refcat"},
      {title:TCB.i18next.t("planta_LBL"), field:"planta", hozAlign:"center", titleDownload:"planta"},
      {title:TCB.i18next.t("puerta_LBL"), field:"puerta", hozAlign:"center", titleDownload:"puerta"},
      {title:TCB.i18next.t("uso_LBL"), field:"uso", hozAlign:"center", editor:"input", titleDownload:"uso", headerFilter:"input"},

      {title:TCB.i18next.t("grupo_LBL"), field:"grupo", hozAlign:"center", editor:"list",editorParams:Finca.getGrupos, 
      titleDownload:"grupo"},
      
      {title:TCB.i18next.t("superficie_LBL"), field:"superficie", hozAlign:"right", topCalc:"sum", mutator:numberMutator, formatter: "_formatoValor", topCalcFormatter: "_formatoValor", titleDownload:"superficie"},
      {title:TCB.i18next.t("participacion_LBL"), field:"participacion", hozAlign:"right", topCalc:"sum", mutator:numberMutator, formatter: "_formatoValor", topCalcFormatter: "_formatoValor", titleDownload:"participacion"},
      {title:TCB.i18next.t("nombreTipoConsumo_LBL"), 
        field:"nombreTipoConsumo", 
        editor:"list", 
        editorParams: function (){ return {values:TipoConsumo.selectNombreTipoConsumo()}}, 
        cellEdited: (cell) => cambioTipoConsumo(cell), titleDownload:"nombreTipoConsumo"},
      {title:TCB.i18next.t("coefHucha_LBL"), field:"coefHucha", editor:"number", hozAlign:"right", formatter: "_formatoValor", cellEdited: (cell) => cambioCondicionesHucha(cell), mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales, titleDownload:"coefHucha"},
      {title:TCB.i18next.t("cuotaHucha_LBL"), field:"cuotaHucha", editor:"number", hozAlign:"right", formatter: "_formatoValor", cellEdited: (cell) => cambioCondicionesHucha(cell), mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales, titleDownload:"cuotaHucha"}
    ],
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

  // Comprobamos que estan cargadas las fincas de cada punto de consumo
  let waitLoop = 0;
  UTIL.mensaje("accionFincas","finca_MSG_accionFincas");

  _tablaFinca.alert("Esperando datos de catastro");
  for (let punto of TCB.PuntoConsumo) {
    if (!punto.sinCatastro) {
      var sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
      if (!punto.fincasCargadas) {
        if (!TCB.importando) {
          document.getElementById('fincasResumen').innerHTML = "Esperando Catastro para punto "+ punto.refcat;
        }
        while (!punto.fincasCargadas && waitLoop++ <= 30) {
          if (TCB.cargaFincasError) {
            _tablaFinca.clearAlert();
            return false;
          }
          if (waitLoop == 30) {
            if (confirm("Tiempo de espera excesivo de catastro. Desea esperar?")) {
              waitLoop = 1;
            } else {
              _tablaFinca.clearAlert();
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
  _tablaFinca.clearAlert();
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
      finca.enReparto = true;
      if ( finca.nombreTipoConsumo !== 'Participe sin consumo') {
        const _tc = UTIL.selectTCB('TipoConsumo','nombreTipoConsumo',finca.nombreTipoConsumo); 
        if (_tc.length > 0) {
          alMenosUna = true;
          TCB.Participes.push( finca);
          if (finca.grupo === "Zonas Comunes") {
            //Buscamos la zona comun en la lista por si ya hubiera sido creada anteriormente
            const _aZC = TCB.listaZonasComunes.find( (zc) => { return zc === finca.nombreFinca});
            //Si no fue creada la añadimos a la lista y creamos la propiedad correspondiente
            if (_aZC === undefined) {
              TCB.listaZonasComunes.push(finca.nombreFinca);
              Finca.prototype[finca.nombreFinca] = 0;
            }
          }
        } else { //Es una finca que tiene un tipo de consumo que no esta en la lista. Posible subida de CSV
          alert(TCB.i18next.t("finca_MSG_tipoConsumoDesconocido") + finca.nombreTipoConsumo);
          return false;
        }
      } else if (finca.grupo !== 'Zonas Comunes') {
        TCB.Participes.push( finca);
      } else {
        alert ("Una zona comun no puede ser un participe sin consumo");
        _tablaFinca.getRow(finca.idFinca).scrollTo('nearest');
        _tablaFinca.getRow(finca.idFinca).select();
        return false;
      }
    } else {
      if (finca.grupo === "Zonas Comunes") {
        alert("No puede existir una zona común sin tipo de consumo asignado");
        _tablaFinca.getRow(finca.idFinca).scrollTo('nearest');
        _tablaFinca.getRow(finca.idFinca).select();
        return false;
      }
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

function creaNuevaFinca() {

  let puntoConsumoActivo;
  if (TCB.modoActivo === COMUNIDAD) { //Añadimos la finca al punto de consumo de la fila seleccionada en ese momento
    let _pcsSelected = _tablaFinca.getSelectedData();
    if (_pcsSelected.length > 1) {
      alert("Debe tener solo una finca seleccionada del punto de consumo al que quiera agregar la nueva finca");
      return;
    } else if (_pcsSelected.length === 0) {
      alert("Debe tener una finca seleccionada del punto de consumo al que quiera agregar la nueva finca");
      return;
    } else { 
      puntoConsumoActivo = _pcsSelected[0].idPuntoConsumo;
    }
  } else { //Si no es modo COMUNIDAD hay un solo punto de consumo
    puntoConsumoActivo = TCB.PuntoConsumo[0].idPuntoConsumo;
  }

  const _finca = {
    idPuntoConsumo : puntoConsumoActivo,
    nombreTipoConsumo: undefined,
    idFinca: (++TCB.idFinca).toFixed(0), 
    nombreFinca:"Unidad " + (TCB.idFinca - 1),
    refcat:"N/A", 
    planta:"N/A", 
    puerta:"N/A", 
    uso:"Indefinida",
    grupo:"Zonas Comunes", 
    superficie:0, 
    participacion: 0,
    coefHucha: 0
  };

  const newFinca = new Finca(_finca);
  TCB.Finca.push(newFinca);
  TCB.requiereOptimizador = true;
  _tablaFinca.addRow(newFinca, true);
}

/** Cambia el tipo de consumo de todas las fincas que estuvieran seleccionadas.
 * Existen dos tipos de consumo especiales:
 * "borrar" -> implica que se borrara la finca
 * "participe sin consumo" -> son fincas que se hacen cargo de alguna inversión aunque no tienen un consumo directo asociado
 * 
 * @param {Tabulator.Cell} cell Celda de tipo consumo de la finca seleccionada
 * @returns {string} Tipo de consumo seleccionado
 */
function cambioTipoConsumo(cell) {

  let _aFinca;
  let _iFinca;

  // Si no hay filas seleccionadas marcamos como seleccionada la fila activa
  if (_tablaFinca.getSelectedRows().length === 0) {
    _tablaFinca.selectRow([cell.getRow().getIndex()]);
  }

  //A todas las filas seleccionadas les pondremos el mismo nombreTipoConsumo o las borraremos si esa es la acción seleccionada de la lista
  var selectedData = _tablaFinca.getSelectedRows();
  selectedData.forEach ( row => {
    const _accion = cell.getValue();
    _iFinca = TCB.Finca.findIndex( (finca) => {return finca.idFinca === row.getData().idFinca});
    _aFinca = TCB.Finca[_iFinca];
    if (_accion === 'Borrar') {
      //Si es una zona comun hay que borrarla de la lista de zonas comunes
      if (_aFinca.grupo === "Zonas Comunes") {
        const _izc = TCB.listaZonasComunes.findIndex ( (_zc) => { return _zc === _aFinca.nombreFinca});
        if (_izc >= 0) {
          TCB.listaZonasComunes.splice(_izc, 1);
          //Se borra la propiedad de la clase Finca
          delete Finca.prototype[_aFinca.nombreFinca];
          //Se borra la columna de la tabla de reparto
          TCB._tablaReparto.deleteColumn(_aFinca.nombreFinca);
          //Se borra la fila de la tabla reparto
          TCB._tablaReparto.deleteRow( _aFinca.idFinca);

        }
      }
      //La borramos de la estructura de Fincas
      TCB.Finca.splice(_iFinca, 1);
      //La borramos de la tabla
      row.delete();

    } else {
      _aFinca.nombreTipoConsumo = cell.getValue();
      row.update ({'nombreTipoConsumo': cell.getValue()});
      row.deselect();
    }
  })

  //Habra que ejecutar el optimizador
  TCB.requiereOptimizador = true;
  return cell.getValue();
}

function cambioNombreFinca ( cell) {

  const _nNombre = cell.getValue();
  const _oNombre = cell.getOldValue();

  const _aGrupo = cell.getRow().getData().grupo;
  if (_aGrupo === "Zonas Comunes") {
    //Cambiamos el nombre de la propiedad en la clase Finca si ya hubiera sido creado
    if (_oNombre in Finca.prototype) {
      Finca.prototype[_nNombre] = Finca.prototype[_oNombre];
    }
    delete Finca.prototype[_oNombre];
    //Cambiamos el nombre en la lista de zonas comunes
    const _iZC = TCB.listaZonasComunes.findIndex( (_zc) => {return _zc === _oNombre});
    TCB.listaZonasComunes[_iZC] = _nNombre;
    //Cambiamos el nombre en la tabla de reparto
    TCB._tablaReparto.updateColumnDefinition( _oNombre, {title: _nNombre, field: _nNombre});
  }
  let fincaCambiada = UTIL.selectTCB('Finca', 'idFinca', cell.getRow().getData().idFinca)[0]; //TCB.Finca.find( obj => { return obj.idFinca === cell.getRow().getData().idFinca});
  fincaCambiada.nombreFinca = cell.getValue();
  return fincaCambiada.nombreFinca;

}

function cambioCondicionesHucha ( cell) {
  const idFinca = cell.getRow().getIndex();
  let actFinca = UTIL.selectTCB('Finca', 'idFinca', idFinca)[0];//TCB.Finca.find( (finca) => {return finca.idFinca === idFinca});
  if (cell.getField() === "coefHucha") actFinca.coefHucha = cell.getValue();
  if (cell.getField() === "cuotaHucha") actFinca.cuotaHucha = cell.getValue();
  Finca.actualiza_creaFinca ( actFinca);
  _tablaFinca.updateOrAddData([Finca.getTabulatorRow("idFinca", actFinca.idFinca)]);
}

function importarFincas (fichero) {

  _tablaFinca.import("csv", ".csv")
  .then(() => {
    alert ("cargado");
    let i=0;
    _tablaFinca.getRows().forEach((row) => {
      let finca = row.getData();
      if (finca.nombreTipoConsumo === '') finca.nombreTipoConsumo = undefined;
      finca.participacion = parseFloat(finca.participacion);
      Finca.actualiza_creaFinca( finca);
      i++;
    })
    alert(i);
      //file successfully imported
  })
  .catch((err) => {
    alert("Error:" + err)
      //something went wrong
  })

/* 
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
        console.log(finca);
        if (finca.nombreTipoConsumo === '') finca.nombreTipoConsumo = undefined;
        finca.participacion = parseFloat(finca.participacion);
        Finca.actualiza_creaFinca( finca);
      }
      TCB.requiereOptimizador = true;
      _tablaFinca.updateOrAddData(data);
    }
    reader.readAsText(fichero);
  }); */
}

function csvToArray(str, delimiter = ",") {
  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  try {
    var headers = str.slice(0, str.indexOf("\n")).split(delimiter);
    for (let i=0; i<headers.length; i++) headers[i] = headers[i].trim().replace( /['"]+/g, "" );
  } catch (e) {
    alert("Posible error de formato fichero de consumos\n" + str);
    return;
  }
  UTIL.debugLog("Cabecera CSV:", headers);

  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");
  let arr = [];
  for (let i=0; i<rows.length; i++) {
    let el = {};
    let valores = rows[i].split(delimiter);
    if (valores.length === headers.length) {
      for (let j=0; j<headers.length; j++) {
        el[headers[j]] = valores[j].replace( /['"\r]+/g, "" );
      }
      if (parseInt(el.idFinca) > TCB.idFinca) TCB.idFinca = parseInt(el.idFinca);
      arr.push(el);
    }
  }
  return arr;
}

export {gestionFincas}