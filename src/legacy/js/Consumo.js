import TCB from "./TCB.js";
import * as UTIL from "./Utiles.js";
import TipoConsumo from "./TipoConsumo.js";
import DiaHora from "./DiaHora.js";
/**
 * @class Consumo
 * @classdesc Clase representa el consumo global de toda la configuración.
 * @extends DiaHora
*/
class Consumo extends DiaHora {

  // Estas propiedades se definen para que exista un nombre único para cada campo en toda la aplicación.
  /**@property {number} cMaximoAnual Sinonimo de diaHora.maximoAnual */
  get cMaximoAnual() { return this.maximoAnual} //Pico máximo de consumo
  set cMaximoAnual( valor) { this.maximoAnual = valor}
  /**@property {number} cTotalAnual Sinonimo de diaHora.totalAnual */
  get cTotalAnual() { return this.totalAnual}   //Consumo total anual
  set cTotalAnual( valor) {this.totalAnual = valor}

/**
 * @constructor
 * @param {Object} consumo Un objeto consumo importado
 */
  constructor( consumo ) {
    super();

    if (consumo === undefined) {
      let _tcCount = {};
      // Contabilizamos las fincas que tienen el mismo tipo de consumo
      for (let finca of TCB.Participes) {
        if (_tcCount[finca.nombreTipoConsumo] === undefined) 
        _tcCount[finca.nombreTipoConsumo] = 1;
        else
        _tcCount[finca.nombreTipoConsumo]++;
      }
  
      for (let nombreTipoConsumo in _tcCount) {
        const _tc = TipoConsumo.findxNombre(nombreTipoConsumo);
        this.sintetizaDiaHora (_tc, _tcCount[nombreTipoConsumo]);
        UTIL.debugLog('Sintetizando '+ _tcCount[nombreTipoConsumo]+' fincas con tipoConsumo ' + nombreTipoConsumo);
      }
    } else {
      //Asignacion propiedades contenidas en el objeto de entrada salvo que sean un objeto    
      for (const objProp in consumo) {
        if (typeof consumo[objProp] !== Object) {
          this[objProp] = consumo[objProp];
        }
      }
    }
  } // End constructor
}
export default Consumo