// import TCB from "./TCB";
import DiaHora from './DiaHora'
import * as UTIL from './Utiles'
import TCB from './TCB'
/**
 * Clase representa un perfil específico de consumo. Se puede obtener a partir de un fichero CSV de distribuidora o del perfile estandar de REE
 * @extends DiaHora
 */
class TipoConsumo extends DiaHora {
  get csvCargado() {
    return this.datosCargados
  }
  /**
   * @constructor
   * @param {Object} tipo
   */
  constructor(tipo) {
    super()
    this.idTipoConsumo //Probablemente no se use
    this.nombreTipoConsumo //Es la clave unica
    this.fuente // CSV, REE o DATADIS
    this.consumoAnualREE
    this.tipoTarifaREE
    this.ficheroCSV
    this.nombreFicheroCSV
    this.options = {}

    //Asignacion propiedades contenidas en el objeto de entrada salvo que sean un objeto
    for (const objProp in tipo) {
      if (typeof tipo[objProp] !== Object) {
        this[objProp] = tipo[objProp]
      }
    }

    this.options = this.selectCSVOptions(this.fuente)
  } // End constructor

  /**
   * Function to define options for the loadFromCsv function
   * @param {string} fuente [CVS, REE, DATADIS, SOM]
   * @returns
   */
  selectCSVOptions(fuente) {
    let options = { metodo: 'PROMEDIO', fuente: fuente }
    if (fuente === 'REE') {
      options = {
        valorArr: this.tipoTarifaREE,
        factor: this.consumoAnualREE,
      }
    } else {
      options = {
        valorArr: ['consumo_kWh', 'AE_kWh', 'Consumo_kWh', 'Consumo'], //Header for consumption -> options to be received based on file source
        factor: 1,
      }
    }
    //Si la fuente es CSV de DATADIS loadcsv debera cambiar el formato de fecha de AAAA/MM/DD a DD/MM/AAAA
    options.fechaSwp = fuente === 'DATADIS'
    //Si la fuente es SOM loadcsv la hora ya viene 0:23, si no viene 1:24
    options.deltaHour = fuente === 'SOM' ? 0 : -1
    return options
  }

  async loadTipoConsumoFromCSV() {
    this.inicializa()
    var astatus = false

    await UTIL.loadFromCSV(this.ficheroCSV, this, this.options)
      .then((returnObject) => {
        //Verificamos que tenemos 365 dias registrados.
        let faltan = 0
        for (let i = 0; i < 365; i++) {
          //Si un registro no tiene fecha le ponemos la que correspodne al indice
          if (this.idxTable[i].fecha === '') {
            faltan++
            const ano = returnObject.fechaInicio.getFullYear()
            const [dia, mes] = UTIL.fechaDesdeIndice(i)
            this.idxTable[i].fecha = new Date(ano, mes, dia, 0, 0)
          }
        }
        if (faltan !== 0) {
          UTIL.debugLog('Faltan datos de ' + faltan + ' dias')
          if (
            window.confirm(
              TCB.i18next.t('CONSUMPTION.ERROR_FALTAN_DATOS', { faltan: faltan }),
            )
          ) {
            astatus = true
          }
        } else astatus = true
        if (astatus) {
          this.fechaInicio = returnObject.fechaInicio
          this.horaInicio = returnObject.horaInicio
          this.fechaFin = returnObject.fechaFin
          this.horaFin = returnObject.horaFin
          this.numeroRegistros = returnObject.numeroRegistros
          this.datosCargados = true
          this.sintesis()
        }
      })
      .catch((e) => {
        alert(e)
        astatus = false
      })
    return astatus
  }
}
export default TipoConsumo
