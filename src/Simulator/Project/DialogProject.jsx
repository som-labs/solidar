import { useRef, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'
import pako from 'pako'

// Openlayers objects
import { GeoJSON } from 'ol/format'

// REACT Solidar Components
import { BasesContext } from '../BasesContext'
import { EconomicContext } from '../EconomicContext'
import { EnergyContext } from '../EnergyContext'
import { ConsumptionContext } from '../ConsumptionContext'

// MUI objects
import { Box, Typography, Button, InputLabel, Tooltip } from '@mui/material'
// REACT Solidar Components
import { useAlert } from '../../components/AlertProvider.jsx'
import { SLDRInputField } from '../../components/SLDRComponents'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'
import BaseSolar from '../classes/BaseSolar.js'
import Instalacion from '../classes/Instalacion.js'
import Rendimiento from '../classes/Rendimiento.js'
import TipoConsumo from '../classes/TipoConsumo.js'
import { GlobalContext } from '../GlobalContext.jsx'

export default function DialogProject({ onClose }) {
  const { t } = useTranslation()
  const { SLDRAlert } = useAlert()
  const fileInputRef = useRef(null)
  const [task, setTask] = useState()
  const { tipoPanelActivo, setTipoPanelActivo, bases, setBases, map } =
    useContext(BasesContext)
  const {
    fincas,
    setFincas,
    zonasComunes,
    setZonasComunes,
    allocationGroup,
    setAllocationGroup,
    tiposConsumo,
    tarifas,
    setTarifas,
    setTiposConsumo,
    setRepartoValido,
  } = useContext(ConsumptionContext)
  const {
    totalPaneles,
    setTotalPaneles,
    calculaResultados,
    consumoGlobal,
    setConsumoGlobal,
    balanceGlobal,
    setBalanceGlobal,
    produccionGlobal,
    setProduccionGlobal,
  } = useContext(EnergyContext)
  const { setEconomicoGlobal, economicoGlobal } = useContext(EconomicContext)

  const {
    setImportando,
    setNewTiposConsumo,
    setNewBases,
    setNewPanelActivo,
    setNewUnits,
    setNewEnergyBalance,
  } = useContext(GlobalContext)

  const defaultData = {
    nombreProyecto: undefined,
    emailContacto: undefined,
    telefonoContacto: undefined,
    fechaCreacion: TCB.fechaCreacion,
    descripcion: undefined,
  }
  let initialData = {}
  for (let key in defaultData) {
    initialData[key] = TCB[key]
  }

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
    fName += date.getDate().toLocaleString(TCB.i18next.language, {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })
    fName +=
      '-' +
      date.getHours().toLocaleString(TCB.i18next.language, {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    fName += date.getMinutes().toLocaleString(TCB.i18next.language, {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })
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
  async function exportProject(values) {
    //At least one BaseSolar should exist to export
    if (bases.length === 0) {
      SLDRAlert('EXPORT', t('Proyecto.NO_EXPORT_AVAILABLE'), 'Error')
      return false
    }

    //If any proyecto property has been edited it will be included in solimp file
    for (let key in values) {
      TCB[key] = values[key]
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
    TCB.datosProyecto.featIdUnico = TCB.featIdUnico
    TCB.datosProyecto.conversionCO2 = TCB.conversionCO2
    TCB.datosProyecto.tipoPaneles = TCB.tipoPaneles
    TCB.datosProyecto.tipoPanelActivo = tipoPanelActivo

    // Guardamos los datos del mapa en formato geoJSON
    TCB.datosProyecto.mapa = salvarDatosMapa()

    // Guardamos las bases
    TCB.datosProyecto.BaseSolar = bases

    //Si es !INDIVIDUAL guardamos las fincas
    if (TCB.modoActivo !== 'INDIVIDUAL') {
      TCB.datosProyecto.Finca = fincas
      TCB.datosProyecto.ZonaComun = zonasComunes
      //Guardamos la distribucion de energia entre los participes
      console.log('Exportando allocationGroup', allocationGroup)
      if (allocationGroup) TCB.datosProyecto.allocationGroup = allocationGroup
    }

    //Guardamos los tipos de consumo
    if (tiposConsumo.length !== 0) {
      TCB.datosProyecto.TipoConsumo = tiposConsumo
      //El objeto File correspondiente no puede ser exportado via JSON.
      TCB.datosProyecto.TipoConsumo.forEach((tipo) => {
        delete tipo.ficheroCSV
      })
    }

    console.log(tarifas)
    TCB.datosProyecto.tarifas = tarifas
    TCB.datosProyecto.totalPaneles = totalPaneles

    if (economicoGlobal) {
      TCB.datosProyecto.economico = economicoGlobal
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
    SLDRAlert('EXPORT', t('Proyecto.MSG_SUCCESS_EXPORT', { fichero: rFile }))
    onClose()
  }

  async function obtenerDatos(fichero) {
    console.log('Obteniendo datos de: ', fichero)
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

    datosImportar.BaseSolar.forEach((base) => {
      // Actualizamos los labels del mapa con el nombre de la correspondiente base ya que no viene en los datos exportados
      const label = TCB.origenDatosSolidar.getFeatureById(
        'BaseSolar.label.' + base.idBaseSolar,
      )
      UTIL.setLabel(label, base.nombreBaseSolar, TCB.baseLabelColor, TCB.baseLabelBGColor)

      //Creamos el objeto BaseSolar
      let tbase = new BaseSolar(base, datosImportar.tipoPanelActivo)
      UTIL.debugLog('importLocalizacion - nueva base creada', tbase)

      //Creamos el objeto instalacion de la base
      if (Object.keys(base.instalacion).length !== 0)
        tbase.instalacion = new Instalacion(base.instalacion)

      UTIL.debugLog('importLocalizacion - nueva instalacion creada', tbase.instalacion)

      //Creamos el rendimiento.
      tbase.rendimiento = new Rendimiento(base.rendimiento)
      tbase.rendimiento.transformaFechas()
      UTIL.debugLog('importLocalizacion - nuevo rendimiento creado', tbase.rendimiento)

      //Creamos la baseSolar en TCB
      setBases((prev) => [...prev, tbase])
      //Fit map view to bases if any

      const mapView = map.getView()
      const center = mapView.getCenter()
      mapView.fit(TCB.origenDatosSolidar.getExtent())
      if (mapView.getZoom() > 20) {
        mapView.setCenter(center)
        mapView.setZoom(20)
      }
    })
  }

  async function importTipoConsumo(datosImportar) {
    datosImportar.TipoConsumo.forEach((tipo) => {
      let tTipo = new TipoConsumo(tipo)
      tTipo.transformaFechas()
      tTipo.fechaInicio = new Date(tTipo.fechaInicio)
      tTipo.ficheroCSV = tTipo.nombreFicheroCSV
      setTiposConsumo((prev) => [...prev, tTipo])
    })
  }

  async function handleImportClick(event) {
    // Trigger click event of the hidden file input element
    event.preventDefault()
    if (bases.length > 0) {
      if (
        await SLDRAlert('CONFIRM', t('Proyecto.MSG_CONFIRM_REPLACE'), 'Warning', true)
      ) {
        setTask('Import')
        fileInputRef.current.click()
      }
    } else {
      setTask('Import')
      fileInputRef.current.click()
    }
  }

  /**
   * Proceso de importación de un proyecto solimp
   * @param {File} fichero Objeto File asociado al fichero solimp a importar
   * @returns {boolean} true si todo ha ido bien false si algo ha fallado
   */
  async function importProject(event) {
    if (event.target.files.length === 0) return

    const fichero = event.target.files[0]

    setImportando(true)
    //Limpiamos todas las estructuras
    setTiposConsumo([])
    setBases([])
    setTarifas([])
    //  Variables de totalización
    setConsumoGlobal() // Este campo contiene la suma de todos las consumos[]
    setEconomicoGlobal() // Este campo contiene la suma de todos las consumos.economico[]
    setProduccionGlobal() // Este campo contiene la suma de todos las bases.produccion[]
    setBalanceGlobal() // Este campo contiene el balance global de la instalación

    // Las de OpenLayers
    TCB.origenDatosSolidar.getFeatures().forEach((feat) => {
      TCB.origenDatosSolidar.removeFeature(feat)
    })

    // read data from solimp file
    const datosImportar = await obtenerDatos(fichero)
    // Check solimp version to check if compatible
    if (datosImportar.version[0] !== '4') {
      SLDRAlert('IMPORT ERROR', t('PROYECTO.MSG_VERSION_PROBLEM'))
      return
    }

    if (datosImportar.modoActivo !== TCB.modoActivo) {
      SLDRAlert(
        'IMPORT ERROR',
        t('Proyecto.MSG_INCOMPATIBLE_MODE', { modo: datosImportar.modoActivo }),
        'Warning',
      )
      return
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
    TCB.tipoPaneles = datosImportar.tipoPaneles
    setTipoPanelActivo(datosImportar.tipoPanelActivo)
    setNewPanelActivo(false)

    importLocalizacion(datosImportar)
    setNewBases(false)
    if (TCB.modoActivo !== 'INDIVIDUAL') {
      if (datosImportar.Finca) setFincas(datosImportar.Finca)
      if (datosImportar.ZonaComun) setZonasComunes(datosImportar.ZonaComun)
    }
    setNewUnits(false)
    setTotalPaneles(datosImportar.totalPaneles)

    //console.log(datosImportar)
    // Import Tarifa
    // TCB.nombreTarifaActiva = datosImportar.nombreTarifaActiva
    // TCB.tipoTarifa = datosImportar.tipoTarifa
    // TCB.tarifaActiva = datosImportar.tarifaActiva

    if (datosImportar.tarifas) {
      setTarifas(datosImportar.tarifas)
    }

    if (datosImportar.TipoConsumo) {
      importTipoConsumo(datosImportar)
      setNewTiposConsumo(false)
    }

    // //Importamos la distribucion de energia entre los participes
    if (TCB.modoActivo !== 'INDIVIDUAL') {
      if (datosImportar?.allocationGroup) {
        setAllocationGroup(datosImportar.allocationGroup)
        console.log('IMPORTADO AllocationGroup', datosImportar.allocationGroup)
      }
    }
    setNewEnergyBalance(false)
    setRepartoValido(true)
    setEconomicoGlobal(datosImportar?.economico)
    onClose()
  }

  function cancelProject() {
    console.log('cancel')
    onClose()
  }

  function saveProject(values) {
    console.log('Tarea:' + task)

    //recoverFormData('save', values)
  }

  const validate = (values) => {
    const errors = {}

    if (values.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      console.log(emailPattern.test(values.email))
      if (!emailPattern.test(values.email)) {
        errors.emailContacto = 'Formato de email incorrecto'
        return errors
      }
    }

    //Pattern for Spanish phone numbers (landline or mobile)
    if (values.telefonoContacto) {
      const patternSpain = /^(?:(?:\+|00)34)?[6-9]\d{8}$/
      if (!patternSpain.test(values.telefono)) {
        errors.telefonoContacto =
          'No es un número de teléfono correcto, verificalo por favor'
        return errors
      }
    }
    return errors
  }

  return (
    <>
      <Formik
        initialValues={initialData}
        validate={validate}
        onSubmit={(values) => {
          exportProject(values)
        }}
      >
        {({ values }) => (
          <Form>
            <DialogTitle>{t('Proyecto.DIALOG_TITLE')}</DialogTitle>
            <DialogContent>
              {/* Material-UI button that triggers file input click */}
              <Box
                style={{
                  mt: '4rem',
                  border: 1,
                  display: 'flex',
                  gap: 8,
                  flexDirection: 'row',
                }}
              >
                {/* Hidden file input element */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".solimp"
                  style={{ display: 'none' }}
                  onChange={importProject}
                />

                <Tooltip title={t('Proyecto.TOOLTIP.importarProyecto')}>
                  <Button
                    variant="contained"
                    fullWidth
                    color="primary"
                    size="large"
                    onClick={handleImportClick}
                  >
                    {t('Proyecto.LABEL.importarProyecto')}
                  </Button>
                </Tooltip>

                <Button
                  variant="contained"
                  fullWidth
                  color="primary"
                  size="large"
                  onClick={() => setTask('Export')}
                  disabled={bases.length === 0}
                >
                  {t('Proyecto.LABEL.exportarProyecto')}
                </Button>
              </Box>

              {task === 'Export' ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    flexDirection: 'column',
                    flex: 1,
                    padding: '5px',
                    mb: '2rem',
                  }}
                >
                  <Typography variant="body" align="center">
                    {t('Proyecto.DIALOG_DESCRIPTION')}
                  </Typography>

                  <InputLabel htmlFor="nombreProyecto">
                    {t('Proyecto.PROP.nombreProyecto')}
                  </InputLabel>
                  <SLDRInputField
                    name="nombreProyecto"
                    type="text"
                    object="Proyecto"
                    unit=""
                    sx={{ textAlign: 'left', width: '100%' }}
                  />

                  <InputLabel htmlFor="emailContacto">
                    {t('Proyecto.PROP.emailContacto')}
                  </InputLabel>
                  <SLDRInputField
                    name="emailContacto"
                    object="Proyecto"
                    sx={{ textAlign: 'left', width: '100%' }}
                  ></SLDRInputField>

                  <InputLabel htmlFor="telefonoContacto">
                    {t('Proyecto.PROP.telefonoContacto')}
                  </InputLabel>
                  <SLDRInputField
                    name="telefonoContacto"
                    object="Proyecto"
                    sx={{ textAlign: 'left' }}
                  ></SLDRInputField>

                  <InputLabel htmlFor="fechaCreacion">
                    {t('Proyecto.PROP.fechaCreacion')}
                  </InputLabel>
                  <SLDRInputField
                    disabled
                    name="fechaCreacion"
                    object="Proyecto"
                    sx={{ textAlign: 'left', mb: '1rem' }}
                  ></SLDRInputField>
                  <SLDRInputField
                    name="descripcion"
                    style={{
                      textAlign: 'left',
                      width: '100%',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                    }}
                    MUIType="TextareaAutosize"
                    aria-label="descripcion"
                    placeholder={t('Proyecto.PROP.descripcion')}
                    minRows={3}
                    object="Proyecto"
                  ></SLDRInputField>
                </Box>
              ) : (
                ''
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={cancelProject}>{t('BASIC.LABEL_CANCEL')}</Button>
              {task === 'Export' ? (
                <Button type="submit">{t('BASIC.LABEL_EXEC')}</Button>
              ) : (
                ''
              )}
            </DialogActions>
          </Form>
        )}
      </Formik>
    </>
  )
}
