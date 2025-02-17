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
   * @param {Object} tiposConsumo, fincas, zonasComunes
   * consumo A JS object to be used as template for a Solidar Consumo object
   */
  constructor(tiposConsumo, fincas, zonasComunes) {
    super()
    console.log('BUILDING Consumo', tiposConsumo, fincas, zonasComunes)
    this._name = 'Consumo'
    this.periodo //Will store kWh per fee period (P1, P2, ...)

    //Creacion del consumo global
    //Dependiendo del modo debemos calcular el consumo total
    //En modo INDIVIDUAL el consumo total es la suma de todos los tipos de consumo
    if (TCB.modoActivo === 'INDIVIDUAL') {
      for (let _tc of tiposConsumo) {
        this.suma(_tc)
      }
      //En otro modo el consumo total es:
      //la suma de los consumos de cada finca
    } else {
      for (let _fnc of fincas) {
        if (_fnc.nombreTipoConsumo !== '' && _fnc.participa) {
          let _tc = tiposConsumo.find((_tcn) => {
            return _tcn.nombreTipoConsumo === _fnc.nombreTipoConsumo
          })
          this.suma(_tc)
        }
      }
      //la suma de los consumos de cada zona comun
      for (let _zc of zonasComunes) {
        if (_zc.nombreTipoConsumo !== '') {
          let _tc = tiposConsumo.find((_tcn) => {
            return _tcn.nombreTipoConsumo === _zc.nombreTipoConsumo
          })
          this.suma(_tc)
        }
      }
      console.log(this)
    }
  } // End constructor
}
export default Consumo
