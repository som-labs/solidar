import TCB from "./TCB.js";
import * as UTIL from "./Utiles.js";
import Finca from "./Finca.js";

export default class PuntoConsumo {
  
    constructor( punto) {
    // Propiedades alfa
        this.idPuntoConsumo;
        this.nombrePuntoConsumo;
        this.lonlatPuntoConsumo;
        this.refcat;
        this.direccion;
        this.territorio;
//        this.fincas = [];
        this.fincasCargadas = false;

    // Propiedades geo
        this.geometria = {}; // {symbol:, label:} se guardaran los features de OpenLayers

    //Asignacion propiedades contenidas en el objeto de entrada salvo que sean un objeto   
        for (const objProp in punto) {
          if (typeof punto[objProp] !== Object) this[objProp] = punto[objProp];
        }
    }

    async cargaFincas () {
    
        //Carga las fincas dependientes de cada punto de consumo con la llamada al catastro
        var url = "proxy-Catastro-detalle x refcat.php?refcat=" + this.refcat;
        url += "&idSesion=" + TCB.idSesion;
        try {
          const fincas = await fetch(url);
          UTIL.debugLog("Catastro ->"+url);
          if (fincas.status === 200) {
            let jsonFincas = await fincas.json();

            for (let unaFinca of jsonFincas) {
              unaFinca.idPuntoConsumo = this.idPuntoConsumo;
              unaFinca.idFinca = TCB.idFinca++;
              unaFinca.grupo = Finca.mapaUsoGrupo[unaFinca.uso];
              TCB.Finca.push( new Finca(unaFinca));
            }
            this.fincasCargadas = true;
            return true;
          } else {
            alert("Error obteniendo datos de catastro " + fincas.status + "\n" + url);
            this.fincasCargadas = false;
            TCB.cargaFincasError = true;
            return false;
          }
        } catch (err) {
          UTIL.debugLog("Error obteniendo datos de catastro " + err.message + "\n" + url);
          this.fincasCargadas = false;
          TCB.cargaFincasError = true;
          return false;
        }
    }

}

