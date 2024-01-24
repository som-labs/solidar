import { useState, useRef, useEffect, useContext } from 'react'
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
import { getArea, getLength, getDistance } from 'ol/sphere.js'

// MUI objects
import { Button, Tooltip, Typography, Box } from '@mui/material'

//React global components
import { BasesContext } from '../BasesContext'
import DialogBaseSolar from './DialogBaseSolar'
import { useDialog } from '../../components/DialogProvider'
import { AlertContext } from '../components/Alert'

// Local Location module
import verificaTerritorio from './Nominatim.js'

// Solidar global modules
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

/**
 * A React component to create BaseSolar on the OpenLayer map interface
 * @component
 * @property {string} cause Can be ['save'-> buton , 'cancel' -> buton, Pointevent -> backdropClick]
 * @param {Object} data - The properties of the BaseSolar component
 * @param {function} onClose - Function to be called when finishing edit. formData is the data after manipulation.
 * @returns {JSX.Element} The rendered JSX element.
 */

export default function MapComponent() {
  const { t } = useTranslation()

  // Map state
  const [mapType, setMapType] = useState('LOCATION.LABEL_SATELITE')
  const [selectedCoord] = useState([-3.7, 40.45])

  const { map, setMap, processFormData } = useContext(BasesContext)
  const mapElement = useRef()
  const basesLayer = useRef()
  const mapRef = useRef(map)
  const { SLDRAlert } = useContext(AlertContext)

  const [openDialog, closeDialog] = useDialog()

  const baseInteraction = new Draw({
    source: TCB.origenDatosSolidar,
    type: 'Polygon',
    maxPoints: 3,
    //Esta funcion permite generar un rectangulo ortogonal al primer segmento dibujado, la cumbrera.
    geometryFunction: function (coordinates, geometry) {
      let newCoordinates = coordinates[0].slice()

      if (newCoordinates.length === 3) {
        const firstPoint = newCoordinates[0]
        const fixPoint = newCoordinates[1]
        let floatPoint = newCoordinates[2]
        const dx = fixPoint[0] - firstPoint[0]
        const dy = fixPoint[1] - firstPoint[1]
        const dpx = floatPoint[0] - firstPoint[0]
        const dpy = floatPoint[1] - firstPoint[1]

        const rotationBase = Math.atan2(dy, dx)
        let rotation

        let vecprod = dx * dpy - dy * dpx
        if (vecprod > 0) rotation = rotationBase + Math.PI / 2
        else rotation = rotationBase - Math.PI / 2

        const radius = UTIL.distancia(floatPoint, fixPoint)

        floatPoint[0] = fixPoint[0] + radius * Math.cos(rotation)
        floatPoint[1] = fixPoint[1] + radius * Math.sin(rotation)
        newCoordinates[2] = floatPoint

        let nuevoY = floatPoint[1] - (fixPoint[1] - firstPoint[1])
        let nuevoX = firstPoint[0] - (fixPoint[0] - floatPoint[0])
        let nuevoPunto = [nuevoX, nuevoY]
        newCoordinates.splice(3, 0, nuevoPunto)
        newCoordinates.splice(4, 0, firstPoint)
      }

      if (!geometry) {
        geometry = new Polygon([newCoordinates])
      } else {
        geometry.setCoordinates([newCoordinates])
      }
      return geometry
    },
  })

  //Manage esc key during base drawing
  var drawing = false
  const keydown = (evt) => {
    var charCode = evt.which ? evt.which : evt.keyCode
    if (charCode === 27 && drawing === true) {
      baseInteraction.set('escKey', Math.random())
    }
  }

  document.addEventListener('keydown', keydown, false)
  //set a custom listener name escKey
  baseInteraction.set('escKey', '')

  // Measuring Tooltip variables
  let sketch //Currently drawn OL feature.
  let measureTooltipElement //HTMLElement -The measure tooltip element.
  let measureTooltip //OL Overlay where to show measurement
  /**

  /**
   * Format tooltip text.
   * @param {Polygon} polygon The polygon.
   * @return {string} Formatted area.
   */
  const formatData = function (polygon) {
    let output
    let cumbrera
    let ancho

    const vertices = polygon.getCoordinates()[0]
    if (vertices.length < 2) return ''

    const start = transform(vertices[0], 'EPSG:3857', 'EPSG:4326')
    const end = transform(vertices[1], 'EPSG:3857', 'EPSG:4326')
    cumbrera = getDistance(start, end)

    if (vertices.length === 2) {
      output = t('LOCATION.TOOLTIP_CUMBRERA', {
        cumbrera: UTIL.formatoValor('longitud', Math.round(cumbrera)),
      })
    } else {
      const start = transform(vertices[1], 'EPSG:3857', 'EPSG:4326')
      const end = transform(vertices[2], 'EPSG:3857', 'EPSG:4326')
      ancho = getDistance(start, end)

      output = t('LOCATION.TOOLTIP_MEASURES', {
        cumbrera: UTIL.formatoValor('longitud', cumbrera),
        ancho: UTIL.formatoValor('longitud', ancho),
        area: UTIL.formatoValor('superficie', getArea(polygon)),
      })
    }
    return output
  }

  /**
   * Creates a new measure tooltip
   */
  function createMeasureTooltip() {
    if (measureTooltipElement) {
      measureTooltipElement.parentNode.removeChild(measureTooltipElement)
    }

    const customStyle = {
      lineHeight: '1',
      color: 'blue',
    }

    measureTooltipElement = document.createElement('div')
    Object.assign(measureTooltipElement.style, customStyle)
    measureTooltip = new Overlay({
      element: measureTooltipElement,
      offset: [15, -15],
      positioning: 'botom-left',
      stopEvent: false,
      insertFirst: false,
    })
  }

  createMeasureTooltip()

  //Define several interaction events on the map
  baseInteraction.on('drawstart', (evt) => {
    drawing = true
    sketch = evt.feature
    const listener = sketch.getGeometry().on('change', function (evt) {
      const geom = evt.target
      const output = formatData(geom)
      measureTooltipElement.innerHTML = output
    })
  })

  baseInteraction.on('drawend', () => {
    measureTooltipElement.classList.add('hidden')
    measureTooltipElement.innerHTML = ' '
    sketch = null
    drawing = false
  })

  baseInteraction.on('change:escKey', () => {
    baseInteraction.removeLastPoint()
  })

  const pointerMoveHandler = function (evt) {
    if (evt.dragging) {
      return
    }
    if (sketch) {
      const geom = sketch.getGeometry().getCoordinates()[0]
      if (geom.length > 1) {
        if (geom[1][0] < geom[0][0]) measureTooltip.positioning = 'center-right'
        else measureTooltip.positioning = 'center-left'
        //console.log(measureTooltip.positioning)
      }
    }
    measureTooltip.setPosition(evt.coordinate)
  }

  useEffect(() => {
    // If there is not previous Map in MapContext create one
    if (!mapRef.current) {
      //Landbase Open Street Map
      const OpenS = new TileLayer({
        source: new OSM({
          crossOrigin: null,
          maxZoom: 30,
        }),
      })
      OpenS.set('name', 'OSM')

      // SAT is satellite layer provided by ESRI via arcgisonline
      const SAT = new TileLayer({
        source: new XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 30,
        }),
      })
      SAT.set('name', 'SAT')
      SAT.setVisible(false)

      // Vector is the layers where new features (bases o puntosConsumo) are shown from vectorSource
      basesLayer.current = new VectorLayer({
        source: TCB.origenDatosSolidar,
        style: new Style({
          stroke: new Stroke({
            fillcolor: [0, 250, 0, 0.5],
            color: [0, 250, 0, 1],
            width: 4,
          }),
          fill: new Fill({
            color: 'rgba(0, 255, 0, 0.3)',
          }),
        }),
      })

      //OpenLayers map creation
      mapRef.current = new Map({
        target: mapElement.current,
        layers: [OpenS, SAT, basesLayer.current],
        view: new View({
          center: fromLonLat(selectedCoord),
          maxZoom: 20,
          zoom: 18,
        }),
        controls: [],
      })

      //Load interactions to allow bases drawing
      mapRef.current.addInteraction(baseInteraction)

      //Event to call the function that will create the base once the geometry is defined in the map
      baseInteraction.on('drawend', (event) => {
        construirBaseSolar(event)
      })

      //Store the map in BasesContext
      mapRef.current.on('pointermove', pointerMoveHandler)
      setMap(mapRef.current)
    } else {
      mapRef.current.setTarget(mapElement.current)
    }
    mapRef.current.addOverlay(measureTooltip)
  }, [])

  // Function called when properties dialog is closed
  function endDialog(reason, formData) {
    switch (reason) {
      case undefined:
        return
      case 'save':
        processFormData(reason, formData)
        break
      case 'cancel':
        UTIL.deleteBaseGeometries(formData.idBaseSolar)
        break
      default: //Backdrop click does not return formData
        UTIL.deleteBaseGeometries(TCB.featIdUnico)
        break
    }
    closeDialog()
  }

  //Called when a base geometry has been created in the map
  async function construirBaseSolar(geoBaseSolar) {
    // Get unique featID
    TCB.featIdUnico++

    // Construimos la geometria de la BaseSolar que es un paralelogramo a partir de tres puntos
    const geometria = geoBaseSolar.feature.getGeometry()
    const puntos = geometria.getCoordinates()[0]

    let start, end
    // First two points defines cumbrera
    start = transform(puntos[0], 'EPSG:3857', 'EPSG:4326')
    end = transform(puntos[1], 'EPSG:3857', 'EPSG:4326')
    const cumbrera = getDistance(start, end)
    //Third point defines ancho
    start = transform(puntos[1], 'EPSG:3857', 'EPSG:4326')
    end = transform(puntos[2], 'EPSG:3857', 'EPSG:4326')
    const ancho = getDistance(start, end)

    // Calculamos una coordenada central para esta base que utilizaremos en PVGIS y donde la rotularemos
    const puntoAplicacion = geometria.getInteriorPoint().getCoordinates()

    // Transformamos el punto al EPSG:4326 necesario para Nominatim
    const puntoAplicacion_4326 = transform(puntoAplicacion, 'EPSG:3857', 'EPSG:4326')

    //Verificamos que el punto esta en España y ademas fijamos el territorio
    const cursorOriginal = document.body.style.cursor
    document.body.style.cursor = 'progress'
    try {
      const { status, details } = await verificaTerritorio(puntoAplicacion_4326)
      document.body.style.cursor = cursorOriginal
      if (status !== 'success') {
        SLDRAlert(
          'NOMINATIM error 1',
          t('LOCATION.ERROR_' + status, { err: details }),
          'ERROR',
        )
        TCB.origenDatosSolidar.removeFeature(geoBaseSolar.feature)
        return false
      }
    } catch (error) {
      console.log('CATCHED', error)
      SLDRAlert('NOMINATIM error 2', error, 'ERROR')
      TCB.origenDatosSolidar.removeFeature(geoBaseSolar.feature)
      return false
    }

    // Calculo propuesta de acimut basandose en la cumbrera
    const azimutLength = 100
    let midPoint = [0, 0]
    let coef

    // Si el dibujo es libre, es decir sin cumbrera primero
    //    let rotate = 0
    // if (largo2 > largo1) {
    //   coef = (azimutLength / largo1) * 2
    //   midPoint[0] = puntos[1][0] + (puntos[2][0] - puntos[1][0]) / 2
    //   midPoint[1] = puntos[1][1] + (puntos[2][1] - puntos[1][1]) / 2
    // } else {
    //   coef = (azimutLength / largo2) * 2
    //   midPoint[0] = puntos[0][0] + (puntos[1][0] - puntos[0][0]) / 2
    //   midPoint[1] = puntos[0][1] + (puntos[1][1] - puntos[0][1]) / 2
    // }
    // if (midPoint[1] > puntoAplicacion[1]) {
    //   rotate = Math.PI
    // }

    midPoint[0] = puntos[2][0] + (puntos[3][0] - puntos[2][0]) / 2
    midPoint[1] = puntos[2][1] + (puntos[3][1] - puntos[2][1]) / 2
    coef = azimutLength / ancho

    //Dibujamos un acimut pequeño que aparecerá o no según la configuracion elegida
    const geomAcimut = new LineString([puntoAplicacion, midPoint])
    geomAcimut.scale(coef, coef, puntoAplicacion)
    const acimutCoordinates = geomAcimut.getCoordinates()
    let point1 = acimutCoordinates[0]
    let point2 = acimutCoordinates[1]

    // Angles are measured with 0 at south (axis -Y) and positive west (axis +X)
    let acimut =
      (Math.atan2(-1 * (point1[0] - point2[0]), point1[1] - point2[1]) * 180) / Math.PI
    acimut = parseInt(acimut)
    const acimutLine = new Feature({
      geometry: geomAcimut,
    })
    acimutLine.setId('BaseSolar.acimut.' + TCB.featIdUnico)
    acimutLine.setStyle(new Style({}))
    TCB.origenDatosSolidar.addFeature(acimutLine)
    acimutLine.setStyle(new Style({}))

    //Preparamos los datos default para constuir un objeto BaseSolar
    geoBaseSolar.feature.setId('BaseSolar.area.' + TCB.featIdUnico)
    let nuevaBaseSolar = {}
    //const areaMapa = getArea(geometria, { projection: 'EPSG:3857' })

    nuevaBaseSolar.idBaseSolar = TCB.featIdUnico.toString()
    nuevaBaseSolar.nombreBaseSolar = 'Base ' + nuevaBaseSolar.idBaseSolar
    nuevaBaseSolar.cumbrera = cumbrera
    nuevaBaseSolar.ancho = ancho
    nuevaBaseSolar.area = getArea(geometria)
    nuevaBaseSolar.inclinacion = 0
    nuevaBaseSolar.inclinacionOptima = true
    nuevaBaseSolar.roofType = 'Optimos'
    nuevaBaseSolar.inAcimut = acimut
    nuevaBaseSolar.angulosOptimos = true
    nuevaBaseSolar.requierePVGIS = true
    nuevaBaseSolar.lonlatBaseSolar =
      puntoAplicacion_4326[0].toFixed(4) + ',' + puntoAplicacion_4326[1].toFixed(4)
    //New point feature where the name label will be set
    let label = new Feature({ geometry: new Point(puntoAplicacion) })
    label.setId('BaseSolar.label.' + nuevaBaseSolar.idBaseSolar)
    TCB.origenDatosSolidar.addFeatures([label])

    //Activamos el dialogo de edicion de atributos de BaseSolar
    openDialog({
      children: (
        <DialogBaseSolar
          data={nuevaBaseSolar}
          onClose={(cause, formData) => endDialog(cause, formData)}
        />
      ),
    })
  }

  return (
    <>
      <Box sx={{ mt: '1rem', ml: '1rem' }}>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('LOCATION.PROMPT_DRAW'),
          }}
        />
      </Box>
      {/* El mapa */}
      <div
        ref={mapElement}
        className="map"
        style={{ width: '100%', height: '300px' }}
      ></div>
      {/* Boton para cambiar vista mapa vs satelite */}
      <Tooltip title={t('LOCATION.TOOLTIP_MAP_TYPE')} placement="top">
        <Button
          variant="contained"
          onClick={() => {
            if (mapType === 'LOCATION.LABEL_SATELITE') setMapType('LOCATION.LABEL_VECTOR')
            else setMapType('LOCATION.LABEL_SATELITE')
            let OpenS = map
              .getLayers()
              .getArray()
              .find((layer) => layer.get('name') == 'OSM')
            let SAT = map
              .getLayers()
              .getArray()
              .find((layer) => layer.get('name') == 'SAT')
            OpenS.setVisible(!OpenS.getVisible())
            SAT.setVisible(!SAT.getVisible())
          }}
        >
          {t(mapType)}
        </Button>
      </Tooltip>
    </>
  )
}
