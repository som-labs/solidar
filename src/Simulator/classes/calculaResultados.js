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
    base.produccion = new Produccion(base)
  })

  // Se genera un unico objeto produccion que totaliza la produccion de todas las bases
  TCB.produccion = new Produccion()

  // Construccion objeto Balance global
  TCB.balance = new Balance(TCB.produccion, TCB.consumo, 100)
  TCB.balanceCreado = true
  TCB.economico = new Economico()
  return
}

export default calculaResultados
