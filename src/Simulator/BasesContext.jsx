import { createContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// OpenLayers objects
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import Overlay from 'ol/Overlay.js'
import { OSM, Vector as VectorSource, XYZ } from 'ol/source'
import { Style, Fill, Stroke } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import { Point, LineString, Polygon } from 'ol/geom'
import { transform, fromLonLat } from 'ol/proj'
import { Draw } from 'ol/interaction'
import { getArea, getDistance } from 'ol/sphere.js'

// Solidar objects
import TCB from './classes/TCB'
import * as UTIL from './classes/Utiles'
import BaseSolar from './classes/BaseSolar'

const BasesContext = createContext()

const BasesContextProvider = ({ children }) => {
  const { t } = useTranslation()
  const [map, setMap] = useState()
  const [bases, setBases] = useState([])

  //TCB fields to be reflected in state
  const hdrBase = {
    idBaseSolar: undefined,
    nombreBaseSolar: undefined,
    cumbrera: undefined,
    ancho: undefined,
    inclinacion: undefined,
    inclinacionOptima: undefined,
    roofType: undefined,
    inAcimut: undefined,
    angulosOptimos: undefined,
    requierePVGIS: undefined,
    lonlatBaseSolar: undefined,
    potenciaMaxima: undefined,
    anchoReal: undefined,
    areaReal: undefined,
    panelesMaximo: undefined,
    filas: undefined,
    columnas: undefined,
  }

  // Move data object to the hdr template
  const hdrFill = (data) => {
    let newData = {}
    for (let field in hdrBase) newData[field] = data[field]
    return newData
  }

  // Add base object to the bases state
  function addTCBBaseToState(base) {
    setBases((prevBases) => [...prevBases, hdrFill(base)])
  }

  function computeCoplanarAcimut(formData, center, area) {
    const puntos = area.getCoordinates()[0]
    let acimut = parseInt(
      (Math.atan2(puntos[1][0] - puntos[2][0], puntos[1][1] - puntos[2][1]) * 180) /
        Math.PI,
    )

    // let midPoint = [0, 0]
    // const puntoAplicacion = center.getCoordinates()

    // let start, end
    // // First two points defines cumbrera
    // start = transform(puntos[0], 'EPSG:3857', 'EPSG:4326')
    // end = transform(puntos[1], 'EPSG:3857', 'EPSG:4326')
    // const cumbrera = getDistance(start, end)
    // //Third point defines ancho
    // start = transform(puntos[1], 'EPSG:3857', 'EPSG:4326')
    // end = transform(puntos[2], 'EPSG:3857', 'EPSG:4326')
    // const ancho = getDistance(start, end)

    const { columnas, filas, modoInstalacion } = BaseSolar.configuraPaneles(formData)

    // midPoint[0] = puntos[2][0] + (puntos[3][0] - puntos[2][0]) / 2
    // midPoint[1] = puntos[2][1] + (puntos[3][1] - puntos[2][1]) / 2
    // const geomAcimut = new LineString([puntoAplicacion, midPoint])

    //Scale to take three times ancho
    // geomAcimut.scale(3, 3, puntoAplicacion)
    // const acimutCoordinates = geomAcimut.getCoordinates()
    // let point1 = acimutCoordinates[0]
    // let point2 = acimutCoordinates[1]

    // Angles are measured with 0 at south (axis -Y) and positive west (axis +X)
    // let acimut =
    //   (Math.atan2(point1[0] - point2[0], point1[1] - point2[1]) * 180) / Math.PI
    // acimut = parseInt(acimut)

    // const acimutLine = new Feature({
    //   geometry: geomAcimut,
    // })
    // acimutLine.setId('BaseSolar.acimut.' + formData.idBaseSolar)
    // acimutLine.setStyle(null)
    // TCB.origenDatosSolidar.addFeature(acimutLine)

    return {
      columnas: columnas,
      filas: filas,
      modoInstalacion: modoInstalacion,
      inAcimut: acimut,
    }
  }

  function computeAcimut(formData, center, area) {
    let acimut
    const puntos = area.getCoordinates()[0]

    if (formData.roofType === 'Coplanar') {
      acimut = parseInt(
        (Math.atan2(puntos[1][0] - puntos[2][0], puntos[1][1] - puntos[2][1]) * 180) /
          Math.PI,
      )
    } else {
      let acimutCumbrera =
        (Math.atan2(puntos[0][0] - puntos[1][0], puntos[0][1] - puntos[1][1]) * 180) /
        Math.PI
      let acimutAncho = acimutCumbrera < 90 ? acimutCumbrera + 90 : acimutCumbrera - 90

      console.log('REAL ACIMUTS', acimutCumbrera, acimutAncho)

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

      console.log('FINAL ACIMUTS', finalAcimutCumbrera, finalAcimutAncho)

      const A = BaseSolar.configuraPaneles(formData)
      console.log('OPTION ANCHO', A, finalAcimutAncho, getPVGIS(finalAcimutAncho))

      const B = BaseSolar.configuraPaneles(formData)
      console.log(
        'OPTION CUMBRERA',
        B,
        finalAcimutCumbrera,
        getPVGIS(finalAcimutCumbrera),
      )

      if (
        A.filas * A.columnas * getPVGIS(finalAcimutAncho) >
        B.filas * B.columnas * getPVGIS(finalAcimutCumbrera)
      ) {
        acimut = finalAcimutAncho
      } else {
        acimut = finalAcimutCumbrera
      }
    }
    return acimut
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

  //Function to be executed at closeDialog del DialogNewBaseSolar. Is here because can be used as exit of DailogNewBaseSolar from BasesSuammry as edit and from MapComponent as new.
  function processFormData(reason, formData) {
    //Update openlayers label with nombreBaseSolar
    console.log('FROM DIALOG', formData)
    const labelFeatId = 'BaseSolar.label.' + formData.idBaseSolar
    const labelFeature = TCB.origenDatosSolidar.getFeatureById(labelFeatId)
    UTIL.setLabel(
      labelFeature,
      formData.nombreBaseSolar,
      TCB.baseLabelColor,
      TCB.baseLabelBGColor,
    )

    //Update ancho based on inclinacion in case of rooftype coplanar
    if (formData.roofType === 'Coplanar') {
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
    console.log('CONVERTED TO REAL', formData)

    //Will compute acimut in case it is a new base
    const centerPoint = labelFeature.getGeometry()
    const areaComponent = 'BaseSolar.area.' + formData.idBaseSolar
    const areaShape = TCB.origenDatosSolidar.getFeatureById(areaComponent).getGeometry()
    if (reason === 'save') {
      formData.inAcimut = computeAcimut(formData, centerPoint, areaShape)
      console.log('CON ACIMUT DATA', formData)
    } else {
      console.log('estamos editando por ahora no hay cambio de acimut desde dialogo')
    }
    formData = Object.assign({}, formData, BaseSolar.configuraPaneles(formData))
    console.log('CON CONFIGURACION DATA', formData)

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

    console.log('TO CREATE UPDATE', formData)
    //Update or create a TCB.BaseSolar with formData
    let baseIndex

    if (reason === 'save') {
      // We are creating a new base
      baseIndex = TCB.BaseSolar.push(new BaseSolar(formData)) - 1
      //Adding created BaseSolar to BasesContext
      addTCBBaseToState(TCB.BaseSolar[baseIndex])
    } else {
      //We are updating existing base
      baseIndex = TCB.BaseSolar.findIndex((base) => {
        return base.idBaseSolar === formData.idBaseSolar
      })
      //Update TCB.BaseSolar with formData
      TCB.BaseSolar[baseIndex].updateBase(formData)
      //Update BaseSolar in BasesContext with formData
      const updatedBases = bases.map((base) => {
        if (base.idBaseSolar === formData.idBaseSolar) {
          return { ...formData } // Replace the item with same idBaseSolar
        }
        return base // Keep other items unchanged
      })
      setBases(updatedBases)
    }
  }

  function validaBases() {
    if (TCB.BaseSolar.length > 0) {
      //Carga rendimientos de cada base que lo requiera asincronicamente
      //La propiedad requierePVGIS es gestionada en GestionLocalizacion y se pone a true cuando cambia algun angulo

      try {
        for (let base of TCB.BaseSolar) {
          if (base.requierePVGIS) {
            UTIL.debugLog('Base requiere PVGIS:', base)
            base.cargaRendimiento()
            base.requierePVGIS = false
            TCB.requiereOptimizador = true
          }
        }
        //setBases(oldBases)
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
    processFormData,
    validaBases,
    addTCBBaseToState,
  }
  return <BasesContext.Provider value={contextValue}>{children}</BasesContext.Provider>
}

export { BasesContext, BasesContextProvider }
