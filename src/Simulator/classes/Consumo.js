import TCB from './TCB'
import DiaHora from './DiaHora'
/**
 * @class Consumo
 * @classdesc Clase representa el consumo global de toda la configuración.
 * @extends DiaHora
 */
class Consumo extends DiaHora {
  /**
   * @constructor
   * @param {Object} consumo A JS object to be used as template for a Solidar Consumo object
   */
  constructor(consumo) {
    super()
    this.periodo //Will store kWh per fee period (P1, P2, ...)

    if (consumo === undefined) {
      //Creacion del consumo global
      for (let _tc of TCB.TipoConsumo) {
        this.suma(_tc)
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
