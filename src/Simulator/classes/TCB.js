/**
 * TCB
 * @namespace
 * @fileoverview Area de allmacenamiento de las variables globales de la aplicación
 * @version      Solidar.4
 * @author       José Luis García (SOM Madrid)
 * @copyright
 *
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
 */
import { Vector as VectorSource } from 'ol/source'

const INDIVIDUAL = 'INDIVIDUAL'
const COLECTIVO = 'COLECTIVO'
const COMUNIDAD = 'COMUNIDAD'
const DESARROLLO = 'DESARROLLO'

/*global INDIVIDUAL, COLECTIVO, COMUNIDAD, DESARROLLO, ol*/
const TCB = {
  appInitialized: false,
  URLParameters: null, //Argumentos de la llamada.

  //Variables globales de funcionamiento
  debug: false,
  user: null,
  basePath: '',
  idSesion: '', //Identificador unico de sesión

  /*  Existen tres modos de ejecucion de Solidar
    Individual (default): No existen puntos de consumo, multiples bases, no hay fincas ni reparto
    Colectivo: Existe solo un punto de consumo, multiples bases, hay fincas y un unico reparto
    Comunidad: Existen multiples puntos de consumo, cada uno de ellos con fincas y un unico reparto */

  modos: [INDIVIDUAL, COLECTIVO, COMUNIDAD, DESARROLLO],
  modoActivo: INDIVIDUAL,

  estilos: ['SOM', 'CLARA'],
  estiloActivo: 'SOM',

  graphs: {},
  nombreProyecto: 'Mi proyecto',
  emailContacto: '',
  telefonoContacto: '',
  fechaCreacion: new Date(),
  descripcion: '',
  direccion: '',

  territorio: null,

  //Donde se guardan los datos a exportar
  datosProyecto: { version: '4.2' },

  /**
   * @type {Array<TipoConsumo>}
   */
  TipoConsumo: [],

  /**
   * @type {Array<BaseSolar>}
   */
  BaseSolar: [],

  /**
   *  @type {Array<Fincas>}
   */
  Finca: [],

  UnitType: [], //Array con los tipos unicos de fincas obtenidos de DGC + las zonas comunes {nombre, consumo, allocation, zonaComun}
  //Es la suma de las participaciones devueltas por DGC. Se untilizará para normalizar los coeficientes
  participacionTotal: 0,

  /**
   * @type {Array<ZonaComun>}
   */
  ZonaComun: [],
  allocationGroup: {}, // Object indicando que grupos participan del gasto correspondiente a una zona comun {nombre del grupo: {zc1: true/false, zc2: true/false,....}}
  requiereReparto: true, //Flag indicando a Reparto economico si de debe reconstruir GruposZC
  requiereAllocation: true,

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
  origenDatosSolidar: new VectorSource({ wrapX: false }),
  baseLabelColor: [0, 0, 0, 1],
  baseLabelBGColor: [168, 50, 153, 0.1],

  //rendimientoCreado: false,
  instalacionCreada: false,
  produccionCreada: false,
  economicoCreado: false,
  requiereOptimizador: true,

  // Estos precios son los de SOM a agosto 2022 y solo sirven de backup en caso de no acceder al API de la cooperativa o no acceder al fichero local.
  tarifas: {
    '2.0TD': {
      precios: [0.05, 0.241, 0.166, 0.127, 0, 0, 0],
      horas: [3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2],
    },
    '3.0TD-Peninsula': {
      precios: [0.07, 0.215, 0.197, 0.167, 0.159, 0.145, 0.147],
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
      precios: [0.05, 0.202, 0.163, 0.165, 0.134, 0.105, 0.122],
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
      precios: [0.05, 0.202, 0.163, 0.165, 0.134, 0.105, 0.122],
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
    '3.0TD-TD-Illes Balears': {
      precios: [0.05, 0.202, 0.163, 0.165, 0.134, 0.105, 0.122],
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
      precios: [0.05, 0.202, 0.163, 0.165, 0.134, 0.105, 0.122],
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
  //Valores a utilizar en INDIVIDUAL con defaults
  tarifaActiva: {
    tipo: '2.0TD',
    nombre: '',
    detalle: '2.0TD',
    idTarifa: 0,
    precios: [],
    coefHucha: 80,
    cuotaHucha: 0,
  },
  tiempoEsperaTarifas: 20, //Tiempo en segundos que espera los precios de Som
  fuenteTarifa: '',
  nombreTarifaActiva: '2.0TD', //El nombre de la tarifa activa en caso de 3.0TD incluye el territorio
  tipoTarifa: '2.0TD', //Puede ser 2.0TD o 3.0TD

  //Valores a utilizar en !INDIVIDUAL y completados en consumptionStep
  Tarifa: [],

  // Parametros por defecto
  parametros: {
    impuestoElectrico: 5.113,
    IVAEnergia: 21.0,
    IVAInstalacion: 21.0,
    perdidasSistema: 20,
    interesVAN: 3,
    margen: 0.5, //Se pondrá a 0 si es tejado inclinado
    CAU: 'CAU Proyecto',
  },

  /* This data will be read from datos/tipoPaneles.json during InicializaAplicacion */
  /* tipoPaneles[0], is the user defined panel. It can be filled in PanelsSelector */
  tipoPaneles: [],
  defaultPanelActivo: 2, //Default panel type from json file

  /** Constante donde se define el precio estimado de la instalación en base a la potencia instalada
   * @typedef {object} precioInstalacion
   * @property {number} precioInstalacion.desde rango inferior de kWp para este precio
   * @property {number} precioInstalacion.hasta rango superior de kWp para este precio
   * @property {number} precioInstalacion.precio precio en Euros / kWp a aplicar a la instalación en este rango de kWp
   */
  preciosInstalacion: [
    { desde: 0, hasta: 2, precio: 1510 },
    { desde: 2, hasta: 3, precio: 1240 },
    { desde: 3, hasta: 4, precio: 1100 },
    { desde: 4, hasta: 5, precio: 1020 },
    { desde: 5, hasta: 7, precio: 990 },
    { desde: 7, hasta: 8, precio: 950 },
    { desde: 8, hasta: 9, precio: 920 },
    { desde: 9, hasta: 10, precio: 900 },
    { desde: 10, hasta: 15, precio: 830 },
    { desde: 15, hasta: 20, precio: 790 },
    { desde: 20, hasta: 25, precio: 770 },
    { desde: 25, hasta: 50, precio: 730 },
    { desde: 50, hasta: 100, precio: 710 },
    { desde: 100, hasta: 1000, precio: 650 },
  ],

  tiempoSubvencionIBI: 0,
  valorSubvencionIBI: 0,
  porcientoSubvencionIBI: 0,
  valorSubvencion: 0,
  porcientoSubvencion: 0,
  // tipoSubvencionEU: 'Sin',
  // subvencionEU: {
  //   Individual: { '<=10kWp': 600, '>10kWp': 450 },
  //   Comunitaria: { '<=10kWp': 710, '>10kWp': 535 },
  // },

  coefHucha: 80,
  cuotaHucha: 0,

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
  // CO2AnualRenovable: 0,
  // CO2AnualNoRenovable: 0,

  Especificaciones: {
    BaseSolar: {
      geometrias: { area: '', label: '', acimut: '', symbol: '' },
      atributos: {
        id: '',
        nombre: '',
        lonlatBase: '',
        areaMapa: '',
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
