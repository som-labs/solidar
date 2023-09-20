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
  #precioFinal;
  /**
   * @constructor
   * @param {Object} inInst objeto con las características de la instalación a crear
   * @param {number} inInst.paneles número de paneles
   * @param {number} inInst.potenciaUnitaria kWp de cada uno de los paneles
   */
  constructor( inInst ) {
    UTIL.debugLog("Nueva instalacion con "+inInst.paneles+" paneles de "+ inInst.potenciaUnitaria+" kWp");
    this.potenciaUnitaria = inInst.potenciaUnitaria;
    this.paneles = inInst.paneles;
  }

/*   set precioFinal (precio) {
    this.#precioFinal = precio;
  } */

  /**
   * @property {number} potenciaTotal Potencia total kWp disponibles en esta instalación
   */
  get potenciaTotal() {
    return this.potenciaUnitaria * this.paneles;
  }
  /**
   * @property {number} precioInstalacion Precio estimado de la instalación en Euros con impuestos incluidos
   * @see TCB.precioInstalacion
   */
  get precioInstalacion() {
    if (this.potenciaTotal > 0) {
      let potenciaBase = this.potenciaTotal;
      let i = TCB.precioInstalacion.precios.findIndex( rango => rango.desde <= potenciaBase && rango.hasta >= potenciaBase);
      this.#precioFinal = this.potenciaTotal * TCB.precioInstalacion.precios[i].precio * (1 + TCB.parametros.IVAinstalacion / 100);
    } else {
      this.#precioFinal = 0;
    }
    return this.#precioFinal;
  }
  /**
   * @property {number} precioInstalacionCorregido Precio estimado de la instalación en Euros con impuestos incluidos y aplicando factor manual de corrección introducido por el usuario
   */
  get precioInstalacionCorregido () {
    return this.#precioFinal * TCB.correccionPrecioInstalacion;
  }
}
export default Instalacion 