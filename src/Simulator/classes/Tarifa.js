import TCB from './TCB'
/**
 * @class Tarifa
 * @classdesc Clase representa las tarifas aplicadas a cada TipoConsumo.
 */

class Tarifa {
  /**
   * @param {string} nombreTarifa idenficador
   * @param {string} tipo El formato del nombre de la tarifa es X.0TD-Y
   *    X - nombreTarifa = [ 2.0TD, 3.0TD]
   *    Y - territorio = ['Peninsula', 'Islas Baleares', 'Canarias', 'Melilla', 'Ceuta']
   */
  constructor(nombreTarifa, tipo) {
    this._name = 'Tarifa'
    this.tipo = tipo
    this.idTarifa = TCB.featIdUnico++
    this.nombreTarifa = nombreTarifa
    this.precios = Array.from(TCB.tarifas[tipo].precios)
    this.detalle = tipo === '3.0TD' ? tipo + '-' + TCB.territorio : tipo
    //this.horas = TCB.tarifas[tipo].horas
    this.coefHucha = 80 //Default de SOM
    this.cuotaHucha = 0
  }

  setTarifa(nombreTarifa) {
    this.nombreTarifa = nombreTarifa
    this.precios = Array.from(TCB.tarifas[nombreTarifa].precios)
    //this.horas = TCB.tarifas[nombreTarifa].horas
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
