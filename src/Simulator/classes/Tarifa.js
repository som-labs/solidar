import TCB from "./TCB.js";
/**
 * @class Tarifa
 * @classdesc Clase representa las tarifas aplicadas a cada TipoConsumo.
*/

class Tarifa {
/**
 * 
 * @param {string} nombreTarifa El formato del nombre de la tarifa es X.0TD-R 
 *    nombreTarifa = [ 2.0TD, 3.0TD]
 *    territorio = ['Peninsula', 'Islas Baleares', 'Canarias', 'Melilla', 'Ceuta']                                       
 */
  constructor(nombreTarifa, territorio) {
    this.idTarifa = TCB.featIdUnico++;
    this.nombreTarifa = nombreTarifa;
    this.territorio = territorio;
    let ctarifa = nombreTarifa === "2.0TD" ? nombreTarifa : nombreTarifa + "-" + territorio;
    this.precios = Array.from(TCB.tarifas[ctarifa].precios);
    this.horas = TCB.tarifas[ctarifa].horas;
  }

  setTarifa (nombreTarifa, territorio) {
    this.nombreTarifa = nombreTarifa;
    this.territorio = territorio;
    let ctarifa = nombreTarifa === "2.0TD" ? nombreTarifa : nombreTarifa + "-" + territorio;
    this.precios = Array.from(TCB.tarifas[ctarifa].precios);
    this.horas = TCB.tarifas[ctarifa].horas;
  }

  getTarifa () {
    let lista = {};
    lista.Compensa = this.precios[0];
    let _max = 6;
    //if (this.nombreTarifa === "2.0TD") _max = 3;
    for (let i=1; i <= _max; i++) lista["P"+i]= this.precios[i];
    return lista;
  }
}
export default Tarifa