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
    let tTC = new TipoConsumo( importTC);

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

  document.getElementById('csvResumen').innerHTML ="";

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
  const lista =  activo.objeto.tarifa.getTarifa ()
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
      formatter:grafIcon, width:40, headerSort:false, cellClick: (evt, cell) => muestraGraficosFila(cell)},
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

/**
 * Gestiona el cambio de nombre del TipoConsumo teniendo en cuenta que la relacion entre Finca y TipoConsumo se basa en el nombre de éste.
 * @param {Tabulator.cell} cell Identificación del TipoConsumo que estamos cambiando
 */
function cambioNombreTipoConsumo (cell) {

  const activo = UTIL.setActivo(cell);
  activo.objeto.nombreTipoConsumo = cell.getValue();
  //Buscamos las fincas que tuvieran este TipoConsumo asociado y les cambiamos el nombre
  for (let finca of TCB.Finca) {
    if (finca.nombreTipoConsumo === cell.getOldValue()) finca.nombreTipoConsumo = cell.getValue();
  }
  document.getElementById("csvResumen").innerHTML = TCB.i18next.t("tipoConsumoDefault_MSG");
  
}

function cambioPrecioTarifa (evt, tipoConsumo) {
  let idx;
  if (evt.id === 'Compensa') idx = 0;
  else idx = evt.id[1];
  tipoConsumo.tarifa.precios[idx] = parseFloat(evt.value);
}

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
      const _idx = TCB.Finca.findIndex( (finca) => {return finca.nombreTipoConsumo === activo.objeto.nombreTipoConsumo});
      if (_idx < 0) { //Ninguna finca tiene este Tipode  consumo asociado
        TCB.TipoConsumo.splice(idxTipoConsumo, 1);
        cell.getRow().delete();
      } else {
        alert ("Hay fincas con este tipo de consumo");
      }
  }
  document.getElementById("csvResumen").innerHTML = TCB.i18next.t("tipoConsumoDefault_MSG");
  document.getElementById('graf_resumenConsumo').style.display = "none";
  document.getElementById("graf_perfilDia").style.display = "none";
}

function muestraGraficosFila(cell) {

  const activo = UTIL.setActivo(cell);
  muestraGraficosObjeto (activo.objeto);

}

function muestraGraficosObjeto (objeto) {
  if (objeto !== undefined) {
    let consumoMsg = TCB.i18next.t('consumo_MSG_resumen', {registros: objeto.numeroRegistros, 
      desde: objeto.fechaInicio.toLocaleDateString(),
      hasta: objeto.fechaFin.toLocaleDateString()});
    document.getElementById("csvResumen").innerHTML = consumoMsg;

    document.getElementById('graf_resumenConsumo').style.display = "block";
    document.getElementById('graf_perfilDia').style.display = "block";
    document.getElementById('graf_res').style.display = "block";

    TCB.graficos.gestionTipoConsumo_MapaConsumo(objeto, "graf_resumenConsumo", "graf_perfilDia");
    TCB.graficos.gestionTipoConsumo_MapaMesHora(objeto, "graf_res");

  } else {
    document.getElementById("csvResumen").innerHTML = TCB.i18next.t("tipoConsumoDefault_MSG");
    document.getElementById('graf_resumenConsumo').style.display = "none";
    document.getElementById('graf_perfilDia').style.display = "none";
    document.getElementById('graf_res').style.display = "none";
  }
}

async function creaNuevoTipoConsumoDefault(){
  TCB.requiereOptimizador = true;
  TCB.cambioTipoConsumo = true;
  let nuevoTipoConsumo = {};
  document.getElementById("csvResumen").innerHTML = TCB.i18next.t("tipoConsumoDefault_MSG");
  nuevoTipoConsumo.idTipoConsumo = TCB.featIdUnico++;
  nuevoTipoConsumo.nombreTipoConsumo = "TCons " + nuevoTipoConsumo.idTipoConsumo;
  nuevoTipoConsumo.fuente = "CSV";
  nuevoTipoConsumo.consumoAnualREE = "";
  nuevoTipoConsumo.ficheroCSV = null;
  nuevoTipoConsumo.nombreFicheroCSV = TCB.i18next.t("consumo_MSG_nombreCSVPorDefinir");
  nuevoTipoConsumo.nombreTarifa = "2.0TD";
  nuevoTipoConsumo.territorio = TCB.territorio;

  let idxTC = TCB.TipoConsumo.push( new TipoConsumo(nuevoTipoConsumo));
  TCB.TipoConsumo[idxTC-1].tarifa = new Tarifa(nuevoTipoConsumo.nombreTarifa, nuevoTipoConsumo.territorio);
  nuevoTipoConsumo.cTotalAnual = TCB.TipoConsumo[idxTC-1].cTotalAnual;
  document.getElementById('graf_resumenConsumo').style.display = "none";
  document.getElementById('graf_perfilDia').style.display = "none";
  document.getElementById('graf_res').style.display = "none";

  _tablaTipoConsumo.addRow(nuevoTipoConsumo, false)
  .then(function(row) {
    //const tipoCell = row.getCell('fuente').getElement();
    row.getCell('fuente').getElement().style.backgroundColor = "white"; 
    row.getCell('botonSeleccionFichero').getElement().style.backgroundColor = document.body.style.backgroundColor;
    const REEcell = row.getCell('consumoAnualREE').getElement();
    REEcell.style.backgroundColor = document.body.style.backgroundColor;
    const CSVcell = row.getCell('nombreFicheroCSV').getElement();
    CSVcell.style.backgroundColor = document.body.style.backgroundColor;
    CSVcell.innerHTML = TCB.i18next.t("consumo_MSG_nombreCSVPorDefinir");
  })
  return nuevoTipoConsumo;
}

async function getFile(cell) { 
  const activo = UTIL.setActivo(cell);
  if (activo.fila.fuente === "REE") return;
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = () => {
      UTIL.debugLog("Cargando consumos desde: "+ input.files[0].name);
      TCB.requiereOptimizador = true;
      let objTipoConsumo = TCB.TipoConsumo.find( tipo => tipo.idTipoConsumo === cell.getRow().getData().idTipoConsumo);
      objTipoConsumo.nombreFicheroCSV = input.files[0].name;
      if (cargaCSV (objTipoConsumo, input.files[0], activo.fila.fuente)) {
        activo.fila.nombreFicheroCSV = input.files[0].name;
        activo.objeto.nombreFicheroCSV = input.files[0].name;
      } else {
        activo.fila.nombreFicheroCSV = TCB.i18next.t("consumo_MSG_nombreCSVPorDefinir");
      }
    };
  input.click();
}

async function cambioTarifa (cell) {
  TCB.requiereOptimizador = true;
  TCB.cambioTipoConsumo = true;
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

    let consumoMsg = TCB.i18next.t('consumo_MSG_resumen', {registros: activo.objeto.numeroRegistros, 
      desde: activo.objeto.fechaInicio.toLocaleDateString(),
      hasta: activo.objeto.fechaFin.toLocaleDateString()});
    document.getElementById("csvResumen").innerHTML = consumoMsg;
    TCB.graficos.gestionTipoConsumo_MapaConsumo(activo.objeto, "graf_resumenConsumo", "graf_perfilDia");
    document.getElementById('graf_resumenConsumo').style.display = "block";
    document.getElementById("graf_perfilDia").style.display = "block";
  }

  return activo.objeto.tarifa.nombreTarifa;
}

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
    let consumoMsg = TCB.i18next.t('consumo_MSG_resumen', {registros: objTipoConsumo.numeroRegistros, 
                              desde: objTipoConsumo.fechaInicio.toLocaleDateString(),
                              hasta: objTipoConsumo.fechaFin.toLocaleDateString()});
    document.getElementById("csvResumen").innerHTML = consumoMsg;

    _tablaTipoConsumo.updateData([objTipoConsumo.select_tablaTipoConsumo()]);
    muestraGraficosObjeto(objTipoConsumo);
/*     document.getElementById('graf_resumenConsumo').style.display = "block";
    document.getElementById("graf_perfilDia").style.display = "block";
    document.getElementById('graf_res').style.display = "block";
    TCB.graficos.gestionTipoConsumo_MapaMesHora( objTipoConsumo, "graf_res");
    TCB.graficos.gestionTipoConsumo_MapaConsumo(objTipoConsumo, "graf_resumenConsumo", "graf_perfilDia"); */
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
  valorArr:[activo.objeto.tarifa.nombreTarifa], factor: activo.objeto.consumoAnualREE };
  await activo.objeto.loadFromCSV(activo.objeto.ficheroCSV, opciones);

  console.log(activo.objeto.numeroRegistros);
  if (activo.objeto.numeroRegistros > 0) {
/*     let consumoMsg = TCB.i18next.t('consumo_MSG_resumen', {registros: activo.objeto.numeroRegistros, 
                              desde: activo.objeto.fechaInicio.toLocaleDateString(),
                              hasta: activo.objeto.fechaFin.toLocaleDateString()});
    document.getElementById("csvResumen").innerHTML = consumoMsg;

    document.getElementById('graf_resumenConsumo').style.display = "block";
    document.getElementById("graf_perfilDia").style.display = "block";
    document.getElementById('graf_res').style.display = "block";
    TCB.graficos.gestionTipoConsumo_MapaConsumo(activo.objeto, "graf_resumenConsumo", "graf_perfilDia");
    TCB.graficos.gestionTipoConsumo_MapaMesHora( activo.objeto, "graf_res"); */
    muestraGraficosObjeto(activo.objeto);
    _tablaTipoConsumo.updateData([activo.objeto.select_tablaTipoConsumo()]);
  }
}

function cambioFuente (cell) {

  TCB.cambioTipoConsumo = true;
  activo = UTIL.setActivo(cell);

/*   document.getElementById("csvResumen").innerHTML = TCB.i18next.t("tipoConsumoDefault_MSG");
  document.getElementById('graf_resumenConsumo').style.display = "none";
  document.getElementById("graf_perfilDia").style.display = "none";
  document.getElementById('graf_res').style.display = "none"; */
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