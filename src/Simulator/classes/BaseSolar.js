import TCB from './TCB'
import * as UTIL from './Utiles'
import Rendimiento from './Rendimiento'
/**
 * @class BaseSolar
 * @classdesc Clase para definir las bases solares en las que se instalarán las fuentes de producción
 */
class BaseSolar {
  #inclinacion

  /**
   * @constructor
   * @param {Object} area Descripción de la base donde se instalarán los paneles
   */
  constructor(area) {
    Object.defineProperties(this, {
      inclinacion: {
        enumerable: true,
        set(angulo) {
          this.#inclinacion = angulo
          //BaseSolar.configuraPaneles(this)
        },
        get() {
          return this.#inclinacion
        },
      },
      potenciaMaxima: {
        enumerable: true,
        set(valor) {}, //Esta aqui para evitar error al intentar set desde update
        get() {
          return this.columnas * this.filas * TCB.tipoPanelActivo.potencia
        },
      },
      anchoReal: {
        enumerable: true,
        set(valor) {}, //Esta aqui para evitar error al intentar set desde update
        get() {
          //El ancho corregido por la inclinacion del tejado en caso inclinado
          if (this.roofType === 'Inclinado')
            return this.ancho / Math.cos((this.#inclinacion * Math.PI) / 180)
          else return this.ancho
        },
      },
      areaReal: {
        enumerable: true,
        set(valor) {}, //Esta aqui para evitar error al intentar set desde update
        get() {
          //El ancho corregido por la inclinacion del tejado en caso inclinado
          if (this.roofType === 'Inclinado')
            return this.area / Math.cos((this.#inclinacion * Math.PI) / 180)
          else return this.area
        },
      },
      panelesMaximo: {
        enumerable: true,
        set(valor) {}, //Esta aqui para evitar error al intentar set desde update
        get() {
          return this.filas * this.columnas
        },
      },
    })

    this.idBaseSolar = area.idBaseSolar
    this.nombreBaseSolar = area.nombreBaseSolar
    this.lonlatBaseSolar = area.lonlatBaseSolar

    //Dimensiones. El ancho es la dirección perpendicular a la cumbrera
    this.roofType = area.roofType // configuracion en el tejado
    //                                inclinado => tejado inclinado
    //                                horizontal => paneles inclinados
    this.cumbrera = area.cumbrera //Longitud de la base en la parte alta cuando roofType === inclinado
    this.ancho = area.ancho //Longitud de la dimension transversal a la cumbrera medida en el mapa
    this.area = area.area //Superficie plana sobre el mapa
    //Configuracion de los paneles
    this.filas // = 0
    this.columnas // = 0

    //Angulos optimos de la configuracion
    this.angulosOptimos = area.angulosOptimos
    this.inclinacionOptima = area.inclinacionOptima

    //La inclinacion real se gestiona por el setter ya que su cambio implica cambio de areas
    //CUIDADO: roofType debe estar predefinido para que la configuración de paneles sea correcto.
    this.#inclinacion = area.inclinacion
    //BaseSolar.configuraInclinacion(this)

    this.inAcimut = area.inAcimut

    this.rendimientoCreado = false //true si ya tiene cargados los datos de PVGIS y se ha calculado su rendimiento
    this.requierePVGIS = true //Flag para controlar si es necesario llamar a PVGIS o no despues de cambios

    this.rendimiento = {}
    this.instalacion = {}
    this.produccion = {}

    // Si hay una base como argumento de entrada se copian todas las propiedades a la nueva base
    this.updateBase(area)
    UTIL.debugLog('Nueva base solar creada', this)
  }
  /**
   * Crea el objeto Rendimiento de una BaseSolar
   * @see Rendimiento
   */
  async cargaRendimiento() {
    // if (this.rendimientoCreado) {
    //   this.rendimiento = {}
    //   this.rendimientoCreado = false
    // }
    this.rendimiento = new Rendimiento(this)
  }

  static configuraPaneles(area) {
    let hColumnas
    let hFilas
    let vColumnas
    let vFilas
    let hGap
    let vGap
    let config = {}

    const { roofType, cumbrera, anchoReal, inclinacion, lonlatBaseSolar } = area

    if (roofType === 'Inclinado') {
      // Opcion largo panel paralelo a cumbrera
      hColumnas = Math.trunc(
        (cumbrera - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.largo,
      )
      hFilas = Math.trunc(
        (anchoReal - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.ancho,
      )

      // Opcion largo panel perpendicular a cumbrera
      vColumnas = Math.trunc(
        (cumbrera - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.ancho,
      )
      vFilas = Math.trunc(
        (anchoReal - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.largo,
      )
      // Elegimos la configuracion que nos permite mas paneles
    } else {
      //Caso tejado horizontal u optimo
      const latitud = parseFloat(lonlatBaseSolar.split(',')[1])
      // Opcion largo panel paralelo a la cumbrera
      hGap =
        TCB.tipoPanelActivo.ancho * Math.cos((inclinacion * Math.PI) / 180) +
        (TCB.tipoPanelActivo.ancho * Math.sin((inclinacion * Math.PI) / 180)) /
          Math.tan(((61 - latitud) * Math.PI) / 180)
      hColumnas = Math.trunc(
        (cumbrera - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.largo,
      )
      hFilas = Math.trunc((anchoReal - 2 * TCB.parametros.margen) / hGap)
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
      vFilas = Math.trunc((anchoReal - 2 * TCB.parametros.margen) / vGap)
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

  updateBase(newData) {
    //Asignacion propiedades contenidas en el objeto de entrada salvo que sean un objeto
    for (const objProp in newData) {
      if (typeof newData[objProp] !== Object) {
        // Si la propiedad es un objeto no lo copiamos

        //console.log(objProp, Object.getOwnPropertyDescriptor(this, objProp))
        //if (Object.getOwnPropertyDescriptor(this, objProp).writable !== undefined)
        if (objProp === 'fecha' && typeof newData[objProp] === 'string')
          // Si la propiedad es modificable
          // Si es una fecha en modo string la convertimos a Date
          newData[objProp] = new Date(newData[objProp])
        else {
          //console.log(objProp, newData[objProp])
          this[objProp] = newData[objProp]
        }
      }
    }
  }

  /**
   * @typedef {Object} row
   * @property {number} idBaseSolar base.idBaseSolar
   * @property {string} nombreBaseSolar base.nombreBaseSolar
   * @property {number} unitarioTotal base.rendimiento.unitarioTotal
   * @property {number} potenciaMaxima base.potenciaMaxima
   * @property {number} paneles base.instalacion.paneles
   * @property {number} potenciaUnitaria base.instalacion.potenciaUnitaria
   * @property {number} potenciaTotal base.instalacion.potenciaTotal
   */
  /**
   * Simula un select de la tabla BaseSolar con la vista de Instalacion
   * @static
   * @returns {row}
   */
  static getTabulatorRow(campo, valor) {
    const base = TCB.BaseSolar.find((b) => {
      return b[campo] === valor
    })
    return {
      idBaseSolar: base.idBaseSolar,
      nombreBaseSolar: base.nombreBaseSolar,
      unitarioTotal: base.rendimiento.unitarioTotal,
      potenciaMaxima: base.potenciaMaxima,
      paneles: base.instalacion.paneles,
      potenciaUnitaria: base.instalacion.potenciaUnitaria,
      potenciaTotal: base.instalacion.potenciaTotal,
    }
  }
}
export default BaseSolar
