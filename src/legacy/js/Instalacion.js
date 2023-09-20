import TCB from "./TCB.js";
import * as UTIL from "./Utiles.js";
/**
 * @class Instalacion
 * @classdesc Clase para definir la configuración de la instalación de una base
 */
class Instalacion {
  /**
   * @private {number} #precioFinal Precio final de la instalación
   */
  #precioInstalacion;
  #numeroPaneles;
  #potenciaUnitaria;
  /**
   * @constructor
   * @param {Object} inInst objeto con las características de la instalación a crear
   * @param {number} inInst.paneles número de paneles
   * @param {number} inInst.potenciaUnitaria kWp de cada uno de los paneles
   */
  constructor( inInst ) {

    Object.defineProperties(this, {
      precioInstalacion: {
          enumerable:true, 
          set(precio) {
            this.#precioInstalacion = precio;
          },
          get() {
            return this.#precioInstalacion;
          }
      },
      potenciaUnitaria: {
          enumerable: true,
          set (potencia) {
            // actualiza proporcionalemnte el precio si ya tenia un precio asignado
            if (this.#precioInstalacion !== 0) 
              this.#precioInstalacion *= potencia / this.#potenciaUnitaria;
            else
              this.getPrecioInstalacion();
          
            this.#potenciaUnitaria = potencia;
          },
          get () {
            return this.#potenciaUnitaria
          }
      },
      paneles: {
          enumerable: true,
          set (numero) {
          // actualiza proporcionalemnte el precio si ya tenia un precio asignado
          if (this.#precioInstalacion !== 0) 
            this.#precioInstalacion *= numero / this.#numeroPaneles;
          else
            this.getPrecioInstalacion();
      
            this.#numeroPaneles = numero;
          },
          get () {
            return this.#numeroPaneles;
          }
      },
  /** Potencia total kWp disponibles en esta instalación
  * @type {number} 
  */
      potenciaTotal: {
        enumerable: true,
        get() {
          return this.potenciaUnitaria * this.#numeroPaneles;
        }
      }
    })

    UTIL.debugLog("Nueva instalacion con "+inInst.paneles+" paneles de "+ inInst.potenciaUnitaria+" kWp");
    this.#potenciaUnitaria = inInst.potenciaUnitaria;
    this.#numeroPaneles = inInst.paneles;
    this.getPrecioInstalacion();
  }

  toJSON() {
    return {
      potenciaUnitaria: this.#potenciaUnitaria,
      paneles: this.#numeroPaneles,
      precioInstalacion: this.#precioInstalacion
    }
  }
  /** Devuelve el precio teórico de la instalación según nuestra estimación
  * @see TCB.precioInstalacion
  *  return {number} Precio teorico de la instalación
  */
  getPrecioInstalacion() {
    if (this.potenciaTotal > 0) {
      let potenciaBase = this.potenciaTotal;
      let i = TCB.precioInstalacion.precios.findIndex( rango => rango.desde <= potenciaBase && rango.hasta >= potenciaBase);
      this.#precioInstalacion = this.potenciaTotal * TCB.precioInstalacion.precios[i].precio * (1 + TCB.parametros.IVAinstalacion / 100);
    } else {
      this.#precioInstalacion = 0;
    }
  }
}
export default Instalacion 