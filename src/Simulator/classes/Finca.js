import TCB from './TCB.js'
import * as UTIL from './Utiles.js'
/**
 * @class Finca
 * @classdesc Es la clase que representa las unidades (Finca) candidatas a formar parte del proyecto.
 */

class Finca {
  // Estas propiedades se definen para que exista un nombre único para cada campo en toda la aplicación.
  /**@property {number} ahorroFincaAnual Sinonimo de ahorroAnual */
  get ahorroFincaAnual() {
    if (this.economico !== undefined) return this.economico.ahorroAnual
    else return 0
  }
  set ahorroFincaAnual(value) {
    return
  }

  constructor(finca) {
    this._name = 'Finca'
    this.coefConsumo = 0
    this.coefInversion = 0
    this.coefEnergia = 0
    this.coefHucha = 0
    this.cuotaHucha = 0
    //this.coste = 0

    this.nombreTipoConsumo = ''
    this.idTarifa = ''
    this.participa = false
    this.idFinca
    this.nombreFinca
    this.refcat
    this.planta
    this.puerta
    this.uso
    this.superficie
    this.participacion
    this.grupo
    this.CUPS

    //Asignacion propiedades contenidas en el objeto de entrada salvo que sean un objeto
    for (const objProp in finca) {
      if (typeof finca[objProp] !== Object) {
        this[objProp] = finca[objProp]
      }
    }

    this.superficie =
      typeof finca.superficie === 'string'
        ? parseFloat(finca.superficie.replace(',', '.'))
        : finca.superficie
    this.participacion =
      typeof finca.participacion === 'string'
        ? parseFloat(finca.participacion.replace(',', '.'))
        : finca.participacion

    this.grupo = Finca.mapaUsoGrupo?.[finca.uso] ? Finca.mapaUsoGrupo[finca.uso] : 'Otros'

    /**
     * Cada finca lleva un puntero al PuntoConsumo que pertenece
     * @see PuntoConsumo
     */
    this.idPuntoConsumo
    /**
     * Cada finca tiene su balance energetico
     * @see Balance
     */
    this.balance
    /**
     * Cada Finca tiene su balance económico
     * @see Economico
     */
    this.economico
    /**
     * Cada Finca tiene una tarifa
     */
    this.idTarifa
  }

  actualizaCondicionesHucha(coefHucha, cuotaHucha) {
    if (this.economico === undefined) return
    this.coefHucha = coefHucha
    this.cuotaHucha = cuotaHucha
    this.economico.correccionExcedentes(coefHucha, cuotaHucha)
  }

  /** La funcion actualiza la finca con el mismo idFinca que el argumento fincaActiva. Si esta no existe se crea una nueva finca con las propiedades de fincaActiva
   *
   * @param {Object} fincaActualizada
   */
  static actualiza_creaFinca(fincaActiva) {
    const fincaActualizada = TCB.Finca.find((f) => f.idFinca === fincaActiva.idFinca)
    //const fincaActualizada = TCB.Finca.find( (finca) => { return finca.idFinca === fincaActiva.idFinca });
    //if (fincaActualizada === undefined) {
    if (fincaActualizada.length === 0) {
      TCB.Finca.push(new Finca(fincaActiva))
    } else {
      for (let prop in fincaActiva) {
        fincaActualizada[0][prop] = fincaActiva[prop]
      }
    }
  }

  static mapaUsoGrupo = {
    'Almacen-Estacionamiento': 'Estacionamiento',
    Estacionamiento: 'Estacionamiento',
    Comercial: 'Comercial',
    Cultural: 'Otros',
    'Ocio y Hostelería': 'Otros',
    Industrial: 'Otros',
    Deportivo: 'Otros',
    Oficinas: 'Otros',
    'Edificio Singular': 'Otros',
    Religioso: 'Otros',
    Espectáculos: 'Otros',
    Residencial: 'Residencial',
    'RDL 1/2004 8.2.a': 'Otros', //producción de energía eléctrica y gas y al refino de petróleo, y las centrales nucleares
    'RDL 1/2004 8.2.b': 'Otros', //presas, saltos de agua y embalses, incl. su lecho o vaso, excepto destinadas exclusivamente al riego
    'RDL 1/2004 8.2.c': 'Otros', //autopistas, carreteras y túneles de peaje
    'RDL 1/2004 8.2.d': 'Otros', //aeropuertos y puertos comerciales
    'Sanidad y Beneficencia': 'Otros',
    Agrario: 'Otros',
    'Suelo sin edif., obras urbaniz., jardinería, constr. ruinosa': 'Otros',
    'Industrial agrario': 'Otros',
    'Almacén agrario': 'Otros',
    Otros: 'Otros',
  }

  static getGrupos = {
    values: ['Estacionamiento', 'Comercial', 'Residencial', 'Otros', 'Zonas Comunes'],
  }
}
export default Finca
