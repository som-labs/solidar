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

import TCB from './TCB'
import { Style, Fill, Text } from 'ol/style'
import Papa from 'papaparse'

const campos = {
  ahorroFincaAnual: { unidad: ' €', decimales: 2, salvar: true, mostrar: true },
  // Genericos
  energia: { unidad: ' kWh', decimales: 0, salvar: true, mostrar: true },
  potencia: { unidad: ' kWp', decimales: 0, salvar: true, mostrar: true },
  potenciaWp: { unidad: ' Wp', decimales: 0, salvar: true, mostrar: true },
  porciento: { unidad: '%', decimales: 0, salvar: true, mostrar: true },
  peso: { unidad: ' Kg', decimales: 2, salvar: true, mostrar: true },
  dinero: { unidad: ' €', decimales: 0, salvar: true, mostrar: true },
  superficie: { unidad: 'm²', decimales: 2, salvar: true, mostrar: true },
  longitud: { unidad: 'm', decimales: 2, salvar: true, mostrar: true },
  precioEnergia: { unidad: ' €/kWh', decimales: 3, salvar: true, mostrar: true },
  fecha: { unidad: 'fecha', salvar: false, mostrar: true },
  pdfpieDePagina: { unidad: 'fecha', decimales: 'larga', mostrar: true },

  maximoAnual: {
    unidad: ' kWh',
    decimales: 2,
    salvar: true,
    mostrar: false,
  },
  totalAnual: { unidad: ' kWh', decimales: 0, salvar: true, mostrar: true },
  // Especificos
  /* Proyecto */
  nombreProyecto: { unidad: '', salvar: true, mostrar: true },
  fechaproyecto: { unidad: 'fecha', decimales: 'larga', mostrar: true },
  posicionLonLat: { antes: 'campoLONLAT' },

  // BaseSolar:
  idBaseSolar: { unidad: '', decimales: 0, salvar: true, mostrar: false, order: 1 },
  nombreBaseSolar: { unidad: '', decimales: 0, salvar: true, mostrar: false, order: 2 },
  lonlatBaseSolar: { unidad: '', salvar: true, mostrar: true, order: 3 },
  roofType: { unidad: '', salvar: true, mostrar: true, order: 4 },
  cumbrera: { unidad: 'm', decimales: 1, salvar: true, mostrar: true, order: 5 },
  ancho: { unidad: 'm', decimales: 1, salvar: true, mostrar: false, order: 5 },
  columnas: { unidad: '', decimales: 0, salvar: true, mostrar: true, order: 6 },
  anchoReal: { unidad: 'm', decimales: 1, salvar: true, mostrar: true, order: 7 },
  filas: { unidad: '', decimales: 0, salvar: true, mostrar: true, order: 8 },
  panelesMaximo: { unidad: '', decimales: 0, salvar: true, mostrar: true, order: 9 },
  tipoBaseSolar: { unidad: '', decimales: 0, salvar: false, mostrar: false },
  areaReal: { unidad: ' m²', decimales: 0, salvar: true, mostrar: true, order: 10 },
  area: { unidad: ' m²', decimales: 0, salvar: true, mostrar: false },
  acimut: { unidad: 'º', decimales: 2, salvar: true, mostrar: true, order: 11 },
  inAcimut: { unidad: 'º', decimales: 2, salvar: true, mostrar: true, order: 12 },
  inclinacionOptima: { unidad: '', salvar: true, mostrar: false, order: 13 },
  angulosOptimos: { unidad: '', salvar: true, mostrar: false, order: 14 },
  inclinacion: {
    unidad: 'º',
    decimales: 2,
    salvar: true,
    mostrar: true,
    order: 15,
  },
  potenciaMaxima: {
    unidad: ' kWp',
    decimales: 2,
    salvar: true,
    mostrar: true,
    order: 16,
  },
  modoInstalacion: { unidad: '', salvar: true, mostrar: true, order: 4.1 },

  requierePVGIS: { unidad: '', salvar: true, mostrar: false },

  /* instalacion */
  potenciaUnitaria: {
    unidad: ' Wp',
    decimales: 0,
    salvar: true,
    mostrar: true,
    order: 1,
  },
  paneles: { unidad: '', decimales: 0, salvar: true, mostrar: true, order: 2 },
  potenciaTotal: { unidad: ' kWp', decimales: 3, salvar: true, mostrar: true, order: 3 },

  /* produccion */
  produccionCreada: { unidad: '', salvar: false, mostrar: false },
  cnumeroDias: { unidad: '', salvar: true, mostrar: false },
  CO2AnualRenovable: { unidad: ' kg', decimales: 0, salvar: true, mostrar: true },
  CO2AnualNoRenovable: { unidad: ' kg', decimales: 0, salvar: true, mostrar: true },
  /* rendimiento */
  unitarioTotal: { unidad: ' kWh', decimales: 2, salvar: true, mostrar: true, order: 1 },
  produccionTotal: {
    unidad: ' kWh',
    decimales: 2,
    salvar: true,
    mostrar: true,
    order: 2,
  },
  system_loss: { unidad: '%', decimales: 0, salvar: false, mostrar: true, order: 3 },
  technology: { unidad: '', salvar: false, mostrar: true, order: 4 },
  inclinacionOptimal: { unidad: '', salvar: false, mostrar: true, order: 5 },
  acimutOptimal: { unidad: '', salvar: false, mostrar: true, order: 6 },
  radiation_db: { unidad: '', decimales: 0, salvar: false, mostrar: true, order: 7 },
  meteo_db: { unidad: '', salvar: false, mostrar: true, order: 8 },
  year_min: { unidad: '', decimales: 0, salvar: false, mostrar: false },
  year_max: { unidad: '', decimales: 0, salvar: false, mostrar: false },
  PVGISfechaInicio: {
    unidad: 'fecha',
    decimales: 'corta',
    salvar: false,
    mostrar: true,
    order: 9,
  },
  PVGISfechaFin: {
    unidad: 'fecha',
    decimales: 'corta',
    salvar: false,
    mostrar: true,
    order: 10,
  },

  /* TipoConsumo */
  idTipoConsumo: { unidad: '', decimales: 0, salvar: true, mostrar: false },
  nombreTipoConsumo: { unidad: '', decimales: 0, salvar: true, mostrar: true },
  nombreFicheroCSV: { unidad: '', decimales: 0, salvar: true, mostrar: false },
  numeroRegistros: { unidad: '', decimales: 0, salvar: false, mostrar: false },
  numeroDias: { unidad: '', decimales: 0, salvar: false, mostrar: false },
  fuente: { unidad: '', salvar: true, mostrar: true },
  consumoAnualREE: { unidad: ' kWh', decimales: 0, salvar: true, mostrar: false },
  csvCargado: { salvar: false, mostrar: false },
  ficheroCSV: { unidad: '', salvar: false, mostrar: false },
  rendimientoCreado: { salvar: false, mostrar: false },
  /* Tarifa */
  idTarifa: { unidad: '', salvar: true, mostrar: false },
  nombreTarifa: { unidad: '', salvar: true, mostrar: true },
  precios: { salvar: true, mostrar: true },
  Compensa: { unidad: ' €/kWh', decimales: 3, salvar: true, mostrar: true },
  P1: { unidad: ' €/kWh', decimales: 3, salvar: true, mostrar: true },
  P2: { unidad: ' €/kWh', decimales: 3, salvar: true, mostrar: true },
  P3: { unidad: ' €/kWh', decimales: 3, salvar: true, mostrar: true },
  P4: { unidad: ' €/kWh', decimales: 3, salvar: true, mostrar: true },
  P5: { unidad: ' €/kWh', decimales: 3, salvar: true, mostrar: true },
  P6: { unidad: ' €/kWh', decimales: 3, salvar: true, mostrar: true },
  horas: { salvar: true, mostrar: false },
  cTarifa: { salvar: false, mostrar: false },

  /* Economico */
  ahorroAnual: { unidad: ' €', decimales: 0, salvar: false, mostrar: true },
  TIRProyecto: { unidad: '%', decimales: 1, salvar: false, mostrar: true },
  VANProyecto: { unidad: ' €', decimales: 0, salvar: false, mostrar: true },
  interesVAN: { unidad: '%', decimales: 0, salvar: false, mostrar: false },
  economicoCreado: { unidad: '', salvar: false, mostrar: false },
  tiempoSubvencionIBI: { unidad: '', decimales: 0, salvar: true, mostrar: true },
  valorSubvencionIBI: { unidad: ' €', decimales: 0, salvar: true, mostrar: true },
  porcientoSubvencionIBI: { unidad: '%', decimales: 0, salvar: true, mostrar: true },
  //tipoSubvencionEU: { unidad: '', salvar: true, mostrar: true },
  valorSubvencion: { unidad: ' €', decimales: 0, salvar: false, mostrar: true },
  previo: { unidad: ' €', decimales: 2, salvar: false, mostrar: true },
  inversion: { unidad: ' €', decimales: 2, salvar: false, mostrar: true },
  ahorro: { unidad: ' €', decimales: 2, salvar: false, mostrar: true },
  IBI: { unidad: ' €', decimales: 2, salvar: false, mostrar: true },
  subvencion: { unidad: ' €', decimales: 2, salvar: false, mostrar: true },
  pendiente: { unidad: ' €', decimales: 2, salvar: false, mostrar: true },
  VAN: { unidad: ' €', decimales: 0, salvar: false, mostrar: true },
  TIR: { unidad: '%', decimales: 1, salvar: false, mostrar: true },
  precioInstalacion: { unidad: ' €', decimales: 0, salvar: true, mostrar: true },
  precioInstalacionCorregido: { unidad: ' €', decimales: 0, salvar: true, mostrar: true },

  /* Globales */
  areaTotal: { unidad: ' m²', decimales: 2, salvar: true, mostrar: true },
  //"impuestoTotal":{"unidad": "%", "decimales": 0, "salvar":false, "mostrar":true},
  gastoSinPlacasAnual: {
    unidad: ' €',
    decimales: 0,
    salvar: false,
    mostrar: true,
    antes: 'consumoOriginalAnual',
  },
  coefConsumo: { unidad: '%', decimales: 2, salvar: true, mostrar: true },
  coefEnergia: { unidad: '%', decimales: 2, salvar: true, mostrar: true },
  coefInversion: { unidad: '%', decimales: 2, salvar: true, mostrar: true },
  gastoConPlacasAnual: {
    unidad: ' €',
    decimales: 0,
    salvar: false,
    mostrar: true,
    antes: 'consumoConPlacasAnual',
  },
  consumoOriginalMensual: { unidad: ' €', decimales: 0, salvar: false, mostrar: true },
  consumoConPlacasMensual: { unidad: ' €', decimales: 0, salvar: false, mostrar: true },
  consumoConPlacasMensualCorregido: {
    unidad: ' €',
    decimales: 0,
    salvar: false,
    mostrar: true,
  },
  compensadoMensual: { unidad: ' €', decimales: 0, salvar: false, mostrar: true },
  compensadoMensualCorregido: {
    unidad: ' €',
    decimales: 0,
    salvar: false,
    mostrar: true,
  },
  ahorradoAutoconsumoMes: { unidad: ' €', decimales: 0, salvar: false, mostrar: true },
  perdidaMes: { unidad: ' €', decimales: 0, salvar: false, mostrar: true },

  fechaInicio: { unidad: 'fecha', salvar: true, mostrar: false },
  horaInicio: { unidad: '', salvar: true, mostrar: false },
  horaFin: { unidad: '', salvar: true, mostrar: false },
  fechaFin: { unidad: 'fecha', salvar: true, mostrar: false },

  lon: { unidad: '', decimales: 2, salvar: true, mostrar: true },
  lat: { unidad: '', decimales: 2, salvar: true, mostrar: true },
}

const nombreMes = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]
const nombreMesLargo = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]
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
]

const returnFloat = (value) => {
  let floatValue
  if (typeof value === 'string') {
    floatValue = parseFloat(
      value.replace(/,/g, '.').toLocaleString(undefined, { useGrouping: true }),
    )
    return floatValue
  } else {
    return value
  }
}
const ValidateDecimal = (language, inputValue) => {
  const number = 1.1
  const decimalSeparator = number.toLocaleString(language).substring(1, 2)
  const decimalRegex = new RegExp(`^\\d*\\${decimalSeparator}?\\d*$`)
  return decimalRegex.test(inputValue)
}

const ValidateEntero = (inputValue) => {
  if (inputValue === '') return false
  const decimalRegex = new RegExp(`^-?\\d*$`)
  return decimalRegex.test(inputValue)
}

/** Devuelve el valor de la variable en los argumentos de entrada de la URL
 * @memberof UTIL
 * @param {String} variable Nombre de la variable que buscamos en los argumentos de entrada
 * @returns {Boolean|String}  false si la variable no está en la entrada o el valor de la misma si está
 */
function getParametrosEntrada(variable) {
  if (TCB.URLParameters === null) return false
  return TCB.URLParameters.get(variable) ?? false
}

/** Envia mensaje a la consola del desarrollador si se ha activado el debug en la url de llamada con el argumento debug=1.
 * Si el argumento objeto no es nulo se vuelca su contenido en la consola
 * @param {String} mensaje
 * @param {Object} objeto
 */
function debugLog(mensaje, objeto) {
  if (TCB.debug !== false) {
    console.log(mensaje)
    if (objeto !== undefined && typeof objeto === 'object') {
      console.dir(objeto)
    }
  }
}

function cambioValor(cell, cambiaLabel) {
  const nombreTablaActiva = cell.getTable().element.id
  const propiedadCambiada = cell.getField()
  var instanciaCambiada

  let [tablaActiva, subTabla, subId] = nombreTablaActiva.split('.')

  if (subTabla === undefined) {
    let _id = 'id' + nombreTablaActiva
    instanciaCambiada = TCB[tablaActiva].find(
      (obj) => obj[_id] === cell.getRow().getData()[_id],
    )
    instanciaCambiada[propiedadCambiada] = cell.getValue()
  } else {
    instanciaCambiada = TCB[tablaActiva].find((obj) => obj.id === parseInt(subId))
    instanciaCambiada[subTabla][propiedadCambiada] = cell.getValue()
  }
  if (cambiaLabel) {
    setLabel(
      instanciaCambiada.geometria.label,
      instanciaCambiada[propiedadCambiada],
      [255, 255, 255, 1],
      [168, 50, 153, 0.6],
    )
  }
}

function distancia(p0, p1) {
  const deltaX = p1[0] - p0[0]
  const deltaY = p1[1] - p0[1]
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
}

/** Completa el estilo y texto a asignar a un label en el mapa
 * @memberof Utiles.js
 * @param {*} feature es el ol.feature (un punto) al que se asignará el label. El objeto en cuestion tiene un ID del tipo objeto.componente.id
 * @param {*} texto a poner en el label
 * @param {*} colorArray color del texto
 * @param {*} bgcolorArray color del background del label
 *
 */
async function setLabel(feature, texto, colorArray, bgcolorArray) {
  //Identificamos el objeto de que se trata a partir del ID del feature recibido

  const componente = feature.getId().split('.')
  const nombreObjeto = componente[0]
  //Definimos la justificación del texto segun el objeto
  let posicionTexto = 'center'
  switch (nombreObjeto) {
    case 'AreaSolar':
      posicionTexto = 'center'
      break
    case 'PuntoConsumo':
      posicionTexto = 'start'
      break
  }
  //let featureStyle = feature.getStyle()
  //Construimos el style
  // console.log(featureStyle)
  // if (featureStyle === undefined || featureStyle === null) {
  //feature.set('label', texto)
  const mText = new Text({
    font: '16px sans-serif',
    textAlign: posicionTexto,
    text: texto,
    fill: new Fill({ color: colorArray }),
    backgroundFill: new Fill({ color: bgcolorArray }),
    padding: [2, 2, 2, 2],
  })
  const featureStyle = new Style({
    text: mText,
  })
  //}
  feature.setStyle(featureStyle)
  return featureStyle
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
    TipoConsumo: 'TipoConsumo',
    PuntoConsumo: 'PuntoConsumo',
    BaseSolar: 'BaseSolar',
    Finca: 'Finca',
    BasesAsignadas: 'BaseSolar',
  }

  const tipoObjetoBuscado = sinonimos[cell.getTable().element.id]
  let _activo = {
    tabla: cell.getTable(),
    nombreTabla: tipoObjetoBuscado,
    celda: cell.getField(),
    fila: cell.getRow().getData(),
  }
  //El campo unico (id) de cada objeto es id<nombre objeto>
  const _id = 'id' + _activo.nombreTabla
  _activo.id = _activo.fila[_id]
  _activo.objeto = TCB[tipoObjetoBuscado].find((obj) => obj[_id] === _activo.id)
  return _activo
}

/**
 * Introduce los valores de un dia en diaHora y actualiza la tabla idx del dia correspondiente
 * En caso de existir valores previos para ese dia calcula los promedios
 * @param {object} unDia Estructura a carga
 * @param {Date} unDia.fecha Fecha del registro al que se insertarán estos datos
 * @param {Array(24)<number>} unDia.valores Valores a insertar en esta fila
 */
function mete(unDia, aThis, metodo) {
  let _dia = unDia.fecha.getDate()
  let _mes = unDia.fecha.getMonth()
  var indiceDia = indiceDesdeDiaMes(_dia, _mes)
  for (let hora = 0; hora < 24; hora++) {
    if (metodo === 'PROMEDIO') {
      if (aThis.idxTable[indiceDia].previos > 0) {
        //Implica que ya habia registros previos para ese dia por lo que recalculamos el promedio
        unDia.valores[hora] =
          (aThis.diaHora[indiceDia][hora] * aThis.idxTable[indiceDia].previos +
            unDia.valores[hora]) /
          (aThis.idxTable[indiceDia].previos + 1)
      }
    }
    aThis.diaHora[indiceDia][hora] = unDia.valores[hora]
  }

  aThis.idxTable[indiceDia].fecha = unDia.fecha
  aThis.idxTable[indiceDia].previos = aThis.idxTable[indiceDia].previos + 1
  aThis.idxTable[indiceDia].suma = suma(unDia.valores)
  aThis.idxTable[indiceDia].promedio = promedio(unDia.valores)
  aThis.idxTable[indiceDia].maximo = Math.max(...unDia.valores)
}

// function mete(unDia, idxTable, outTable) {
//   var indiceDia = indiceDesdeDiaMes(unDia.dia, unDia.mes)
//   for (let hora = 0; hora < 24; hora++) {
//     if (idxTable[indiceDia].previos > 0) {
//       //Implica que ya habia registros previos para ese dia
//       unDia.valores[hora] =
//         (outTable[indiceDia][hora] * idxTable[indiceDia].previos + unDia.valores[hora]) /
//         (idxTable[indiceDia].previos + 1)
//     }
//     outTable[indiceDia][hora] = unDia.valores[hora]
//   }
//   idxTable[indiceDia].previos = idxTable[indiceDia].previos + 1
//   idxTable[indiceDia].dia = unDia.dia
//   idxTable[indiceDia].mes = unDia.mes
//   idxTable[indiceDia].suma = suma(unDia.valores)
//   idxTable[indiceDia].maximo = Math.max(...unDia.valores)
// }

async function getFileFromUrl(url, type) {
  const response = await fetch(url)
  const data = await response.blob()
  const metadata = { type: type || 'text/csv' }
  return new File([data], metadata)
}

/**
 * @typedef {object} options Define la forma de interpretar el CSV
 * @property {Object} options Define la forma de interpretar el CSV
 * @property {string} options.fuente Origen del CSV [REE, CSV, DATADIS, SOM]
 * @property {number} options.factor Se multiplica los valores leidos por este factor. Si undefined -> 1
 * @property {Array<string>} options.valorArr Array con los nombres de campos donde se almacena el valor a cargar. Por ejemplo: Consumo en Naturgy y Consumo_kWh en Iberdrola y VIESGO y AE_kWh en ENDESA.
 */
/**
 * Carga los datos contenidos en fichero CSV con un registro por hora dentro de DiaHora.
 * @async
 * @param {File} csvFile Estructura desde donde se cargará los datos
 * @param {object} aThis Object extending DiaHora where values will be loaded
 * @param {options} options Opciones de carga del csv
 */

async function loadFromCSV(csvFile, aThis, options) {
  return new Promise((resolve, reject) => {
    var tHoraChk = 0
    Papa.parse(csvFile, {
      header: true,
      transformHeader: (header) => {
        // Rename headers
        let tmpHeader = header.toUpperCase()
        if (options.valorArr.includes(header)) return 'consumo'
        if (['ENERGIAVERTIDA_KWH'].includes(tmpHeader)) return 'excedente' //Not used yet
        if (['FECHA'].includes(tmpHeader)) return 'fecha'
        if (['HORA'].includes(tmpHeader)) return 'hora'
        return header
      },

      transform: (value, header) => {
        // Convert 'consumo' column to float
        if (header === 'consumo') {
          return parseFloat(value.replace(',', '.'))
        }
        if (header === 'fecha') {
          //Para gestionar fechas en formato dd/mm/aaaa como vienen en el CSV debamos invertir a aaaa/mm/dd en javascript
          let posDia = options.fechaSwp ? 2 : 0
          let posMes = 1
          let posAno = options.fechaSwp ? 0 : 2
          let parts = value.split('/')
          let _dia = parts[posDia]
          let _mes = parts[posMes] - 1 //_mes es el indice interno gestionado por JS pero es 1-24 en los ficheros de las distribuidoras
          let _ano = parts[posAno]
          if (_dia > 31 || _mes > 11) {
            //Es probable que hayan definido DATADIS para un CSV de distribuidora
            const tError = new Error(
              TCB.i18next.t('CONSUMPTION.ERROR_fuenteTipoErroneo_DATADIS'),
            )
            reject(tError)
          }
          let currFecha = new Date(_ano, _mes, _dia, 0, 0)
          return currFecha
        }

        if (header === 'hora') {
          let tHora = parseInt(value.split(':')[0]) + options.deltaHour
          //Hay casos en ficheros CSV que aparece una hora 25 los dias de cambio de horario.
          if (tHora > 23) {
            tHora = 23
            tHoraChk++
          }
          if (tHora < 0) {
            //Es probable que hayan definido CSV de distribuidora para un DATADIS
            const tError = new Error(
              TCB.i18next.t('CONSUMPTION.ERROR_fuenteTipoErroneo_CSV'),
            )
            reject(tError)
          }
          return tHora
        }

        return value // Return original value for other columns
      },

      complete: (results) => {
        // Check if the header row contains both "Name" and "Value" headers
        const headers = results.meta.fields
        let chkHeaders = true
        let failHdr = []
        if (!headers.includes('consumo')) {
          failHdr = [...options.valorArr]
          chkHeaders = false
        }
        if (!headers.includes('fecha')) {
          failHdr.push('fecha')
          chkHeaders = false
        }
        if (!headers.includes('hora')) {
          failHdr.push('hora')
          chkHeaders = false
        }
        if (!chkHeaders) {
          let errorMsg = TCB.i18next.t('CONSUMPTION.ERROR_CABECERAS_CSV', {
            cabeceras: failHdr.join(','),
          })
          const tError = new Error(errorMsg)
          reject(tError)
        }

        if (results.data.length === 0) return false

        if (tHoraChk > 1) {
          const tError = new Error(
            TCB.i18next.t('CONSUMPTION.ERROR_fuenteTipoErroneo_SOM'),
          )
          reject(tError)
        }

        debugLog(
          'CSV procesando ' +
            results.data.length +
            ' registros del fichero ' +
            csvFile.name,
        )
        try {
          var lastFecha = new Date(1970, 1, 1)
          var returnObject = {}
          var lastLine
          var lastHora
          var unDia = { fecha: lastFecha, valores: Array(24).fill(0) } //el mes es 0-11, la hora es 0-23
          let firstRow = true
          // Se han detectado ficheros de Naturgy con registros vacios al final del mismo
          // si el campo fecha viene vacio consideramos que hay que ignorar el registro

          let hasData
          results.data.forEach((linea) => {
            lastLine = linea
            if (linea.fecha === undefined) return
            if (linea.fecha.getMonth() == 1 && linea.fecha.getDate() == 29) return //Ignoramos el 29/2 de los años bisiestos

            //Cualquier cosa que venga que no sea un numero pasa a cero
            if (isNaN(linea.consumo)) linea.consumo = 0

            if (linea.fecha.getTime() == lastFecha.getTime()) {
              //debemos cambiar la , por el . para obtener el valor
              unDia.valores[linea.hora] = linea.consumo * options.factor
              hasData = true
            } else {
              if (firstRow) {
                returnObject.fechaInicio = linea.fecha
                returnObject.horaInicio = linea.hora
                unDia = {
                  fecha: linea.fecha,
                  valores: Array(24).fill(0),
                }
                unDia.valores[linea.hora] = linea.consumo * options.factor
                firstRow = false
                hasData = true
              } else {
                mete(unDia, aThis, options.metodo)
                hasData = false
                unDia = {
                  fecha: linea.fecha,
                  valores: Array(24).fill(0),
                }
                unDia.valores[linea.hora] = linea.consumo * options.factor
                hasData = true
              }
              lastFecha = linea.fecha
            }
            lastHora = linea.hora
          })

          // Si el ultimo registro no vino vacio lo metemos
          if (hasData) mete(unDia, aThis, options.metodo)

          returnObject.fechaFin = lastFecha
          returnObject.horaFin = lastHora
          returnObject.numeroRegistros = results.data.length
          returnObject.datosCargados = true
          resolve(returnObject)
        } catch (error) {
          returnObject.numeroRegistros = 0
          returnObject.datosCargados = false
          debugLog('Error lectura en linea:\n' + JSON.stringify(lastLine) + '\n' + error)
          reject('Error lectura en linea:\n' + JSON.stringify(lastLine) + '\n' + error)
        }
      },

      error: (error) => {
        console.error('Error parsing CSV:', error.message)
        reject(error)
      },
    })
  })
}

// function csvToArray(str, delimiter = ',') {
//   // slice from start of text to the first \n index
//   // use split to create an array from string by delimiter
//   try {
//     var headers = str.slice(0, str.indexOf('\n')).split(delimiter)
//     for (let i = 0; i < headers.length; i++) headers[i] = headers[i].trim()
//   } catch (e) {
//     alert('Posible error de formato fichero de consumos\n' + str)
//     return
//   }
//   debugLog('Cabecera CSV:', headers)

//   // la diferencia entre los ficheros de Naturgy y de Iberdrola es que
//   // la cuarta columna donde esta el consumo se llama Consumo en Naturgy y Consumo_kWh en Iberdrola y VIESGO y AE_kWh en ENDESA.
//   // unificamos en "Consumo"
//   if (headers[3] == 'Consumo_kWh') headers[3] = 'Consumo'
//   if (headers[3] == 'AE_kWh') headers[3] = 'Consumo'

//   let chk_consumo = false
//   let chk_fecha = false
//   let chk_hora = false
//   headers.forEach((hdr) => {
//     if (hdr === 'Consumo' || hdr === '2.0TD' || hdr === '3.0TD') chk_consumo = true
//     if (hdr === 'Fecha') chk_fecha = true
//     if (hdr === 'Hora') chk_hora = true
//   })
//   if (!(chk_consumo && chk_fecha && chk_hora)) {
//     let failHdr = ''
//     if (!chk_consumo) failHdr += 'Consumo '
//     if (!chk_fecha) failHdr += 'Fecha '
//     if (!chk_hora) failHdr += 'Hora '
//     alert(TCB.i18next.t('consumo_MSG_errorCabeceras', { cabeceras: failHdr }))
//     return []
//   }
//   // slice from \n index + 1 to the end of the text
//   // use split to create an array of each csv value row
//   const rows = str.slice(str.indexOf('\n') + 1).split('\n')
//   let arr = []
//   rows.forEach((row) => {
//     if (row.length > 1) {
//       const values = row.split(delimiter)
//       const el = headers.reduce(function (object, header, index) {
//         object[header] = values[index]
//         return object
//       }, {})
//       arr.push(el)
//     }
//   })

//   // return the array
//   return arr
// }

function promedio(arr) {
  return arr.reduce((a, b) => a + b) / arr.length
}

function suma(arr) {
  return arr.reduce((a, b) => a + b, 0)
}

// Funciones de gestion de indice de dias -------------------------------------------------------------------
function difDays(inicio, fin) {
  let diferencia = fin.getTime() - inicio.getTime()
  return Math.ceil(diferencia / (1000 * 3600 * 24))
}

function indiceDesdeFecha(fecha) {
  var dia = fecha.getDate()
  var mes = fecha.getMonth()
  return indiceDia[mes][1] + dia - 1
}

function indiceDesdeDiaMes(dia, mes) {
  return indiceDia[mes][1] + dia - 1
}

function fechaDesdeIndice(indice) {
  for (let i = 0; i < 12; i++) {
    if (indiceDia[i][2] >= indice) {
      let mes = i
      let dia = indice - indiceDia[mes][1] + 1
      return [dia, mes]
    }
  }
}

function dumpData(nombre, idxTable, dataTable) {
  // Loop the array of objects
  var csv
  for (let row = 0; row < idxTable.length; row++) {
    let keysAmount = Object.keys(idxTable[row]).length
    let keysCounter = 0

    // If this is the first row, generate the headings
    if (row === 0) {
      // Loop each property of the object
      for (let key in idxTable[row]) {
        // This is to not add a comma at the last cell
        // The '\n' adds a new line
        csv += key + (keysCounter + 1 < keysAmount ? ';' : '')
        keysCounter++
      }
      for (let i = 0; i < 24; i++) {
        csv += ';' + i
      }
      csv += '\r\n'
    }
    keysCounter = 0
    for (let key in idxTable[row]) {
      csv += idxTable[row][key] + (keysCounter + 1 < keysAmount ? ';' : '')
      keysCounter++
    }
    for (let i = 0; i < 24; i++) {
      csv += ';' + dataTable[row][i]
    }
    csv += '\r\n'
  }

  var element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv))
  element.setAttribute('download', nombre)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

/** Genera los strings formateados de todos los campos de la aplicación.
 * @memberof! Utiles.js
 * @param {string} campo
 * @param {any} valor
 * @param {string} unidadFinal Optional overide unidad en UTIL.campos
 * @returns {string} valor formateado segun definición de UTIL.campos
 */
function formatoValor(campo, valor, unidadFinal) {
  if (valor === undefined) return undefined

  const dato = campos[campo]
  /*      console.log(dato); 
  console.log(campo + "->" + valor);  */
  if (dato === undefined || valor === '') return valor

  if (typeof valor === 'boolean') return TCB.i18next.t('BASIC.valor_' + valor)
  if (dato.unidad === 'º') {
    //Se debe tener en cuanta que algunos campos de angulos para PVGIS pueden tener el valor Optimo por lo que no se añade º
    if (valor === 'Optimo') return TCB.i18next.t('valorOptimo_LBL')
  }
  if (dato.unidad === 'fecha') {
    const tvalor = typeof valor === 'string' ? new Date(valor) : valor
    let options
    if (dato.decimales === 'larga') {
      options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }
    } else {
      options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }
    }
    return tvalor.toLocaleDateString(TCB.i18next.language, options)
  }

  const unidad = unidadFinal ?? dato.unidad
  if (dato.decimales !== undefined) {
    /*Segun la definición ISO (https://st.unicode.org/cldr-apps/v#/es/Symbols/70ef5e0c9d323e01) los numeros en 'es' no llevan '.' si no hay mas de dos digitos delante del '.' Minimum Grouping Digits = 2. Como no estoy de acuerdo con este criterio en el caso de 'es' lo cambio a 'ca' que funciona bien */
    let lng =
      TCB.i18next.language.substring(0, 2) === 'es'
        ? 'ca'
        : TCB.i18next.language.substring(0, 2)
    return (
      valor.toLocaleString(lng, {
        maximumFractionDigits: dato.decimales,
        minimumFractionDigits: dato.decimales,
      }) + unidad
    )
  } else {
    return valor.toLocaleString() + unidad
  }
}
/** formatoValor desde una celda de Tabulator
 * Esta definida como extensiónd e Tabulator -> Tabulator.extendModule en inicializaAplicacion
 * @memberof! Utiles.js
 * @param {Tabulator.cell} cell
 * @param {String} campo Nombre del campo donde proviene el valor. Campos definirá el formato definitivo en decimales y unidades
 * @returns {String} Valor del campo formateado
 */
function n_formatoValor(cell, campo) {
  if (campo === undefined) campo = cell.getField()
  const valor = cell.getValue()
  return formatoValor(campo, valor)
}
/* Función para mostrar el formulario modal de propiedades de un objeto generico
@param: objeto -> es el objeto del que se mostrará todas las propiedades que devuelve getOwnPropertyDescriptors en la función
                obtenerPropiedades. La llamada es recursiva, si una propiedad es un objeto se mostrarán la propiedades de ese
                objeto tambien.
@param: descripcion -> titulo del <body> del formulario modal
 */
var modalWrap = null
function formularioAtributos(objeto, descripcion) {
  //}, yesBtnLabel = 'Yes', noBtnLabel = 'Cancel', callback) {
  if (modalWrap !== null) {
    modalWrap.remove()
  }
  const vectorPropiedades = obtenerPropiedades(objeto, 0)
  modalWrap = document.createElement('div')
  let tmpHTML =
    `<div class="modal fade" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title">` +
    TCB.i18next.t('resultados_LBL_tituloPropiedades') +
    `</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>` +
    descripcion +
    `</p>
            <table id="tablaPropiedades" class="table table-sm table-striped table-bordered text-end center">`

  for (let obj in vectorPropiedades) {
    tmpHTML +=
      "<tr class='table-info text-center'><td colspan=2>" +
      TCB.i18next.t('objeto_' + obj) +
      '</td><tr>'
    for (let prop of vectorPropiedades[obj]) {
      if (prop.valor === undefined) prop.valor = 'Indefinido'
      if (campos[prop.nombre] !== undefined && campos[prop.nombre].mostrar) {
        tmpHTML +=
          "<tr><td class='text-start'>" +
          TCB.i18next.t(prop.nombre + '_LBL') +
          "</td><td class='text-end'>" +
          formatoValor(prop.nombre, prop.valor) +
          '</td></tr>'
      }
    }
  }
  tmpHTML += `</table>
          </div>
        </div>
      </div>
    </div>
  `

  modalWrap.innerHTML = tmpHTML
  //modalWrap.querySelector('.modal-success-btn').onclick = callback;
  document.body.append(modalWrap)
  var modal = new bootstrap.Modal(modalWrap.querySelector('.modal'))
  modal.show()
}
/** funcion para convertir el los objetos Solidar del repositorio en una tabla
 * TCB.XXXX[] -> [objeto, propiedad: [valores de propiedad en cada XXX]]
 * Es necesaria para el reporte PDF
 *
 * @param {Object} tabla
 * @returns {Array}
 */
function swapTabla(tabla) {
  let tTabla = {}
  for (let k = 0; k < tabla.length; k++) {
    //Si estamos procesando el TipoConsumo que representa el consumo Global lo ignoramos
    if (tabla[k]._name === 'TipoConsumo' && tabla[k].nombreTipoConsumo === 'Global') {
      continue
    }

    const propiedades = obtenerPropiedades(tabla[k], 0)
    for (let obj in propiedades) {
      // Si el objeto no ha sido creado en tTabla lo creamos
      if (tTabla[obj] === undefined) {
        Object.defineProperty(tTabla, obj, { value: {}, enumerable: true })
      }

      // La tarifa tiene un proceso especial porque obtenerPropiedades no lo devuelve
      if (obj === 'Tarifa') {
        let listaPrecios = tabla[k].tarifa.getTarifa()
        for (let precio in listaPrecios) {
          if (tTabla[obj][precio] === undefined) {
            Object.defineProperty(tTabla[obj], precio, {
              value: [formatoValor(precio, listaPrecios[precio])],
              enumerable: true,
            })
          } else {
            tTabla[obj][precio].push(formatoValor(precio, listaPrecios[precio]))
          }
        }
      } else {
        for (let prop of propiedades[obj]) {
          if (campos[prop.nombre] !== undefined && campos[prop.nombre].mostrar) {
            if (tTabla[obj][prop.nombre] === undefined) {
              Object.defineProperty(tTabla[obj], prop.nombre, {
                value: [formatoValor(prop.nombre, prop.valor)],
                enumerable: true,
              })
            } else {
              //Particular case don't want to get totalAnual of rendimiento
              if (!(obj === 'Rendimiento' && prop.nombre === 'totalAnual'))
                tTabla[obj][prop.nombre].push(formatoValor(prop.nombre, prop.valor))
            }
          }
        }
      }
    }
  }
  return tTabla
}
/** Es lo mismo que swapTabla pero cuando el objeto Solidar no es un Array.
 * TCB.XXXX -> [objeto, propiedad: [valor de propiedad]]
 * Es para el reporte PDF de los objetos globales
 *
 * @memberof! Utiles.js
 * @param {*} tabla
 */
function swapObjeto(objeto) {
  let tTabla = {}
  const propiedades = obtenerPropiedades(objeto, 0)
  for (let obj in propiedades) {
    //Es posible que el objeto recibido pueda tener objetos anidados
    Object.defineProperty(tTabla, obj, { value: {}, enumerable: true })
    for (let prop of propiedades[obj]) {
      if (campos[prop.nombre] !== undefined && campos[prop.nombre].mostrar) {
        Object.defineProperty(tTabla[obj], prop.nombre, {
          value: [formatoValor(prop.nombre, prop.valor)],
          enumerable: true,
        })
      }
    }
  }
  return tTabla
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
var prop_val
/** Función recursiva para obtener los valores de las propiedades de un objeto excluyendo el campo geometria.
 * El objeto base tiene nivel 0, si es objeto propiedad de otro objeto el nivel es 1
 *
 * @param {object} objeto
 * @param {integer} nivel
 * @returns {propiedades}
 */

function obtenerPropiedades(objeto, nivel) {
  if (objeto === undefined || objeto === null || objeto instanceof File) return
  if (nivel == 0) prop_val = {}

  let propiedades = Object.getOwnPropertyDescriptors(objeto)
  /*
  Original was looking as actobj = objeto.constructor.name but minification change the object name and impossible to use generic code at runtime. Adding ._name property to each class as substitute of constructor.name
  */
  let actobj = objeto._name

  if (actobj === 'Object' || actobj === undefined) return //No esta previsto mostrar campos de tipo objeto javascript como puede ser el status del rendimiento
  prop_val[actobj] = prop_val[actobj] ?? []

  for (let prop in propiedades) {
    if (!Array.isArray(objeto[prop])) {
      let tipoPropiedad = typeof objeto[prop]
      if (tipoPropiedad === 'object') {
        if (objeto[prop] instanceof Date) {
          if (campos[prop] !== undefined && campos[prop].mostrar)
            prop_val[actobj].push({ nombre: prop, valor: objeto[prop] })
        } else {
          if (prop !== 'geometria') {
            let actobj = objeto._name
            prop_val[actobj].push({ nombre: prop, valor: 'Objeto' })
            obtenerPropiedades(objeto[prop], 1)
          }
        }
      } else {
        if (campos[prop] !== undefined && campos[prop].mostrar)
          if (!(actobj === 'Rendimiento' && prop === 'totalAnual')) {
            //Particular case don't want to get totalAnual of rendimiento
            prop_val[actobj].push({ nombre: prop, valor: objeto[prop] })
          }
      }
    }
  }
  return prop_val
}

/** Devuelve el número recibido con solo dos decimales
 *
 * @param {Number} numero EL número a redondear
 * @returns {Number} El valor del argumento numero a dos decimales
 */
function round2Decimales(numero) {
  return +(Math.round(numero + 'e+2') + 'e-2')
}

/** Nuestra el texto en el campo cuyo id es campo
 *
 * @param {string} campo Identificacion del nodo del DOM donde mostrar el texto
 * @param {string} texto Identificacion i18n del mensaje a mostrar
 */
function mensaje(campo, texto) {
  let nodoCampo = document.getElementById(campo)
  nodoCampo.innerHTML = TCB.i18next.t(texto)
  nodoCampo.setAttribute('data-i18n', texto)
}

function muestraAtributos(cell) {
  //tipo, id, evento) {
  /*     const filaActiva = evento.target.parentNode.parentNode.parentNode;
      const id = filaActiva.cells[0].outerText; */
  const activo = setActivo(cell)
  formularioAtributos(
    activo.objeto,
    TCB.i18next.t('resultados_LBL_basePropiedades', { id: activo.id }),
  )
}

/** Funcion para mostrar resultados
 *
 * @param {string} donde campo donde se muestra el valor
 * @param {any} valor a mostrar
 */
function muestra(donde, valor) {
  let _campo = document.getElementById(donde)
  if (_campo.type === 'number' || _campo.type === 'text') {
    _campo.setAttribute('type', '')
    _campo.setAttribute('value', valor)
  } else {
    _campo.innerHTML = valor
  }
}

function deleteBaseGeometries(featId) {
  // Delete OpenLayers geometries
  for (const geoProp in TCB.Especificaciones.BaseSolar.geometrias) {
    const componentId = 'BaseSolar.' + geoProp + '.' + featId
    const component = TCB.origenDatosSolidar.getFeatureById(componentId)
    TCB.origenDatosSolidar.removeFeature(component)
  }
}

function selectTCB(tabla, campo, valor) {
  let recordSet = []
  for (let i = 0; i < TCB[tabla].length; i++) {
    if (TCB[tabla][i][campo] === valor) {
      recordSet.push(i)
    }
  }
  return recordSet
}

async function cargaTarifasDesdeSOM() {
  const urlSOMTarifas = TCB.basePath + 'proxy SOM.php?nombre='
  let _url
  let respuesta
  let txtTarifas
  try {
    _url = urlSOMTarifas + '2.0TD'
    debugLog('Tarifas leidas desde SOM:' + _url)
    respuesta = await fetch(_url)
    if (respuesta.status === 200) {
      txtTarifas = await respuesta.text()
      if (txtTarifas.includes('error')) throw new Error(txtTarifas)
      else
        TCB.tarifas['2.0TD'].precios = txtTarifas.split(',').map((t) => {
          return parseFloat(t)
        })
    }
    debugLog('Tarifas 2.0TD desde SOM', { txtTarifas })

    _url = urlSOMTarifas + '3.0TD'
    respuesta = await fetch(_url)
    if (respuesta.status === 200) {
      txtTarifas = await respuesta.text()
      if (txtTarifas.includes('error')) throw new Error(txtTarifas)
      else {
        TCB.tarifas['3.0TD-Peninsula'].precios = txtTarifas.split(',').map((t) => {
          return parseFloat(t)
        })
        TCB.tarifas['3.0TD-Ceuta'].precios = txtTarifas.split(',').map((t) => {
          return parseFloat(t)
        })
        TCB.tarifas['3.0TD-Melilla'].precios = txtTarifas.split(',').map((t) => {
          return parseFloat(t)
        })
        TCB.tarifas['3.0TD-Illes Balears'].precios = txtTarifas.split(',').map((t) => {
          return parseFloat(t)
        })
        TCB.tarifas['3.0TD-Canarias'].precios = txtTarifas.split(',').map((t) => {
          return parseFloat(t)
        })
      }
    }
    debugLog('Tarifas 3.0TD desde SOM', { txtTarifas })
    return true
  } catch (err) {
    alert(
      'Error leyendo tarifas desde SOM Energia\n' +
        err.message +
        '\nSeguimos con fichero de solidarenergia.es',
    )
    return false
  }
}

export {
  cambioValor,
  cargaTarifasDesdeSOM,
  //copyClipboard,
  //csvToArray,
  debugLog,
  deleteBaseGeometries,
  difDays,
  distancia,
  dumpData,
  fechaDesdeIndice,
  formatoValor,
  formularioAtributos,
  getFileFromUrl,
  getParametrosEntrada,
  indiceDesdeDiaMes,
  indiceDesdeFecha,
  loadFromCSV,
  mensaje,
  mete,
  muestra,
  muestraAtributos,
  n_formatoValor,
  nombreMes,
  nombreMesLargo,
  obtenerPropiedades,
  promedio,
  returnFloat,
  round2Decimales,
  selectTCB,
  setActivo,
  setLabel,
  suma,
  swapTabla,
  swapObjeto,
  ValidateDecimal,
  ValidateEntero,
  campos,
}
window.dumpData = dumpData
