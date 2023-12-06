import TCB from './TCB'
/**
 * @class Tarifa
 * @classdesc Clase representa las tarifas aplicadas a cada TipoConsumo.
 */

class Tarifa {
  /**
   * @param {string} nombreTarifa El formato del nombre de la tarifa es X.0TD-Y
   *    X - nombreTarifa = [ 2.0TD, 3.0TD]
   *    Y - territorio = ['Peninsula', 'Islas Baleares', 'Canarias', 'Melilla', 'Ceuta']
   */
  constructor(nombreTarifa) {
    this.idTarifa = TCB.featIdUnico++
    this.nombreTarifa = nombreTarifa
    this.precios = Array.from(TCB.tarifas[nombreTarifa].precios)
    this.horas = TCB.tarifas[nombreTarifa].horas
  }

  setTarifa(nombreTarifa) {
    this.nombreTarifa = nombreTarifa
    this.precios = Array.from(TCB.tarifas[nombreTarifa].precios)
    this.horas = TCB.tarifas[nombreTarifa].horas
  }

  getTarifa() {
    let lista = {}
    lista.Compensa = this.precios[0]
    let _max = 6
    //if (this.nombreTarifa === "2.0TD") _max = 3;
    for (let i = 1; i <= _max; i++) lista['P' + i] = this.precios[i]
    return lista
  }
}
export default Tarifa
