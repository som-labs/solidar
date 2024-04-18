import * as UTIL from './Utiles'
import Instalacion from './Instalacion'
import TCB from './TCB'

/**
 * Funcion para asignar un número de paneles de potencia unitaria (segun valor argumento potenciaPanelInicio)
 * a cada base de forma de cubrir la demanda total a las bases disponibles teniendo en cuenta las limitaciones de superficie.
 *
 * @param {Base[]} bases Conjunto de objetos Base disponibles
 * @param {Consumo} consumo Un objeto Consumo a cubrir
 * @param {Float} potenciaPanelInicio Potencia unitaria de cada panel en Wp
 * @returns {Float} energiaPendiente Es el valor de la energía que no ha podiodo ser asignada
 */
function optimizador(bases, consumo, potenciaPanelInicio) {
  let energiaPendiente = consumo.totalAnual
  let energiaAsignada = 0
  let tmpPaneles
  TCB.totalPaneles = 0

  // Sort bases from higher to lower solar preformance.
  // Assign the most production to the better performance up to the limit based on available area
  if (bases.length > 1)
    bases.sort((a, b) => b.rendimiento.unitarioTotal - a.rendimiento.unitarioTotal)

  for (let i = 0; i < bases.length; i++) {
    energiaAsignada = bases[i].rendimiento.unitarioTotal * bases[i].potenciaMaxima
    energiaAsignada =
      energiaAsignada > energiaPendiente ? energiaPendiente : energiaAsignada
    tmpPaneles = Math.round(
      energiaAsignada / bases[i].rendimiento.unitarioTotal / (potenciaPanelInicio / 1000),
    )
    UTIL.debugLog(
      'Creada Instalacion con ' +
        tmpPaneles +
        ' paneles de ' +
        potenciaPanelInicio +
        ' Wp en la base ',
      bases[i].id,
    )

    //Si no hay consumo suficiente para justificar un panel ponemos un panel
    if (tmpPaneles === 0 && i === 0) {
      tmpPaneles = 1
    }

    //Create a new instalation on this base of tmpPaneles
    bases[i].instalacion = new Instalacion({
      paneles: tmpPaneles,
      potenciaUnitaria: potenciaPanelInicio,
    })
    TCB.totalPaneles += tmpPaneles
    energiaPendiente -= energiaAsignada
  }

  return energiaPendiente
}
/** Change number of paneles of the configuration
 * @param {Int} panelesNuevo Total number of panels to install in all bases available
 * @returns {}
 */
function nuevoTotalPaneles(panelesNuevo) {
  let tmpPaneles
  let panelesPendientes = panelesNuevo
  let maxPanelesBase

  UTIL.debugLog('nuevo cantidad de paneles a asignar:' + panelesNuevo)
  // Sort bases from higher to lower solar preformance.
  // Assign the most production to the better performance up to the limit based on available area
  if (TCB.BaseSolar.length > 1)
    TCB.BaseSolar.sort((a, b) => {
      return b.rendimiento.unitarioTotal - a.rendimiento.unitarioTotal
    })

  for (let base of TCB.BaseSolar) {
    maxPanelesBase = Math.trunc(
      base.potenciaMaxima / (base.instalacion.potenciaUnitaria / 1000),
    )

    tmpPaneles = maxPanelesBase > panelesPendientes ? panelesPendientes : maxPanelesBase
    UTIL.debugLog('asignados ' + tmpPaneles + ' a base ' + base.idBaseSolar)
    base.instalacion.paneles = tmpPaneles
    panelesPendientes -= tmpPaneles
  }

  if (panelesPendientes > 0)
    console.log('no hay suficiente superficie para instalar ' + panelesNuevo + ' paneles')
  return panelesPendientes
}

export { optimizador, nuevoTotalPaneles }
