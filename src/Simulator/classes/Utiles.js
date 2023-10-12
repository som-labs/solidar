/**
 * @module utiles.js
 * @fileoverview Funciones varias
 * @version      Solidar.3
 * @author       José Luis García (SOM Madrid)
 * @copyright
 * 
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
*/

import TCB from './TCB.js'
import Style from 'ol/style/Style.js'
import Fill from 'ol/style/Fill.js'
import Text from 'ol/style/Text.js'

/*global bootstrap, ol*/
const campos = {
  "ahorroFincaAnual":{unidad:" €", decimales:2, "salvar":true, "mostrar":true},
// Genericos
  "energia": {"unidad":" kWh", "decimales":2, "salvar":true, "mostrar":true},
  "potencia": {"unidad": " kWp", "decimales":3, "salvar":true, "mostrar":true},
  "porciento": {"unidad":"%", "decimales":2, "salvar":true, "mostrar":true},
  "peso": {"unidad":" Kg", "decimales": 2, "salvar":true, "mostrar":true},
  "dinero": {"unidad": " €", "decimales": 0, "salvar":true, "mostrar":true},
  "superficie": {"unidad": "m²", "decimales": 2, "salvar":true, "mostrar":true},
  "precioEnergia": {"unidad": " €/kWh", "decimales": 2, "salvar":true, "mostrar":true},
  "fecha":{"unidad": "fecha", "salvar":false, "mostrar":true},
  "pdfpieDePagina":{"unidad":"fecha", decimales:"larga", "mostrar": true},

// Especificos
/* Proyecto */
"nombreProyecto":{unidad:"", salvar: true, mostrar: true},
"fechaproyecto":{unidad: "fecha", decimales:"larga", mostrar: true},
"posicionLonLat":{antes: "campoLONLAT"},

// Punto de consumo:
"lonlatPuntoConsumo":{"unidad":"", "salvar":true, "mostrar":true},
"idPuntoConsumo":{"unidad":"", "salvar":true, "mostrar":false},
"nombrePuntoConsumo": {"unidad":"", "decimales":0, "salvar":true, "mostrar":true},
"territorio":{"unidad":"","salvar":true, "mostrar":true},
"refcat":{"unidad":"", "salvar":true, "mostrar":true},
"direccion":{"unidad":"", "decimales":0, "salvar":true, "mostrar":true},
"fincasCargadas":{"unidad":"", "decimales":0, "salvar":true, "mostrar":false},

/* Fincas */
"idFinca":{"unidad":"", "salvar":true, "mostrar":false},
"nombreFinca":{"unidad":"", "salvar":true, "mostrar":true},
"bloque":{"unidad":"", "salvar":true, "mostrar":true},
"escalera":{"unidad":"", "salvar":true, "mostrar":true},
"planta":{"unidad":"", "salvar":true, "mostrar":true},
"puerta":{"unidad":"", "salvar":true, "mostrar":true},
"participacion":{unidad:"%", decimales: 2, salvar:true, mostrar:true},
"coefHucha":{unidad: "%", decimales: 0, salvar:true, "mostrar":true},
"cuotaHucha":{unidad:" €", decimales: 2, salvar:true, mostrar:true},
"coefHuchaGlobal":{unidad: "%", decimales: 2, salvar:true, "mostrar":true},
"cuotaHuchaGlobal":{unidad:" €", decimales: 2, salvar:true, mostrar:true},
"coste":{unidad:" €", decimales: 2, salvar:true, mostrar:true},

// BaseSolar:
"idBaseSolar": {"unidad":"", "decimales":0, "salvar":true, "mostrar":false},
"nombreBaseSolar": {"unidad":"", "decimales":0, "salvar":true, "mostrar":true},
"lonlatBaseSolar":{"unidad":"", "salvar":true, "mostrar":true},
"tipoBaseSolar": {"unidad":"", "decimales":0, "salvar":false, "mostrar":false},
"areaMapa": {"unidad": " m²", "decimales":2, "salvar":true, "mostrar":true, antes:"area"},
"areaReal": {"unidad": " m²", "decimales":2, "salvar":true, "mostrar":true},
"potenciaMaxima": {"unidad": " kWp", "decimales":3, "salvar":true, "mostrar":true},
"inclinacionPaneles": {"unidad":"º","decimales":2, "salvar":true, "mostrar":true},
"inclinacionTejado": {"unidad":"º","decimales":2, "salvar":true, "mostrar":true},
"acimut": {"unidad":"º","decimales":2, "salvar":true, "mostrar":true},
"inAcimut": {"unidad":"º","decimales":2, "salvar":true, "mostrar":true},
"inclinacionOptima": {"unidad": "", "salvar":true, "mostrar":true},
"angulosOptimos": {"unidad":"", "salvar":true, "mostrar":true},
"requierePVGIS": {"unidad": "", "salvar":true, "mostrar":false},

/* instalacion */
"potenciaUnitaria": {"unidad":" kWp","decimales":3, "salvar":true, "mostrar":true},
"paneles": {"unidad":"", "decimales":0, "salvar":true, "mostrar":true},
"potenciaTotal":{"unidad":" kWp", "decimales":3, "salvar":true, "mostrar":true},

/* produccion */
"produccionCreada": {"unidad": "", "salvar":false, "mostrar":false},
"pTotalAnual": {"unidad":" kWh", "decimales":2, "salvar":true, "mostrar":true},
"cnumeroDias":  {"unidad": "", "salvar":true, "mostrar":false},
"pMaximoAnual": {"unidad":" kWh", "decimales":2, "salvar":true, "mostrar":true, antes:"maximoAnual"},

/* rendimiento */
"unitarioTotal": {"unidad":" kWh", "decimales":2, "salvar":true, "mostrar":true},
"produccionTotal": {"unidad":" kWh", "decimales":2, "salvar":true, "mostrar":true},
"system_loss": {"unidad":"%", "decimales":2, "salvar":false, "mostrar":true},
"technology": {"unidad":"", "salvar":false, "mostrar":true},
"inclinacionOptimal": {"unidad":"", "salvar":false, "mostrar":true},
"acimutOptimal": {"unidad":"", "salvar":false, "mostrar":true},
"radiation_db": {"unidad":"", "decimales":0, "salvar":false, "mostrar":true},
"meteo_db": {"unidad":"", "salvar":false, "mostrar":true},
"year_min": {"unidad":"","decimales":0, "salvar":false, "mostrar":false},
"year_max": {"unidad":"","decimales":0, "salvar":false, "mostrar":false},
"rendimientoCreado": {"unidad": "", "salvar":false, "mostrar":false},
"PVGISfechaInicio":{"unidad": "fecha", "decimales":"corta", "salvar":false, "mostrar":true},
"PVGISfechaFin":{"unidad": "fecha", "decimales":"corta","salvar":false, "mostrar":true},

/* TipoConsumo */
"idTipoConsumo": {"unidad":"", "decimales":0, "salvar":true, "mostrar":false},
"nombreTipoConsumo": {"unidad":"", "decimales":0, "salvar":true, "mostrar":true},
"nombreFicheroCSV": {"unidad":"", "decimales":0, "salvar":true, "mostrar":true},
"tcMaximoAnual": {"unidad":" kWh", "decimales":2, "salvar":true, "mostrar":true, antes:"maximoAnual"},
"cTotalAnual": {"unidad":" kWh", "decimales":2, "salvar":true, "mostrar":true},
"numeroRegistros": {"unidad":"","decimales":0, "salvar":false, "mostrar":false},
"numeroDias":{"unidad":"","decimales":0, "salvar":false, "mostrar":false},
"fuente":{"unidad":"", "salvar":true, "mostrar":true},
"consumoAnualREE": {"unidad": " kWh", "decimales":2, "salvar":true, "mostrar":true},
"csvCargado":{"salvar":false, "mostrar":false},
"ficheroCSV": {"unidad": "", "salvar":false, "mostrar":false},

/* Consumo */
"cMaximoAnual": {"unidad":" kWh", "decimales":2, "salvar":true, "mostrar":true, antes:"maximoAnual"},

/* Tarifa */
"idTarifa":{"unidad":"", "salvar":true, "mostrar":false},
"nombreTarifa":{"unidad":"", "salvar":true, "mostrar":true},
"precios":{"salvar":true, "mostrar":true},
"Compensa":{"unidad":" €/kWh", "decimales":3, "salvar":true, "mostrar":true},
"P1":{"unidad":" €/kWh", "decimales":3, "salvar":true, "mostrar":true},
"P2":{"unidad":" €/kWh", "decimales":3, "salvar":true, "mostrar":true},
"P3":{"unidad":" €/kWh", "decimales":3, "salvar":true, "mostrar":true},
"P4":{"unidad":" €/kWh", "decimales":3, "salvar":true, "mostrar":true},
"P5":{"unidad":" €/kWh", "decimales":3, "salvar":true, "mostrar":true},
"P6":{"unidad":" €/kWh", "decimales":3, "salvar":true, "mostrar":true},
"horas":{"salvar":true, "mostrar":false},
"cTarifa":{"salvar":false, "mostrar":false},

/* Economico */
"ahorroAnual":{"unidad": " €", "decimales": 0, "salvar":false, "mostrar":true},
"TIRProyecto":{"unidad": "%", "decimales": 0, "salvar":false, "mostrar":true},
"VANProyecto":{"unidad": " €", "decimales": 0, "salvar":false, "mostrar":true},
"interesVAN":{"unidad": "%", "decimales": 0, "salvar":false, "mostrar":false},
"economicoCreado": {"unidad": "", "salvar":false, "mostrar":false},
"tiempoSubvencionIBI": {unidad: "", decimales:0, salvar:true, mostrar:true},
"valorSubvencionIBI": {unidad: " €", decimales:0, salvar:true, mostrar:true},
"porcientoSubvencionIBI": {unidad: "%", decimales:2, salvar:true, mostrar:true},
"tipoSubvencionEU": {"unidad": "", "salvar":true, "mostrar":true},
"valorSubvencionEU": {"unidad": "", "salvar":false, "mostrar":true},
"previo":{"unidad":" €", "decimales":2, "salvar":false, "mostrar":true},
"inversion":{"unidad":" €", "decimales":2, "salvar":false, "mostrar":true},
"ahorro":{"unidad":" €", "decimales":2, "salvar":false, "mostrar":true},
"IBI":{"unidad":" €", "decimales":2, "salvar":false, "mostrar":true},
"subvencion":{"unidad":" €", "decimales":2, "salvar":false, "mostrar":true},
"pendiente":{"unidad":" €", "decimales":2, "salvar":false, "mostrar":true},
"VAN":{"unidad":" €", "decimales":2, "salvar":false, "mostrar":true},
"TIR":{"unidad":"%", "decimales":2, "salvar":false, "mostrar":true},
"precioInstalacion":{unidad:" €", decimales:0, salvar:true, mostrar:true},
"nuevoPrecioInstalacion":{unidad:" €", decimales:0, salvar:true, mostrar:true},

/* Globales */
  "areaTotal": {"unidad": " m²", "decimales":2, "salvar":true, "mostrar":true},
  //"impuestoTotal":{"unidad": "%", "decimales": 0, "salvar":false, "mostrar":true},
  "gastoSinPlacasAnual":{"unidad": " €", "decimales": 0, "salvar":false, "mostrar":true, antes:"consumoOriginalAnual"},
  "coefConsumo":{"unidad": "%", decimales: 2, "salvar":true, "mostrar":true},
  "coefEnergia":{"unidad": "%", decimales: 2, "salvar":true, "mostrar":true},
  "coefInversion":{"unidad": "%", decimales: 2, "salvar":true, "mostrar":true},
  "gastoConPlacasAnual":{"unidad": " €", "decimales": 0, "salvar":false, "mostrar":true, antes:"consumoConPlacasAnual"}, 
  "consumoOriginalMensual":{"unidad": " €", "decimales": 0, "salvar":false, "mostrar":true},
  "consumoConPlacasMensual":{"unidad": " €", "decimales": 0, "salvar":false, "mostrar":true},
  "consumoConPlacasMensualCorregido":{"unidad": " €", "decimales": 0, "salvar":false, "mostrar":true},
  "compensadoMensual":{"unidad": " €", "decimales": 0, "salvar":false, "mostrar":true},
  "compensadoMensualCorregido":{"unidad": " €", "decimales": 0, "salvar":false, "mostrar":true},
  "ahorradoAutoconsumoMes":{"unidad": " €", "decimales": 0, "salvar":false, "mostrar":true},
  "perdidaMes":{"unidad": " €", "decimales": 0, "salvar":false, "mostrar":true},

	"fechaInicio": {"unidad":"fecha", "salvar":true, "mostrar":false},
  "horaInicio": {"unidad":"", "salvar":true, "mostrar":false},
  "horaFin": {"unidad":"", "salvar":true, "mostrar":false},
	"fechaFin": {"unidad":"fecha", "salvar":true, "mostrar":false},
	"inclinacion": {"unidad":"º", "decimales":2, "salvar":true, "mostrar":true},
  "lon":{"unidad":"", "decimales":2, "salvar":true, "mostrar":true},
  "lat":{"unidad":"", "decimales":2, "salvar":true, "mostrar":true},

}

const nombreMes = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic"
];
const nombreMesLargo = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];
//indiceDia es utilizado para convertir una fecha de un año cualquiera en un indice dia entre 0 y 364
export const indiceDia = [
  [0, 0, 30],
  [1, 31, 58],
  [2, 59, 89],
  [3, 90, 119],
  [4, 120, 150],
  [5, 151, 180],
  [6, 181, 211],
  [7, 212, 242],
  [8, 243, 272],
  [9, 273, 303],
  [10, 304, 333],
  [11, 334, 364],
];

/** Devuelve el valor de la variable en los argumentos de entrada de la URL
 * @memberof UTIL
 * @param {String} variable Nombre de la variable que buscamos en los argumentos de entrada
 * @returns {Boolean|String}  false si la variable no está en la entrada o el valor de la misma si está
 */
function getParametrosEntrada(variable) {
  const argumentos = window.location.search;
  const urlParametros = new URLSearchParams(argumentos); 
  if (urlParametros.has(variable)) {
    return urlParametros.get(variable);
  } else {
    return false;
  }
}
/** Envia mensaje a la consola del desarrollador si se ha activado el debug en la url de llamada con el argumento debug=1.
 * Si el argumento objeto no es nulo se vuelca su contenido en la consola
 * @param {String} mensaje 
 * @param {Object} objeto 
 */
function debugLog(mensaje, objeto) {
  if (TCB.debug !== false) {
    console.log(mensaje);
    if (objeto !== undefined && typeof objeto === "object") {
      console.dir(objeto);
    }
  }
}

function cambioValor ( cell, cambiaLabel ) {

  const nombreTablaActiva = cell.getTable().element.id;
  const propiedadCambiada = cell.getField();
  var instanciaCambiada;

  let [tablaActiva, subTabla, subId] = nombreTablaActiva.split(".");

  if (subTabla === undefined) {
    let _id = "id"+nombreTablaActiva;
    instanciaCambiada = TCB[tablaActiva].find( obj => obj[_id] === cell.getRow().getData()[_id]);
    instanciaCambiada[propiedadCambiada] = cell.getValue();
  } else {
    instanciaCambiada = TCB[tablaActiva].find( obj => obj.id === parseInt(subId));
    instanciaCambiada[subTabla][propiedadCambiada] = cell.getValue();
  }
  if (cambiaLabel) {
    setLabel( instanciaCambiada.geometria.label, instanciaCambiada[propiedadCambiada] ,[255, 255, 255, 1], [168, 50, 153, 0.6] );
  }
}

function distancia(p0, p1) {
  const deltaX = p1[0] - p0[0];
  const deltaY = p1[1] - p0[1];
  return ( Math.sqrt(deltaX*deltaX + deltaY*deltaY));
}

/** Completa el estilo y texto a asignar a un label en el mapa
 * @memberof Utiles.js
 * @param {*} feature es el ol.feature (un punto) al que se asignará el label. El objeto en cuestion tiene un ID del tipo objeto.componente.id 
 * @param {*} texto a poner en el label
 * @param {*} colorArray color del texto
 * @param {*} bgcolorArray color del background del label
 * 
 */
async function setLabel ( feature, texto, colorArray, bgcolorArray) {

  //Identificamos el objeto de que se trata a partir del ID del feature recibido
  const componente = feature.getId().split('.');
  const nombreObjeto = componente[0];
  //Definimos la justificación del texto segun el objeto
  let posicionTexto = "center"
  switch (nombreObjeto) {
    case "AreaSolar":
      posicionTexto = "center";
      break;
    case "PuntoConsumo":
      posicionTexto = "start";
      break;
  }
  //Construimos el style
  var Slabel = new Style({
    text: new Text({
      font: '16px sans-serif',
      textAlign: posicionTexto,
      text: texto,
      fill: new Fill({ color: colorArray}),
      backgroundFill: new Fill({ color: bgcolorArray}),
      padding: [2, 2, 2, 2],
    })
  })
  //lo asignamos al feature recibido
  feature.setStyle(Slabel);
  return Slabel
}

/**
 * @typedef {Object} activo
 * @property {Tabulator.Table} tabla Tabla de Tabulator
 * @property {string} nombreTabla nombre de la tabla
 * @property {string} celda 
 * @property {Tabulator.row} fila
 * @property {string} id
 * @property {object} objeto
 */
/**
 * @memberof! Utiles.js
 * @param {Tabulator.cell} cell 
 * @returns {object} activo
 */
function setActivo(cell) {
  // Sinonimos almacena la relacion entre id de la tabla en index y objeto que almacena
  let sinonimos = {
    'TipoConsumo':'TipoConsumo',
    'PuntoConsumo':'PuntoConsumo',
    'BaseSolar':'BaseSolar',
    'Finca':'Finca',
    'BasesAsignadas':'BaseSolar'
  }

  const tipoObjetoBuscado = sinonimos[cell.getTable().element.id];
  let _activo = {
    'tabla': cell.getTable(),  
    'nombreTabla': tipoObjetoBuscado,
    'celda': cell.getField(),
    "fila": cell.getRow().getData()
  };
  //El campo unico (id) de cada objeto es id<nombre objeto>
  const _id = "id" + _activo.nombreTabla;
  _activo.id = _activo.fila[_id];
  _activo.objeto = TCB[tipoObjetoBuscado].find( obj => obj[_id] === _activo.id);
  return _activo;
}



function mete(unDia, idxTable, outTable) {

  var indiceDia = indiceDesdeDiaMes(unDia.dia, unDia.mes);
  for (let hora = 0; hora < 24; hora++) {
    if (idxTable[indiceDia].previos > 0) {
      //Implica que ya habia registros previos para ese dia
      unDia.valores[hora] =
        (outTable[indiceDia][hora] * idxTable[indiceDia].previos +
          unDia.valores[hora]) /
        (idxTable[indiceDia].previos + 1);
    }
    outTable[indiceDia][hora] = unDia.valores[hora];
  }
  idxTable[indiceDia].previos = idxTable[indiceDia].previos + 1;
  idxTable[indiceDia].dia = unDia.dia;
  idxTable[indiceDia].mes = unDia.mes;
  idxTable[indiceDia].suma = suma(unDia.valores);
  idxTable[indiceDia].maximo = Math.max(...unDia.valores);
}

async function getFileFromUrl(url, type) {
  const response = await fetch(url);
  const data = await response.blob();
  const metadata = { type: type || "text/csv" };
  return new File([data], metadata);
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
  debugLog("Cabecera CSV:", headers);

  // la diferencia entre los ficheros de Naturgy y de Iberdrola es que
  // la cuarta columna donde esta el consumo se llama Consumo en Naturgy y Consumo_kWh en Iberdrola y VIESGO y AE_kWh en ENDESA.
  // unificamos en "Consumo"
  if (headers[3] == "Consumo_kWh") headers[3] = "Consumo";
  if (headers[3] == "AE_kWh") headers[3] = "Consumo";

  let chk_consumo = false;
  let chk_fecha = false;
  let chk_hora = false;
  headers.forEach ( hdr => {
    if (hdr === "Consumo" || hdr === "2.0TD" || hdr === "3.0TD") chk_consumo = true;
    if (hdr === "Fecha") chk_fecha = true;
    if (hdr === "Hora") chk_hora = true;
  })
  if (! (chk_consumo && chk_fecha && chk_hora)) {
    let failHdr = "";
    if (!chk_consumo) failHdr += "Consumo "; 
    if (!chk_fecha) failHdr += "Fecha ";
    if (!chk_hora) failHdr += "Hora ";
    alert (TCB.i18next.t("consumo_MSG_errorCabeceras", {cabeceras: failHdr}));
    return [];
  }
  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");
  let arr = [];
  rows.forEach( (row) => {
    if(row.length > 1) {
      const values = row.split(delimiter);
      const el = headers.reduce(function (object, header, index) {
        object[header] = values[index];
        return object;
      }, {});
      arr.push(el);
    }
  })

  // return the array
  return arr;
}

function promedio(arr) {
  return arr.reduce((a, b) => a + b) / arr.length;
}

function suma(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

// Funciones de gestion de indice de dias -------------------------------------------------------------------
function difDays(inicio, fin) {
  let diferencia = fin.getTime() - inicio.getTime();
  return Math.ceil(diferencia / (1000 * 3600 * 24));
}

function indiceDesdeFecha(fecha) {
  var dia = fecha.getDate();
  var mes = fecha.getMonth();
  return indiceDia[mes][1] + dia - 1;
}

function indiceDesdeDiaMes(dia, mes) {
  return indiceDia[mes][1] + dia - 1;
}

function fechaDesdeIndice(indice) {
  for (let i = 0; i < 12; i++) {
    if (indiceDia[i][2] >= indice) {
      let mes = i;
      let dia = indice - indiceDia[mes][1] + 1;
      return [dia, mes];
    }
  }
}

function dumpData(nombre, idxTable, dataTable) {
  // Loop the array of objects
  var csv;
  for (let row = 0; row < idxTable.length; row++) {
    let keysAmount = Object.keys(idxTable[row]).length;
    let keysCounter = 0;

    // If this is the first row, generate the headings
    if (row === 0) {
      // Loop each property of the object
      for (let key in idxTable[row]) {
        // This is to not add a comma at the last cell
        // The '\n' adds a new line
        csv += key + (keysCounter + 1 < keysAmount ? ";" : "");
        keysCounter++;
      }
      for (let i = 0; i < 24; i++) {
        csv += ";" + i;
      }
      csv += "\r\n";
    }
    keysCounter = 0;
    for (let key in idxTable[row]) {
      csv += idxTable[row][key] + (keysCounter + 1 < keysAmount ? ";" : "");
      keysCounter++;
    }
    for (let i = 0; i < 24; i++) {
      csv += ";" + dataTable[row][i];
    }
    csv += "\r\n";
  }

  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(csv)
  );
  element.setAttribute("download", nombre);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/** Genera los strings formateados de todos los campos de la aplicación
 * @memberof! Utiles.js
 * @param {string} campo 
 * @param {any} valor 
 * @returns {string} valor formateado segun definición de UTIL.campos
 */
function formatoValor( campo, valor) {

  if (valor === undefined) return undefined;

   const dato = campos[campo];
/*      console.log(dato); 
  console.log(campo + "->" + valor);  */
  if (dato === undefined || valor === "") return valor;

  if (typeof valor === 'boolean') return TCB.i18next.t("valor_"+valor);
  if (dato.unidad === 'º') { //Se debe tener en cuanta que algunos campos de angulos para PVGIS pueden tener el valor Optimo por lo que no se añade º
      if (valor === 'Optimo') return TCB.i18next.t("valorOptimo_LBL");
  }
  if (dato.unidad === 'fecha') {
    const tvalor = typeof valor === 'string' ? new Date(valor) : valor;
    let options;
    if (dato.decimales === "larga") {
      options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
      };
    } else {
      options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }
    }
    return (tvalor.toLocaleDateString(TCB.i18next.language, options));
  }

  if (dato.decimales !== undefined) {
    /*Segun la definición ISO (https://st.unicode.org/cldr-apps/v#/es/Symbols/70ef5e0c9d323e01) los numeros en 'es' no llevan '.' si no hay mas de dos digitos delante del '.' Minimum Grouping Digits = 2. Como no estoy de acuerdo con este criterio en el caso de 'es' lo cambio a 'ca' que funciona bien */
    let lng = TCB.i18next.language.substring(0,2) === 'es' ? 'ca' : TCB.i18next.language.substring(0,2);
    return valor.toLocaleString(lng, {maximumFractionDigits: dato.decimales, minimumFractionDigits: dato.decimales}) + dato.unidad;
  } else {
    return valor.toLocaleString() + dato.unidad;
  }
}
/** formatoValor desde una celda de Tabulator
 * Esta definida como extensiónd e Tabulator -> Tabulator.extendModule en inicializaAplicacion
 * @memberof! Utiles.js
 * @param {Tabulator.cell} cell 
 * @param {String} campo Nombre del campo donde proviene el valor. Campos definirá el formato definitivo en decimales y unidades
 * @returns {String} Valor del campo formateado
 */
function n_formatoValor( cell, campo) {

  if (campo === undefined) campo = cell.getField();
  const valor = cell.getValue();
  return formatoValor( campo, valor);

}
/* Función para mostrar el formulario modal de propiedades de un objeto generico
@param: objeto -> es el objeto del que se mostrará todas las propiedades que devuelve getOwnPropertyDescriptors en la función
                obtenerPropiedades. La llamada es recursiva, si una propiedad es un objeto se mostrarán la propiedades de ese
                objeto tambien.
@param: descripcion -> titulo del <body> del formulario modal
 */
var modalWrap = null;
function formularioAtributos (objeto, descripcion) { //}, yesBtnLabel = 'Yes', noBtnLabel = 'Cancel', callback) {
  if (modalWrap !== null) {
    modalWrap.remove();
  }
  const vectorPropiedades = obtenerPropiedades(objeto, 0);
  modalWrap = document.createElement('div');
  let tmpHTML = `<div class="modal fade" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title">` + TCB.i18next.t("resultados_LBL_tituloPropiedades") + `</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>` + descripcion + `</p>
            <table id="tablaPropiedades" class="table table-sm table-striped table-bordered text-end center">`

            for (let obj in vectorPropiedades) {
              tmpHTML += "<tr class='table-info text-center'><td colspan=2>" + TCB.i18next.t("objeto_"+obj) + "</td><tr>";
              for (let prop of vectorPropiedades[obj]) {
                if (prop.valor === undefined) prop.valor = "Indefinido";
                if (campos[prop.nombre] !== undefined && campos[prop.nombre].mostrar) {
                    tmpHTML += "<tr><td class='text-start'>" + TCB.i18next.t(prop.nombre + "_LBL") + 
                    "</td><td class='text-end'>" +  formatoValor(prop.nombre, prop.valor) + "</td></tr>";
                }
              }
            }
    tmpHTML += 
            `</table>
          </div>
        </div>
      </div>
    </div>
  `;

  modalWrap.innerHTML = tmpHTML;
  //modalWrap.querySelector('.modal-success-btn').onclick = callback;
  document.body.append(modalWrap);
  var modal = new bootstrap.Modal(modalWrap.querySelector('.modal'));
  modal.show();
}
/** funcion para convertir el los objetos Solidar del repositorio en una tabla
 * TCB.XXXX[] -> [objeto, propiedad: [valores de propiedad en cada XXX]]
 * Es necesaria para el reporte PDF
 *
 * @param {Object} tabla 
 * @returns {Array}
 */
function swapTabla ( tabla) {
  let tTabla = {};
  for(let k=0; k<tabla.length; k++) {
    //Si estamos procesando el TipoConsumo que representa el consumo Global lo ignoramos
    if (tabla[k].constructor.name === "TipoConsumo" && tabla[k].nombreTipoConsumo === 'Global') {
      continue;
    }

    const propiedades = obtenerPropiedades ( tabla[k], 0);
    for (let obj in propiedades) {
      // Si el objeto no ha sido creado en tTabla lo creamos
      if (tTabla[obj] === undefined) {
        Object.defineProperty(tTabla, obj, {value: {}, enumerable : true});
      }

      // La tarifa tiene un proceso especial porque obtenerPropiedades no lo devuelve
      if (obj === 'Tarifa') {
        let listaPrecios = tabla[k].tarifa.getTarifa();
        for (let precio in listaPrecios) {
          if (tTabla[obj][precio] === undefined) {
            Object.defineProperty(tTabla[obj], precio, {value: [formatoValor(precio,listaPrecios[precio])], 
              enumerable : true});
          } else {
            tTabla[obj][precio].push(formatoValor(precio,listaPrecios[precio]));
          }
        }
      } else {
        for (let prop of propiedades[obj]) {
          if (campos[prop.nombre] !== undefined && campos[prop.nombre].mostrar) {
            if (tTabla[obj][prop.nombre] === undefined) {
              Object.defineProperty(tTabla[obj], prop.nombre, {value: [formatoValor(prop.nombre,prop.valor)], enumerable : true});
            } else {
              tTabla[obj][prop.nombre].push(formatoValor(prop.nombre,prop.valor));
            }
          }
        }
      }
    }  
  }
  return tTabla;
}
/** Es lo mismo que swapTabla pero cuando el objeto Solidar no es un Array.
 * TCB.XXXX -> [objeto, propiedad: [valor de propiedad]]
 * Es para el reporte PDF de los objetos globales
 * 
 * @memberof! Utiles.js
 * @param {*} tabla 
 */
function swapObjeto ( objeto) {

  let tTabla = {};
  const propiedades = obtenerPropiedades(objeto, 0);
  for (let obj in propiedades) { //Es posible que el objeto recibido pueda tener objetos anidados
    Object.defineProperty(tTabla, obj, {value: {}, enumerable : true});
    for (let prop of propiedades[obj]) {
      if (campos[prop.nombre] !== undefined && campos[prop.nombre].mostrar) {
        Object.defineProperty(tTabla[obj], prop.nombre, {value: [formatoValor(prop.nombre,prop.valor)], enumerable : true});
      }
    }
  }
  return tTabla;
}
/**
 * @typedef {object} propiedad
 * @property {String} nombre Nombre de la propiedad
 * @property {String} valor Valor de la propiedad
 */
/**
 * @typedef {object} propiedades
 * @property {String} nombreObjeto
 * @property {Array<propiedad>} propiedades 
 */
var prop_val;
/** Función recursiva para obtener los valores de las propiedades de un objeto excluyendo el campo geometria.
 * El objeto base tiene nivel 0, si es objeto propiedad de otro objeto el nivel es 1
 * 
 * @param {object} objeto 
 * @param {integer} nivel 
 * @returns {propiedades} 
 */

function obtenerPropiedades ( objeto, nivel) {
  if (objeto === undefined || objeto === null || objeto instanceof File) return;
  if (nivel == 0 ) prop_val = {};
const propiedades = Object.getOwnPropertyDescriptors(objeto);

  let actobj = objeto.constructor.name;
  prop_val[actobj] = prop_val[actobj] ?? [];

  for (let prop in propiedades) {
    if (!Array.isArray(objeto[prop])) {
      let tipoPropiedad = typeof objeto[prop];
      if (tipoPropiedad === 'object') {
        if (objeto[prop] instanceof Date) {
            //prop_val[actobj].push({'nombre': prop, 'valor': objeto[prop].toLocaleDateString() });
            prop_val[actobj].push({'nombre': prop, 'valor': objeto[prop]});
        } else {
          if (prop !== "geometria") {
            let actobj = objeto.constructor.name;
            prop_val[actobj].push({'nombre': prop, 'valor': "Objeto" });
            obtenerPropiedades( objeto[prop], 1);
          }
        }
      } else {
        prop_val[actobj].push({'nombre': prop, 'valor': objeto[prop] });
      }
    } else {
      // hay que ver como hacemos con el precio de Tarifa que es un array
    }
  }
  return prop_val;
}

/** Devuelve el número recibido con solo dos decimales
 * 
 * @param {Number} numero EL número a redondear
 * @returns {Number} El valor del argumento numero a dos decimales
 */
function round2Decimales(numero) {
  return +(Math.round(numero + "e+2")  + "e-2");
}

/** Nuestra el texto en el campo cuyo id es campo
 * 
 * @param {string} campo Identificacion del nodo del DOM donde mostrar el texto
 * @param {string} texto Identificacion i18n del mensaje a mostrar
 */
function mensaje (campo, texto) {

  let nodoCampo = document.getElementById( campo);
  nodoCampo.innerHTML = TCB.i18next.t(texto);
  nodoCampo.setAttribute("data-i18n", texto);
}

function muestraAtributos (cell ) { //tipo, id, evento) {
  /*     const filaActiva = evento.target.parentNode.parentNode.parentNode;
      const id = filaActiva.cells[0].outerText; */
  const activo = setActivo(cell);
  formularioAtributos(activo.objeto, TCB.i18next.t("resultados_LBL_basePropiedades", {'id': activo.id}));
}

/** Funcion para mostrar resultados
 * 
 * @param {string} donde campo donde se muestra el valor
 * @param {any} valor a mostrar
 */
function muestra(donde, valor) {
  let _campo = document.getElementById(donde);
  if (_campo.type === 'number' || _campo.type === 'text'){
    _campo.setAttribute('type','');
    _campo.setAttribute('value', valor);
  } else {
    _campo.innerHTML = valor;
  }
}

//Hay que analizar porque no funcionan estas opciones
//async function copyClipboard(text) {

/*   navigator.clipboard.writeText("TEXT_TO_BE_COPIED")
         .then(() => alert("Copied")) */

/*   if (navigator && navigator.clipboard && navigator.clipboard.writeText)
  return navigator.clipboard.writeText(text);
  return Promise.reject('The Clipboard API is not available.');  */
//}

function selectTCB (tabla, campo, valor) {
let recordSet = [];
  for (let i=0; i<TCB[tabla].length; i++) {
    if (TCB[tabla][i][campo] === valor) {
      recordSet.push(i);
    }
  }
  return recordSet;
}

function hdrToolTip (e, col) {
  //e - mouseover event
  //cell - cell component
  //onRendered - onRendered callback registration function
  
  var el = document.createElement("div");
  el.style.backgroundColor = "black";
  el.style.color = "white";
  el.style.fontSize = "medium";
  el.innerText = TCB.i18next.t(col.getField()+"_TT"); //getDefinition().title);
  return el; 
}
async function cargaTarifasDesdeSOM() {
  const urlSOMTarifas =  "./proxy SOM.php?nombre=";
  debugLog("Tarifas leidas desde SOM:" + urlSOMTarifas);
  let _url;
  let respuesta;
  let txtTarifas;
  try {
    _url = urlSOMTarifas + '2.0TD';
    respuesta = await fetch(_url);
    if (respuesta.status === 200) {
      txtTarifas = await respuesta.text();
      TCB.tarifas['2.0TD'].precios = txtTarifas.split(",");
    }
    console.log(txtTarifas);
    _url = urlSOMTarifas + '3.0TD';
    respuesta = await fetch(_url);
    if (respuesta.status === 200) {
      txtTarifas = await respuesta.text();
      TCB.tarifas['3.0TD-Peninsula'].precios = txtTarifas.split(",");
      TCB.tarifas['3.0TD-Ceuta'].precios = txtTarifas.split(",");
      TCB.tarifas['3.0TD-Melilla'].precios = txtTarifas.split(",");
      TCB.tarifas['3.0TD-Islas Baleares'].precios = txtTarifas.split(",");
      TCB.tarifas['3.0TD-Canarias'].precios = txtTarifas.split(",");
    }
    console.log(txtTarifas);
    return true;
  } catch (err) {
    alert("Error leyendo tarifas desde SOM Energia" + err.message + "<br>Seguimos con fichero de Solidar");
    return false;
  }
}

function preparaInput( campo, changeFunction, datoOrigen) {
 
  let t = document.getElementById(campo);
  //Guardamos el valor original en el atributo dato-origen del campo
  t.setAttribute('dato-origen', datoOrigen);
  /* 
  La definicion del formato numero en español no es correcta para el separador de miles menos que 9999 por lo que cambiamos a catalan
  */
  let lng = TCB.i18next.language.substring(0,2) === 'es' ? 'ca' : TCB.i18next.language.substring(0,2);
  t.setAttribute("lng", lng);

  t.addEventListener("change", (e) => changeFunction( e));
  
  t.addEventListener("focus", (e) => {
    console.log("get focus en "+ t.id + " para valor anterior " + t.getAttribute('dato-origen'));
    e.target.value = t.getAttribute('dato-origen');
    e.target.type = 'number'; 
  })
  t.addEventListener("focusout", (e) => {
    console.log("salgo de "+t.id+" con valor "+ e.target.value);
    t.setAttribute('dato-origen', e.target.value);
    e.target.type='';
    e.target.value= formatoValor(campo, e.target.value);
    console.log("mostrado como "+ e.target.value);
  })

}
export {
  cambioValor,
    //copyClipboard,
  csvToArray,
  debugLog,
  difDays,
  distancia,
  dumpData,
  fechaDesdeIndice,
  formatoValor,
  formularioAtributos,
  getFileFromUrl,
  getParametrosEntrada,
  hdrToolTip,
  indiceDesdeDiaMes,
  indiceDesdeFecha,
  mensaje,
  mete,
  muestra,
  muestraAtributos,
  n_formatoValor,
  nombreMes,
  nombreMesLargo,
  obtenerPropiedades,
  promedio,
  round2Decimales,
  selectTCB,
  setActivo,
  setLabel,
  suma,
  swapTabla,
  swapObjeto,
  campos
};
window.dumpData = dumpData;