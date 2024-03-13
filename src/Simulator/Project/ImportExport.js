// Openlayers objects
import { GeoJSON } from 'ol/format'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import BaseSolar from '../classes/BaseSolar.js'
import Instalacion from '../classes/Instalacion.js'
import Rendimiento from '../classes/Rendimiento.js'
import TipoConsumo from '../classes/TipoConsumo.js'

/**
 * Utilizada en exporta para salvar los datos del mapa usando OpenLayers GeoJSON
 * @returns GeoJSON con datos del mapa
 */
function salvarDatosMapa() {
  var writer = new GeoJSON()
  var objetosSolidar = TCB.origenDatosSolidar.getFeatures()
  var geojsonStr = writer.writeFeatures(objetosSolidar)
  return geojsonStr
}

/**
 * Generate solimp file from originalData argument
 * @param {Object} originalData copy of TCB
 * @returns {string} Generated filename
 */
function export2txt(originalData) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(originalData, null, 2)], {
      type: 'text/plain',
    }),
  )
  const date = new Date()
  let fName = TCB.nombreProyecto + '(' + date.getFullYear()
  fName += (date.getMonth() + 1).toLocaleString(TCB.i18next.language, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })
  fName += date
    .getDate()
    .toLocaleString(TCB.i18next.language, { minimumIntegerDigits: 2, useGrouping: false })
  fName +=
    '-' +
    date.getHours().toLocaleString(TCB.i18next.language, {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })
  fName += date
    .getMinutes()
    .toLocaleString(TCB.i18next.language, { minimumIntegerDigits: 2, useGrouping: false })
  fName += ').solimp'
  a.setAttribute('download', fName)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  return fName
}

/**
 * Main function to export a project into solimp file
 * @returns {string} Generated filename
 */
async function exportProject() {
  //At least one BaseSolar should exist to export
  if (TCB.BaseSolar.length === 0) {
    alert(TCB.i18next.t('Debe existir al menos una base para exportar'))
    return false
  }
  // Proyecto hdr info
  TCB.datosProyecto.fechaExportacion = new Date()
  TCB.datosProyecto.nombreProyecto = TCB.nombreProyecto
  TCB.datosProyecto.territorio = TCB.territorio
  TCB.datosProyecto.emailContacto = TCB.emailContacto
  TCB.datosProyecto.telefonoContacto = TCB.telefonoContacto
  TCB.datosProyecto.fechaCreacion = TCB.fechaCreacion
  TCB.datosProyecto.descripcion = TCB.descripcion

  // Copy all global properties stored in TCB
  TCB.datosProyecto.parametros = TCB.parametros
  TCB.datosProyecto.precioInstalacion = TCB.precioInstalacion
  TCB.datosProyecto.featIdUnico = TCB.featIdUnico // Generador de identificadores de objeto unicos
  TCB.datosProyecto.totalPaneles = TCB.totalPaneles
  TCB.datosProyecto.areaTotal = TCB.areaTotal
  TCB.datosProyecto.conversionCO2 = TCB.conversionCO2
  TCB.datosProyecto.nombreTarifaActiva = TCB.nombreTarifaActiva
  TCB.datosProyecto.tipoTarifa = TCB.tipoTarifa
  TCB.datosProyecto.tarifaActiva = TCB.tarifaActiva
  TCB.datosProyecto.tipoPanelActivo = TCB.tipoPanelActivo

  // Guardamos los datos del mapa en formato geoJSON
  TCB.datosProyecto.mapa = salvarDatosMapa()
  // Guardamos las bases
  TCB.datosProyecto.BaseSolar = TCB.BaseSolar
  //Guardamos los tipos de consumo

  TCB.datosProyecto.TipoConsumo = TCB.TipoConsumo
  //El objeto File correspondiente no puede ser exportado via JSON.
  TCB.datosProyecto.TipoConsumo.forEach((tipo) => {
    delete tipo.ficheroCSV
  })

  // Guardamos condiciones economicas no almacenadas en el objeto Economico
  TCB.datosProyecto.tiempoSubvencionIBI = TCB.tiempoSubvencionIBI
  TCB.datosProyecto.valorSubvencionIBI = TCB.valorSubvencionIBI
  TCB.datosProyecto.porcientoSubvencionIBI = TCB.porcientoSubvencionIBI
  TCB.datosProyecto.valorSubvencion = TCB.valorSubvencion
  TCB.datosProyecto.porcientoSubvencion = TCB.porcientoSubvencion

  //Generamos el fichero solimp
  const rFile = export2txt(TCB.datosProyecto)
  return rFile
}

async function obtenerDatos(fichero) {
  var datos
  let reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onerror = (err) => {
      alert(
        TCB.i18next.t('precios_MSG_errorLecturaFicheroImportacion') +
          '\nReader.error: ' +
          err,
      )
      reject('...error de lectura')
    }

    reader.onload = (e) => {
      try {
        datos = JSON.parse(e.target.result)
        resolve(datos)
      } catch (err) {
        alert(
          TCB.i18next.t('precios_MSG_errorLecturaFicheroImportacion') +
            '\nParser.error: ' +
            err,
        )
        reject()
      }
    }

    reader.readAsText(fichero)
  })
}

async function importLocalizacion(datosImportar) {
  // Importamos los features OpenLayers
  var jsonReader = new GeoJSON()
  var impFeatures = jsonReader.readFeatures(datosImportar.mapa)
  TCB.origenDatosSolidar.addFeatures(impFeatures)

  TCB.totalPaneles = parseFloat(datosImportar.totalPaneles)

  datosImportar.BaseSolar.forEach((base) => {
    // Actualizamos los labels del mapa con el nombre de la correspondiente base ya que no viene en los datos exportados
    const label = TCB.origenDatosSolidar.getFeatureById(
      'BaseSolar.label.' + base.idBaseSolar,
    )
    UTIL.setLabel(label, base.nombreBaseSolar, TCB.baseLabelColor, TCB.baseLabelBGColor)

    //Creamos el objeto BaseSolar
    let tbase = new BaseSolar(base)
    UTIL.debugLog('importLocalizacion - nueva base creada', tbase)

    //Creamos el objeto instalacion de la base
    tbase.instalacion = new Instalacion({
      paneles: base.instalacion.paneles,
      potenciaUnitaria: base.instalacion.potenciaUnitaria,
    })
    UTIL.debugLog('importLocalizacion - nueva instalacion creada', tbase.instalacion)

    //Creamos el rendimiento.
    tbase.rendimiento = new Rendimiento(base.rendimiento)
    tbase.rendimiento.transformaFechas()
    UTIL.debugLog('importLocalizacion - nuevo rendimiento creado', tbase.rendimiento)

    //Creamos la baseSolar en TCB
    TCB.BaseSolar.push(tbase)
  })
}

async function importTipoConsumo(datosImportar) {
  datosImportar.TipoConsumo.forEach((tipo) => {
    let tTipo = new TipoConsumo(tipo)
    tTipo.transformaFechas()
    tTipo.fechaInicio = new Date(tTipo.fechaInicio)
    tTipo.ficheroCSV = tTipo.nombreFicheroCSV
    UTIL.debugLog('importTipoConsumo - nuevo tipoConsumo creado', tTipo)

    // Insert into TCB
    TCB.TipoConsumo.push(tTipo)
    TCB.TipoConsumo.ficheroCSV = TCB.TipoConsumo.nombreFicheroCSV
  })
  TCB.cambioTipoConsumo = true
}

/**
 * Proceso de importación de un proyecto solimp
 * @param {File} fichero Objeto File asociado al fichero solimp a importar
 * @returns {boolean} true si todo ha ido bien false si algo ha fallado
 */
async function importProject(fichero) {
  //Limpiamos todas las estructuras
  TCB.TipoConsumo = []
  TCB.BaseSolar = []
  //  Variables de totalización
  TCB.consumo = {} // Este campo contiene la suma de todos las consumos[]
  TCB.economico = {} // Este campo contiene la suma de todos las consumos.economico[]
  TCB.produccion = {} // Este campo contiene la suma de todos las bases.produccion[]
  TCB.balance = {} // Este campo contiene el balance global de la instalación

  // Las de OpenLayers
  TCB.origenDatosSolidar.getFeatures().forEach((feat) => {
    TCB.origenDatosSolidar.removeFeature(feat)
  })

  // Don' want to optimize, Use panels as imported
  TCB.requiereOptimizador = false

  // read data from solimp file
  const datosImportar = await obtenerDatos(fichero)

  // Check solimp version to check if compatible
  if (datosImportar.version !== '4') {
    return { status: false, error: 'MSG_problemaVersion' }
  }

  TCB.nombreProyecto = datosImportar.nombreProyecto
  TCB.territorio = datosImportar.territorio
  TCB.emailContacto = datosImportar.emailContacto
  TCB.telefonoContacto = datosImportar.telefonoContacto
  TCB.fechaCreacion = datosImportar.fechaCreacion
  TCB.descripcion = datosImportar.descripcion
  TCB.parametros = datosImportar.parametros
  TCB.precioInstalacion = datosImportar.precioInstalacion
  TCB.featIdUnico = parseInt(datosImportar.featIdUnico) // Generador de identificadores de objeto unicos
  TCB.totalPaneles = datosImportar.totalPaneles
  TCB.areaTotal = datosImportar.areaTotal
  TCB.conversionCO2 = datosImportar.conversionCO2

  // Import Tarifa
  TCB.nombreTarifaActiva = datosImportar.nombreTarifaActiva
  TCB.tipoTarifa = datosImportar.tipoTarifa
  TCB.tarifaActiva = datosImportar.tarifaActiva

  // Import parameters
  for (let param in datosImportar.parametros) {
    TCB.parametros[param] = datosImportar.parametros[param]
  }
  TCB.tipoPanelActivo = datosImportar.tipoPanelActivo

  importLocalizacion(datosImportar)
  importTipoConsumo(datosImportar)

  return { status: true, error: '' }
}

export { exportProject, importProject }
