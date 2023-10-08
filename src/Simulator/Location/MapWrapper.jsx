// react
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next'

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import Style from 'ol/style/Style.js'
import Fill from 'ol/style/Fill.js'
import Stroke from 'ol/style/Stroke.js';
import ZoomSlider from 'ol/control/ZoomSlider';
import {transform, fromLonLat} from 'ol/proj'
import {toStringXY} from 'ol/coordinate'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import { Container } from '@mui/material'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'

import TCB from '../classes/TCB'
import * as UTIL from '../Utiles'
import TCBContext from '../TCBContext'
import BaseSolar from '../classes/BaseSolar.js'

function MapWrapper() {
  const { t, i18n } = useTranslation()
  // set intial state
  const [ map, setMap ] = useState()
  const [ mapType, setMapType ] = useState('LOCATION.LABEL_SATELITE')

  const [ featuresLayer, setFeaturesLayer ] = useState()
  const [ selectedCoord , setSelectedCoord ] = useState([-3.7, 40.45])
  const [ address, setAddress] = useState('')
  const [ candidatos, setCandidatos] = useState([])

  const {bases, setBases, tipoConsumo, setTipoConsumo} = useContext(TCBContext)
  const mapElement = useRef()
  // create state ref that can be accessed in OpenLayers onclick callback function
  //  https://stackoverflow.com/a/60643670
  const mapRef = useRef()
  mapRef.current = map

    // initialize map on first render - logic formerly put into componentDidMount
  useEffect( () => {
      // Vector es el Layer que muestra los features mantenidos en la fuente origenDatosSolidar
      //TCB.origenDatosSolidar = new VectorSource({wrapX: false});

      // Definiciones del mapa
      //var attribution = new ol.control.Attribution({collapsible: false});

      // Cartografía básica de Open Street Map
      const OpenS = new TileLayer({
        source: new OSM({
          crossOrigin: null,
          maxZoom: 30
        })
      });
      OpenS.set('name', 'OSM');
      
      // Vector es el Layer que muestra los features mantenidos en la fuente origenDatosSolidar
      // TCB.origenDatosSolidar = new VectorLayer({wrapX: false});
      // const vector = new VectorLayer({ source: TCB.origenDatosSolidar,
      //   style: new Style({
      //     stroke: new Stroke({
      //       fillcolor: [0,250,0,0.5],
      //       color: [0, 250, 0, 1],
      //       width: 4,
      //     }),
      //     fill: new Fill({
      //       color: 'rgba(0, 255, 0, 0.3)',
      //     }),
      //   }),
      // });
      
      // SAT es el layer con la imagen satelite provista por ESRI via arcgisonline
      const SAT = new TileLayer({
        source: new XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 30,
        })
      });
      SAT.set('name', 'SAT');
      SAT.setVisible(false);

      if (mapElement.current && !mapRef.current) {
          mapRef.current = new Map({
              target: mapElement.current,
              layers: [OpenS, SAT],
              view: new View({
                center: fromLonLat(selectedCoord),
                maxZoom: 20,
                zoom: 18,
              }),
            controls: [ ]
          })

          mapRef.current.on('click', (event) => createNewBase(event))
          //  {
          //   let tArea = (Math.random() * 100) 
          //   let aBase = {                
          //     idBaseSolar: TCB.featIdUnico,
          //     nombreBaseSolar: "Area " + TCB.featIdUnico++,
          //     areaMapa: tArea,
          //     areaReal: tArea,
          //     potenciaMaxima: tArea / TCB.parametros.conversionAreakWp,
          //     inclinacionTejado: 0,
          //     inAcimut: 0,
          //     potenciaTotal: 0,
          //     paneles: 0,
          //     potenciaUnitaria: TCB.parametros.potenciaPanelInicio,
          //     angulosOptimos: true
          //   }
            
          //   setBases(bases => [...bases, aBase])
          //   TCB.BaseSolar.push( new BaseSolar(aBase)) 

          // })
          setMap(mapRef.current)
          //TCB.map = { {mapRef.current} }
      } else {
        console.log("ya existe map lo recuperariamos pero no funciona")
      }
  }, [bases, setBases])

  return <>
      <Container>
      {/* Campo  para introducir una direccion REVISAR: como hacer que este campo y candidatos se repartan el ancho*/}
        <Tooltip title={t('LOCATION.TOOLTIP_ADDRESS')} placement="top">
            <TextField
            onChange={ (ev)=>setAddress( ev.target.value) }
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                    <IconButton edge="end" color="primary" onClick={ findAddress}>
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
            //disabled REVISAR: Pendiente de resolver la activacion o no segun haya candidataos
            id="candidatos"
            select
            label=""
            helperText="Seleccione la dirección que corresponda"
            defaultValue={{ ...candidatos[0] }}  //REVISAR: como hacer que aparezca la primera direccion en la lista
            onChange={(ev, value) => { mapRef.current.getView().setCenter(fromLonLat(value.props.value))} }             
          >
            {candidatos.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.text}
              </MenuItem>
            ))}
        </TextField>
      {/* EL mapa */}
          <div ref={mapElement} className='map' style={{ width: "100%", height: "300px" }}></div> 

      {/* Boton para cambiar vista mapa vs satelite */}
          <Button
            variant="contained"
            onClick={ ()=> {
              if (mapType === 'LOCATION.LABEL_SATELITE')
                setMapType('LOCATION.LABEL_VECTOR')
              else
                setMapType('LOCATION.LABEL_SATELITE')

              let OpenS = map.getLayers().getArray().find(layer => layer.get('name') == 'OSM')
              let SAT = map.getLayers().getArray().find(layer => layer.get('name') == 'SAT')
              OpenS.setVisible(!OpenS.getVisible());
              SAT.setVisible(!SAT.getVisible());
            }}
          >
          {t(mapType)}
          </Button>
        
        {/* Este boton simula la creacion de una base en el mapa */}
        <div>
          <Button
              variant="contained"
              onClick={ ()=> {
              let tArea = (Math.random() * 100) 
              let aBase = {                
                  idBaseSolar: TCB.featIdUnico,
                  nombreBaseSolar: "Area " + TCB.featIdUnico++,
                  areaMapa: tArea,
                  areaReal: tArea,
                  potenciaMaxima: tArea / TCB.parametros.conversionAreakWp,
                  inclinacionTejado: 0,
                  inAcimut: 0,
              }
              
              setBases([...bases, aBase])
              TCB.BaseSolar.push( new BaseSolar(aBase)) 
              }}
            >
            {t('SIMULATOR.LABEL_CREATEAREA')}
          </Button>
        </div>
      </Container>
  </>;

  // map click handler
async function createNewBase( event) {
alert('nuve base')
  console.log("bases al inicio de click en TCB " + TCB.BaseSolar.length)
  console.log("bases al inicio de click en bases ")
  console.dir(bases)
  // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
  //  https://stackoverflow.com/a/60643670
  const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);

  // transform coord to EPSG 4326 standard Lat Long
  const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

  // set React state
  setSelectedCoord( transormedCoord )
  let territorioEnEspana = await verificaTerritorio(transormedCoord);
  if (!territorioEnEspana) { //Si no esta en España no seguimos
    //TCB.origenDatosSolidar.removeFeature(geoPuntoConsumo.feature);
    alert('No estamos en España')
    return false;
  }
  
  console.log(transormedCoord)

  let tArea = (Math.random() * 100) 
  let aBase = {                
      idBaseSolar: TCB.featIdUnico,
      nombreBaseSolar: "Area " + TCB.featIdUnico++,
      areaMapa: tArea,
      areaReal: tArea,
      potenciaMaxima: tArea / TCB.parametros.conversionAreakWp,
      inclinacionTejado: 0,
      inAcimut: 0,
      lonlatBaseSolar: transormedCoord,
      potenciaTotal: 0,
      paneles: 0,
      potenciaUnitaria: TCB.parametros.potenciaPanelInicio,
      angulosOptimos: true
  }

  console.log(aBase)

  // Añadimos la base a TCB
  TCB.BaseSolar.push( new BaseSolar(aBase)) 
  // Añadimos la base al contexto de bases
  setBases([...bases, aBase])

}

/** Vamos a verificar si el punto dado esta en España
  Devuelve false si no lo esta o alguno de los siguientes valores en caso de estar en España
  ['Peninsula', 'Islas Baleares', 'Canarias', 'Melilla', 'Ceuta']
 * 
 * @param {array} point [Latitud, Longitud]
 * @returns false si no esta en España
 * @returns true si el punto esta en territorio español
 */
async function verificaTerritorio (point) {

  const nominatimInfo = await verificaTerritorioNominatim( point);

  if (nominatimInfo === null) { // Las coordenadas no estan en España
    alert (t('mapa_MSG_territorio')); //Quiere decir que no estamos en España
    TCB.territorio = "";
    return false;
  } else if (!nominatimInfo) { //Ha habido un error en la llamada a Nominatim
    return false;
  } else {  //Todo correcto
    TCB.territorio = nominatimInfo.zona;
    return true;
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

  let status;
  const cursorOriginal = document.body.style.cursor;
  document.body.style.cursor = 'wait';

  let url = "https://nominatim.openstreetmap.org/reverse?lat="+point[1].toFixed(4)+"&lon="+point[0].toFixed(4)+
  "&format=geocodejson&zoom=18&accept-language='es'";
  UTIL.debugLog("Call reverse Nominatim :" + url);
  try {
    const respTerritorio = await fetch(url);
    if (respTerritorio.status === 200) {
      let datoTerritorio = await respTerritorio.text();

      let jsonTerritorio = JSON.parse(datoTerritorio);
      if (jsonTerritorio["error"] !== undefined) {
        throw (jsonTerritorio["error"]);
      }

      UTIL.debugLog("El punto esta en:", jsonTerritorio);
      let localizacion = jsonTerritorio.features[0].properties.geocoding
      if ( localizacion.country === 'España') {
        // Verificamos si estamos en territorio insular. 
        let territorio = "Peninsula";
        let detalle = localizacion.state
        const islas = ['Illes Balears', 'Canarias', 'Melilla', 'Ceuta'];
        if (detalle == undefined) detalle = localizacion.city  //Para Ceuta y Melilla Nominatim no devuelve state pero usamos city.
        if (islas.includes(detalle)) territorio = detalle;
        UTIL.debugLog("Localización:" + territorio);
        status = {zona: territorio, 
          calle: localizacion.street, 
          ciudad: localizacion.city} ;
      } else {
        UTIL.debugLog("Localización erronea:" + localizacion.country);
        status = null;
      }
    } else {
      alert(TCB.i18next.t("nominatim_MSG_errorFetch", {"err": respTerritorio, "url": url}));
      await UTIL.copyClipboard(url);
      status = false;
    }
  } catch (err) {
    alert(TCB.i18next.t("nominatim_MSG_errorFetch", {"err": err, "url": url}));
    await UTIL.copyClipboard(url);
    status = false;
  }
  document.body.style.cursor = cursorOriginal;
  return status;
}

async function findAddress ( ) {

  setCandidatos ([])
    let url =
      "https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&addressdetails=1&countrycodes=es&";
    url += "q=" + address;
    UTIL.debugLog("Call Nominatim:" + url);
  
    try {
      const respCandidatos = await fetch(url)
      if (respCandidatos.status === 200) {
        var dataCartoCiudad = await respCandidatos.text();
        var jsonAdd = JSON.parse(dataCartoCiudad);
        let count = 0;
        var nitem = []
        jsonAdd.forEach(function (item) {
          nitem.push({value: [item.lon, item.lat], text: item.display_name.toString(), key: count++})
        })
        setCandidatos([...nitem])

//REVISAR: cual es la forma correcta de desabilitar el select
        if (count > 0 ) {
          document.getElementById('candidatos').disabled = false;
        } else {
          document.getElementById('candidatos').disabled = true;
        }
      } else {
        alert("Error conectando con Nominatim: " + respCandidatos.status + "\n" + url);
        return false;
      }
    } catch (err) {
      alert(TCB.i18next.t("nominatim_MSG_errorFetch", {"err": err.message, "url": url}));
      return false;
    }
}




}

export default MapWrapper