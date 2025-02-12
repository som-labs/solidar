// Openlayers objects
import { GeoJSON } from 'ol/format'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import BaseSolar from '../classes/BaseSolar.js'
import Instalacion from '../classes/Instalacion.js'
import Rendimiento from '../classes/Rendimiento.js'
import TipoConsumo from '../classes/TipoConsumo.js'
import pako from 'pako'

import Consumo from '../classes/Consumo.js'
import Economico from '../classes/Economico.js'
import calculaResultados from '../classes/calculaResultados.js'
import Produccion from '../classes/Produccion.js'

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
  const outString = JSON.stringify(originalData)
  console.log(outString)
  const compressed = pako.gzip(outString)
  const blob = new Blob([compressed], { type: 'application/gzip' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url

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
    alert(TCB.i18next.t('Proyecto.NO_EXPORT_AVAILABLE'))
    return false
  }
  // Proyecto hdr info
  TCB.datosProyecto.modoActivo = TCB.modoActivo
  TCB.datosProyecto.fechaExportacion = new Date()
  TCB.datosProyecto.nombreProyecto = TCB.nombreProyecto
  TCB.datosProyecto.territorio = TCB.territorio
  TCB.datosProyecto.direccion = TCB.direccion
  TCB.datosProyecto.emailContacto = TCB.emailContacto
  TCB.datosProyecto.telefonoContacto = TCB.telefonoContacto
  TCB.datosProyecto.fechaCreacion = TCB.fechaCreacion
  TCB.datosProyecto.descripcion = TCB.descripcion

  // Copy all global properties stored in TCB
  TCB.datosProyecto.parametros = TCB.parametros
  TCB.datosProyecto.featIdUnico = TCB.featIdUnico // Generador de identificadores de objeto unicos
  //TCB.datosProyecto.areaTotal = TCB.areaTotal
  TCB.datosProyecto.conversionCO2 = TCB.conversionCO2
  TCB.datosProyecto.tipoPanelActivo = TCB.tipoPanelActivo

  // Guardamos los datos del mapa en formato geoJSON
  TCB.datosProyecto.mapa = salvarDatosMapa()
  // Guardamos las bases
  TCB.datosProyecto.BaseSolar = TCB.BaseSolar

  //Si es !INDIVIDUAL guardamos las fincas
  if (TCB.modoActivo !== 'INDIVIDUAL') {
    TCB.datosProyecto.Finca = TCB.Finca
    TCB.datosProyecto.ZonaComun = TCB.ZonaComun
    //Guardamos la distribucion de energia entre los participes
    console.log('Exportando allocationGroup', TCB.allocationGroup)
    if (TCB.allocationGroup) TCB.datosProyecto.allocationGroup = TCB.allocationGroup
  }

  //Guardamos los tipos de consumo
  if (TCB.TipoConsumo.length !== 0) {
    TCB.datosProyecto.TipoConsumo = TCB.TipoConsumo
    //El objeto File correspondiente no puede ser exportado via JSON.
    TCB.datosProyecto.TipoConsumo.forEach((tipo) => {
      delete tipo.ficheroCSV
    })
  }

  //Guardamos la información de tarifas
  TCB.datosProyecto.nombreTarifaActiva = TCB.nombreTarifaActiva
  TCB.datosProyecto.tipoTarifa = TCB.tipoTarifa
  TCB.datosProyecto.tarifaActiva = TCB.tarifaActiva
  if (TCB.modoActivo !== 'INDIVIDUAL') {
    TCB.datosProyecto.Tarifa = TCB.Tarifa
  }

  TCB.datosProyecto.totalPaneles = TCB.totalPaneles

  if (TCB.economico) {
    TCB.datosProyecto.economico = TCB.economico
  }

  //TCB.datosProyecto.precioInstalacion = TCB.economico.precioInstalacion

  // Guardamos condiciones economicas no almacenadas en el objeto Economico
  // TCB.datosProyecto.tiempoSubvencionIBI = TCB.tiempoSubvencionIBI
  // TCB.datosProyecto.valorSubvencionIBI = TCB.valorSubvencionIBI
  // TCB.datosProyecto.porcientoSubvencionIBI = TCB.porcientoSubvencionIBI
  // TCB.datosProyecto.valorSubvencion = TCB.valorSubvencion
  // TCB.datosProyecto.porcientoSubvencion = TCB.porcientoSubvencion
  // TCB.datosProyecto.coefHucha = TCB.coefHucha
  // TCB.datosProyecto.cuotaHucha = TCB.cuotaHucha

  //Guardamos precio de la instalacion modificado
  //TCB.datosProyecto.precioInstalacionCorregido = TCB.economico.precioInstalacionCorregido

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
        const compressedData = new Uint8Array(e.target.result)
        const decompressed = pako.ungzip(compressedData, { to: 'string' })
        datos = JSON.parse(decompressed)
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

    reader.readAsArrayBuffer(fichero)
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
    let tbase = new BaseSolar(base, tipoPanelActivo)
    UTIL.debugLog('importLocalizacion - nueva base creada', tbase)

    //Creamos el objeto instalacion de la base
    tbase.instalacion = new Instalacion(base.instalacion)

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
  if (TCB.TipoConsumo.length > 0) {
    //   TCB.consumo = new Consumo()
    TCB.cambioTipoConsumo = true
  }
  // } else TCB.cambioTipoConsumo = true
}

/**
 * Proceso de importación de un proyecto solimp
 * @param {File} fichero Objeto File asociado al fichero solimp a importar
 * @returns {boolean} true si todo ha ido bien false si algo ha fallado
 */
async function importProject(fichero) {
  TCB.importando = true
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
  //TCB.requiereOptimizador = false

  // read data from solimp file
  const datosImportar = await obtenerDatos(fichero)
  console.log(datosImportar)
  // Check solimp version to check if compatible
  if (datosImportar.version[0] !== '4') {
    return { status: false, error: 'MSG_problemaVersion' }
  }

  if (datosImportar.modoActivo !== TCB.modoActivo) {
    return { status: false, error: 'Modo incompatible' }
  }

  TCB.nombreProyecto = datosImportar.nombreProyecto
  TCB.territorio = datosImportar.territorio
  TCB.direccion = datosImportar.direccion
  TCB.emailContacto = datosImportar.emailContacto
  TCB.telefonoContacto = datosImportar.telefonoContacto
  TCB.fechaCreacion = datosImportar.fechaCreacion
  TCB.descripcion = datosImportar.descripcion
  TCB.parametros = datosImportar.parametros
  TCB.featIdUnico = parseInt(datosImportar.featIdUnico) // Generador de identificadores de objeto unicos
  TCB.conversionCO2 = datosImportar.conversionCO2
  TCB.tipoPanelActivo = datosImportar.tipoPanelActivo
  importLocalizacion(datosImportar)

  if (TCB.modoActivo !== 'INDIVIDUAL') {
    TCB.Finca = datosImportar.Finca
    TCB.ZonaComun = datosImportar.ZonaComun
  }
  console.log(TCB.Finca[0])
  //TCB.precioInstalacion = datosImportar.precioInstalacion

  TCB.totalPaneles = datosImportar.totalPaneles
  //TCB.areaTotal = datosImportar.areaTotal

  // Import Tarifa
  TCB.nombreTarifaActiva = datosImportar.nombreTarifaActiva
  TCB.tipoTarifa = datosImportar.tipoTarifa
  TCB.tarifaActiva = datosImportar.tarifaActiva
  TCB.Tarifa = datosImportar.Tarifa
  importTipoConsumo(datosImportar)

  // //Importamos la distribucion de energia entre los participes
  if (TCB.modoActivo !== 'INDIVIDUAL') {
    console.log(datosImportar.allocationGroup)
    if (datosImportar.allocationGroup) {
      TCB.allocationGroup = datosImportar.allocationGroup
      console.log('IMPORTADO AllocationGroup rn TCB', datosImportar.allocationGroup)
    }
  }

  //if (TCB.modoActivo === 'INDIVIDUAL') {
  // Import IBI and subvenciones
  TCB.economico = datosImportar.economico
  console.log(TCB.economico)
  // TCB.economico.tiempoSubvencionIBI = datosImportar.tiempoSubvencionIBI
  // TCB.economico.valorSubvencionIBI = datosImportar.valorSubvencionIBI
  // TCB.economico.porcientoSubvencionIBI = datosImportar.porcientoSubvencionIBI
  //}

  // En versiones anteriores a la 4.1 la potencia unitaria estaba en kWp, ahora esta en Wp
  // if (datosImportar.version === '4') {
  //   TCB.tipoPanelActivo.potencia = datosImportar.tipoPanelActivo.potencia * 1000
  //   TCB.valorSubvencion = 0
  //   TCB.porcientoSubvencion = 0
  //   //Import virtual battery
  //   TCB.coefHucha = 80
  //   TCB.cuotaHucha = 0
  // } else {
  //   TCB.tipoPanelActivo.potencia = datosImportar.tipoPanelActivo.potencia
  //   TCB.valorSubvencion = datosImportar.valorSubvencion
  //   TCB.porcientoSubvencion = datosImportar.porcientoSubvencion
  //   TCB.coefHucha = datosImportar.coefHucha
  //   TCB.cuotaHucha = datosImportar.cuotaHucha
  //   TCB.version = datosImportar.version
  // }

  // importTipoConsumo(datosImportar)
  // TCB.consumo = new Consumo()
  // TCB.cambioTipoConsumo = false
  // await calculaResultados(true)

  // TCB.importando = true //This is a flag for PreparaEnergyBalance not to compute Economico again
  // TCB.economico = new Economico()
  // if (datosImportar.precioInstalacionCorregido !== undefined)
  //   TCB.economico.precioInstalacionCorregido = datosImportar.precioInstalacionCorregido
  return { status: true, error: '' }
}

export { exportProject, importProject }
