import React, { useState, useEffect, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// OpenLayers objects
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { OSM, Vector as VectorSource, XYZ } from 'ol/source'
import { Style, Fill, Stroke, Text } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import { Point, LineString } from 'ol/geom'
import { getArea } from 'ol/sphere'
import { transform, fromLonLat } from 'ol/proj'
import { Draw, Select } from 'ol/interaction'
import { altKeyOnly, click } from 'ol/events/condition.js'
import { defaults } from 'ol/interaction/defaults'

// MUI objects
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import Typography from '@mui/material/Typography'

// Componentes Solidar
import MapContext from '../MapContext'
import DialogNewBaseSolar from './DialogNewBaseSolar'
import { useDialog } from '../../components/DialogProvider'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import TCBContext from '../TCBContext'
import BaseSolar from '../classes/BaseSolar'

// REVISAR: Prueba autoselect para las direcciones junto con GoogleMaps.jsx
import CandidatosApp from './CandidatosApp'

function MapComponent() {
  const { t, i18n } = useTranslation()

  // Map state
  const [mapType, setMapType] = useState('LOCATION.LABEL_SATELITE')
  const [selectedCoord, setSelectedCoord] = useState([-3.7, 40.45])

  const { map, setMap } = useContext(MapContext)

  const mapElement = useRef()
  const basesLayer = useRef()
  const mapRef = useRef(map)

  // OpenLayers features manipulation
  const { bases, setBases } = useContext(TCBContext)

  // Address search states
  const [address, setAddress] = useState('')
  const [candidatos, setCandidatos] = useState([])

  const [openDialog, closeDialog] = useDialog()
  // const [editing, setEditing] = useState(false)

  const baseInteraction = new Draw({
    source: TCB.origenDatosSolidar,
    type: 'Polygon',
    maxPoints: 3,
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

  //Event when a base geometry has been created
  async function construirBaseSolar(geoBaseSolar) {
    // Get unique featID
    TCB.featIdUnico++

    // Construimos la geometria de la BaseSolar que es un paralelogramo a partir de tres puntos
    let geometria = geoBaseSolar.feature.getGeometry()
    let puntos = geometria.getCoordinates()[0]
    const largo1 = UTIL.distancia(puntos[0], puntos[1])
    const largo2 = UTIL.distancia(puntos[1], puntos[2])
    let nuevoY = puntos[2][1] - (puntos[1][1] - puntos[0][1])
    let nuevoX = puntos[0][0] - (puntos[1][0] - puntos[2][0])
    let nuevoPunto = [nuevoX, nuevoY]
    puntos.splice(3, 0, nuevoPunto)
    geoBaseSolar.feature.getGeometry().setCoordinates([puntos])

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
    let rotate = 0
    let midPoint = [0, 0]
    let coef
    let alfa

    if (largo2 > largo1) {
      coef = (azimutLength / largo1) * 2
      midPoint[0] = puntos[1][0] + (puntos[2][0] - puntos[1][0]) / 2
      midPoint[1] = puntos[1][1] + (puntos[2][1] - puntos[1][1]) / 2
    } else {
      coef = (azimutLength / largo2) * 2
      midPoint[0] = puntos[0][0] + (puntos[1][0] - puntos[0][0]) / 2
      midPoint[1] = puntos[0][1] + (puntos[1][1] - puntos[0][1]) / 2
    }

    if (midPoint[1] > puntoAplicacion[1]) {
      rotate = Math.PI
    }

    const geomAcimut = new LineString([puntoAplicacion, midPoint])
    geomAcimut.scale(coef, coef, puntoAplicacion)
    geomAcimut.rotate(rotate, puntoAplicacion)
    const nPuntos = geomAcimut.getCoordinates()
    alfa = Math.asin((nPuntos[1][0] - nPuntos[0][0]) / azimutLength)
    let acimut = (alfa * 180) / Math.PI

    var acimutLine = new Feature({
      geometry: geomAcimut,
    })
    acimutLine.setId('BaseSolar.acimut.' + TCB.featIdUnico)
    TCB.origenDatosSolidar.addFeature(acimutLine)

    //Preparamos los datos default para constuir un objeto BaseSolar
    geoBaseSolar.feature.setId('BaseSolar.area.' + TCB.featIdUnico)
    let nuevaBaseSolar = {}
    const areaMapa = getArea(geometria, { projection: 'EPSG:3857' })
    nuevaBaseSolar.idBaseSolar = TCB.featIdUnico.toString()
    nuevaBaseSolar.nombreBaseSolar = 'Base ' + nuevaBaseSolar.idBaseSolar
    nuevaBaseSolar.potenciaMaxima = areaMapa / TCB.parametros.conversionAreakWp
    nuevaBaseSolar.inclinacionPaneles = 0
    nuevaBaseSolar.inclinacionOptima = false
    nuevaBaseSolar.roofType = 'coplanar'
    nuevaBaseSolar.inAcimut = acimut.toFixed(2)
    nuevaBaseSolar.inAcimutOptimo = false
    nuevaBaseSolar.angulosOptimos = false
    nuevaBaseSolar.requierePVGIS = true
    nuevaBaseSolar.lonlatBaseSolar =
      puntoAplicacion_4326[0].toFixed(4) + ',' + puntoAplicacion_4326[1].toFixed(4)
    nuevaBaseSolar.areaMapa = areaMapa
    nuevaBaseSolar.areaReal = areaMapa

    //New point feature where the name label will be set
    let label = new Feature({ geometry: new Point(puntoAplicacion) })
    label.setId('BaseSolar.label.' + nuevaBaseSolar.idBaseSolar)
    TCB.origenDatosSolidar.addFeatures([label])

    //Activamos el dialogo de edicion de atributos de BaseSolar
    // setEditing(false)
    // console.log(3)
    //openNewBaseSolarDialog(nuevaBaseSolar, false)
    openDialog({
      children: (
        <DialogNewBaseSolar data={nuevaBaseSolar} editing={false} onClose={closeDialog} />
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
      alert(t('mapa_MSG_territorio')) //Quiere decir que no estamos en España
      TCB.territorio = ''
      return false
    } else if (!nominatimInfo) {
      //Ha habido un error en la llamada a Nominatim
      return false
    } else {
      //Todo correcto
      TCB.territorio = nominatimInfo.zona
      return true
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
          TCB.i18next.t('nominatim_MSG_errorFetch', { err: respTerritorio, url: url }),
        )
        await UTIL.copyClipboard(url)
        status = false
      }
    } catch (err) {
      alert(TCB.i18next.t('nominatim_MSG_errorFetch', { err: err, url: url }))
      await UTIL.copyClipboard(url)
      status = false
    }
    document.body.style.cursor = cursorOriginal
    return status
  }

  async function findAddress() {
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

        //REVISAR: cual es la forma correcta de desabilitar el select
        if (count > 0) {
          document.getElementById('candidatos').disabled = false
        } else {
          document.getElementById('candidatos').disabled = true
        }
      } else {
        alert('Error conectando con Nominatim: ' + respCandidatos.status + '\n' + url)
        return false
      }
    } catch (err) {
      alert(TCB.i18next.t('nominatim_MSG_errorFetch', { err: err.message, url: url }))
      return false
    }
  }

  return (
    <>
      {/* <GoogleMaps></GoogleMaps> */}
      {/* <CandidatosApp></CandidatosApp> */}
      {/* Campo  para introducir una direccion REVISAR: como hacer que este campo y candidatos se repartan el ancho*/}
      <Typography variant="body">{t('LOCATION.DESCRIPTION_ADDRESS')}</Typography>
      <br />
      <Tooltip title={t('LOCATION.TOOLTIP_ADDRESS')} placement="top">
        <TextField
          onChange={(ev) => setAddress(ev.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" color="primary" onClick={findAddress}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText={t('LOCATION.PROMPT_ADDRESS')}
          value={address}
          type="text"
        />
      </Tooltip>
      <TextField
        disabled={candidatos.length === 0}
        id="candidatos"
        select
        label=""
        helperText={t('LOCATION.PROMPT_CANDIDATE')}
        defaultValue="" //REVISAR: como hacer que aparezca la primera direccion en la lista
        onChange={(ev, value) => {
          mapRef.current.getView().setCenter(fromLonLat(value.props.value))
        }}
      >
        {candidatos.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.text}
          </MenuItem>
        ))}
      </TextField>
      <br></br>

      {/* El mapa */}
      <Typography variant="body">{t('LOCATION.PROMPT_DRAW')}</Typography>
      <div
        ref={mapElement}
        className="map"
        style={{ width: '100%', height: '300px' }}
      ></div>

      {/* Boton para cambiar vista mapa vs satelite */}
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
    </>
  )
}
export default MapComponent
