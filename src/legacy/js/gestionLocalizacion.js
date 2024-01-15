/**
 * @module  gestionLocalizacion
 * @fileoverview Módulo para la gestion de las localizaciones en el mapa
 * @version      Solidar.3
 * @author       José Luis García (SOM Madrid)
 * @copyright
 *
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
 */
import TCB from './TCB.js'
import * as UTIL from './Utiles.js'
import BaseSolar from './BaseSolar.js'
import PuntoConsumo from './PuntoConsumo.js'
import Instalacion from './Instalacion.js'
import Finca from './Finca.js'
import Produccion from './Produccion.js'
import Rendimiento from './Rendimiento.js'
import * as Idioma from './Idioma.js'
/*global ol, INDIVIDUAL, COMUNIDAD, Tabulator*/

var map
var draw

var geometriaActiva = { nombre: 'BaseSolar', tipo: 'Polygon' } //Tomará el valor ['PuntoConsumo', 'BaseSolar','acimut']
var geometriaPrevia //Es para el caso de tener que volver a activar un tipo de geometria despues de una interaccion

var divBaseSolar
var divPuntoConsumo
var _tablaPuntoConsumo
var _tablaBaseSolar

var activo

// Variables comunes para todos los modulos de construccion de objetos Solidar
let geometria
let componente
let puntoAplicacion
let puntoAplicacion_4326
let territorioEnEspana
let nominatimInfo

/**
 * Es la función llamada desde el Wizard para la gestion de la ventana de localización
 * @memberof module:gestionLocalizacion
 * @param {string} accion [Inicializa, Valida, Prepara, Importa, Exporta]
 * @param {Object} datos En el caso de importacion los datos a importar
 * @returns {boolean} true si todo ha ido bien false si algo ha fallado
 */
async function gestionLocalizacion(accion, datos) {
  UTIL.debugLog('gestionLocalizacion: ' + accion)
  let status
  switch (accion) {
    case 'Inicializa':
      status = inicializaEventos()
      break
    case 'Valida':
      status = await valida()
      break
    case 'Prepara':
      status = prepara()
      break
    case 'Importa':
      status = importa(datos)
      break
    case 'Exporta':
      status = exporta()
      break
  }
  return status
}

/**
 * @memberof gestionLocalizacion
 * @method inicializaEventos
 * Es la funcion en la que se inicializan:
 * - todos los listeners de la pestaña localizacion
 * - el mapa de OpenLayers
 * - las tablas de Tabulator
 *
 */
function inicializaEventos() {
  // Evento para gestionar boton deshacer. DOMid: "botonDeshacer"
  document.getElementById('botonDeshacer').addEventListener('click', function () {
    draw.removeLastPoint()
  })

  divBaseSolar = document.getElementById('BaseSolar')
  divPuntoConsumo = document.getElementById('PuntoConsumo')

  // Evento disparado al escribir una dirección. DOMid: "localziacion"
  // Una vez capturado el nombre se pasa a Nominatim para obtener la lista de candidatos. DOMid: "localizacion"
  document.getElementById('localizacion').value = TCB.i18next.t('localizacion_LBL')
  document
    .getElementById('localizacion')
    .addEventListener('change', async function handleChange1() {
      await mapaPorLocalizacion('localizacion')
    })

  // Evento disparado el seleccionar una localizacion de la lista de candidatos obtenida de Nominatim. DOMid: "candidatos"
  // Cada  elemento de la lista de candidatos tiene asociado el value de lon-lat que es pasado en el evento
  document
    .getElementById('candidatos')
    .addEventListener('click', async function handleChange(event) {
      await centraMapa(event.target.value)
    })

  // Evento para gestionar boton deshacer. DOMid: "botonDeshacer"
  document.getElementById('botonDeshacer').addEventListener('click', function () {
    draw.removeLastPoint()
  })

  /*Evento del boton que permite crear nuevos PuntoConsumo. DIMid: "botonConsumo".
  Este boton solo esta activo si el modo de trabajo no es Individual */
  if (TCB.modoActivo !== INDIVIDUAL) {
    const _btnPuntoConsumo = document.getElementById('botonPuntoConsumo')
    _btnPuntoConsumo.style.display = 'block'
    _btnPuntoConsumo.addEventListener('click', function () {
      divBaseSolar.style.display = 'none'
      divPuntoConsumo.style.display = 'block'
      geometriaActiva = { nombre: 'PuntoConsumo', tipo: 'Point' }
      addInteraction()
    })
  }

  // Evento para crear nuevas bases. DOMid: "botonBaseSolar"
  document.getElementById('botonBaseSolar').addEventListener('click', function () {
    divPuntoConsumo.style.display = 'none'
    divBaseSolar.style.display = 'block'
    geometriaActiva = { nombre: 'BaseSolar', tipo: 'Polygon' }
    addInteraction()
  })

  //--> operativa para cambiar la vista entre Vector y Satelite. DOMid: "botonTipoMapa"
  const botonTipoMapa = document.getElementById('botonTipoMapa')
  botonTipoMapa.addEventListener('click', function handleChange() {
    if (botonTipoMapa.innerText === TCB.i18next.t('mapa_LBL_vector')) {
      botonTipoMapa.innerText = TCB.i18next.t('mapa_LBL_satelite')
    } else {
      botonTipoMapa.innerText = TCB.i18next.t('mapa_LBL_vector')
    }
    let OSM = map
      .getLayers()
      .getArray()
      .find((layer) => layer.get('name') == 'OSM')
    let SAT = map
      .getLayers()
      .getArray()
      .find((layer) => layer.get('name') == 'SAT')
    OSM.setVisible(!OSM.getVisible())
    SAT.setVisible(!SAT.getVisible())
  })

  // Evento para crear nuevas bases. DOMid: "botonShadow"
  /*   document.getElementById('botonShadow').addEventListener('click', function () {
    const _view = map.getView();
    const puntoAplicacion = ol.proj.transform(_view.getCenter(), "EPSG:3857", "EPSG:4326");
    let url = 'https://app.shadowmap.org/?lat='+puntoAplicacion[1]+'&lng='+puntoAplicacion[0]+'&zoom='+_view.getZoom()+'&basemap=map&time='+Date.now()+'&vq=2';
    console.log(url);
    window.open(url, '_blank');
  }); */

  // Evento para registrar la entrada de lon-lat a mano
  const posicionLonLat = document.getElementById('posicionLonLat')
  posicionLonLat.addEventListener('change', async function handleChange() {
    let point = posicionLonLat.value.split(',').map((x) => parseFloat(x))
    if (!(await verificaTerritorio(point))) {
      document.getElementById('lonlat').value = ''
      return false
    } else {
      centraMapa(posicionLonLat.value)
    }
  })

  // Inicializa el mapa
  // Definiciones del mapa
  var attribution = new ol.control.Attribution({ collapsible: false })

  // Cartografía básica de Open Street Map
  const OSM = new ol.layer.Tile({
    source: new ol.source.OSM({
      crossOrigin: null,
      maxZoom: 30,
    }),
  })
  OSM.set('name', 'OSM')

  // Vector es el Layer que muestra los features mantenidos en la fuente origenDatosSolidar
  TCB.origenDatosSolidar = new ol.source.Vector({ wrapX: false })
  const vector = new ol.layer.Vector({
    source: TCB.origenDatosSolidar,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        fillcolor: [0, 250, 0, 0.5],
        color: [0, 250, 0, 1],
        width: 4,
      }),
      fill: new ol.style.Fill({
        color: 'rgba(0, 255, 0, 0.3)',
      }),
    }),
  })

  // SAT es el layer con la imagen satelite provista por ESRI via arcgisonline
  const SAT = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maxZoom: 30,
    }),
  })
  SAT.set('name', 'SAT')
  SAT.setVisible(false)

  // Creación del mapa
  TCB.map = new ol.Map({
    interactions: ol.interaction.defaults({ doubleClickZoom: false }), //Desabilitamos el zoom in del doubleclick
    controls: ol.control.defaults({ attribution: false }).extend([attribution]),
    target: 'map',
    view: new ol.View({
      center: ol.proj.fromLonLat([-3.7, 40.45]),
      maxZoom: 20,
      zoom: 18, //6
    }),
  })
  map = TCB.map
  map.addLayer(SAT)
  map.addLayer(OSM)
  map.addLayer(vector)
  map.addControl(new ol.control.ZoomSlider())

  // Dejamos inicializado el proceso con Bases si es modo individual en otro caso nada
  if (TCB.modoActivo === INDIVIDUAL) {
    //Solo se dibujan bases por lo que podemos dejar el comando activo
    geometriaActiva = { nombre: 'BaseSolar', tipo: 'Polygon' }
    divBaseSolar.style.display = 'block'
  } else {
    geometriaActiva = { nombre: 'nada', tipo: 'nada' }
  }
  addInteraction()

  /* Declaramos el evento del mapa que se activará cada vez que Interaction crea un nuevo feature en origenDatosSolidar.
  El nuevo feature se convertira en un objeto de Solidar en funcion de cual sea la geometriaActiva:
  - un BaseSolar (Polygon) donde se instalarán los paneles en cuyo caso el feature creado es de tipo Polygon
  - una acimut (LineString) en la linea que define el acimut de alguna Base previamente creada, en cuyo caso es de tipo LineString
  - un Consumo (Point) donde se definirá un perfil de consumo
  */
  TCB.origenDatosSolidar.on('addfeature', (featCreado) => {
    if (TCB.importando) return //Si estamos en un proceso de importacion no debemos hacer nada

    // Dependiendo de la geometriaActiva se procesará el feature recien creado
    switch (geometriaActiva.nombre) {
      case 'BaseSolar':
        construirBaseSolar(featCreado)
        break
      case 'acimut':
        modificaAcimutBaseSolar(featCreado)
        break
      case 'PuntoConsumo':
        construirPuntoConsumo(featCreado)
        break
    }
  })

  // Inicializamos tablas de Tabulator
  muestraTablas()
} // Fin de inicialización

/** Se gestionaran los UTIL.campos mapa y bases del fichero de importacion
 *
 * @param {*} datosImportar
 */
async function importa(datosImportar) {
  // Limpiamos las estructuras existentes
  // Las de Tabulator
  _tablaBaseSolar.clearData()
  if (TCB.modoActivo !== INDIVIDUAL) _tablaPuntoConsumo.clearData()

  // Las de OpenLayers
  TCB.origenDatosSolidar.getFeatures().forEach((feat) => {
    TCB.origenDatosSolidar.removeFeature(feat)
  })

  // Importamos los features OpenLayers
  var jsonReader = new ol.format.GeoJSON()
  var impFeatures = jsonReader.readFeatures(datosImportar.mapa)
  TCB.origenDatosSolidar.addFeatures(impFeatures)

  TCB.totalPaneles = parseFloat(datosImportar.totalPaneles)

  datosImportar.BaseSolar.forEach((base) => {
    // Actualizamos los labels del mapa con el nombre de la correspondiente base ya que no viene en los datos exportados
    const label = TCB.origenDatosSolidar.getFeatureById(
      'BaseSolar.label.' + base.idBaseSolar,
    )
    UTIL.setLabel(label, base.nombreBaseSolar, TCB.baseLabelColor, TCB.baseLabelBGColor)

    // Vemos si tiene acimut geométrico para poner el symbol al final de la linea
    const markerAcimut = TCB.origenDatosSolidar.getFeatureById(
      'BaseSolar.symbol.' + base.idBaseSolar,
    )
    if (markerAcimut) {
      //Hay que confirmar el tema de simbolo si va en el centro de la base y orientado o al final del acimut
      markerAcimut.setStyle(TCB.markerAcimutSymbol)
    }

    //Ajustamos la vista al area importada
    let mapView = TCB.map.getView()
    mapView.fit(TCB.origenDatosSolidar.getExtent())
    if (mapView.getZoom() > 18) mapView.setZoom(18)

    //Creamos el objeto BaseSolar
    UTIL.debugLog('Creando base: ' + base.nombreBaseSolar)
    let tbase = new BaseSolar(base)

    //Creamos el objeto instalacion de la base
    tbase.instalacion = new Instalacion({
      paneles: base.instalacion.paneles,
      potenciaUnitaria: base.instalacion.potenciaUnitaria,
    })

    //Creamos el rendimiento
    tbase.rendimiento = new Rendimiento(base.rendimiento)

    //Creamos la produccion de cada base
    tbase.produccion = new Produccion(tbase)

    //Creamos la baseSolar en TCB
    TCB.BaseSolar.push(tbase)

    //Lo mostramos en la tabla
    _tablaBaseSolar.addData([base], true)
  })

  //Creamos la produccion global
  //Como el objeto Produccion de Solidar no tiene metodos propios se copia directamente el objeto JSON de solimp
  TCB.produccion = new Produccion() //datosImportar.produccion;

  if (datosImportar.version === '3.1') {
    //En esta version no se exportaba este valor
    // Cálculo del CO2 equivalente a la producción anual de toda la instalación
    TCB.CO2AnualRenovable =
      TCB.conversionCO2[TCB.territorio].renovable * TCB.produccion.pTotalAnual
    TCB.CO2AnualNoRenovable =
      TCB.conversionCO2[TCB.territorio].norenovable * TCB.produccion.pTotalAnual
  }
  // Importamos los PuntoConsumo

  //Definimos el estilo del punto de consumo que no viene en los datos exportados
  datosImportar.PuntoConsumo.forEach((punto) => {
    UTIL.debugLog('Creando punto consumo: ' + punto.nombrePuntoConsumo)

    //Si no es INDIVIDUAL los puntosConsumo tienen geometria y hay que crearla
    if (TCB.modoActivo !== INDIVIDUAL) {
      const symbol = TCB.origenDatosSolidar.getFeatureById(
        'PuntoConsumo.symbol.' + punto.idPuntoConsumo,
      )
      symbol.setStyle(TCB.markerConsumo)
      const label = TCB.origenDatosSolidar.getFeatureById(
        'PuntoConsumo.label.' + punto.idPuntoConsumo,
      )
      UTIL.setLabel(
        label,
        punto.nombrePuntoConsumo,
        TCB.baseLabelColor,
        TCB.baseLabelBGColor,
      )
    }

    //Creamos el punto de consumo en TCB
    TCB.PuntoConsumo.push(new PuntoConsumo(punto))

    //Lo mostramos en la tabla en el caso que no sea modo INDIVIDUAL
    if (TCB.modoActivo !== INDIVIDUAL) {
      _tablaPuntoConsumo.addData([punto], true)
    }
  })
}

async function exporta() {
  // Guardamos los datos del mapa en formato geoJSON
  TCB.datosProyecto.mapa = salvarDatosMapa()
  TCB.datosProyecto.BaseSolar = TCB.BaseSolar
  TCB.datosProyecto.PuntoConsumo = TCB.PuntoConsumo

  TCB.datosProyecto.TipoConsumo = TCB.TipoConsumo
  for (let tc of TCB.datosProyecto.TipoConsumo) {
    delete tc.ficheroCSV //El objeto File correspondiente no puede ser exportado via JSON.
  }
}

function prepara() {
  return true
}

async function valida() {
  // Sin bases no se puede continuar
  if (TCB.BaseSolar.length === 0) {
    alert(TCB.i18next.t('mapa_MSG_defineBase'))
    return false
  }

  // Si estamos en modo individual y no hay ningun PuntoConsumo Ficticio previo creamos un PuntoConsumo Ficticio y una Finca asociada
  if (TCB.PuntoConsumo.length === 0 && TCB.modoActivo === INDIVIDUAL) {
    let puntoDummy = {
      idPuntoConsumo: TCB.featIdUnico++,
      nombrePuntoConsumo: 'Ficticio',
      lonlatPuntoConsumo: TCB.BaseSolar[0].lonlatBaseSolar,
      refcat: '',
      direccion: nominatimInfo.calle + '-' + nominatimInfo.ciudad,
      territorio: TCB.BaseSolar[0].territorio,
      puntoSinCatastro: true,
      fincasCargadas: true,
    }
    TCB.PuntoConsumo.push(new PuntoConsumo(puntoDummy))

    let _finca = new Finca({
      idFinca: TCB.idFinca++,
      nombreFinca: 'Global',
      nombreTipoConsumo: 'Global',
      nombrePuntoConsumo: 'Ficticio',
      refcat: 'Ficticia',
      coefInversion: 100,
      coefEnergia: 100,
      coefConsumo: 100,
      participacion: 100,
      coefHucha: 0,
      cuotaHucha: 0,
      enReparto: true,
    })
    TCB.Finca.push(_finca)
    TCB.Participes.push(_finca)
  }

  // Sin puntos de consumo no se puede continuar
  if (TCB.PuntoConsumo.length === 0) {
    alert(TCB.i18next.t('mapa_MSG_definePuntoConsumo'))
    return false
  }

  //Carga rendimientos de cada base que lo requiera asincronicamente
  //La propiedad requierePVGIS es gestionada en GestionLocalizacion y se pone a true cuando cambia algun angulo
  try {
    TCB.BaseSolar.forEach((base) => {
      if (base.requierePVGIS) {
        if (!base.angulosOptimos) {
          if (
            base.inclinacionTejado === 0 &&
            base.inclinacionPaneles === 0 &&
            !base.inclinacionOptima
          ) {
            if (
              !window.confirm(
                'Base: ' + base.nombreBaseSolar + ' con paneles a 0º de inclinación',
              )
            )
              return false
          }
        }
        UTIL.debugLog('Base requiere PVGIS:', base)
        base.cargaRendimiento()
        TCB.requiereOptimizador = true
      }
    })

    //Se utilizará en el grafico de alternativas para limitar el número máximo de paneles que se pueden instalar
    TCB.areaTotal = 0
    for (let base of TCB.BaseSolar) TCB.areaTotal += base.areaReal

    //Si el modo no es individual
    if (TCB.modoActivo !== INDIVIDUAL) {
      //Todos los puntos de consumo deben tener sus fincas cargadas salvo que sea un punto sin catastro. En ese caso se cargaran las fincas en el módulo de gestión de fincas importando desde CSV
      TCB.cargaFincasError = false
      TCB.PuntoConsumo.forEach((punto) => {
        if (!punto.sinCatastro) {
          //Seguimos si el catastro ha identificado una refcat basado en lon-lat
          if (!punto.fincasCargadas) {
            //Seguimos si no sa habian cargado las fincas previamente
            if (!punto.cargaFincas()) {
              //Cargamos las fincas
              alert(
                'Problema en cargaFincas de Punto Consumo ' + punto.nombrePuntoConsumo,
              )
              return false
            }
          }
        }
      })
    }

    return true
  } catch (err) {
    alert('Error en validacion de Localizacion: ' + err)
    return false
  }
}
/** Construye las tablas Tabulator
 *
 */
function muestraTablas() {
  var deleteIcon = function () {
    return "<i class='fa fa-trash-o'></i>"
  }
  var acimutIcon = function () {
    return "<i class='fa fa-compass'></i>"
  }
  var noEditable = function (cell) {
    cell.getElement().style.backgroundColor = 'rgba(220, 249, 233, 1)'
    return UTIL.formatoValor(cell.getField(), cell.getValue())
  }

  // Creamos tabla para gestionar puntos de consumo si no es el modo INDIVIDUAL
  if (TCB.modoActivo !== INDIVIDUAL) {
    _tablaPuntoConsumo =
      _tablaPuntoConsumo ??
      new Tabulator(divPuntoConsumo, {
        columnDefaults: { headerTooltip: (e, col) => UTIL.hdrToolTip(e, col) },
        height: '100%',
        layout: 'fitColumns',
        index: 'idPuntoConsumo',
        data: TCB.PuntoConsumo,
        rowFormatter: function (row) {
          if (row.getData().csvCargado) {
            row.getElement().style.backgroundColor = '#1e3b20'
          }
        },
        columns: [
          { title: 'Id', field: 'idPuntoConsumo', hozAlign: 'center' },
          {
            title: 'Nombre',
            field: 'nombrePuntoConsumo',
            hozAlign: 'left',
            editor: 'input',
            cellEdited: (cell) => UTIL.cambioValor(cell, true),
          },
          {
            title: 'Lon-Lat',
            field: 'lonlatPuntoConsumo',
            hozAlign: 'center',
            formatter: noEditable,
          },
          {
            title: 'Ref. Catastral',
            field: 'refcat',
            hozAlign: 'center',
            formatter: noEditable,
          },
          {
            title: 'Direccion Postal',
            field: 'direccion',
            hozAlign: 'left',
            formatter: noEditable,
          },
          {
            title: 'Territorio',
            field: 'territorio',
            hozAlign: 'center',
            formatter: noEditable,
          },
          {
            field: 'botonBorraBase',
            titleFormatter: deleteIcon,
            formatter: deleteIcon,
            width: 40,
            hozAlign: 'center',
            headerSort: false,
            cellClick: (evt, cell) => borraObjeto(cell),
          },
        ],
      })
    _tablaPuntoConsumo.on('tableBuilt', function () {
      Idioma.i18nTitulosTabla(_tablaPuntoConsumo)
    })
  }

  // Creamos tabla para gestionar las bases
  _tablaBaseSolar =
    _tablaBaseSolar ??
    new Tabulator(divBaseSolar, {
      columnDefaults: { headerTooltip: (e, col) => UTIL.hdrToolTip(e, col) },
      height: '100%',
      layout: 'fitColumns',
      index: 'idBaseSolar',

      data: TCB.BaseSolar,
      columns: [
        {
          title: 'Nombre',
          field: 'nombreBaseSolar',
          hozAlign: 'left',
          editor: 'input',
          cellEdited: (cell) => UTIL.cambioValor(cell, true),
        },
        {
          title: 'Lon-Lat',
          field: 'lonlatBaseSolar',
          hozAlign: 'center',
          formatter: noEditable,
        },
        {
          title: 'Area en mapa',
          field: 'areaMapa',
          hozAlign: 'right',
          formatter: noEditable,
        },
        {
          title: 'Inclinacion Tejado',
          field: 'inclinacionTejado',
          hozAlign: 'right',
          formatter: '_formatoValor',
          editor: 'input',
          cellEdited: (cell) => inclinacionTejado(cell),
        },
        {
          title: 'Area corregida',
          field: 'areaReal',
          hozAlign: 'right',
          formatter: noEditable,
        },
        {
          title: 'Max. kWp',
          field: 'potenciaMaxima',
          hozAlign: 'right',
          formatter: noEditable,
        },
        {
          title: 'Inclinacion del panel',
          field: 'inclinacionPaneles',
          hozAlign: 'right',
          formatter: '_formatoValor',
          editor: 'input',
          cellEdited: (cell) => inclinacionPaneles(cell),
        },
        {
          title: 'Inclinación óptima',
          field: 'inclinacionOptima',
          hozAlign: 'center',
          headerSort: false,
          formatter: 'tickCross',
          cellClick: (evt, cell) => inclinacionOptima(cell),
        },
        {
          title: 'Orientación (Acimut)',
          field: 'inAcimut',
          formatter: '_formatoValor',
          hozAlign: 'right',
          editor: 'input',
          cellEdited: (cell) => acimutBaseSolar(cell, 'INPUT'),
        },
        {
          field: 'botonAcimut',
          titleFormatter: acimutIcon,
          formatter: acimutIcon,
          width: 40,
          hozAlign: 'center',
          headerSort: false,
          cellClick: (evt, cell) => acimutBaseSolar(cell, 'GEO'),
        },
        {
          title: 'Angulos óptimos',
          field: 'angulosOptimos',
          hozAlign: 'center',
          formatter: 'tickCross',
          cellClick: (evt, cell) => angulosOptimos(cell),
        },
        {
          field: 'botonBorraBase',
          titleFormatter: deleteIcon,
          formatter: deleteIcon,
          width: 40,
          hozAlign: 'center',
          headerSort: false,
          cellClick: (evt, cell) => borraObjeto(cell),
        },
      ],
    })
  _tablaBaseSolar.on('tableBuilt', function () {
    Idioma.i18nTitulosTabla(_tablaBaseSolar)
  })
}

/** Este funcion es la que gestiona la interactividad con el mapa
 *
 * Dependiendo del valor del campo nombre del objeto geometriaActiva se hace:
 * nada: no queda ninguna opción de dibujo activada
 * BaseSolar: se prepara para dibujar un poligon que representa la base
 * acimut: se prepara para dibujar una linea que permite definir al ángulo acimut
 *
 */
function addInteraction() {
  UTIL.mensaje('accionMapa', 'mapa_MSG_' + geometriaActiva.tipo)
  map.removeInteraction(draw)
  if (geometriaActiva.nombre !== 'nada') {
    let drawOptions = {
      source: TCB.origenDatosSolidar,
      type: geometriaActiva.tipo,
    }
    if (geometriaActiva.nombre === 'acimut') drawOptions.maxPoints = 2
    if (geometriaActiva.nombre === 'BaseSolar') drawOptions.maxPoints = 3
    draw = new ol.interaction.Draw(drawOptions)
    map.addInteraction(draw)
    //Si estamos dibujando el acimut de una BaseSolar tomamos el primer punto como el punto de aplicacion de la base
    if (geometriaActiva.nombre === 'acimut') {
      componente = 'BaseSolar.label.' + activo.id
      let baseGeom = TCB.origenDatosSolidar.getFeatureById(componente).getGeometry()
      let geomPuntoAplicacion = baseGeom.getCoordinates()
      let coord = [geomPuntoAplicacion[0], geomPuntoAplicacion[1]]
      draw.appendCoordinates([coord])
    }
  }
}

/** Se construirá el objeto BaseSolar a partir del feature creado en OpenLayers
 * Esta funcion se activa cuando el usuario ha terminado de dibujar un area en el mapa que será candiata para
 * instalar bases solares.
 * El feature BaseSolar esta compuesto por 4 geometrias. Dos de ellas se definen automaticamente al dibujar el area
 *   - Polygon con ID BaseSolar.area.+featID
 *   - Label con ID  BaseSolar.label.+featID
 *
 * las otras 2 se dibujarán opcionalmente si el usuario define un acimut interactuando con el mapa
 *   - Linea de acimut con ID BaseSolar.acimut.+featID Se construirá luego si el usuario lo define con ID A+featID
 *   - Marker de fin de acimut con ID BaseSolar.symbol.+featID
 *
 * @param {ol.Feature} geoBaseSolar definida en el mapa
 * @returns True si todo OK, False en caso contrario
 */
async function construirBaseSolar(geoBaseSolar) {
  // Incrementamos el featID
  TCB.featIdUnico++
  // Construimos la geometria de la BaseSolar que es un paralelogramo a partir de tres puntos
  geometria = geoBaseSolar.feature.getGeometry()
  let puntos = geometria.getCoordinates()[0]
  /*     const largo1 = UTIL.distancia(puntos[0], puntos[1]);
      const largo2 = UTIL.distancia(puntos[1], puntos[2]); */
  let nuevoY = puntos[2][1] - (puntos[1][1] - puntos[0][1])
  let nuevoX = puntos[0][0] - (puntos[1][0] - puntos[2][0])
  let nuevoPunto = [nuevoX, nuevoY]
  puntos.splice(3, 0, nuevoPunto)
  geoBaseSolar.feature.getGeometry().setCoordinates([puntos])

  // Calculamos una coordenada central para esta base que utilizaremos en PVGIS y donde la rotularemos
  puntoAplicacion = geometria.getInteriorPoint().getCoordinates()

  // Transformamos el punto al EPSG:4326 necesario para Nominatim
  puntoAplicacion_4326 = ol.proj.transform(puntoAplicacion, 'EPSG:3857', 'EPSG:4326')

  //Verificamos que el punto esta en España y ademas fijamos el territorio
  territorioEnEspana = await verificaTerritorio(puntoAplicacion_4326)
  if (!territorioEnEspana) {
    //Si no esta en España no seguimos
    TCB.origenDatosSolidar.removeFeature(geoBaseSolar.feature)
    return false
  }

  //Preparamos los datos default para constuir un objeto BaseSolar
  geoBaseSolar.feature.setId('BaseSolar.area.' + TCB.featIdUnico)
  let nuevaBaseSolar = {}
  nuevaBaseSolar.idBaseSolar = TCB.featIdUnico.toString()
  nuevaBaseSolar.nombreBaseSolar =
    TCB.nombreProyecto + ' Base ' + nuevaBaseSolar.idBaseSolar
  nuevaBaseSolar.lonlatBaseSolar =
    puntoAplicacion_4326[0].toFixed(4) + ',' + puntoAplicacion_4326[1].toFixed(4)
  nuevaBaseSolar.areaMapa = ol.sphere.getArea(geometria, { projection: 'EPSG:3857' })
  nuevaBaseSolar.areaReal = nuevaBaseSolar.areaMapa
  nuevaBaseSolar.inclinacionTejado = 0
  nuevaBaseSolar.potenciaMaxima =
    nuevaBaseSolar.areaMapa / TCB.parametros.conversionAreakWp
  nuevaBaseSolar.inclinacionPaneles = 0
  nuevaBaseSolar.inclinacionOptima = false
  nuevaBaseSolar.inAcimut = 0
  nuevaBaseSolar.angulosOptimos = true
  nuevaBaseSolar.geometria = {
    area: geoBaseSolar.feature,
    label: nuevoLabel(
      'BaseSolar.label.' + TCB.featIdUnico,
      puntoAplicacion,
      nuevaBaseSolar.nombreBaseSolar,
      TCB.baseLabelColor,
      TCB.baseLabelBGColor,
    ),
    acimut: '',
    symbol: '',
  }

  //Lo insertamos en el repositorio
  TCB.BaseSolar.push(new BaseSolar(nuevaBaseSolar))
  //Lo insertamos en la tabla
  _tablaBaseSolar.addData([nuevaBaseSolar], false)
  //Marcamos necesidad de ejecutar optimizador por existencia de nueva base
  TCB.requiereOptimizador = true
  return true
}

/** Se construirá el objeto PuntoConsumo a partir del feature creado en OpenLayers
 *  Esta funcion se activa cuando el usuario ha terminado de dibujar un punto en el mapa que identificará
 *  a la finca donde se encuentran los consumos
 *  El feature PuntoConsumo esta compuesto por 2 geometrias:
 *  - Point con ID consumo.symbol.featID
 *  - Label con ID consumo.label.featID (Se creará con el texto del nombre)
 *
 * @param {ol.Fe} geoPuntoConsumo definido en el mapa cuando el modo no es INDIVIDUAL
 * @returns True si todo OK, False en caso contrario
 */

async function construirPuntoConsumo(geoPuntoConsumo) {
  // En el modo INTERACTIVO no existe PuntoConsumo, en modo COMUNIDAD puede existir solo 1, en COMUNIDAD puede haber muchos
  if (TCB.PuntoConsumo.length > 0 && TCB.modoActivo !== COMUNIDAD) {
    alert(TCB.i18next.t('mapa_MSG_cuantosPuntoConsumo', { modoActivo: TCB.modoActivo }))
    return false
  }

  // Incrementamos el featID
  TCB.featIdUnico++
  // Construimos la geometria del puntoCosnumoa
  geometria = geoPuntoConsumo.feature.getGeometry()
  // Calculamos una coordenada
  puntoAplicacion = geometria.getCoordinates()
  // Transformamos el punto al EPSG:4326 necesario para Nominatim
  puntoAplicacion_4326 = ol.proj.transform(puntoAplicacion, 'EPSG:3857', 'EPSG:4326')
  //Verificamos que el punto esta en España y ademas fijamos el territorio
  territorioEnEspana = await verificaTerritorio(puntoAplicacion_4326)
  if (!territorioEnEspana) {
    //Si no esta en España no seguimos
    TCB.origenDatosSolidar.removeFeature(geoPuntoConsumo.feature)
    return false
  }

  let nuevoPuntoConsumo = {}
  //Obtenemos la identificación de la parcela basada en sus coordenadas
  let identificacionParcela = await getParcelaXY(puntoAplicacion_4326)
  if (identificacionParcela.codigo !== 0) {
    //Si no hay datos de catastro
    if (
      confirm(
        TCB.i18next.t('mapa_MSG_errorCatastroXY', {
          descripcion: identificacionParcela.descripcion,
        }),
      )
    ) {
      //Pedimos confirmacion
      nuevoPuntoConsumo.sinCatastro = true
      identificacionParcela.refcat = 'Sin catastro'
      identificacionParcela.direccion = nominatimInfo.calle + '-' + nominatimInfo.ciudad
    } else {
      TCB.origenDatosSolidar.removeFeature(geoPuntoConsumo.feature)
      return false
    }
  }
  geoPuntoConsumo.feature.setStyle(TCB.markerConsumo)
  geoPuntoConsumo.feature.setId('PuntoConsumo.symbol.' + TCB.featIdUnico)

  //Preparamos los datos default para constuir un objeto PuntoConsumo
  nuevoPuntoConsumo.idPuntoConsumo = TCB.featIdUnico.toString()
  nuevoPuntoConsumo.nombrePuntoConsumo =
    TCB.nombreProyecto + ' PC:' + nuevoPuntoConsumo.idPuntoConsumo
  nuevoPuntoConsumo.lonlatPuntoConsumo =
    puntoAplicacion_4326[0].toFixed(4) + ',' + puntoAplicacion_4326[1].toFixed(4)
  nuevoPuntoConsumo.refcat = identificacionParcela.refcat
  nuevoPuntoConsumo.direccion = identificacionParcela.direccion
  nuevoPuntoConsumo.territorio = TCB.territorio
  nuevoPuntoConsumo.geometria = {
    symbol: geoPuntoConsumo.feature,
    label: nuevoLabel(
      'PuntoConsumo.label.' + TCB.featIdUnico,
      puntoAplicacion,
      nuevoPuntoConsumo.nombrePuntoConsumo,
      TCB.puntoConsumoLabelColor,
      TCB.puntoConsumoLabelBGColor,
    ),
  }

  //Lo insertamos en el repositorio
  TCB.PuntoConsumo.push(new PuntoConsumo(nuevoPuntoConsumo))
  //Lo insertamos en la tabla
  _tablaPuntoConsumo.addData([nuevoPuntoConsumo], true)
  //Marcamos necesidad de ejecutar optimizador por existencia de nueva base
  TCB.requiereOptimizador = true

  return true
}

/** LLamada cuando addInteracion recibio un acimut
 * Se completa elcampo acimut en la tabla Base y se incorpora el componente geometrico acimut
 * Al finalizar se deja la interaccion activa en nada.
 *
 * @param {Objeto} acimutBaseSolar  Objeto OpenLayer creado por addInteraction
 */
function modificaAcimutBaseSolar(acimutBaseSolar) {
  // Borramos la linea y el marker si existieran
  TCB.origenDatosSolidar.removeFeature(activo.objeto.geometria.acimut)
  TCB.origenDatosSolidar.removeFeature(activo.objeto.geometria.symbol)

  //Establecemos la identificacion de esta geometria
  acimutBaseSolar.feature.setId('BaseSolar.acimut.' + activo.id)
  let acimutCoordinates = acimutBaseSolar.feature.getGeometry().getCoordinates()
  let point1 = acimutCoordinates[0]
  let point2 = acimutCoordinates[1]

  //Esta es la geometria que se dibuja en el centro de la base
  //let markerAcimut = new ol.Feature({ geometry: new ol.geom.Point(point1)});
  //Esta es la geometria que se dibuja al final de la linea de acimut
  let markerAcimut = new ol.Feature({ geometry: new ol.geom.Point(point2) })
  // Creamos el nuevo marker

  markerAcimut.setId('BaseSolar.symbol.' + activo.id)
  // Calculamos el nuevo acimut y actualizamos la tabla
  let acimut = (Math.atan2(point1[0] - point2[0], point1[1] - point2[1]) * 180) / Math.PI
  acimut = Math.trunc(acimut * 100) / 100
  let markerAcimutSymbol = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 0.5],
      /* En caso de poner simbolo orientado en el centro
    src: "./datos/panel simple.svg",
    scale: 0.05,
    anchor: [0.5, 1],
    rotation: acimut / 180 * Math.PI */
      src: './datos/ABC.svg',
    }),
  })
  markerAcimut.setStyle(markerAcimutSymbol)

  //Se define el acimut en el objeto
  activo.objeto.inAcimut = acimut
  //Si se ha definido un acimut a mano los angulos para PVGIS ya no son optimos
  activo.objeto.angulosOptimos = false
  //Al quitar ángulos optimos se pueden quedar los ángulos a cero por lo que ponemos inclinación optima
  if (activo.objeto.inclinacionTejado === 0 && activo.objeto.inclinacionPaneles === 0) {
    activo.objeto.inclinacionOptima = true
  }
  //Se completan los UTIL.campos geométricos del objeto Base
  activo.objeto.geometria.acimut = acimutBaseSolar.feature
  activo.objeto.geometria.symbol = markerAcimut
  //Se actualiza la tabla
  activo.tabla.updateData([activo.objeto])

  //Se actualizan lo datos del ol.layer pero antes desactivamos el on event cuando se agregan features
  geometriaActiva = { nombre: 'nada', tipo: 'nada' }
  TCB.origenDatosSolidar.addFeatures([markerAcimut])
  //Se deja el sistema neutro para dibujo de próxima geometria
  addInteraction()
}
/** Se utiliza para definir el label asociado a un objeto en el mapa
 *
 * @param {Object} id del objeto al que se asocia el label
 * @param {Array(2)<Number>} punto coordenadas en las que se inserta
 * @param {String} texto a poner en el label
 * @param {Color} color color del texto
 * @param {Color} bgcolor color de background
 * @returns {Object} Objeto OpenLayers Label
 */
function nuevoLabel(id, punto, texto, color, bgcolor) {
  let label = new ol.Feature({ geometry: new ol.geom.Point(punto) })
  label.setId(id)

  UTIL.setLabel(label, texto, color, bgcolor)

  geometriaPrevia = geometriaActiva.nombre
  geometriaActiva.nombre = 'texto'
  TCB.origenDatosSolidar.addFeatures([label])
  geometriaActiva.nombre = geometriaPrevia
  addInteraction()
  return label
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
  nominatimInfo = await verificaTerritorioNominatim(point)

  if (nominatimInfo === null) {
    // Las coordenadas no estan en España
    alert(TCB.i18next.t('mapa_MSG_territorio')) //Quiere decir que no estamos en España
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
 * @returns territorio entre los siguientes valores: ['Peninsula', 'Islas Baleares', 'Canarias', 'Melilla', 'Ceuta'];
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
    "&format=json&zoom=18&accept-language='es'"
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
      if (jsonTerritorio.address.country === 'España') {
        // Verificamos si estamos en territorio insular.
        let territorio = 'Peninsula'
        let detalle = jsonTerritorio.display_name.split(',')
        const islas = ['Islas Baleares', 'Canarias', 'Melilla', 'Ceuta']
        if (islas.includes(detalle[0])) territorio = detalle[0]
        UTIL.debugLog('Localización:' + territorio)
        status = {
          zona: territorio,
          calle: jsonTerritorio.address.road,
          ciudad: jsonTerritorio.address.city,
        }
      } else {
        UTIL.debugLog('Localización erronea:' + jsonTerritorio.address.country)
        status = null
      }
    } else {
      alert(TCB.i18next.t('nominatim_MSG_errorFetch', { err: respTerritorio, url: url }))
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

async function mapaPorLocalizacion() {
  var localizacion = document.getElementById('localizacion')
  var listaCandidatos = document.getElementById('candidatos')
  let url =
    'https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&addressdetails=1&countrycodes=es&'
  url += 'q=' + localizacion.value
  UTIL.debugLog('Call Nominatim:' + url)
  var latlons = []

  try {
    const respCandidatos = await fetch(url)
    if (respCandidatos.status === 200) {
      var dataCartoCiudad = await respCandidatos.text()
      var jsonAdd = JSON.parse(dataCartoCiudad)

      while (listaCandidatos.firstChild) {
        listaCandidatos.removeChild(listaCandidatos.firstChild)
      }

      jsonAdd.forEach(function (item) {
        var nitem = document.createElement('option')
        nitem.value = [item.lon, item.lat]
        nitem.text = item.display_name.toString()
        latlons.push = [item.lat, item.lon]
        listaCandidatos.appendChild(nitem)
      })

      if (listaCandidatos.childElementCount > 0) {
        listaCandidatos.disabled = false
      } else {
        listaCandidatos.disabled = true
      }
    } else {
      alert('Error conectando con Nominatim: ' + respCandidatos.status + '\n' + url)
      UTIL.copyClipboard(url)
      return false
    }
  } catch (err) {
    alert(TCB.i18next.t('nominatim_MSG_errorFetch', { err: err.message, url: url }))
    UTIL.copyClipboard(url)
    return false
  }
}

async function centraMapa(direccion) {
  let coords = direccion.split(',')
  map
    .getView()
    .setCenter(ol.proj.transform([coords[0], coords[1]], 'EPSG:4326', 'EPSG:3857'))
  map.getView().setZoom(17)
}

function inclinacionPaneles(cell) {
  activo = UTIL.setActivo(cell)
  if (cell.getValue() === cell.getOldValue()) return
  activo.objeto.inclinacionPaneles = parseFloat(cell.getValue())
  activo.objeto.inclinacionOptima = false
  activo.objeto.angulosOptimos = false
  activo.tabla.updateData([activo.objeto])
  activo.objeto.requierePVGIS = true
}

function inclinacionOptima(cell) {
  activo = UTIL.setActivo(cell)
  componente = 'BaseSolar.inclinacion.' + activo.id
  if (cell.getValue()) {
    activo.objeto.inclinacionOptima = false
  } else {
    activo.objeto.inclinacionOptima = true
    activo.objeto.angulosOptimos = false
    activo.objeto.inclinacionPaneles = 0
  }
  activo.tabla.updateData([activo.objeto])
  activo.objeto.requierePVGIS = true
}

function inclinacionTejado(cell) {
  activo = UTIL.setActivo(cell)
  activo.objeto.inclinacionTejado = parseFloat(cell.getValue())
  activo.objeto.areaReal =
    activo.objeto.areaMapa / Math.cos((activo.objeto.inclinacionTejado / 180) * Math.PI)
  activo.objeto.potenciaMaxima = activo.objeto.areaReal / TCB.parametros.conversionAreakWp
  activo.tabla.updateData([activo.objeto])
  activo.objeto.requierePVGIS = true
}

/** LLamada desde la tabla BaseSolar al seleccionar el campo Acimut de una fila.
 * El acimut puede ser definido de dos maneras, mediante input number en cuyo caso el evento viene con nodeName => INPUT o
 * desde el boton que esta en la misma celda en cuyo caso se activa el dibujo de acimut
 *
 * @param {Event} evento
 */
function acimutBaseSolar(cell, tipo) {
  activo = UTIL.setActivo(cell)
  activo.objeto.requierePVGIS = true
  activo.objeto.angulosOptimos = false

  if (tipo === 'INPUT') {
    if (cell.getValue() === cell.getOldValue()) return
    activo.objeto.inAcimut = parseFloat(cell.getValue())
    TCB.origenDatosSolidar.removeFeature(activo.objeto.geometria.acimut) //Si habia un acimut dibujado lo borramos
    TCB.origenDatosSolidar.removeFeature(activo.objeto.geometria.symbol)
    activo.objeto.angulosOptimos = false
    activo.objeto.inclinacionOptima = false
    activo.tabla.updateData([activo.objeto])
  } else {
    geometriaActiva = { nombre: 'acimut', tipo: 'LineString' }
    addInteraction()
  }
}

/**
 * Si se seleccion angulos optimos se debe desabilitar la posibilidad de inclinacion, inclinacionOptima y acimut
 * @param {*} evento
 */
function angulosOptimos(cell) {
  activo = UTIL.setActivo(cell)
  if (cell.getValue()) {
    activo.objeto.angulosOptimos = false
  } else {
    activo.objeto.angulosOptimos = true
    activo.objeto.inAcimut = 0
    TCB.origenDatosSolidar.removeFeature(activo.objeto.geometria.acimut)
    TCB.origenDatosSolidar.removeFeature(activo.objeto.geometria.symbol)
    activo.objeto.inclinacion = ''
    activo.objeto.inclinacionOptima = true
  }
  activo.tabla.updateData([activo.objeto])
  activo.objeto.requierePVGIS = true
}

/**
 * Devuelve datos de la parcela mas cercana al punto dado
 * @param {Array(2)<Number>} punto en coordenadas sistema geografico EPSG:4326
 * @returns {JSON} Devuelve objeto JSON de catastro con:
 *  'codigo' => 0 si no hay error, <0 en caso de error
 *  'refcat' => referencia catastral mas cercana a las coordenadas dadas,
 *  'direccion' => dirección de la parcela;
 *  'descripcion' => solo en caso de codigo <0
 */
async function getParcelaXY(punto) {
  let url = 'proxy-Catastro-refcat x lonlat.php?'
  url += 'coorX=' + punto[0] + '&coorY=' + punto[1]
  UTIL.debugLog('Consulta_RCCOOR :' + url)
  try {
    const respuesta = await fetch(url)
    if (respuesta.status === 200) {
      let datoRC = await respuesta.text()
      return JSON.parse(datoRC)
    }
  } catch (err) {
    alert(TCB.i18next.t('catastro_MSG_errorFetch', { err: err.message, url: url }))
    return false
  }
}

/**
 * Utilizada en exporta para salvar los datos del mapa usando OpenLayers GeoJSON
 * @returns GeoJSON con datos del mapa
 */
function salvarDatosMapa() {
  var writer = new ol.format.GeoJSON()
  var objetosSolidar = TCB.origenDatosSolidar.getFeatures()
  var geojsonStr = writer.writeFeatures(objetosSolidar)
  return geojsonStr
}

/**
 * Funcion para borrar objetos puntoConsumo o baseSolar de forma completa, en Tabulator, en TCB y si tiene geometria en OpenLayers
 * @param {Tabulator.cell} cell Es la celda que contiene el simbolo de borrado en Tabulator
 * @returns {boolean}
 */
function borraObjeto(cell) {
  const activo = UTIL.setActivo(cell) //Cual es el objeto asociado a la fila seleccionada
  const _id = 'id' + activo.nombreTabla //La clave del objeto es idPuntoConsumo o idBaseSolar
  const idxObjetoActivo = TCB[activo.nombreTabla].findIndex(
    (obj) => obj[_id] === activo.id,
  ) //Posicion en la tabla para usar luego en la función splice

  if (activo.nombreTabla === 'PuntoConsumo') {
    //Vamos a verificar que no tiene Fincas asociadas
    let fincasEnPuntoConsumo = UTIL.selectTCB(
      'Finca',
      'idPuntoConsumo',
      activo.objeto.idPuntoConsumo,
    )
    if (fincasEnPuntoConsumo.length > 0) {
      if (confirm(TCB.i18next.t('hay fincas - borrarlas?'))) {
        //Pedimos confirmacion
        while (fincasEnPuntoConsumo.length > 0) {
          let i = fincasEnPuntoConsumo.pop()
          TCB.Finca.splice(i, 1)
        }
      } else {
        return false
      }
    }
  }

  //Removemos la fila de la tabla
  activo.tabla.deleteRow(activo.objeto[_id])
  //Removemos los componentes geograficos de origenDatosSolidar
  if (Object.prototype.hasOwnProperty.call(activo.objeto, 'geometria')) {
    for (const geoProp in activo.objeto.geometria)
      TCB.origenDatosSolidar.removeFeature(activo.objeto.geometria[geoProp])
  }
  //Removemos el objeto de la TCB
  TCB[activo.nombreTabla].splice(idxObjetoActivo, 1)
  return
}

export { gestionLocalizacion, salvarDatosMapa }
