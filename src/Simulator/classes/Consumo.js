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
    this._name = 'Consumo'
    this.periodo //Will store kWh per fee period (P1, P2, ...)
    console.log('NUEVOCONSUMO', consumo, TCB.Finca, TCB.ZonaComun)
    if (consumo === undefined) {
      //Creacion del consumo global
      //Dependiendo del modo debemos calcular el consumo total
      //En modo INDIVIDUAL el consumo total es la suma de todos los tipos de consumo
      if (TCB.modoActivo === 'INDIVIDUAL') {
        for (let _tc of TCB.TipoConsumo) {
          this.suma(_tc)
        }
        //En otro modo el consumo total es:
        //la suma de los consumos de cada finca
      } else {
        for (let _fnc of TCB.Finca) {
          if (_fnc.nombreTipoConsumo !== '' && _fnc.participa) {
            let _tc = TCB.TipoConsumo.find((_tcn) => {
              return _tcn.nombreTipoConsumo === _fnc.nombreTipoConsumo
            })
            this.suma(_tc)
          }
        }
        //la suma de los consumos de cada zona comun
        for (let _zc of TCB.ZonaComun) {
          if (_zc.nombreTipoConsumo !== '') {
            let _tc = TCB.TipoConsumo.find((_tcn) => {
              return _tcn.nombreTipoConsumo === _zc.nombreTipoConsumo
            })
            this.suma(_tc)
          }
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
