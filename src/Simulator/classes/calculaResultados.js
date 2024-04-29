import TCB from './TCB'
import * as UTIL from './Utiles'
import Produccion from './Produccion'
import Balance from './Balance'

/**
 * Esta funcion realiza los calculos del balance de energia para la configuracion de bases y consumos existentes.
 * Construye la produccion de cada base
 * Construye la produccion global
 * Construye el balance Energia
 * Construye el balance Economico
 */
async function calculaResultados() {
  // Se genera un objeto produccion para cada una de las bases
  // PENDIENTE: cuando importamos la base ya trae la produccion calculada. Ver como evitar

  for (let base of TCB.BaseSolar) {
    base.produccion = new Produccion(base)
    UTIL.debugLog(
      'calculaResultados - produccion de base ' + base.nombreBaseSolar,
      base.produccion,
    )
  }

  // Se genera un unico objeto produccion que totaliza la produccion de todas las bases
  TCB.produccion = new Produccion()
  UTIL.debugLog('calculaResultados - produccion global ', TCB.produccion)
  // Construccion objeto Balance global
  TCB.balance = new Balance(TCB.produccion, TCB.consumo, 100)
  UTIL.debugLog('calculaResultados - balance global ', TCB.balance)
  TCB.balanceCreado = true
  // TCB.economico = new Economico()
  // UTIL.debugLog('calculaResultados - economico global ', TCB.economico)
  return
}

export default calculaResultados
