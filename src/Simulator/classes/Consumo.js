import TCB from './TCB'
import * as UTIL from './Utiles'
import TipoConsumo from './TipoConsumo'
import DiaHora from './DiaHora'
/**
 * @class Consumo
 * @classdesc Clase representa el consumo global de toda la configuración.
 * @extends DiaHora
 */
class Consumo extends DiaHora {
  // Estas propiedades se definen para que exista un nombre único para cada campo en toda la aplicación.
  /**@property {number} cMaximoAnual Sinonimo de diaHora.maximoAnual */
  get cMaximoAnual() {
    return this.maximoAnual
  } //Pico máximo de consumo
  set cMaximoAnual(valor) {
    this.maximoAnual = valor
  }
  /**@property {number} cTotalAnual Sinonimo de diaHora.totalAnual */
  get cTotalAnual() {
    return this.totalAnual
  } //Consumo total anual
  set cTotalAnual(valor) {
    this.totalAnual = valor
  }

  /**
   * @constructor
   * @param {Object} consumo Un objeto consumo importado
   */
  constructor(consumo) {
    UTIL.debugLog('Generando consumo global')
    super()

    if (consumo === undefined) {
      let _tcCount = {}
      // Contabilizamos las fincas que tienen el mismo tipo de consumo
      for (let finca of TCB.Participes) {
        if (_tcCount[finca.nombreTipoConsumo] === undefined)
          _tcCount[finca.nombreTipoConsumo] = 1
        else _tcCount[finca.nombreTipoConsumo]++
      }

      for (let nombreTipoConsumo in _tcCount) {
        if (nombreTipoConsumo !== 'Participe sin consumo') {
          const _tc = UTIL.selectTCB(
            'TipoConsumo',
            'nombreTipoConsumo',
            nombreTipoConsumo,
          )
          this.sintetizaDiaHora(_tc[0], _tcCount[nombreTipoConsumo])
          UTIL.debugLog(
            'Sintetizando ' +
              _tcCount[nombreTipoConsumo] +
              ' fincas con tipoConsumo ' +
              nombreTipoConsumo,
          )
        }
      }
    } else {
      //Asignacion propiedades contenidas en el objeto de entrada salvo que sean un objeto
      for (const objProp in consumo) {
        if (typeof consumo[objProp] !== Object) {
          if (objProp === 'fecha' && typeof consumo[objProp] === 'string')
            consumo[objProp] = new Date(consumo[objProp])
          this[objProp] = consumo[objProp]
        }
      }
    }
  } // End constructor
}
export default Consumo
