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
   * @param {number} inInst.potenciaUnitaria kWp de cada uno de los paneles
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
        set(potencia) {
          // actualiza proporcionalmente el precio si ya tenia un precio asignado
          if (this.#precioInstalacion !== 0)
            this.#precioInstalacion *= potencia / this.#potenciaUnitaria
          else this.#precioInstalacion = Instalacion.getPrecioInstalacion(potencia)

          this.#potenciaUnitaria = potencia
        },
        get() {
          return this.#potenciaUnitaria
        },
      },
      paneles: {
        enumerable: true,
        set(numero) {
          // actualiza proporcionalemnte el precio si ya tenia un precio asignado
          if (this.#precioInstalacion !== 0)
            this.#precioInstalacion *= numero / this.#numeroPaneles
          else
            this.#precioInstalacion = Instalacion.getPrecioInstalacion(
              numero / this.#numeroPaneles,
            )

          this.#numeroPaneles = numero
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
          return this.potenciaUnitaria * this.#numeroPaneles
        },
      },
    })

    this.#potenciaUnitaria = inInst.potenciaUnitaria
    this.#numeroPaneles = inInst.paneles
    this.#precioInstalacion = Instalacion.getPrecioInstalacion(
      inInst.potenciaUnitaria * inInst.paneles,
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
  /** Devuelve el precio teórico de la instalación en base a su potencia según nuestra estimación
   * @see TCB.precioInstalacion
   *  return {number} Precio teorico de la instalación
   */
  static getPrecioInstalacion(potenciaTotal) {
    let precioInstalacion = 0
    if (potenciaTotal > 0) {
      let potenciaBase = potenciaTotal
      let i = TCB.precioInstalacion.precios.findIndex(
        (rango) => rango.desde <= potenciaBase && rango.hasta >= potenciaBase,
      )

      precioInstalacion =
        potenciaTotal *
        TCB.precioInstalacion.precios[i].precio *
        (1 + TCB.parametros.IVAinstalacion / 100)
    }
    return precioInstalacion
  }
}
export default Instalacion
