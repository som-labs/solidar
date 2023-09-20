import TCB from "./TCB.js";
import DiaHora from "./DiaHora.js";
/**
 * Clase representa la produccion horaria. Puede ser de una base o en caso TCB.produccion la global de toda la configuración
 * @extends DiaHora
 */
class Produccion extends DiaHora {
// Estas propiedades se definen para que exista un nombre único para cada campo en toda la aplicación.
get pMaximoAnual() { return this.maximoAnual}  //Pico máximo de consumo
set pMaximoAnual( valor) { this.maximoAnual = valor}
get pTotalAnual() { return this.totalAnual}  //Consumo total anual
set pTotalAnual( valor) { this.totalAnual = valor}
get csvCargado() { return this.datosCargados}
set csvCargado( valor) {this.datosCargados = valor}
/**
 * Si base es undefined se creará un objeto produccion resultante de la suma de la produccion de todas las bases
 * en caso contrario se crea el objeto produccion con los datos que vienen en el objeto base.
 * @constructor
 * @param {BaseSolar} base 
 */
  constructor( base) {
    super ();

    this.potenciaTotal = 0;
    this.precioInstalacion = 0;
    this.precioInstalacionCorregido = 0;

    if (base !== undefined) { // Generamos la produccion de esa base
      this.escala(base.rendimiento, base.instalacion.potenciaTotal / 1000);
      this.potenciaTotal = base.instalacion.potenciaTotal;
      this.precioInstalacion = base.instalacion.precioInstalacion;
      this.precioInstalacionCorregido = base.instalacion.precioInstalacionCorregido;
      base.produccionCreada = true;
    } else { // Es la construccion de la produccion que sintetiza la produccion de todas las bases

      for (let _base of TCB.BaseSolar) {
        this.suma(_base.produccion);
        this.potenciaTotal += _base.instalacion.potenciaTotal;
      }

      let i = TCB.precioInstalacion.precios.findIndex( rango => rango.desde <= this.potenciaTotal && rango.hasta >= this.potenciaTotal);
      this.precioInstalacion = this.potenciaTotal * TCB.precioInstalacion.precios[i].precio * (1 + TCB.parametros.IVAinstalacion / 100);
      this.precioInstalacionCorregido = this.precioInstalacion * TCB.correccionPrecioInstalacion;
      TCB.produccionCreada = true;
    }
  }
}
export default Produccion