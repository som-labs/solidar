import { createContext, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

// OpenLayers objects

import Feature from 'ol/Feature'
import { LineString } from 'ol/geom'

// REACT Solidar Components
import { useAlert } from '../components/AlertProvider.jsx'
import { GlobalContext } from './GlobalContext.jsx'

// Solidar objects
import TCB from './classes/TCB'
import * as UTIL from './classes/Utiles'
import BaseSolar from './classes/BaseSolar'

const BasesContext = createContext()

const BasesContextProvider = ({ children }) => {
  const { t } = useTranslation()
  const { setNewBases } = useContext(GlobalContext)
  const { SLDRAlert } = useAlert()
  const [map, setMap] = useState()
  const [bases, setBases] = useState([])
  const [tipoPanelActivo, setTipoPanelActivo] = useState({
    id: 3,
    nombre: '430 Wp',
    tecnologia: 'crystSi',
    potencia: 430,
    ancho: 1.134,
    largo: 1.762,
  })

  const addBase = (base) => {
    setBases((prev) => [...prev, base])
  }

  const modifyBase = (updatedBase) => {
    setBases(
      bases.map((base) =>
        base.idBaseSolar === updatedBase.idBaseSolar
          ? Object.create(
              Object.getPrototypeOf(updatedBase),
              Object.getOwnPropertyDescriptors(updatedBase),
            )
          : base,
      ),
    )
  }

  const deleteBase = (id) => {
    setBases(bases.filter((base) => base.idBaseSolar !== id))
  }

  function computeAcimut(formData, center, area) {
    let inAcimut
    let cumbrera
    let anchoReal

    const puntos = area.getCoordinates()[0]

    if (formData.roofType === 'Inclinado') {
      cumbrera = formData.cumbrera
      anchoReal = formData.anchoReal
      inAcimut = parseInt(
        (Math.atan2(puntos[1][0] - puntos[2][0], puntos[1][1] - puntos[2][1]) * 180) /
          Math.PI,
      )
    } else {
      let acimutCumbrera =
        (Math.atan2(puntos[0][0] - puntos[1][0], puntos[0][1] - puntos[1][1]) * 180) /
        Math.PI
      let acimutAncho = acimutCumbrera < 90 ? acimutCumbrera + 90 : acimutCumbrera - 90

      //console.log('REAL ACIMUTS', acimutCumbrera, acimutAncho)

      let finalAcimutCumbrera
      if (Math.abs(acimutCumbrera) >= 90) {
        finalAcimutCumbrera =
          acimutCumbrera < 0 ? acimutCumbrera + 180 : acimutCumbrera - 180
      } else {
        finalAcimutCumbrera = acimutCumbrera
      }

      let finalAcimutAncho
      if (Math.abs(acimutAncho) >= 90) {
        finalAcimutAncho = acimutAncho < 0 ? acimutAncho + 180 : acimutAncho - 180
      } else {
        finalAcimutAncho = acimutAncho
      }

      //console.log('FINAL ACIMUTS', finalAcimutCumbrera, finalAcimutAncho)

      //Option using cumbrera as cumbrera then acimut is acimut defined by ancho
      let opcCumbrera = {
        ...formData,
      }
      const A = BaseSolar.configuraPaneles(opcCumbrera)
      // console.log(
      //   'OPTION Cumbrera como Cumbrera',
      //   A,
      //   finalAcimutAncho,
      //   getPVGIS(finalAcimutAncho),
      // )

      //Option using ancho as cumbrera then acimut is acimut defined by cumbrera
      let opcAncho = {
        ...formData,
        anchoReal: formData.cumbrera,
        cumbrera: formData.anchoReal,
      }
      const B = BaseSolar.configuraPaneles(opcAncho)
      // console.log(
      //   'OPTION Ancho como cumbrera',
      //   B,
      //   finalAcimutCumbrera,
      //   getPVGIS(finalAcimutCumbrera),
      // )

      if (
        A.filas * A.columnas * getPVGIS(finalAcimutAncho) >
        B.filas * B.columnas * getPVGIS(finalAcimutCumbrera)
      ) {
        // console.log(
        //   'MEJOR opcion cumbrera como cumbrera => acimut ' +
        //     finalAcimutAncho +
        //     ' configuracion ',
        //   A,
        // )
        inAcimut = finalAcimutAncho
        anchoReal = formData.anchoReal
        cumbrera = formData.cumbrera
      } else {
        // console.log(
        //   'MEJOR opcion ancho como cumbrera => acimut ' +
        //     finalAcimutCumbrera +
        //     ' configuración ',
        //   B,
        // )
        inAcimut = finalAcimutCumbrera
        anchoReal = formData.cumbrera
        cumbrera = formData.anchoReal
      }
    }
    return { inAcimut: inAcimut, anchoReal: anchoReal, cumbrera: cumbrera }
  }

  function getPVGIS(acimut) {
    let PV = [
      { desde: 0, hasta: 30, valor: 1616 },
      { desde: 30, hasta: 60, valor: 1577 },
      { desde: 60, hasta: 90, valor: 1459 },
      { desde: 90, hasta: 100, valor: 1281 },
    ]
    acimut = Math.abs(acimut)
    let i = PV.findIndex((rango) => acimut >= rango.desde)

    return (
      PV[i].valor +
      ((PV[i].valor - PV[i + 1].valor) / (PV[i].desde - PV[i + 1].desde)) *
        (Math.abs(acimut) - PV[i].desde)
    )
  }

  /** Function to be executed at closeDialog of DialogNewBaseSolar. Is used as exit of DailogNewBaseSolar from BasesSummary as edit and from MapComponent as new.
   *
   * @param {string} reason Can be save or edit
   * @param {Object} formData New data provided by dialog
   */

  function updateBaseFromForm(reason, formData) {
    //Update openlayers label with nombreBaseSolar
    const labelFeatId = 'BaseSolar.label.' + formData.idBaseSolar
    const labelFeature = TCB.origenDatosSolidar.getFeatureById(labelFeatId)
    UTIL.setLabel(
      labelFeature,
      formData.nombreBaseSolar,
      TCB.baseLabelColor,
      TCB.baseLabelBGColor,
    )

    //Update ancho based on inclinacion in case of rooftype inclinado
    if (formData.roofType === 'Inclinado') {
      formData.anchoReal =
        formData.ancho / Math.cos((formData.inclinacion * Math.PI) / 180)
    } else {
      formData.anchoReal = formData.ancho
      /*In order to compute panels configuration based on shadows we need to have a aproximate angle.
      when asked to PVGIS for Spain  get an average of 35º will be used to avoid big configuration changes between 
      now and BalanceEnergia when final optimal tilt will be gotten. */
      if (formData.inclinacionOptima) formData.inclinacion = 35
    }
    formData.areaReal = formData.cumbrera * formData.anchoReal

    //Will compute acimut in case it is a new base
    const centerPoint = labelFeature.getGeometry()
    const areaComponent = 'BaseSolar.area.' + formData.idBaseSolar
    const areaShape = TCB.origenDatosSolidar.getFeatureById(areaComponent).getGeometry()
    if (reason === 'save') {
      formData = { ...formData, ...computeAcimut(formData, centerPoint, areaShape) }
    }

    formData = Object.assign({}, formData, BaseSolar.configuraPaneles(formData))

    if (formData.filas * formData.columnas === 0) {
      SLDRAlert(
        'VERICACION AREA',
        t('LOCATION.NOT_ENOUGH_AREA', {
          largo: UTIL.formatoValor('longitud', formData.tipoPanel.largo),
          ancho: UTIL.formatoValor('longitud', formData.tipoPanel.ancho),
          margen: UTIL.formatoValor('longitud', TCB.parametros.margen),
        }),
        'Warning',
      )
      UTIL.deleteBaseGeometries(formData.idBaseSolar)
      return false
    }

    //Will draw acimut line
    const puntoAplicacion = centerPoint.getCoordinates()
    let midPoint = []
    midPoint[0] = puntoAplicacion[0] - 30 * Math.sin((formData.inAcimut / 180) * Math.PI)
    midPoint[1] = puntoAplicacion[1] - 30 * Math.cos((formData.inAcimut / 180) * Math.PI)
    const geomAcimut = new LineString([puntoAplicacion, midPoint])
    const acimutLine = new Feature({
      geometry: geomAcimut,
    })
    acimutLine.setId('BaseSolar.acimut.' + formData.idBaseSolar)
    acimutLine.setStyle(null)
    TCB.origenDatosSolidar.addFeature(acimutLine)

    //console.log('setting default to', formData.inclinacion)

    TCB.inclinacionDefault = formData.inclinacion
    //Update or create a BaseSolar with formData
    if (reason === 'save') {
      //We are creating a new base
      addBase(new BaseSolar(formData))
    } else {
      //We are updating existing base
      modifyBase(new BaseSolar(formData))
    }
    setNewBases(true)
    TCB.requiereOptimizador = true
  }

  async function validaBases() {
    if (bases.length > 0) {
      //Carga rendimientos de cada base que lo requiera asincronicamente
      //La propiedad requierePVGIS es gestionada en GestionLocalizacion y se pone a true cuando cambia algun angulo

      try {
        for (let base of bases) {
          if (base.requierePVGIS) {
            UTIL.debugLog('Base requiere PVGIS:', base)
            await base.cargaRendimiento()
            setNewBases(true)
          }
        }

        return { status: true }
      } catch (err) {
        return { status: false, error: err }
      }
    } else {
      return { status: false, error: t('LOCATION.ERROR_DEFINE_BASE') }
    }
  }

  const contextValue = {
    map,
    setMap,
    bases,
    setBases,
    addBase,
    modifyBase,
    deleteBase,
    updateBaseFromForm,
    validaBases,
    tipoPanelActivo,
    setTipoPanelActivo,
  }
  return <BasesContext.Provider value={contextValue}>{children}</BasesContext.Provider>
}

export { BasesContext, BasesContextProvider }
