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
    console.log('IN', formData)
    const puntos = area.getCoordinates()[0]
    let acimut = parseInt(
      (Math.atan2(puntos[1][0] - puntos[2][0], puntos[1][1] - puntos[2][1]) * 180) /
        Math.PI,
    )

    let midPoint = [0, 0]
    const puntoAplicacion = center.getCoordinates()

    // let start, end
    // // First two points defines cumbrera
    // start = transform(puntos[0], 'EPSG:3857', 'EPSG:4326')
    // end = transform(puntos[1], 'EPSG:3857', 'EPSG:4326')
    // const cumbrera = getDistance(start, end)
    // //Third point defines ancho
    // start = transform(puntos[1], 'EPSG:3857', 'EPSG:4326')
    // end = transform(puntos[2], 'EPSG:3857', 'EPSG:4326')
    // const ancho = getDistance(start, end)

    const anchoReal = formData.ancho / Math.cos((formData.inclinacion * Math.PI) / 180)
    const { columnas, filas, modoInstalacion } = configuraPaneles(
      formData.cumbrera,
      anchoReal,
      0,
    )

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
      anchoReal: anchoReal,
      columnas: columnas,
      filas: filas,
      modoInstalacion: modoInstalacion,
      inAcimut: acimut,
    }
  }

  function computeHorizontalAcimut(formData, center, area) {
    const puntos = area.getCoordinates()[0]
    let acimutCumbrera =
      (Math.atan2(puntos[0][0] - puntos[1][0], puntos[0][1] - puntos[1][1]) * 180) /
      Math.PI
    let acimutAncho = acimutCumbrera < 90 ? acimutCumbrera + 90 : acimutCumbrera - 90
    console.log(acimutCumbrera, acimutAncho)

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

    console.log(finalAcimutCumbrera, finalAcimutAncho)

    const { cumbrera, ancho, inclinacion } = formData
    const A = configuraPaneles(cumbrera, ancho, inclinacion, formData.lonlatBaseSolar)
    console.log(A, finalAcimutAncho, getPVGIS(finalAcimutAncho))

    const B = configuraPaneles(ancho, cumbrera, inclinacion, formData.lonlatBaseSolar)
    console.log(B, finalAcimutCumbrera, getPVGIS(finalAcimutCumbrera))
    let acimutData
    if (
      A.filas * A.columnas * getPVGIS(finalAcimutAncho) >
      B.filas * B.columnas * getPVGIS(finalAcimutCumbrera)
    ) {
      acimutData = {
        columnas: A.columnas,
        filas: A.filas,
        modoInstalacion: A.modoInstalacion,
        inAcimut: finalAcimutAncho,
      }
    } else {
      acimutData = {
        columnas: B.columnas,
        filas: B.filas,
        modoInstalacion: B.modoInstalacion,
        inAcimut: finalAcimutCumbrera,
      }
    }
    return acimutData
  }

  function configuraPaneles(cumbrera, ancho, inclinacion, lonlat) {
    let hColumnas
    let hFilas
    let vColumnas
    let vFilas
    let hGap
    let vGap
    let config = {}

    if (inclinacion === 0) {
      // Opcion largo panel paralelo a cumbrera
      hColumnas = Math.trunc(
        (cumbrera - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.largo,
      )
      hFilas = Math.trunc((ancho - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.ancho)

      // Opcion largo panel perpendicular a cumbrera
      vColumnas = Math.trunc(
        (cumbrera - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.ancho,
      )
      vFilas = Math.trunc((ancho - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.largo)
      // Elegimos la configuracion que nos permite mas paneles
    } else {
      //Caso tejado horizontal u optimo
      const latitud = parseFloat(lonlat.split(',')[1])
      // Opcion largo panel paralelo a la cumbrera
      hGap =
        TCB.tipoPanelActivo.ancho * Math.cos((inclinacion * Math.PI) / 180) +
        (TCB.tipoPanelActivo.ancho * Math.sin((inclinacion * Math.PI) / 180)) /
          Math.tan(((61 - latitud) * Math.PI) / 180)
      hColumnas = Math.trunc(
        (cumbrera - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.largo,
      )
      hFilas = Math.trunc((ancho - 2 * TCB.parametros.margen) / hGap)
      //En el caso de una sola fila podría suceder que la inclinación indique un ancho entre filas superior al ancho pero igualmente entra un panel
      hFilas = hFilas === 0 ? 1 : hFilas

      //console.log(hGap, hColumnas, hFilas)
      // Opcion largo panel perpendicular a cumpbrera
      vGap =
        TCB.tipoPanelActivo.largo * Math.cos((inclinacion * Math.PI) / 180) +
        (TCB.tipoPanelActivo.largo * Math.sin((inclinacion * Math.PI) / 180)) /
          Math.tan(((61 - latitud) * Math.PI) / 180)
      vColumnas = Math.trunc(
        (cumbrera - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.ancho,
      )
      vFilas = Math.trunc((ancho - 2 * TCB.parametros.margen) / vGap)
      //En el caso de una sola fila podría suceder que la inclinación indique un ancho entre filas superior al ancho pero igualmente entra un panel
      vFilas = vFilas === 0 ? 1 : vFilas
    }

    if (hColumnas * hFilas > vColumnas * vFilas) {
      config = { columnas: hColumnas, filas: hFilas, modoInstalacion: 'Horizontal' }
    } else {
      config = { columnas: vColumnas, filas: vFilas, modoInstalacion: 'Vertical' }
    }

    UTIL.debugLog('Configuración', config)
    return config
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
    console.log(typeof formData, formData)
    //Update openlayers label with nombreBaseSolar
    const labelFeatId = 'BaseSolar.label.' + formData.idBaseSolar
    const labelFeature = TCB.origenDatosSolidar.getFeatureById(labelFeatId)
    UTIL.setLabel(
      labelFeature,
      formData.nombreBaseSolar,
      TCB.baseLabelColor,
      TCB.baseLabelBGColor,
    )

    //Will compute acimut
    const centerPoint = labelFeature.getGeometry()
    const areaComponent = 'BaseSolar.area.' + formData.idBaseSolar
    const areaShape = TCB.origenDatosSolidar.getFeatureById(areaComponent).getGeometry()

    let acimutData
    if (formData.roofType === 'Coplanar') {
      acimutData = computeCoplanarAcimut(formData, centerPoint, areaShape)
      formData = Object.assign({}, formData, acimutData)
    } else {
      acimutData = computeHorizontalAcimut(formData, centerPoint, areaShape)
      formData = Object.assign({}, formData, acimutData)
    }
    const puntoAplicacion = centerPoint.getCoordinates()
    let midPoint = []
    console.log(puntoAplicacion[0], -30 * Math.sin((formData.inAcimut / 180) * Math.PI))
    console.log(puntoAplicacion[1], -30 * Math.cos((formData.inAcimut / 180) * Math.PI))

    midPoint[0] = puntoAplicacion[0] - 30 * Math.sin((formData.inAcimut / 180) * Math.PI)
    midPoint[1] = puntoAplicacion[1] - 30 * Math.cos((formData.inAcimut / 180) * Math.PI)
    const geomAcimut = new LineString([puntoAplicacion, midPoint])
    const acimutLine = new Feature({
      geometry: geomAcimut,
    })
    acimutLine.setId('BaseSolar.acimut.' + formData.idBaseSolar)
    acimutLine.setStyle(null)
    TCB.origenDatosSolidar.addFeature(acimutLine)

    console.log('TOCREATE', formData)
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
