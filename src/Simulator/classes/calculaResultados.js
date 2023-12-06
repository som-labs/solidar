import TCB from './TCB'
import Produccion from './Produccion'
import Balance from './Balance'
import Economico from './Economico'
/**
 * Esta funcion realiza los calculos del balance de energia para la configuracion de bases y consumos existentes.
 * Construye la produccion de cada base
 * Construye la produccion global
 * Construye el balance global
 * Calcula los ahorros de CO2 en modo Renovable y NoRenovable
 *
 */
async function calculaResultados() {
  // Se genera un objeto produccion para cada una de las bases
  TCB.BaseSolar.forEach((base) => {
    // if (base.produccionCreada) {
    //   base.produccion = {}
    //   base.produccionCreada = false
    // }
    base.produccion = new Produccion(base)
    base.produccion.produccionCreada = true
  })

  // Se genera un unico objeto produccion que totaliza la produccion de todas las bases
  // if (TCB.produccion.produccionCreada) {
  //   TCB.produccion.produccion = {}
  //   TCB.produccion.produccionCreada = false
  // }
  TCB.produccion = new Produccion()
  TCB.produccion.produccionCreada = true

  // Cálculo del CO2 equivalente a la producción anual de toda la instalación
  TCB.CO2AnualRenovable =
    TCB.conversionCO2[TCB.territorio].renovable * TCB.produccion.pTotalAnual
  TCB.CO2AnualNoRenovable =
    TCB.conversionCO2[TCB.territorio].norenovable * TCB.produccion.pTotalAnual

  // Construccion objeto Balance global
  TCB.balance = new Balance(TCB.produccion, TCB.consumo, 100)
  TCB.balanceCreado = true
  TCB.economico = new Economico()
  return
}

export default calculaResultados
