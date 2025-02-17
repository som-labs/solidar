import * as UTIL from './Utiles'
import Instalacion from './Instalacion'
import TCB from './TCB'
import BaseSolar from './BaseSolar'

/**
 * Funcion para asignar un número de paneles de potencia unitaria (segun valor argumento potenciaPanelInicio)
 * a cada base de forma de cubrir la demanda total a las bases disponibles teniendo en cuenta las limitaciones de superficie.
 *
 * @param {Base[]} bases Conjunto de objetos Base disponibles
 * @param {Consumo} consumo Un objeto Consumo a cubrir
 * @param {Float} potenciaPanelInicio Potencia unitaria de cada panel en Wp
 * @returns {Float} energiaPendiente Es el valor de la energía que no ha podiodo ser asignada
 */

let localModifyBase

function optimizador(bases, consumo, potenciaPanelInicio, modifyBase) {
  console.log('Optimizador', bases, consumo, potenciaPanelInicio)
  localModifyBase = modifyBase

  let energiaPendiente = consumo.totalAnual
  let energiaAsignada = 0
  let tmpPaneles

  // Sort bases from higher to lower solar preformance.
  // Assign the most production to the better performance up to the limit based on available area

  const localBases = bases.slice()
  if (bases.length > 1)
    localBases.sort((a, b) => b.rendimiento.unitarioTotal - a.rendimiento.unitarioTotal) // Sort by price

  for (let i = 0; i < localBases.length; i++) {
    energiaAsignada =
      (localBases[i].rendimiento.unitarioTotal *
        localBases[i].panelesMaximo *
        potenciaPanelInicio) /
      1000

    energiaAsignada =
      energiaAsignada > energiaPendiente ? energiaPendiente : energiaAsignada

    console.log('Asignada', energiaAsignada, 'Pendiente', energiaPendiente)
    tmpPaneles = Math.round(
      energiaAsignada /
        localBases[i].rendimiento.unitarioTotal /
        (potenciaPanelInicio / 1000),
    )

    console.log(
      'Creada Instalacion con ' +
        tmpPaneles +
        ' paneles de ' +
        potenciaPanelInicio +
        ' Wp en la base ',
      localBases[i].idBaseSolar,
    )

    //Si no hay consumo suficiente para justificar un panel ponemos un panel
    if (tmpPaneles === 0 && i === 0) {
      tmpPaneles = 1
    }

    //Create a new instalation on this base of tmpPaneles
    localBases[i].instalacion = new Instalacion({
      paneles: tmpPaneles,
      potenciaUnitaria: potenciaPanelInicio,
    })
    //TCB.totalPaneles += tmpPaneles
    modifyBase(localBases[i])
    energiaPendiente -= energiaAsignada
  }
  return energiaPendiente
}

/** Change number of paneles of the configuration
 * @param {Int} panelesNuevo Total number of panels to install in all bases available
 * @returns {}
 */
function nuevoTotalPaneles(bases, panelesNuevo, potenciaPanelInicio) {
  let tmpPaneles
  let panelesPendientes = panelesNuevo
  let maxPanelesBase
  /* PENDIENTE*/
  UTIL.debugLog('nuevo cantidad de paneles a asignar:' + panelesNuevo)
  // Sort bases from higher to lower solar preformance.
  // Assign the most production to the better performance up to the limit based on available area

  const localBases = bases.slice()
  if (bases.length > 1)
    localBases.sort((a, b) => b.rendimiento.unitarioTotal - a.rendimiento.unitarioTotal) // Sort by performance

  console.log('2 nuevoTotalPaneles working', localBases, panelesNuevo)
  for (let i = 0; i < localBases.length; i++) {
    // maxPanelesBase = Math.trunc(
    //   (base.panelesMaximo * potenciaPanelInicio) /
    //     (base.instalacion.potenciaUnitaria / 1000),
    //)
    tmpPaneles =
      localBases[i].panelesMaximo > panelesPendientes ? panelesPendientes : maxPanelesBase
    localBases[i].instalacion.paneles = tmpPaneles
    console.log('3 nuevoTotalPaneles modify base', localBases[i].instalacion.paneles)
    localModifyBase(localBases[i])
    panelesPendientes -= tmpPaneles
  }

  if (panelesPendientes > 0)
    console.log('no hay suficiente superficie para instalar ' + panelesNuevo + ' paneles')
  return panelesPendientes
}

export { optimizador, nuevoTotalPaneles }
