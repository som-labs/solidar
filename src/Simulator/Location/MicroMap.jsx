import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Container } from '@mui/material'

// OpenLayers objects
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { Vector as VectorSource, XYZ } from 'ol/source'
import { Style, Fill, Stroke } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'

import * as UTIL from '../classes/Utiles'

import TCB from '../classes/TCB'

export default function MicroMap() {
  const { t, i18n } = useTranslation()
  const mapElement = useRef()
  const mapRef = useRef()

  useEffect(() => {
    // If there is not previous Map in MapContext create one
    if (!mapRef.current) {
      //Modificación 2926-06-18 Detectado token en git se mueve a .env
      let SAT = null
      const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
      // SAT  is satellite layer provided by Mapbox
      if (mapboxToken) {
        SAT = new TileLayer({
          source: new XYZ({
            url: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
            tileSize: 512,
            attributions:
              '© <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a>',
          }),
        })
        UTIL.debugLog('Using layer provided by Mapbox')
      } else {
        // SAT is satellite layer provided by ESRI via arcgisonline
        SAT = new TileLayer({
          source: new XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            maxZoom: 30,
            attributions:
              '© <a href="https://www.arcgis.com" target="_blank">ArcGIS Online World Imagery</a>',
          }),
        })
      }

      SAT.set('name', 'SAT')
      SAT.setVisible(true)

      // Vector is the layers where new features (bases o puntosConsumo) are shown from vectorSource
      const basesLayer = new VectorLayer({
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
        layers: [SAT, basesLayer],
        view: new View({
          maxZoom: 20,
          zoom: 18,
        }),
        controls: [],
        interactions: [],
      })
    } else {
      mapRef.current.setTarget(mapElement.current)
    }

    const mapView = mapRef.current.getView()
    mapView.fit(TCB.origenDatosSolidar.getExtent())
    const center = mapView.getCenter()
    if (mapView.getZoom() > 20) {
      mapView.setCenter(center)
      mapView.setZoom(20)
    }
  }, [])

  return (
    <div ref={mapElement} className="map" style={{ width: '100%', height: '100%' }}></div>
  )
}
