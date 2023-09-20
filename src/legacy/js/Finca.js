import TCB from "./TCB.js";
/** 
 * @class Finca
 * @classdesc Es la clase que representa las unidades (Finca) candidatas a formar parte del proyecto.
 */

class Finca {
    // Estas propiedades se definen para que exista un nombre único para cada campo en toda la aplicación.
    /**@property {number} ahorroFincaAnual Sinonimo de ahorroAnual */
    get ahorroFincaAnual() { if (this.economico !== undefined) return this.economico.ahorroAnual; else return 0}
    set ahorroFincaAnual( value) {return}

    constructor( finca) {
      this.coefConsumo = 0;
      this.coefInversion = 0;
      this.coefEnergia = 0;
      this.coefHucha = 0;
      this.cuotaHucha = 0;


      this.nombreTipoConsumo = undefined;
      this.idFinca; 
      this.nombreFinca;
      this.refcat;
      this.planta;
      this.puerta;
      this.uso;
      this.superficie;
      this.participacion;

      //Asignacion propiedades contenidas en el objeto de entrada salvo que sean un objeto    
      for (const objProp in finca) {
        if (typeof finca[objProp] !== Object) {
          this[objProp] = finca[objProp];
        }
      }
      this.superficie = typeof finca.superficie === 'string' ? parseFloat(finca.superficie.replace(",", ".")) : finca.superficie;
      this.participacion = typeof finca.participacion === 'string' ? parseFloat(finca.participacion.replace(",", ".")) : finca.participacion;
      
        /**
         * Cada finca lleva un puntero al PuntoConsumo que pertenece
         * @see PuntoConsumo
         */
        this.idPuntoConsumo;
        /**
         * Cada finca tiene su balance energetico
         * @see Balance
         */
        this.balance;
        /**
         * Cada Finca tiene su balance económico
         * @see Economico
         */
        this.economico;
    }
  
    actualizaCondicionesHucha(coefHucha, cuotaHucha) {
      if (this.economico === undefined) return;
        this.coefHucha = coefHucha;
        this.cuotaHucha = cuotaHucha;
        this.economico.correccionExcedentes(coefHucha, cuotaHucha);
    }

    /** La funcion actualiza la finca con el mismo idFinca que el argumento fincaActiva. Si esta no existe se crea una nueva finca con las propiedades de fincaActiva
     * 
     * @param {Object} fincaActualizada 
     */
    static actualiza_creaFinca ( fincaActiva) {
        const fincaActualizada = TCB.Finca.find( (finca) => { return finca.idFinca === fincaActiva.idFinca });
        if (fincaActualizada === undefined) {
          TCB.Finca.push( new Finca(fincaActiva));
        } else {
          for (let prop in fincaActiva) {
            fincaActualizada[prop] = fincaActiva[prop];
          }
        }
    }

    static getTabulatorRow ( campo, valor) {
      const actFinca = TCB.Finca.find( (b) => { return b[campo] === valor})
      if (actFinca === undefined) return undefined;
      let row = {};
      row.idFinca = actFinca.idFinca;
      row.nombreFinca = actFinca.nombreFinca;
      row.uso = actFinca.uso;
      row.participacion = actFinca.participacion;

      row.coefEnergia = actFinca.coefEnergia;
      row.produccionTotal = actFinca.coefEnergia * TCB.produccion.pTotalAnual / 100;
      row.coefInversion = actFinca.coefInversion;
      row.precioInstalacionCorregido = actFinca.coefInversion * TCB.produccion.precioInstalacionCorregido / 100;

      row.coefConsumo = actFinca.coefConsumo;
      row.cTotalAnual =  actFinca.coefConsumo * TCB.consumo.cTotalAnual / 100;
      row.coefHucha = actFinca.coefHucha;
      row.cuotaHucha = actFinca.cuotaHucha;

      if (actFinca.economico !== undefined) row.ahorroFincaAnual = actFinca.economico.ahorroAnual;
      
      return row;
    }

}
export default Finca