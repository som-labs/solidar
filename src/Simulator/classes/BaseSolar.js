import TCB from './TCB'
import * as UTIL from './Utiles'
import Rendimiento from './Rendimiento'
import DiaHora from './DiaHora'
/**
 * @class BaseSolar
 * @classdesc Clase para definir las bases solares en las que se instalarán las fuentes de producción
 */
class BaseSolar extends DiaHora {
  #inclinacion

  /**
   * @constructor
   * @param {Object} area Descripción de la base donde se instalarán los paneles
   */
  constructor(area) {
    super()

    Object.defineProperties(this, {
      inclinacion: {
        enumerable: true,
        set(angulo) {
          this.#inclinacion = angulo
          this.configuraInclinacion()
        },
        get() {
          return this.#inclinacion
        },
      },
      potenciaMaxima: {
        enumerable: true,
        set(valor) {}, //Esta aqui para evitar error al intentar set desde update
        get() {
          return this.columnas * this.filas * TCB.parametros.potenciaPanelInicio
        },
      },
      anchoReal: {
        enumerable: true,
        set(valor) {}, //Esta aqui para evitar error al intentar set desde update
        get() {
          //El ancho corregido por la inclinacion del tejado
          return this.ancho / Math.cos((this.#inclinacion * Math.PI) / 180)
        },
      },
      areaReal: {
        enumerable: true,
        set(valor) {}, //Esta aqui para evitar error al intentar set desde update
        get() {
          return this.anchoReal * this.cumbrera
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
    //                                coplanar => tejado inclinado
    //                                horizontal => paneles inclinados
    //                                optimos => PVGIS determinará la inclinación y el acimut
    this.cumbrera = area.cumbrera //Longitud de la base en la parte alta cuando roofType === coplanar
    this.ancho = area.ancho //Longitud de la dimension transversal a la cumbrera medida en el mapa

    //Configuracion de los paneles
    this.filas = 0
    this.columnas = 0

    //Angulos optimos de la configuracion
    this.angulosOptimos = area.angulosOptimos
    this.inclinacionOptima = area.inclinacionOptima

    //La inclinacion real se gestiona por el setter ya que su cambio implica cambio de areas
    //CUIDADO: roofType debe estar predefinido para que la configuración de paneles sea correcto.
    this.#inclinacion = area.inclinacion
    this.configuraInclinacion()

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

  configuraInclinacion() {
    let hColumnas
    let hFilas
    let hGap

    let vColumnas
    let vFilas
    let vGap
    // Caso coplanar
    if (this.roofType === 'coplanar') {
      // Opcion largo panel paralelo a cumbrera
      hColumnas = Math.trunc(
        (this.cumbrera - 2 * TCB.parametros.margen) / TCB.parametros.largoPanel,
      )
      hFilas = Math.trunc(
        (this.anchoReal - 2 * TCB.parametros.margen) / TCB.parametros.anchoPanel,
      )
      // Opcion largo panel perpendicular a cumpbrera
      vColumnas = Math.trunc(
        (this.cumbrera - 2 * TCB.parametros.margen) / TCB.parametros.anchoPanel,
      )
      vFilas = Math.trunc(
        (this.anchoReal - 2 * TCB.parametros.margen) / TCB.parametros.largoPanel,
      )
    } else {
      //Caso tejado horizontal
      const latitud = parseFloat(this.lonlatBaseSolar.split(',')[1])
      // Opcion largo panel paralelo a la cumbrera
      hGap =
        TCB.parametros.anchoPanel * Math.cos((this.#inclinacion * Math.PI) / 180) +
        (TCB.parametros.anchoPanel * Math.sin((this.#inclinacion * Math.PI) / 180)) /
          Math.tan(((61 - latitud) * Math.PI) / 180)
      hColumnas = Math.trunc(
        (this.cumbrera - 2 * TCB.parametros.margen) / TCB.parametros.largoPanel,
      )
      hFilas = Math.trunc((this.anchoReal - 2 * TCB.parametros.margen) / hGap)
      //En el caso de una sola fila podría suceder que la inclinación indique un ancho entre filas superior al ancho pero igualmente entra un panel
      hFilas = hFilas === 0 ? 1 : hFilas

      //console.log(hGap, hColumnas, hFilas)
      // Opcion largo panel perpendicular a cumpbrera
      vGap =
        TCB.parametros.largoPanel * Math.cos((this.#inclinacion * Math.PI) / 180) +
        (TCB.parametros.largoPanel * Math.sin((this.#inclinacion * Math.PI) / 180)) /
          Math.tan(((61 - latitud) * Math.PI) / 180)
      vColumnas = Math.trunc(
        (this.cumbrera - 2 * TCB.parametros.margen) / TCB.parametros.anchoPanel,
      )
      vFilas = Math.trunc((this.anchoReal - 2 * TCB.parametros.margen) / vGap)
      //En el caso de una sola fila podría suceder que la inclinación indique un ancho entre filas superior al ancho pero igualmente entra un panel
      vFilas = vFilas === 0 ? 1 : vFilas
    }
    //console.log(vGap, vColumnas, vFilas)
    // Elegimos la configuracion que nos permite mas paneles
    if (hColumnas * hFilas > vColumnas * vFilas) {
      this.columnas = hColumnas
      this.filas = hFilas
      this.modoInstalacion = 'Horizontal'
    } else {
      this.columnas = vColumnas
      this.filas = vFilas
      this.modoInstalacion = 'Vertical'
    }
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
