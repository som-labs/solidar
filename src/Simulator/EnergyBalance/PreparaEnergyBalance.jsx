// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

// REACT Solidar Components
import { optimizador } from '../classes/optimizador'
import calculaResultados from '../classes/calculaResultados'

export default async function PreparaEnergyBalance() {
  let cursorOriginal = document.body.style.cursor
  document.body.style.cursor = 'progress'

  //PENDIENTE: desabilitariamos la posibilidad de dar al boton siguiente mientras estamos preparando los resultados
  // document.getElementById('botonSiguiente').disabled = true

  //Si ha habido algún cambio que requiera la ejecución del optimizador lo ejecutamos
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
        // PENDIENTE: reemplazar alert con confimr de espera
        return {
          status: false,
          error: 'Tiempo de respuesta excesivo en la llamada a PVGIS',
        }
      }
      // PENDIENTE: limpiar alert de espera
      base.inAcimut = base.rendimiento.acimut
      base.inclinacion = base.rendimiento.inclinacion
    }

    // Se ejecuta el optimizador para determinar la configuración inicial propuesta
    let pendiente = optimizador(
      TCB.BaseSolar,
      TCB.consumo,
      TCB.parametros.potenciaPanelInicio,
    )
    if (pendiente > 0) {
      //PENDIENTE: ver como procesamos este aviso
      alert(
        'No es posible instalar los paneles necesarios.\nPendiente: ' +
          UTIL.formatoValor('energia', pendiente) +
          '\nContinuamos con el máximo número de paneles posible',
      )
    }
    document.body.style.cursor = cursorOriginal
  }
  await calculaResultados()
  return { status: true }
}
