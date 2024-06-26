// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

// REACT Solidar Components
import { optimizador } from '../classes/optimizador'
import calculaResultados from '../classes/calculaResultados'

// Solidar objects
import Consumo from '../classes/Consumo'
import BaseSolar from '../classes/BaseSolar'
import Economico from '../classes/Economico'

export default async function PreparaEnergyBalance() {
  let cursorOriginal = document.body.style.cursor
  document.body.style.cursor = 'progress'

  //Crearemos el consumo global como suma de todos los tipos de consumo definidos
  UTIL.debugLog('PreparaEnergyBalance - Hay cambio de consumos? ' + TCB.cambioTipoConsumo)
  if (TCB.cambioTipoConsumo) {
    TCB.consumo = new Consumo()
    UTIL.debugLog('PreparaEnergyBalance - Nuevo consumo global creado', TCB.consumo)
    TCB.cambioTipoConsumo = false
  }

  //PENDIENTE: desabilitariamos la posibilidad de dar al boton siguiente mientras estamos preparando los resultados
  // document.getElementById('botonSiguiente').disabled = true

  //Si ha habido algún cambio que requiera la ejecución del optimizador lo ejecutamos
  UTIL.debugLog(
    'PreparaEnergyBalance - Necesario optimizador? ' + TCB.requiereOptimizador,
  )

  if (TCB.requiereOptimizador) {
    // Comprobamos que estan cargados todos los rendimientos. Es el flag base.rendimiento.PVGISresults.status. True si todo OK, undefined si pendiente, False si error en PVGIS
    let waitLoop = 0
    for (let base of TCB.BaseSolar) {
      var sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
      if (base.rendimiento.PVGISresults.status === undefined) {
        //Has to wait
        alert('Esperando datos PVGIS para base: ' + base.nombreBaseSolar)
        while (
          base.rendimiento.PVGISresults.status === undefined &&
          waitLoop++ < TCB.tiempoEsperaPVGIS
        ) {
          console.log(waitLoop + ' seg. (max: ' + TCB.tiempoEsperaPVGIS + ')')
          await sleep(1000)
        }
      }

      if (!base.rendimiento.PVGISresults.status) return base.rendimiento.PVGISresults

      if (waitLoop >= TCB.tiempoEsperaPVGIS) {
        alert('Tiempo de respuesta excesivo en la llamada a PVGIS')
        // PENDIENTE: reemplazar alert con confimr de espera. Como usar SLDRAlert desde aqui
        return {
          status: false,
          error: 'Tiempo de respuesta excesivo en la llamada a PVGIS',
        }
      }
      // PENDIENTE: limpiar alert de espera
      //base.inAcimut = base.rendimiento.acimut
      if (base.inclinacionOptima) {
        base.inclinacion = base.rendimiento.inclinacion
        BaseSolar.configuraPaneles(base)
      }
    }

    UTIL.debugLog('PreparaEnergyBalance - Todas las bases listas llama optimizador')
    // Se ejecuta el optimizador para determinar la configuración inicial propuesta
    let pendiente = optimizador(TCB.BaseSolar, TCB.consumo, TCB.tipoPanelActivo.potencia)

    if (pendiente > 0) {
      UTIL.debugLog(
        'PreparaEnergyBalance - No hay superficie suficiente. Falta: ' + pendiente,
      )
      //PENDIENTE: ver como procesamos este aviso
      alert(
        'No es posible instalar los paneles necesarios.\nPendiente: ' +
          UTIL.formatoValor('energia', pendiente) +
          '\nContinuamos con el máximo número de paneles posible',
      )
    }
    TCB.requiereOptimizador = false
    UTIL.debugLog('PreparaEnergyBalance - pasa a calculaResultados')
    await calculaResultados()
  }

  //When importing first time will not compute Economico next yes
  if (!TCB.importando) {
    TCB.economico = new Economico()
  }

  UTIL.debugLog('calculaResultados - economico global ', TCB.economico)
  if (TCB.economico.periodoAmortizacion > 20) {
    alert(TCB.i18next.t('ECONOMIC_BALANCE.WARNING_AMORTIZATION_TIME'))
  }
  document.body.style.cursor = cursorOriginal
  return { status: true }
}
