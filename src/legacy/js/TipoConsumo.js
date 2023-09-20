import TCB from "./TCB.js";
import DiaHora from "./DiaHora.js";
/**
 * Clase representa un perfil específico de consumo. Se puede obtener a partir de un fichero CSV de distribuidora o del perfile estandar de REE
 * @extends DiaHora
 */
class TipoConsumo extends DiaHora {
// Estas propiedades se definen para que exista un nombre único para cada campo en toda la aplicación.
  get tcMaximoAnual() { return this.maximoAnual}  //Pico máximo de consumo
  get cTotalAnual() { return this.totalAnual}  //Consumo total anual
  set cTotalAnual( valor) { this.totalAnual = valor}
  get csvCargado() { return this.datosCargados}
/**
* @constructor
* @param {Object} tipo 
*/
  constructor(tipo) {

    super();
    this.idTipoConsumo;     //Probablemente no se use
    this.nombreTipoConsumo; //Es la clave unica
    this.fuente;            // CSV o REE
    this.consumoAnualREE;
    this.ficheroCSV;
    this.nombreFicheroCSV;

    this.nombreTarifa;     //Por decidir si es necesairo duplicar o no
    this.territorio;       //Por decidir si es necesairo duplicar o no
    this.tarifa = {};      //Es un objeto Tarifa

    //Asignacion propiedades contenidas en el objeto de entrada salvo que sean un objeto    
    for (const objProp in tipo) {
      if (typeof tipo[objProp] !== Object) {
        this[objProp] = tipo[objProp];
      }
    }
  } // End constructor

  /**
   * 
   * @param {*} nuevaFuente 
   */
  resetFuente( nuevaFuente) {
    this.inicializa();
    this.fuente = nuevaFuente;  // CSV, REE o DATADIS
    this.consumoAnualREE = "";
    this.ficheroCSV = "";
    this.nombreFicheroCSV = "";
  }

  /** Devuelve una fila para la tabla _tablaTipoConsumo
   * 
   * @returns {row} para _tablaTipoConsumo
   */
  select_tablaTipoConsumo() {
    let row = {};
    row.idTipoConsumo = this.idTipoConsumo;     
    row.nombreTipoConsumo = this.nombreTipoConsumo;
    row.fuente = this.fuente;
    row.consumoAnualREE = this.consumoAnualREE;
    row.nombreFicheroCSV = this.nombreFicheroCSV;
    row.cTotalAnual = this.cTotalAnual;
    row.nombreTarifa = this.tarifa.nombreTarifa;
    return row;
  }
  /**
   * Devuelve un array con: select UNIQUE nombreTipoConsumo from TipoConsumo
   * @returns {Array<string>} Nombres de los tipos de consumo definidos
   */
  static selectNombreTipoConsumo () {
        return TCB.TipoConsumo.map( (tipoConsumo) => {return tipoConsumo.nombreTipoConsumo});
  }
  /**
   *  * Devuelve un objeto TipoConsumo con: select TipoConsumo from TipoConsumo where nombreTipoConsumo = nombreTC
   * @param {string} nombreTC Nombre del tipo de consumo buscado
   * @returns {TipoConsumo} o undefined en caso de no existir
   */
  static findxNombre( nombreTC ) {
    return TCB.TipoConsumo.find( (tc) => {return tc.nombreTipoConsumo === nombreTC});
  }


  sintetizaTiposConsumo ( tipo2, factor) {
    if (factor === undefined) factor = 1;
    if (this.nombreTarifa === undefined) {
      this.nombreTarifa = tipo2.nombreTarifa;
      this.territorio = tipo2.territorio;       
      Object.assign(this.tarifa, tipo2.tarifa);
    }
    if (this.tarifa.nombreTarifa !== tipo2.tarifa.nombreTarifa) {
      alert ("No se pueden sintetizar tipos de consumo con tarifas diferentes");
      return null
    }
    super.sintetizaDiaHora( tipo2, factor);
  }
  


}
export default TipoConsumo