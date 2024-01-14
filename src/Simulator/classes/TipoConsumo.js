// import TCB from "./TCB";
import DiaHora from './DiaHora'
/**
 * Clase representa un perfil específico de consumo. Se puede obtener a partir de un fichero CSV de distribuidora o del perfile estandar de REE
 * @extends DiaHora
 */
class TipoConsumo extends DiaHora {
  // Estas propiedades se definen para que exista un nombre único para cada campo en toda la aplicación.
  get tcMaximoAnual() {
    return this.maximoAnual
  } //Pico máximo de consumo
  get cTotalAnual() {
    return this.totalAnual
  } //Consumo total anual
  set cTotalAnual(valor) {
    this.totalAnual = valor
  }
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
   * Function to define options ofor the diaHora.loadFromCsv method
   * @param {string} fuente [CVS, REE, DATADIS]
   * @returns
   */
  selectCSVOptions(fuente) {
    if (fuente === 'REE') {
      return {
        delimiter: ';',
        decimal: '.',
        fechaHdr: 'FECHA',
        horaHdr: 'HORA',
        valorArr: this.tipoTarifaREE,
        factor: this.consumoAnualREE,
      }
    } else {
      return {
        delimiter: ';',
        decimal: ',',
        fechaHdr: 'FECHA',
        horaHdr: 'HORA',
        valorArr: ['CONSUMO', 'CONSUMO_KWH', 'AE_KWH'],
        factor: 1,
        metodo: 'PROMEDIO',
        //Si la fuente es CSV de DATADIS loadcsv debera cambiar el formato de fecha de AAAA/MM/DD a DD/MM/AAAA
        fechaSwp: fuente === 'DATADIS',
      }
    }
  }

  async loadTipoConsumoFromCSV(fuente, fichero) {
    if (fuente !== this.fuente || fichero.name !== this.nombreFicheroCSV) {
      this.inicializa()
    }
    let aStatus
    await this.loadFromCSV(this.ficheroCSV, this.options)
      .then((r) => {
        aStatus = true
      })
      .catch((e) => {
        alert(e)
        aStatus = false
      })
    return aStatus
  }
}
export default TipoConsumo
