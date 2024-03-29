import TCB from './TCB'
import DiaHora from './DiaHora'
import * as UTIL from './Utiles'
/**
 * Clase representa la produccion horaria. Puede ser de una base o en caso TCB.produccion la global de toda la configuración
 * @extends DiaHora
 */
class Produccion extends DiaHora {
  get csvCargado() {
    return this.datosCargados
  }
  set csvCargado(valor) {
    this.datosCargados = valor
  }
  /**
   * Si base es undefined se creará un objeto produccion resultante de la suma de la produccion de todas las bases
   * en caso contrario se crea el objeto produccion con los datos que vienen en el objeto base.
   * @constructor
   * @param {BaseSolar} base
   */
  constructor(base) {
    super()
    this._name = 'Produccion'
    //this.potenciaTotal = 0

    // Generamos la produccion de esa base multiplicando la matriz de rendimiento unitario por la potencia instalada
    if (base !== undefined) {
      this.escala(base.rendimiento, base.instalacion.potenciaTotal / 1000)
      //this.potenciaTotal = base.instalacion.potenciaTotal
      base.produccionCreada = true
      //Ahorro de CO2 de esta base
      this.CO2AnualRenovable =
        TCB.conversionCO2[TCB.territorio].renovable * this.totalAnual
      this.CO2AnualNoRenovable =
        TCB.conversionCO2[TCB.territorio].norenovable * this.totalAnual
    } else {
      // Es la construccion de la produccion que sintetiza la produccion de todas las bases
      this.potenciaTotal = 0
      this.precioInstalacion = 0
      this.CO2AnualRenovable = 0
      this.CO2AnualNoRenovable = 0

      for (let _base of TCB.BaseSolar) {
        this.suma(_base.produccion)
        this.CO2AnualRenovable += _base.produccion.CO2AnualRenovable
        this.CO2AnualNoRenovable += _base.produccion.CO2AnualNoRenovable
      }

      //This property is only used on the global production instance.
      this.potenciaTotalInstalada = TCB.BaseSolar.reduce((a, b) => {
        return a + b.instalacion.potenciaTotal
      }, 0)
    }
    this.produccionCreada = true
  }
}

export default Produccion
