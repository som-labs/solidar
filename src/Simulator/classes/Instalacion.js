import TCB from './TCB'
import * as UTIL from './Utiles'
/**
 * @class Instalacion
 * @classdesc Clase para definir la configuración de la instalación de una base
 */
class Instalacion {
  /**
   * @private {number} #precioFinal Precio final de la instalación
   */
  #precioInstalacion
  #numeroPaneles
  #potenciaUnitaria
  /**
   * @constructor
   * @param {Object} inInst objeto con las características de la instalación a crear
   * @param {number} inInst.paneles número de paneles
   * @param {number} inInst.potenciaUnitaria Wp de cada uno de los paneles
   */
  constructor(inInst) {
    Object.defineProperties(this, {
      precioInstalacion: {
        enumerable: true,
        set(precio) {
          this.#precioInstalacion = precio
        },
        get() {
          return this.#precioInstalacion
        },
      },
      potenciaUnitaria: {
        enumerable: true,
        set(newPotencia) {
          const prevPotencia = this.#potenciaUnitaria
          this.#potenciaUnitaria = newPotencia
          // actualiza proporcionalmente el precio si ya tenia un precio asignado
          if (this.#precioInstalacion !== 0)
            this.#precioInstalacion *= newPotencia / prevPotencia
          else
            this.#precioInstalacion = Instalacion.getInstallationPrice(this.potenciaTotal)
        },
        get() {
          return this.#potenciaUnitaria
        },
      },
      paneles: {
        enumerable: true,
        set(newPanels) {
          const oldPanels = this.#numeroPaneles
          this.#numeroPaneles = newPanels
          // actualiza proporcionalmente el precio si ya tenia un precio asignado
          if (this.#precioInstalacion !== 0)
            this.#precioInstalacion *= newPanels / oldPanels
          //En caso contrario calcula el precio para esa potencia
          else
            this.#precioInstalacion = Instalacion.getInstallationPrice(this.potenciaTotal)
        },
        get() {
          return this.#numeroPaneles
        },
      },
      /** Potencia total kWp disponibles en esta instalación
       * @type {number}
       */
      potenciaTotal: {
        enumerable: true,
        get() {
          return (this.potenciaUnitaria / 1000) * this.#numeroPaneles
        },
      },
    })

    this._name = 'Instalacion'
    this.#potenciaUnitaria = inInst.potenciaUnitaria
    this.#numeroPaneles = inInst.paneles
    this.#precioInstalacion = Instalacion.getInstallationPrice(
      (inInst.potenciaUnitaria * inInst.paneles) / 1000,
    )
    UTIL.debugLog('Nueva instalacion creada', this)
  }

  toJSON() {
    return {
      potenciaUnitaria: this.#potenciaUnitaria,
      paneles: this.#numeroPaneles,
      precioInstalacion: this.#precioInstalacion,
    }
  }
  /** Devuelve el precio teórico de la instalación en base a su potencia (kWp) según nuestra estimación
   * @see TCB.precioInstalacion
   *  return {number} Precio teorico de la instalación
   */
  static getInstallationPrice(potenciaTotal) {
    let precioInstalacion = 0
    if (potenciaTotal > 0) {
      let potenciaBase = potenciaTotal
      let i = TCB.precioInstalacion.precios.findIndex(
        (rango) => rango.desde <= potenciaBase && rango.hasta >= potenciaBase,
      )
      precioInstalacion = potenciaTotal * TCB.precioInstalacion.precios[i].precio
    } else {
      precioInstalacion = 0
    }
    return parseInt(precioInstalacion * ((100 + TCB.parametros.IVAInstalacion) / 100))
  }
}
export default Instalacion
