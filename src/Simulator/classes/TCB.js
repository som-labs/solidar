/**
 * TCB
 * @namespace
 * @fileoverview Area de allmacenamiento de las variables globales de la aplicación
 * @version      Solidar.3.3
 * @author       José Luis García (SOM Madrid)
 * @copyright
 *
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
 */
const INDIVIDUAL = 'INDIVIDUAL'
const COLECTIVO = 'COLECTIVO'
const COMUNIDAD = 'COMUNIDAD'

/*global INDIVIDUAL, COLECTIVO, COMUNIDAD, ol*/
const TCB = {
  //Variables globales de funcionamiento
  debug: false,
  basePath: '',
  idSesion: '', //Identificador unico de sesión

  /*  Existen tres modos de ejecucion de Solidar
    Individual (default): No existen puntos de consumo, multiples bases, no hay fincas ni reparto
    Colectivo: Existe solo un punto de consumo, multiples bases, hay fincas y un unico reparto
    Comunidad: Existen multiples puntos de consumo, cada uno de ellos con fincas y un unico reparto */

  modos: [INDIVIDUAL, COLECTIVO, COMUNIDAD],
  modoActivo: INDIVIDUAL,

  nombreProyecto: '',
  territorio: 'Peninsula',

  importando: false, //Es verdadero durante el proceso de importacion
  //Donde se guardan los datos a exportar
  datosProyecto: { version: '3.3' },

  /**
   * @type {Array<PuntoConsumo>}
   */
  PuntoConsumo: [],
  /**
   * @type {Array<TipoConsumo>}
   */
  TipoConsumo: [],
  /**
   * @type {Array<Finca>}
   */
  Finca: [],
  /**
   * @type {Array<BaseSolar>}
   */
  BaseSolar: [],
  /**
   * @type {Array<Finca>}
   */
  Participes: [],

  // Variables de totalización
  consumo: {}, // Este campo contiene la suma de todos las consumos[]
  consumoCreado: false,
  economico: {}, // Este campo contiene la suma de todos las consumos.economico[]
  produccion: {}, // Este campo contiene la suma de todos las bases.produccion[]
  balance: {}, // Este campo contiene el balance global de la instalación
  totalPaneles: 0,
  areaTotal: 0,

  graficos: {}, //Instancia del módulo de graficos
  featIdUnico: 0, // Generador de identificadores de objeto unicos
  idFinca: 0, //Generador de id de finca. Inicializado desde el proxy de catastro

  _tablaBasesAsignadas: null,
  _tablaReparto: null,
  listaZonasComunes: [], //Lista de los nombres de las zonas comunes generadas en los modos colectivo y comunidad
  tiempoEsperaPVGIS: 100,

  //Por ver
  pdfDoc: '',
  pdf: '',
  tooltipTriggerList: '',

  // Creamos el nuevo marker
  // markerAcimutSymbol : new ol.style.Style({
  //         image: new ol.style.Icon({
  //         anchor: [0.5, 0.5],
  //         /* En el caso de dibujar los paneles en el centro de la base
  //         scale: 0.075,
  //         src: "./datos/panel simple.svg" */
  //         src: "./datos/ABC.svg",
  //         }),
  //     }),

  // markerConsumo : new ol.style.Style({
  //         image: new ol.style.Icon({
  //         scale: 1,
  //         anchor: [0.5, 1],
  //         src: "./datos/marker.png",
  //         }),
  //     }),

  // Variables del mapa
  map: '', // Objeto OpenLayers base del mapa
  origenDatosSolidar: '',
  baseLabelColor: [0, 0, 0, 1],
  baseLabelBGColor: [168, 50, 153, 0.1],
  puntoConsumoLabelColor: [0, 0, 0, 1],
  puntoConsumoLabelBGColor: [168, 50, 153, 0.1],

  rendimientoCreado: false,
  instalacionCreada: false,
  produccionCreada: false,
  balanceCreado: false,
  economicoCreado: false,
  requiereOptimizador: true,
  ultimarefcat: '', //Ultima referencia catastral de la que se han cargado fincas

  //Algunos valores por defecto
  tarifaActiva: '2.0TD',
  // Estos precios son los de SOM a agosto 2022 y no deberían estar aqui.
  tarifas: {
    '2.0TD': {
      precios: [0.13, 0.295, 0.237, 0.199, 0, 0, 0],
      horas: [3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2],
    },
    '3.0TD-Peninsula': {
      precios: [0.13, 0.233, 0.254, 0.23, 0.213, 0.213, 0.196],
      horas: [
        [6, 6, 6, 6, 6, 6, 6, 6, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 3, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 4, 4, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 4, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 4, 4, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 4, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 3, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 4, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 3, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 4, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 3, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 4, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 4, 4, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 4, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 3, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2],
      ],
    },
    '3.0TD-Ceuta': {
      precios: [0.13, 0.233, 0.254, 0.23, 0.213, 0.213, 0.196],
      horas: [
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 1, 1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 1, 1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 3, 3, 3, 3, 3, 5, 5, 5, 5, 3, 3, 3, 3, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 3, 3, 3, 3, 3, 5, 5, 5, 5, 3, 3, 3, 3, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 3, 3, 3, 3, 3, 5, 5, 5, 5, 3, 3, 3, 3, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 1, 1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 1, 1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 4],
      ],
    },
    '3.0TD-Melilla': {
      precios: [0.13, 0.233, 0.254, 0.23, 0.213, 0.213, 0.196],
      horas: [
        [6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 4, 4, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 4, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 4, 4, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 4, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 4, 4, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 4, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 3, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 3, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 3, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 3, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 3],
      ],
    },
    '3.0TD-Illes Balears': {
      precios: [0.13, 0.233, 0.254, 0.23, 0.213, 0.213, 0.196],
      horas: [
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 3, 3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 4, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 3, 3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 4, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 4, 4, 4, 4, 4, 5, 5, 5, 4, 4, 4, 4, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 4, 4, 4, 4, 4, 5, 5, 5, 4, 4, 4, 4, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 3, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 2, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 2, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 2, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 2, 2],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 3, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 4, 4, 4, 4, 4, 5, 5, 5, 4, 4, 4, 4, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 3, 3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 4, 4],
      ],
    },
    '3.0TD-Canarias': {
      precios: [0.13, 0.233, 0.254, 0.23, 0.213, 0.213, 0.196],
      horas: [
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 2, 2, 2, 2, 2, 4, 4, 4, 2, 2, 2, 2, 4, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 2, 2, 2, 2, 2, 4, 4, 4, 2, 2, 2, 2, 4, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 2, 2, 2, 2, 2, 4, 4, 4, 2, 2, 2, 2, 4, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 4, 4, 4, 4, 4, 5, 5, 5, 4, 4, 4, 4, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 4, 4, 4, 4, 4, 5, 5, 5, 4, 4, 4, 4, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 4, 4, 4, 4, 4, 5, 5, 5, 4, 4, 4, 4, 5, 5],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 3, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 3, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 3, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 3, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 3, 3],
        [6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 3, 3],
      ],
    },
  },

  // Parametros por defecto
  parametros: {
    conversionAreakWp: 6,
    impuestoElectrico: 5.113,
    IVAenergia: 5.0,
    IVAinstalacion: 21.0,
    perdidasSistema: 20,
    interesVAN: 3,
    tecnologia: 'crystSi',
    potenciaPanelInicio: 0.45,
  },

  /** Constante donde se define el precio estimado de la instalación en base a la potencia instalada
   * @typedef {object} precioInstalacion
   * @property {number} precioInstalacion.desde rango inferior de kWp para este precio
   * @property {number} precioInstalacion.hasta rango superior de kWp para este precio
   * @property {number} precioInstalacion.precio precio en Euros / kWp a aplicar a la instalación en este rango de kWp
   */
  precioInstalacion: [
    { desde: 0, hasta: 2, precio: 2200 },
    { desde: 2, hasta: 5, precio: 1700 },
    { desde: 5, hasta: 10, precio: 1400 },
    { desde: 10, hasta: 15, precio: 1150 },
    { desde: 15, hasta: 20, precio: 1050 },
    { desde: 20, hasta: 25, precio: 1000 },
    { desde: 25, hasta: 100, precio: 950 },
  ],

  tiempoSubvencionIBI: 0,
  valorSubvencionIBI: 0,
  porcientoSubvencionIBI: 0,
  valorSubvencionEU: 0,
  tipoSubvencionEU: '',
  subvencionEU: {
    Individual: { '<=10kWp': 600, '>10kWp': 450 },
    Comunitaria: { '<=10kWp': 710, '>10kWp': 535 },
  },
  conversionCO2: {
    Peninsula: {
      renovable: 0.331,
      norenovable: 0.472,
    },
    'Illes Balears': {
      renovable: 0.932,
      norenovable: 0.966,
    },
    Canarias: {
      renovable: 0.776,
      norenovable: 0.825,
    },
    Ceuta: {
      renovable: 0.721,
      norenovable: 0.735,
    },
    Melilla: {
      renovable: 0.721,
      norenovable: 0.735,
    },
  },
  CO2AnualRenovable: 0,
  CO2AnualNoRenovable: 0,

  Especificaciones: {
    BaseSolar: {
      geometrias: { area: '', label: '', acimut: '', symbol: '' },
      atributos: {
        id: '',
        nombre: '',
        lonlatBase: '',
        areaMapa: '',
        inclinacionTejado: '',
        areaReal: '',
        potenciaMaxima: '',
        inclinacionPaneles: '',
        inclinacionOptima: '',
        inAcimut: '',
      },
    },
    PuntoConsumo: {
      geometrias: { symbol: '', label: '' },
      atributos: {
        id: '',
        nombre: '',
        lonlatPuntoConsumo: '',
        fuente: '',
        consumoAnualREE: '',
        ficheroCSV: '',
        tarifa: '',
      },
    },
  },
}
export default TCB
