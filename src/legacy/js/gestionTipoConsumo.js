/**
 * @module  js/gestionTipoConsumo
 * @fileoverview Módulo para la gestion de los tipos de consumo a asignar a las fincas o sumar en modo INDIVIDUAL
 * @version      Solidar.3
 * @author       José Luis García (SOM Madrid)
 * @copyright
 * 
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
*/
import TCB from "./TCB.js";
import * as UTIL from "./Utiles.js";
import TipoConsumo from "./TipoConsumo.js";
import Tarifa from "./Tarifa.js";
import * as Idioma from "./Idioma.js";
/*global INDIVIDUAL, Tabulator*/

var activo;
var _tablaTipoConsumo;

/** Es la función llamada desde el Wizard para la gestion de la ventana de consumos
 * 
 * @param {*} accion [Inicializa, Valida, Prepara, Importa]
 * @param {*} datos En el caso de importacion de datos los datos a importar
 * @returns {boolean} true si todo ha ido bien false si algo ha fallado
 */ 

async function gestionTipoConsumo( accion, datos) {
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
      status = prepara();
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

async function inicializaEventos () {

  document.getElementById('botonNuevoTipoConsumo').addEventListener('click', ()=> {
    creaNuevoTipoConsumoDefault();
  });
  TCB.cambioTipoConsumo = true;
  muestraTablas();
}

function importa (datosImportar) {

  for (let importTC of datosImportar.TipoConsumo) {
    
    UTIL.debugLog( "Importando tipo consumo: "+importTC.nombreTipoConsumo);
    let tTC = new TipoConsumo( importTC);
    //Si los datos fueron importados de versiones anteriores no habia fecha. Se asume que son del año 2022 a efectos del cálculo de tarifas en dias de la semana
    for (let dia=0; dia<365; dia++) {
      if (tTC.idxTable[dia].fecha === undefined) tTC.idxTable[dia].fecha = new Date(2022,tTC.idxTable[dia].mes,tTC.idxTable[dia].dia);
    } 

    //En el fichero de importación las fechas vienen como string. Hay que convertirlas a Date.
    tTC.transformaFechas();


    // Asociamos la tarifa al TipoConsumo
    let _tarifa = new Tarifa(tTC.tarifa.nombreTarifa, tTC.tarifa.territorio);
    _tarifa.id = tTC.tarifa.id;
    _tarifa.precios = Array.from(importTC.tarifa.precios);
    _tarifa.horas = Array.from(importTC.tarifa.horas);
    tTC.tarifa = _tarifa;
    tTC.nombreTarifa = tTC.tarifa.nombreTarifa;
    tTC.fechaInicio = new Date(tTC.fechaInicio);
    tTC.fechaFin = new Date(tTC.fechaFin);

    // Insert into TCB
    TCB.TipoConsumo.push(tTC);
    if (tTC.nombreTipoConsumo !== 'Global') {
      _tablaTipoConsumo.updateOrAddData([tTC.select_tablaTipoConsumo()]);
    }
  }
}

function exporta() {
  TCB.datosProyecto.TipoConsumo = TCB.TipoConsumo;
  for (let tc of TCB.datosProyecto.TipoConsumo) {
    delete tc.ficheroCSV; //El objeto File correspondiente no puede ser exportado via JSON.
  }
}

// Esta funcion se ejecuta antes de mostrar la pestaña de tipos de consumo
async function prepara () {

  //Crea un TipoConsumo en TCB.TipoConsumo si no existe ninguno y lo inserta en la tabla de tipos de consumo
  if (TCB.TipoConsumo.length === 0) {
    await creaNuevoTipoConsumoDefault();
  }
  return true;
}

// Esta funcion se ejecuta al dar a siguiente en el wizard
async function valida() {
  // Si no ha habido ningún cambio seguimos adelante
  if (!TCB.cambioTipoConsumo) return true;

  if (TCB.TipoConsumo.length === 0) {
    alert (TCB.i18next.t("consumo_MSG_alMenosUnTipoConsumo"));
    return false;
  }

  //document.getElementById('csvResumen').innerHTML ="";

  let status = true;
  // Se verifica que cada TipoConsumo definido se le ha cargado el CSV correspondiente
  //let consumoTotal = 0;
  //for (let tipoConsumo of TCB.TipoConsumo) consumoTotal +=  tipoConsumo.cTotalAnual;

  for (const tipoConsumo of TCB.TipoConsumo) {
    if (tipoConsumo.fuente === "REE") {
      if (!(tipoConsumo.consumoAnualREE > 0)) {
          alert (tipoConsumo.nombreTipoConsumo + "\n" + TCB.i18next.t("consumo_MSG_definirPotenciaBaseREE"));
          status = false;
          break;
      } 
    } else if (tipoConsumo.fuente === "CSV" || tipoConsumo.fuente === "DATADIS") {
      if (tipoConsumo.ficheroCSV === null) {
          alert (tipoConsumo.nombreTipoConsumo + "\n" + TCB.i18next.t("consumo_MSG_definirFicheroConsumo"));
          status = false;
          break;
      }
    }
  }

  // Si el modo es INDIVIDUAL crearemos un tipo de consumo que representa la suma horaria de todos los tipos de consumo.
  if (TCB.modoActivo === INDIVIDUAL) {

    //Si ya habiamos creado el consumo Global previamente lo borramos
    const idxTipoConsumo = TCB.TipoConsumo.findIndex( (tipo) => {return tipo.nombreTipoConsumo === "Global"});
    if (idxTipoConsumo >= 0) TCB.TipoConsumo.splice(idxTipoConsumo, 1);

    let nuevoTipoConsumo = {};
    nuevoTipoConsumo.idTipoConsumo = TCB.featIdUnico++;
    nuevoTipoConsumo.nombreTipoConsumo = "Global",

    // Estas propiedades se incluyen para mantener la estructura de la tabla a la hora de imprimir el consumo global en paralelo con los TipoConsumo individuales.
    nuevoTipoConsumo.nombreTarifa = "";
    nuevoTipoConsumo.territorio = "";
    nuevoTipoConsumo.fuente = "";
    nuevoTipoConsumo.consumoAnualREE = "";
    nuevoTipoConsumo.ficheroCSV = "";
    nuevoTipoConsumo.nombreFicheroCSV = "";
    let tConsumo = new TipoConsumo(nuevoTipoConsumo);
    tConsumo.tarifa = TCB.TipoConsumo[0].tarifa;

    //Ahora porcedemos a sintetizar todos los tipos de consumo en el tipo consumo Global
    for (const tipoConsumo of TCB.TipoConsumo) {
      tConsumo.sintetizaTiposConsumo( tipoConsumo, 1);
    }

    //Lo incluimos en TCB.TipoConsumo
    TCB.TipoConsumo.push(tConsumo);
    TCB.cambioTipoConsumo = false;
  }
  return status;
}

async function muestraTablas() {

  var tarifaIcon = function() { //cell, formatterParams, onRendered){
    return "<i class='fa fa-eur'></i>";
  };
  var grafIcon = function(){ 
    return "<i class='fa fa-line-chart'></i>";
  };
  var deleteIcon = function(){ 
    return "<i class='fa fa-trash-o'></i>"
  };
  var fileIcon = function(){
    return "<i class='fa fa-file-o'></i>"
  }
  var editFuenteCheck = function(cell) {
    var data = cell.getRow().getData();
    if (cell.getField() === "nombreFicheroCSV" && data.fuente !== "CSV") return false;
    if (cell.getField() === "consumoAnualREE" && data.fuente !== "REE") return false; 
    return true;
  }
  var muestraPrecios = function(cell){
    const activo = UTIL.setActivo(cell);
    const container = document.createElement("div");
    const lista =  activo.objeto.tarifa.getTarifa ();
    let _max = 6;
    if (activo.objeto.tarifa.nombreTarifa === "2.0TD") _max = 3;
    for (let i=1; i <= _max; i++) lista["P"+i]= activo.objeto.tarifa.precios[i]; 

    let contents = "<strong style='font-size:1.2em;'>Tarifa "+activo.objeto.tarifa.nombreTarifa+" (€ / kWh)</strong><br/><ul style='padding:0;  margin-top:10px; margin-bottom:0;>";
    container.innerHTML = contents;

    var tabla = document.createElement("Table");
    for (let prop in lista) {
      if (!(activo.objeto.tarifa.nombreTarifa === "2.0TD" && prop[1] > 3)){
        let row = tabla.insertRow(-1);
        let tarifa = row.insertCell(0);
        let label = document.createTextNode(TCB.i18next.t(prop+"_LBL"));
        tarifa.appendChild(label);
        let precio = row.insertCell(1);
        const lineaTarifa = document.createElement("input");
        lineaTarifa.type = 'number';
        lineaTarifa.style.width = "100px";
        lineaTarifa.style.textAlign = "right";
        lineaTarifa.step = 0.001;
        lineaTarifa.style.border = '1';
        lineaTarifa.id = prop;
        lineaTarifa.value = lista[prop]; //UTIL.formatoValor('precioEnergia', lista[prop]);
        lineaTarifa.addEventListener('change', (evt) => {cambioPrecioTarifa(evt.target, activo.objeto)}); // .tarifa)});
        precio.appendChild(lineaTarifa); 
      }
    }
    container.appendChild(tabla);
    return container;
  };
  var noEditable = function (cell) { //}, formatterParams) {
    cell.getElement().style.backgroundColor = "rgba(220, 249, 233, 1)";
    return UTIL.formatoValor(cell.getField(), cell.getValue());
  }

  _tablaTipoConsumo = _tablaTipoConsumo ?? new Tabulator(document.getElementById('TipoConsumo'), {
    columnDefaults: {headerTooltip: (e, col) => UTIL.hdrToolTip(e, col)},
    maxHeight:"100%",
    layout:"fitColumns", 
    resizable:"header",
    index: "idTipoConsumo", 
    columns:[
      {title: "Nombre",  headerHozAlign:"center", field:"nombreTipoConsumo", hozAlign:"left", editor: "input", cellEdited: (cell) => cambioNombreTipoConsumo(cell, false), validator:"unique"},
      {title:"Fuente", headerHozAlign:"center", field:"fuente", hozAlign:"left", editor:"list", editorParams:{values:["CSV", "REE", "DATADIS"]},
      cellEdited: (cell) => cambioFuente(cell)},
      {title: "consumoAnualREE", field:"consumoAnualREE", hozAlign:"right", editor: "number", cellEdited: (cell) => cambioConsumoAnualREE(cell), validator:"min:0", editable: editFuenteCheck, formatter: "_formatoValor"},
      {title: "Fichero", field: "nombreFicheroCSV", hozAlign:"center", formatter: noEditable },
      {field: "botonSeleccionFichero", hozAlign: "center", titleFormatter: fileIcon, 
      formatter:fileIcon, width:40, headerSort:false, editable: editFuenteCheck, cellClick: (evt, cell) => getFile (cell)},
      {title:"Total anual", field:"cTotalAnual", hozAlign:"right", formatter: noEditable },
      {title:"Tarifa", field:"nombreTarifa", hozAlign:"center", editor:"list", editorParams:{values:["2.0TD", "3.0TD"]}, cellEdited: (cell) => cambioTarifa(cell)},     
      {field: "botonMuestraTarifa", hozAlign: "center", titleFormatter: tarifaIcon, 
      formatter:tarifaIcon, width:40, headerSort:false, clickPopup: (evt, cell) => muestraPrecios(cell)},
      {field: "botonMuestraMapaTipoConsumo", hozAlign: "center", titleFormatter: grafIcon, 
      formatter:grafIcon, width:40, headerSort:false, cellClick: (evt, cell) => muestraGraficosObjeto(cell)},
      {field: "botonBorraTipoConsumo", hozAlign: "center", titleFormatter: deleteIcon, 
      formatter: deleteIcon, width:40, headerSort:false, cellClick: (evt, cell) => borraTipoConsumo( cell)}
    ]
  });
  _tablaTipoConsumo.on("tableBuilt", function(){
    Idioma.i18nTitulosTabla(_tablaTipoConsumo)});

  _tablaTipoConsumo.on("validationFailed", function(){
      //cell - cell component for the edited cell
      //value - the value that failed validation
      //validators - an array of validator objects that failed

      document.getElementById("csvResumen").innerHTML = TCB.i18next.t("nombreTipoConsumoDuplicado_MSG");
/* 
      cell.setValue(" ");
      cell.clearValidation(); */
      return false;

  });
}

/** Gestiona el cambio de nombre del TipoConsumo teniendo en cuenta que la relacion entre Finca y TipoConsumo
 *  se basa en el nombre de éste.
 * @param {Tabulator.cell} cell Identificación del TipoConsumo que estamos cambiando
 */
function cambioNombreTipoConsumo (cell) {

  const activo = UTIL.setActivo(cell);
  activo.objeto.nombreTipoConsumo = cell.getValue();
  //Buscamos las fincas que tuvieran este TipoConsumo asociado y les cambiamos el nombre
  for (let finca of TCB.Finca) {
    if (finca.nombreTipoConsumo === cell.getOldValue()) finca.nombreTipoConsumo = cell.getValue();
  }
  //document.getElementById("csvResumen").innerHTML = TCB.i18next.t("tipoConsumoDefault_MSG");
  
}

/** gestiona el cambio de los precios asociados a una determinada tarifa.
 * Se activa desde el evento asociado al campo dentro de la tabla dinamica que se construye al seleccionar el 
 * simbolo € en la fila del tipo de consumo
 * @param {event} evt Identifica el campo que estamos cambiando
 * @param {TipoConsumo} tipoConsumo 
 */
function cambioPrecioTarifa (evt, tipoConsumo) {
  let idx;
  if (evt.id === 'Compensa') idx = 0;
  else idx = evt.id[1];
  tipoConsumo.tarifa.precios[idx] = parseFloat(evt.value);
}

/** Borra un tipo de consumo siempre que no tenga fincas previamente asociadas
 * 
 * @param {Tabulator.Cell} cell Celda que identifica la fila del tipo de consumo a borrar
 */
function borraTipoConsumo(cell) {

  TCB.requiereOptimizador = true;
  TCB.cambioTipoConsumo = true;
  const activo = UTIL.setActivo(cell);

  //Para poder borrarlo en splice necesitamos conocer el index dentro del array de tipos de consumo
  const idxTipoConsumo = TCB.TipoConsumo.findIndex( (tipo) => {return tipo.idTipoConsumo === activo.id});

  // en este caso no hay puntos de consumo ni fincas reales por lo que borramos sin mas
  if (TCB.modoActivo === INDIVIDUAL && idxTipoConsumo >= 0) { 
    TCB.TipoConsumo.splice(idxTipoConsumo, 1);
    cell.getRow().delete();
  } else {  //Debemos buscar en todas las fincas si alguna tiene este tipo de consumo
      const _fs = UTIL.selectTCB('Finca', 'nombreTipoConsumo', activo.objeto.nombreTipoConsumo);
      if (_fs.length == 0) {
        TCB.TipoConsumo.splice(idxTipoConsumo, 1);
        cell.getRow().delete();
      } else {
        alert (TCB.i18next.t("consumo_MSG_hayFincasAsociadas"));
      }
  }
  //Limpia los graficos
  muestraGraficosObjeto();
}

/** Muestra o apaga la zona de graficos de tipo consumo de un objeto.
 * Si el argumento es undefined limpia los gráficos
 * 
 * @param {Object} target Puede ser un objeto Tipo de consumo o una celda de la tabla que define la fila que contiene
 * el objeto a grafica.
 */
function muestraGraficosObjeto (target) {
  let objetoMostrar;
  if (target !== undefined) {
    if (target.constructor.name === "TipoConsumo") {
      objetoMostrar = target;
    } else {
      const activo = UTIL.setActivo(target);
      objetoMostrar = activo.objeto;
    }
    document.getElementById('graf_resumenConsumo').style.display = "block";
    document.getElementById('graf_perfilDia').style.display = "block";
    document.getElementById('graf_res').style.display = "block";
    TCB.graficos.gestionTipoConsumo_MapaConsumo(objetoMostrar, "graf_resumenConsumo", "graf_perfilDia");
    TCB.graficos.gestionTipoConsumo_MapaMesHora(objetoMostrar, "graf_res");
  } else {
    document.getElementById('graf_resumenConsumo').style.display = "none";
    document.getElementById('graf_perfilDia').style.display = "none";
    document.getElementById('graf_res').style.display = "none";
  }
}

/** Crea un nuevo tipo de consumo con valores por defecto
 * 
 * @returns {Object} El tipo de consumo creado
 */
async function creaNuevoTipoConsumoDefault(){

  muestraGraficosObjeto(); //Limpia la zona de gráficos
  TCB.requiereOptimizador = true;
  TCB.cambioTipoConsumo = true;
  let nuevoTipoConsumo = {};

  //Asigna los valores por defecto
  nuevoTipoConsumo.idTipoConsumo = TCB.featIdUnico++;
  nuevoTipoConsumo.nombreTipoConsumo = "TCons " + nuevoTipoConsumo.idTipoConsumo;
  nuevoTipoConsumo.fuente = "CSV";
  nuevoTipoConsumo.consumoAnualREE = "";
  nuevoTipoConsumo.ficheroCSV = null;
  nuevoTipoConsumo.nombreFicheroCSV = TCB.i18next.t("consumo_MSG_nombreCSVPorDefinir");
  nuevoTipoConsumo.nombreTarifa = "2.0TD";
  nuevoTipoConsumo.territorio = TCB.territorio;

  // Lo añadimos a TCB
  let idxTC = TCB.TipoConsumo.push( new TipoConsumo(nuevoTipoConsumo));
  TCB.TipoConsumo[idxTC-1].tarifa = new Tarifa(nuevoTipoConsumo.nombreTarifa, nuevoTipoConsumo.territorio);
  nuevoTipoConsumo.cTotalAnual = TCB.TipoConsumo[idxTC-1].cTotalAnual;

  //Lo añadimos a la tabla de tipos de consumo
  _tablaTipoConsumo.addRow(nuevoTipoConsumo, false)
  .then(function(row) {
    row.getCell('fuente').getElement().style.backgroundColor = "white"; 
    row.getCell('botonSeleccionFichero').getElement().style.backgroundColor = document.body.style.backgroundColor;
    const REEcell = row.getCell('consumoAnualREE').getElement();
    REEcell.style.backgroundColor = document.body.style.backgroundColor;
    const CSVcell = row.getCell('nombreFicheroCSV').getElement();
    CSVcell.style.backgroundColor = document.body.style.backgroundColor;
    CSVcell.innerHTML = TCB.i18next.t("consumo_MSG_nombreCSVPorDefinir");
  })

  //Devolvemos el tipo de consumo creado
  return nuevoTipoConsumo;
}

/** Crea un elemento input de tipo File oculto y define el eventListener de modo que al activarlo se pueda
 * definir el fichero a cargar.
 * 
 * @param {Tabultor.Cell} cell Indica la celda que se ha activado 
 * @returns 
 */
async function getFile(cell) {
  //Activamos el objeto de la fila seleccionada 
  const activo = UTIL.setActivo(cell);

  //Si el tipo es REE no hay nada que hacer
  if (activo.fila.fuente === "REE") return;

  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = () => {
      UTIL.debugLog("Cargando consumos desde: "+ input.files[0].name);
      TCB.requiereOptimizador = true;
      //let objTipoConsumo = TCB.TipoConsumo.find( tipo => tipo.idTipoConsumo === cell.getRow().getData().idTipoConsumo);
      let _tc = UTIL.selectTCB('TipoConsumo', 'idTipoConsumo', cell.getRow().getData().idTipoConsumo)[0];
      _tc.nombreFicheroCSV = input.files[0].name;
      if (cargaCSV (_tc, input.files[0], activo.fila.fuente)) {
        activo.fila.nombreFicheroCSV = input.files[0].name;
        activo.objeto.nombreFicheroCSV = input.files[0].name;
      } else {
        activo.fila.nombreFicheroCSV = TCB.i18next.t("consumo_MSG_nombreCSVPorDefinir");
      }
  };
  input.click();
}

/** Gestiona el cambio de tarifa asignada al tipo de consumo
 * 
 * @param {Tabulator.Cell} cell Celda la tabla donde esta la tarifa a cambiar
 * @returns {string} Nombre de la tarifa seleccionada
 */
async function cambioTarifa (cell) {

  TCB.requiereOptimizador = true;
  TCB.cambioTipoConsumo = true;
  //Activamos el objeto de la fila seleccionada 
  activo = UTIL.setActivo(cell);
  activo.objeto.nombreTarifa = cell.getValue(); //Hay que trabajar esta duplicidad
  activo.objeto.tarifa.nombreTarifa = cell.getValue();
  activo.objeto.tarifa.setTarifa( activo.objeto.tarifa.nombreTarifa, TCB.territorio);

  activo.fila.nombreTarifa = cell.getValue();
  _tablaTipoConsumo.updateData([activo.objeto.select_tablaTipoConsumo()]);

  //En el caso que la fuente sea REE la tarifa afecta al perfil de consumo
  if (activo.objeto.fuente === "REE" && activo.objeto.consumoAnualREE != 0) {
    activo.objeto.ficheroCSV = await UTIL.getFileFromUrl(TCB.basePath + "datos/REE.csv");
    const opciones = {delimiter:";", decimal:".", fechaHdr:"Fecha", horaHdr:"Hora", 
    valorArr:[activo.objeto.tarifa.nombreTarifa], factor: activo.objeto.consumoAnualREE }
    await activo.objeto.loadFromCSV(activo.objeto.ficheroCSV, opciones);

    muestraGraficosObjeto(activo.objeto);
  }
  return activo.objeto.tarifa.nombreTarifa;
}
/** Define los parametros para la función loadFromCSV segun los datos de la fila
 * 
 * @param {TipoConsumo} objTipoConsumo 
 * @param {File} ficheroCSV 
 * @param {string} fuente 
 * @returns {boolean} true si todo OK, flase en caso de error
 */
async function cargaCSV (objTipoConsumo, ficheroCSV, fuente) {
  TCB.cambioTipoConsumo = true;
  objTipoConsumo.inicializa();
  objTipoConsumo.ficheroCSV = ficheroCSV;
  let opciones = {delimiter:";", decimal:",", fechaHdr:"FECHA", horaHdr:"HORA", 
  valorArr:["CONSUMO","CONSUMO_KWH","AE_KWH"], factor:1};

  //Si la fuente es DATADIS loadcsv debera cambiar el formato de fecha de AAAA/MM/DD a DD/MM/AAAA
  opciones.fechaSwp = (fuente === "DATADIS");
  await objTipoConsumo.loadFromCSV(ficheroCSV, opciones);
  if (objTipoConsumo.numeroRegistros > 0) {
    _tablaTipoConsumo.updateData([objTipoConsumo.select_tablaTipoConsumo()]);
    muestraGraficosObjeto(objTipoConsumo);
    return true
  }
  return false;

}

async function cambioConsumoAnualREE ( cell) {

  activo = UTIL.setActivo(cell);
  TCB.requiereOptimizador = true;
  TCB.cambioTipoConsumo = true;
  activo.objeto.inicializa();
  activo.objeto.consumoAnualREE = parseFloat(cell.getValue());
  activo.objeto.fuente = "REE";
  activo.objeto.ficheroCSV = await UTIL.getFileFromUrl(TCB.basePath + "datos/REE.csv");
  const opciones = {delimiter:";", decimal:".", fechaHdr:"FECHA", horaHdr:"HORA", 
  valorArr:[activo.objeto.tarifa.nombreTarifa], factor: activo.objeto.consumoAnualREE};
  await activo.objeto.loadFromCSV(activo.objeto.ficheroCSV, opciones);

  console.log(activo.objeto.numeroRegistros);
  if (activo.objeto.numeroRegistros > 0) {
    muestraGraficosObjeto(activo.objeto);
    _tablaTipoConsumo.updateData([activo.objeto.select_tablaTipoConsumo()]);
  }
}

function cambioFuente (cell) {

  TCB.cambioTipoConsumo = true;
  activo = UTIL.setActivo(cell);
  muestraGraficosObjeto();
  
  activo.objeto.resetFuente(cell.getValue());

  const REEcell = cell.getRow().getCell('consumoAnualREE').getElement();
  const CSVcell = cell.getRow().getCell('nombreFicheroCSV').getElement();

  if (cell.getValue() === "CSV" || cell.getValue() === "DATADIS") {
    REEcell.style.backgroundColor = document.body.style.backgroundColor; //"rgb(220, 249, 233)";
    CSVcell.style.backgroundColor = "white";
    activo.objeto.nombreFicheroCSV = TCB.i18next.t("consumo_MSG_nombreCSVPorDefinir");

  } else if (cell.getValue() === "REE") {
    CSVcell.style.backgroundColor = document.body.style.backgroundColor; //"rgb(220, 249, 233)";
    REEcell.style.backgroundColor = "white";
  }
  activo.objeto.totalAnual = 0;
  _tablaTipoConsumo.updateData([activo.objeto.select_tablaTipoConsumo()]);

}
export {gestionTipoConsumo}