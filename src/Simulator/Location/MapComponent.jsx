import { useState, useMemo, useRef, useEffect, useContext, useCallback } from 'react'
import { debounce } from '@mui/material/utils'

import { useTranslation } from 'react-i18next'

// OpenLayers objects
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { OSM, Vector as VectorSource, XYZ } from 'ol/source'
import { Style, Fill, Stroke } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import { Point, LineString, Polygon } from 'ol/geom'
import { transform, fromLonLat } from 'ol/proj'
import { Draw } from 'ol/interaction'

// MUI objects
import { Button, Tooltip, TextField, Typography, Autocomplete } from '@mui/material'

// REACT Solidar Components
import { MapContext, MapContextProvider } from '../MapContext'
import DialogNewBaseSolar from './DialogNewBaseSolar'
import { useDialog } from '../../components/DialogProvider'
import InputContext from '../InputContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import BaseSolar from '../classes/BaseSolar'

export default function MapComponent() {
  const { t, i18n } = useTranslation()
  const { bases, setBases } = useContext(InputContext)

  // Map state
  const [mapType, setMapType] = useState('LOCATION.LABEL_SATELITE')
  const [selectedCoord] = useState([-3.7, 40.45])

  const { map, setMap, endDialog } = useContext(MapContext)
  const mapElement = useRef()
  const basesLayer = useRef()
  const mapRef = useRef(map)

  // Address search states
  const [address, setAddress] = useState('')
  const [candidatos, setCandidatos] = useState([])

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
        const rotationFloat = Math.atan2(dpy, dpx)
        let rotation
        if (rotationFloat > rotationBase) rotation = rotationBase + Math.PI / 2
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
        geometry = new Polygon([newCoordinates]) //[newCoordinates])
      } else {
        geometry.setCoordinates([newCoordinates]) //[newCoordinates])
      }
      return geometry
    },
  })

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

      //Define interaction to allow bases drawing
      mapRef.current.addInteraction(baseInteraction)

      //Event to call the function that will create the base once the geometry is defined in the map
      baseInteraction.on('drawend', (event) => {
        construirBaseSolar(event)
      })

      //Store the map in MapContext
      setMap(mapRef.current)
    } else {
      mapRef.current.setTarget(mapElement.current)
    }
  }, [])

  function finDialog(reason, formData) {
    console.log('FINDIALOG', reason)
    if (reason === undefined) return
    if (reason !== 'save') {
      UTIL.deleteBaseGeometries(TCB.featIdUnico.toString())
    }
    endDialog(reason, formData)
    closeDialog()
  }

  //Event when a base geometry has been created
  async function construirBaseSolar(geoBaseSolar) {
    // Get unique featID
    TCB.featIdUnico++

    // Construimos la geometria de la BaseSolar que es un paralelogramo a partir de tres puntos
    let geometria = geoBaseSolar.feature.getGeometry()
    let puntos = geometria.getCoordinates()[0]

    // // First two points define cumbrera
    const cumbrera = UTIL.distancia(puntos[0], puntos[1])
    const ancho = UTIL.distancia(puntos[1], puntos[2])

    // Calculamos una coordenada central para esta base que utilizaremos en PVGIS y donde la rotularemos
    const puntoAplicacion = geometria.getInteriorPoint().getCoordinates()

    // Transformamos el punto al EPSG:4326 necesario para Nominatim
    const puntoAplicacion_4326 = transform(puntoAplicacion, 'EPSG:3857', 'EPSG:4326')

    //Verificamos que el punto esta en España y ademas fijamos el territorio
    const territorioEnEspana = await verificaTerritorio(puntoAplicacion_4326)
    if (!territorioEnEspana) {
      //Si no esta en España no seguimos
      TCB.origenDatosSolidar.removeFeature(geoBaseSolar.feature)
      return false
    }

    //NUEVO: Calculo propuesta de acimut
    const azimutLength = 100
    let midPoint = [0, 0]
    let coef

    // Si el dibujo es libre
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

    // Si primero se dibuja la cumbrera
    midPoint[0] = puntos[2][0] + (puntos[3][0] - puntos[2][0]) / 2
    midPoint[1] = puntos[2][1] + (puntos[3][1] - puntos[2][1]) / 2
    coef = azimutLength / ancho

    //Dibujamos un acimut pequeño que aparecerá o no según la configuracion elegida
    const geomAcimut = new LineString([puntoAplicacion, midPoint])
    geomAcimut.scale(coef, coef, puntoAplicacion)
    const acimutCoordinates = geomAcimut.getCoordinates()
    let point1 = acimutCoordinates[0]
    let point2 = acimutCoordinates[1]

    // Take into account angles are measured with 0 at south (axis -Y) and positive west (axis +X)
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
        <DialogNewBaseSolar
          data={nuevaBaseSolar}
          editing={false}
          onClose={(cause, formData) => finDialog(cause, formData)}
        />
      ),
    })
  }

  /** Vamos a verificar si el punto dado esta en España
  Devuelve false si no lo esta o alguno de los siguientes valores en caso de estar en España
  ['Peninsula', 'Islas Baleares', 'Canarias', 'Melilla', 'Ceuta']
 * 
 * @param {array} point [Latitud, Longitud]
 * @returns false si no esta en España
 * @returns true si el punto esta en territorio español
 */
  async function verificaTerritorio(point) {
    const nominatimInfo = await verificaTerritorioNominatim(point)

    if (nominatimInfo === null) {
      // Las coordenadas no estan en España
      alert(t('LOCATION.ERROR_TERRITORIO')) //Quiere decir que no estamos en España
      TCB.territorio = ''
      return false
    } else if (!nominatimInfo) {
      //Ha habido un error en la llamada a Nominatim
      return false
    } else {
      //Verificamos que la base creada esta en el mismo territorio si es que ya habia otras creadas.
      if (TCB.territorio !== '' && TCB.territorio !== nominatimInfo.zona) {
        alert(t('LOCATION.ERROR_MISMO_TERRITORIO'))
        return false
      } else {
        TCB.territorio = nominatimInfo.zona
        return true
      }
    }
  }

  /**
   * Realiza la llamada a Nominatim para determinar el territorio donde se encuentra point
   * @param {array} point [Latitud, Longitud]
   * @returns null si el territorio no es España
   * @returns false en caso de error en la llamada Nominatim
   * @returns territorio entre los siguientes valores: ['Peninsula', 'Illes Balears', 'Canarias', 'Melilla', 'Ceuta'];
   */
  async function verificaTerritorioNominatim(point) {
    let status
    const cursorOriginal = document.body.style.cursor
    document.body.style.cursor = 'wait'

    let url =
      'https://nominatim.openstreetmap.org/reverse?lat=' +
      point[1].toFixed(4) +
      '&lon=' +
      point[0].toFixed(4) +
      "&format=geocodejson&zoom=18&accept-language='es'"
    UTIL.debugLog('Call reverse Nominatim :' + url)
    try {
      const respTerritorio = await fetch(url)
      if (respTerritorio.status === 200) {
        let datoTerritorio = await respTerritorio.text()

        let jsonTerritorio = JSON.parse(datoTerritorio)
        if (jsonTerritorio['error'] !== undefined) {
          throw jsonTerritorio['error']
        }

        UTIL.debugLog('El punto esta en:', jsonTerritorio)
        let localizacion = jsonTerritorio.features[0].properties.geocoding
        if (localizacion.country === 'España') {
          // Verificamos si estamos en territorio insular.
          let territorio = 'Peninsula'
          let detalle = localizacion.state
          const islas = ['Illes Balears', 'Canarias', 'Melilla', 'Ceuta']
          if (detalle == undefined) detalle = localizacion.city //Para Ceuta y Melilla Nominatim no devuelve state pero usamos city.
          if (islas.includes(detalle)) territorio = detalle
          UTIL.debugLog('Localización:' + territorio)
          status = {
            zona: territorio,
            calle: localizacion.street,
            ciudad: localizacion.city,
          }
        } else {
          UTIL.debugLog('Localización erronea:' + localizacion.country)
          status = null
        }
      } else {
        alert(
          TCB.i18next.t('LOCATION.ERROR_NOMINATIM_FETCH', {
            err: respTerritorio,
            url: url,
          }),
        )
        await UTIL.copyClipboard(url)
        status = false
      }
    } catch (err) {
      alert(TCB.i18next.t('LOCATION.ERROR_NOMINATIM_FETCH', { err: err, url: url }))
      await UTIL.copyClipboard(url)
      status = false
    }
    document.body.style.cursor = cursorOriginal
    return status
  }

  const findAddress = useCallback(async () => {
    setCandidatos([])
    let url =
      'https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&addressdetails=1&countrycodes=es&'
    url += 'q=' + address
    UTIL.debugLog('Call Nominatim:' + url)

    try {
      const respCandidatos = await fetch(url)
      if (respCandidatos.status === 200) {
        var dataCartoCiudad = await respCandidatos.text()
        var jsonAdd = JSON.parse(dataCartoCiudad)
        let count = 0
        var nitem = []
        jsonAdd.forEach(function (item) {
          nitem.push({
            value: [item.lon, item.lat],
            text: item.display_name.toString(),
            key: count++,
          })
        })
        setCandidatos([...nitem])
      } else {
        alert(
          t('ERROR_NOMINATIM_FETCH', {
            err: 'Status: ' + respCandidatos.status,
            url: url,
          }),
        )
        return false
      }
    } catch (err) {
      alert(t('ERROR_NOMINATIM_FETCH', { err: err.message, url: url }))
      return false
    }
  }, [address, t])

  const ref = useRef()

  useEffect(() => {
    ref.current = findAddress
  }, [findAddress])

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.()
    }

    return debounce(func, 500)
  }, [])

  return (
    <>
      {/* Campo  para introducir una direccion */}
      <br />
      <Typography variant="body">{t('LOCATION.DESCRIPTION_ADDRESS')}</Typography>

      <br />
      <Autocomplete
        options={candidatos}
        filterOptions={(x) => x}
        autoComplete
        onChange={(ev, value) => {
          mapRef.current.getView().setCenter(fromLonLat(value.value))
        }}
        onInputChange={(ev, newValue) => {
          if (ev.target.value.length > 3) {
            setAddress(ev.target.value)
            debouncedCallback()
          }
        }}
        getOptionLabel={(option) => option.text}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar lugar o dirección "
            fullWidth
            style={{ width: '100%' }}
          />
        )}
      />
      <br></br>
      {/* El mapa */}
      <Typography
        variant="body"
        dangerouslySetInnerHTML={{
          __html: t('LOCATION.PROMPT_DRAW'),
        }}
      />
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
