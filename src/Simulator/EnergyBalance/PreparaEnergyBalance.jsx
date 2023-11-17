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
    // Comprobamos que estan cargados todos los rendimientos. Es el flag rendimientoCreado de cada BaseSolar
    let waitLoop = 0
    for (let base of TCB.BaseSolar) {
      var sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
      if (!base.rendimientoCreado) {
        alert('Esperando datos PVGIS para base: ' + base.nombreBaseSolar)
        //   if (TCB.importando) {
        //     //document.getElementById('importar').innerHTML = TCB.i18next.t("importarProyecto_MSG_importando");
        //   } else {
        //     document.getElementById('resultadosResumen').innerHTML =
        //       'Esperando PVGIS para base ' + base.idBaseSolar
        //   }

        while (
          !base.rendimientoCreado &&
          waitLoop++ < TCB.tiempoEsperaPVGIS &&
          base.rendimientoCreado !== 'error'
        ) {
          console.log(waitLoop + ' seg. (max: ' + TCB.tiempoEsperaPVGIS + ')')
          await sleep(1000)
        }
        if (base.rendimientoCreado === 'error') {
          alert('Error obteniendo datos de PVGIS')
          base.rendimientoCreado = false
          // PENDIENTE: Reemplazar alert con error
          return
        }
        if (waitLoop >= TCB.tiempoEsperaPVGIS) {
          alert('Tiempo de respuesta excesivo en la llamada a PVGIS')
          // PENDIENTE: reemplazar alert con confimr de espera
          return
        }
        // PENDIENTE: limpiar alert
      } else {
        base.inAcimut = base.rendimiento.acimut
        base.inclinacion = base.rendimiento.inclinacion
      }
    }

    // Se ejecuta el optimizador para determinar la configuración inicial propuesta
    let pendiente = optimizador(
      TCB.BaseSolar,
      TCB.consumo,
      TCB.parametros.potenciaPanelInicio,
    )
    if (pendiente > 0) {
      alert(
        'No es posible instalar los paneles necesarios.\nPendiente: ' +
          UTIL.formatoValor('energia', pendiente) +
          '\nContinuamos con el máximo número de paneles posible',
      )
    }
    document.body.style.cursor = cursorOriginal
  }
  await calculaResultados()
  return true
}
