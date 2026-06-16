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
  TCB.balance = new Balance(TCB.produccion, TCB.consumo, 100, TCB.bateria)
  if (TCB.bateria) {
    UTIL.debugLog(
      `calculaResultados - balance global con ${TCB.produccion.totalPaneles} paneles y bateria de ${TCB.bateria.capacidad} kWh`,
      TCB.balance,
    )
  } else {
    UTIL.debugLog(
      `calculaResultados - balance global con ${TCB.produccion.totalPaneles} paneles y sin bateria`,
      TCB.balance,
    )
  }
  TCB.balanceCreado = true
  // TCB.economico = new Economico()
  // UTIL.debugLog('calculaResultados - economico global ', TCB.economico)

  //Recalculamos los estadisticos de deficit y excedente para el caso sin bateria. Esto nos permite mostrar al usuario la diferencia entre tener o no tener bateria.
  if (!TCB.bateria) {
    const deficit = UTIL.statsSinCeros(TCB.balance.idxTable, 'excedente')
    const invierno = [],
      verano = [],
      medio = []
    for (let i = 0; i < 365; i++) {
      const mes = TCB.balance.idxTable[i].fecha.getMonth() + 1
      if (mes >= 10 || mes <= 3) invierno.push(TCB.balance.idxTable[i])
      else if (mes > 4 && mes < 9) verano.push(TCB.balance.idxTable[i])
      else medio.push(TCB.balance.idxTable[i])
    }

    TCB.statsSinBateria = {
      deficitStats: deficit,
      inviernoStats: UTIL.statsSinCeros(invierno, 'excedente'),
      veranoStats: UTIL.statsSinCeros(verano, 'excedente'),
      medioStats: UTIL.statsSinCeros(medio, 'excedente'),
      autoconsumo: TCB.balance.autoconsumo / TCB.produccion.totalAnual,
      autosuficiencia: TCB.balance.autoconsumo / TCB.consumo.totalAnual,
    }
  }
  return
}

export default calculaResultados
