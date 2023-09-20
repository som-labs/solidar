import TCB from "./TCB.js";
import * as UTIL from "./Utiles.js";
import Rendimiento from "./Rendimiento.js";
/**
 * @class BaseSolar
 * @classdesc Clase para definir las bases solares en las que se instalarán las fuentes de producción
 */
class BaseSolar {
/**
 * @constructor
 * @param {Object} area Descripción de la base donde se instalarán los paneles
 */
  constructor( area ) {
    
    this.nombreBaseSolar = area.nombreBaseSolar;
    this.areaMapa;                //El area en el mapa
    this.areaReal;                //El area corregida por la inclinaciond e l tejado
    this.lonlatBaseSolar;
    this.potenciaMaxima;
    this.inclinacionOptima = false;
    this.inclinacionPaneles = 0;
    this.inclinacionTejado = 0;
    this.angulosOptimos = false;
    this.inAcimut = 0;

    this.rendimientoCreado = false;
    this.requierePVGIS = true;    //Flag para controlar si es necesario llamar a PVGIS o no despues de cambios

    this.geometria = {'label':{}, 'area':{}, 'acimut':{}, 'symbol':{}};

    this.rendimiento = {};
    this.instalacion = {};
    this.produccion = {};

    //Asignacion propiedades contenidas en el objeto de entrada salvo que sean un objeto 
    for (const objProp in area) {
      if (typeof area[objProp] !== Object) {
        if (objProp === 'fecha' && typeof area[objProp] === 'string') area[objProp] = new Date(area[objProp]);
        this[objProp] = area[objProp];
      }
    }
    UTIL.debugLog("Nueva base solar "+area.nombreBaseSolar+" creada");
    
  }
/**
 * Crea el objeto Rendimiento de una BaseSolar
 * @see Rendimiento
 */
  async cargaRendimiento() {
    if (this.rendimientoCreado) {
      this.rendimiento = {};
      this.rendimientoCreado = false;
    } 
    this.rendimiento = new Rendimiento( this);
  }

  /**
   * @typedef {Object} row
   * @property {number} idBaseSolar base.idBaseSolar
   * @property {string} nombreBaseSolar base.nombreBaseSolar
   * @property {number} unitarioTotal base.rendimiento.unitarioTotal
   * @property {number} potenciaMaxima base.potenciaMaxima
   * @property {number} paneles base.instalacion.paneles
   * @property {number} potenciaUnitaria base.instalacion.potenciaUnitaria
   * @property {number} potenciaTotal base.instalacion.potenciaTotal
   */
  /**
   * Simula un select de la tabla BaseSolar con la vista de Instalacion
   * @static
   * @returns {row}
   */
  static getTabulatorRow ( campo, valor) {
    const base = TCB.BaseSolar.find( (b) => { return b[campo] === valor})
    return {
      'idBaseSolar':base.idBaseSolar,
      'nombreBaseSolar':base.nombreBaseSolar,
      'unitarioTotal':base.rendimiento.unitarioTotal,
      'potenciaMaxima':base.potenciaMaxima,
      'paneles':base.instalacion.paneles,
      'potenciaUnitaria':base.instalacion.potenciaUnitaria,
      'potenciaTotal':base.instalacion.potenciaTotal
    }
  }
}
export default BaseSolar