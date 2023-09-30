import * as UTIL from "./Utiles";
import Instalacion from "./Instalacion";
import TCB from "./TCB";

/** 
 * Funcion para asignar un número de paneles de potencia unitaria (segun valor argumento potenciaPanelInicio) 
 * a cada base de forma de cubrir la demanda total a las bases disponibles teniendo en cuenta las limitaciones de superficie.
 *  
 * @param {Base[]} bases Conjunto de objetos Base disponibles
 * @param {Consumo} consumo Un objeto Consumo a cubrir
 * @param {Float} potenciaPanelInicio Potencia unitaria de cada panel
 * @returns {Float} energiaPendiente Es el valor de la energía que no ha podiodo ser asignada
 */
async function optimizador( bases, consumo, potenciaPanelInicio) {

  let energiaPendiente = consumo.cTotalAnual;
  let energiaAsignada = 0;
  let tmpPaneles;
  TCB.totalPaneles = 0;

  // Ordenamos las bases de mayor a menos por su rendimiento. Intentaremos asignar la mayor produccion a la mas productiva
  if (bases.length > 1) bases.sort((a, b) => b.rendimiento.unitarioTotal - a.rendimiento.unitarioTotal);

  for (let i=0; i<bases.length; i++) {
    energiaAsignada = bases[i].rendimiento.unitarioTotal * bases[i].potenciaMaxima;
    energiaAsignada = energiaAsignada > energiaPendiente ? energiaPendiente : energiaAsignada;
    tmpPaneles = Math.round(energiaAsignada / bases[i].rendimiento.unitarioTotal / potenciaPanelInicio);
    UTIL.debugLog("_initInstalacion con" + tmpPaneles + " paneles de " + potenciaPanelInicio + "kWp en la base ", bases[i].id);
    //Creamos una instalación por defecto que cubra el consumo maximo anual
    bases[i].instalacion = new Instalacion({paneles: tmpPaneles, potenciaUnitaria: potenciaPanelInicio});
    TCB.totalPaneles += tmpPaneles;
    energiaPendiente -= energiaAsignada;
  }

  return energiaPendiente;
}
/**
 * 
 * @param {Int} panelesNuevo Número total de paneles que se quieren instalar entre todas las bases
 * @returns {}
 */
function nuevoTotalPaneles ( panelesNuevo) {

  let tmpPaneles;
  let panelesPendientes = panelesNuevo;
  let maxPanelesBase;

  UTIL.debugLog("nuevo cantidad de paneles a asignar:" + panelesNuevo);
  // Ordenamos las bases de mayor a menos por su rendimiento. Intentaremos asignar la mayor produccion a la mas productiva
  if (TCB.BaseSolar.length > 1) TCB.BaseSolar.sort((a, b) => b.rendimiento.unitarioTotal - a.rendimiento.unitarioTotal);

  for (let i=0; i<TCB.BaseSolar.length; i++) {
    maxPanelesBase = Math.trunc(TCB.BaseSolar[i].potenciaMaxima / TCB.BaseSolar[i].instalacion.potenciaUnitaria);
    tmpPaneles = maxPanelesBase > panelesPendientes ? panelesPendientes : maxPanelesBase;
    UTIL.debugLog("asignados " +  tmpPaneles + " a base "+TCB.BaseSolar[i].idBaseSolar);
/*     TCB.BaseSolar[i].instalacion = new Instalacion({paneles: tmpPaneles, potenciaUnitaria:TCB.BaseSolar[i].instalacion.potenciaUnitaria});  */

    TCB.BaseSolar[i].instalacion.paneles = tmpPaneles; 
    panelesPendientes -= tmpPaneles;
  }

  if (panelesPendientes > 0 ) console.log("no hay suficiente superficie para instalar " + panelesNuevo + " paneles");
  return panelesPendientes;
}

export {optimizador, nuevoTotalPaneles}