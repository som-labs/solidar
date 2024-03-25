import * as UTIL from './Utiles'
/**
 * @class DiaHora
 * @classdesc Es la clase base para todas las matrices diaHora de 365 filas y 24 columnas para almacenar los valores de los diversos objetos de la aplicacion
 */

class DiaHora {
  /** @property {Array} idxTable Vector [365] objetos {} resumen de algunas propiedades de cada dia del año */
  idxTable = []
  /** @property {Array} diaHora Matriz [365, 24] valores horarios de cada dia del año */
  diaHora = []
  /** @property {number} numeroRegistros Numero de registros leidos desde la fuente */
  numeroRegistros = 0
  /** @property {number} numeroDias Numero de dias procesados desde la fuente */
  numeroDias = 0
  /** @property {Date} fechaFin Última fecha leida desde la fuente */
  fechaFin
  horaFin
  fechaInicio
  horaInicio
  maximoAnual = -Infinity
  totalAnual = 0
  datosCargados = false

  /**
   * @constructor
   */
  constructor() {
    this.inicializa()
  }

  /** inicializa Inicializa la estructura DiaHora a cero */
  inicializa() {
    for (let i = 0; i < 365; i++) {
      /*             let diaMes = UTIL.fechaDesdeIndice(i);
            this.idxTable[i] = { previos: 0, dia: diaMes[0], mes: diaMes[1], suma: 0, maximo: 0, promedio: 0, fecha:''}; */
      this.idxTable[i] = { previos: 0, suma: 0, maximo: 0, promedio: 0, fecha: '' }
    }
    this.diaHora = Array.from(Array(365), () => new Array(24).fill(0))
  }

  /**
   * Carga diaHora a partir de un objeto JSON
   * Por definir
   */
  async loadFromJSON() {}
  /**
   * Suma a this.diaHora una nueva inDiaHora multiplicada por factor
   * @param {DiaHora} inDiaHora
   * @param {number} factor
   */
  sintetizaDiaHora(inDiaHora, factor) {
    for (let dia = 0; dia < 365; dia++) {
      for (let hora = 0; hora < 24; hora++) {
        this.diaHora[dia][hora] += inDiaHora.diaHora[dia][hora] * factor
      }
      this.idxTable[dia].suma =
        this.idxTable[dia].suma + inDiaHora.idxTable[dia].suma * factor
      this.idxTable[dia].promedio =
        (this.idxTable[dia].promedio + inDiaHora.idxTable[dia].promedio * factor) /
        (factor + 1)
      this.idxTable[dia].maximo =
        this.idxTable[dia].maximo > inDiaHora.idxTable[dia].maximo
          ? this.idxTable[dia].maximo
          : inDiaHora.idxTable[dia].maximo
      this.idxTable[dia].fecha = inDiaHora.idxTable[dia].fecha
    }
    this.sintesis()
  }
  /**
   * Suma diaHora de inDiaHora a this.diaHora y actualiza los campos de idxTable
   * @param {inDiaHora} inDiaHora
   */
  suma(inDiaHora) {
    for (let dia = 0; dia < 365; dia++) {
      for (let hora = 0; hora < 24; hora++) {
        this.diaHora[dia][hora] += inDiaHora.diaHora[dia][hora]
      }
      this.idxTable[dia].fecha = inDiaHora.idxTable[dia].fecha
      this.idxTable[dia].suma += inDiaHora.idxTable[dia].suma
      this.idxTable[dia].promedio = this.idxTable[dia].suma / 2
      this.idxTable[dia].maximo =
        this.idxTable[dia].maximo > inDiaHora.idxTable[dia].maximo
          ? this.idxTable[dia].maximo
          : inDiaHora.idxTable[dia].maximo
    }
    this.sintesis()
  }
  /**
   * Devuelve el valor diaHora de los 365 dias a una determinada hora o array vacio si la hora no es valida
   * @param {number} hora Un numero entre 0 y 23
   * @returns {Array<number>} Array de 365 valores de diaHora a esa hora
   */
  getHora(hora) {
    let arrayHora = []
    if (hora >= 0 && hora < 24) {
      for (let dia = 0; dia < 365; dia++) arrayHora.push(this.diaHora[dia][hora])
    }
    return arrayHora
  }
  /**
   * Devuelve el valor de las 24 horas de un determinado dia o array vacio si el dia no es valido
   * @param {number} dia Un numero entre 0 y 364
   * @returns {Array<number>} Array de 24 valores de diaHora de ese dia
   */
  getDia(dia) {
    let arrayDia = []
    if (dia >= 0 && dia < 365) {
      for (let hora = 0; hora < 24; hora++) arrayDia.push(this.diaHora[dia][hora])
    }
    return dia
  }
  /**
   * Carga diaHora de this a partir de otro objeto diaHora aplicandole un factor de escala.
   * @param {DiaHora} inDiaHora DiaHora origen
   * @param {number} factor
   */
  escala(inDiaHora, factor) {
    for (let dia = 0; dia < 365; dia++) {
      for (let hora = 0; hora < 24; hora++) {
        this.diaHora[dia][hora] = inDiaHora.diaHora[dia][hora] * factor
      }
      this.idxTable[dia].fecha = inDiaHora.idxTable[dia].fecha
      this.idxTable[dia].suma = inDiaHora.idxTable[dia].suma * factor
      this.idxTable[dia].promedio = inDiaHora.idxTable[dia].promedio * factor
      this.idxTable[dia].maximo = inDiaHora.idxTable[dia].maximo * factor
    }
    this.maximoAnual = inDiaHora.maximoAnual * factor
    this.totalAnual = inDiaHora.totalAnual * factor
  }
  /**
   * Introduce los valores de un dia en diaHora y actualiza la tabla idx del dia correspondiente
   * En caso de existir valores previos para ese dia calcula los promedios
   * @param {object} unDia Estructura a carga
   * @param {Date} unDia.fecha Fecha del registro al que se insertarán estos datos
   * @param {Array(24)<number>} unDia.valores Valores a insertar en esta fila
   */
  mete(unDia, metodo) {
    let _dia = unDia.fecha.getDate()
    let _mes = unDia.fecha.getMonth()
    var indiceDia = UTIL.indiceDesdeDiaMes(_dia, _mes)
    for (let hora = 0; hora < 24; hora++) {
      if (metodo === 'PROMEDIO') {
        if (this.idxTable[indiceDia].previos > 0) {
          //Implica que ya habia registros previos para ese dia por lo que recalculamos el promedio
          unDia.valores[hora] =
            (this.diaHora[indiceDia][hora] * this.idxTable[indiceDia].previos +
              unDia.valores[hora]) /
            (this.idxTable[indiceDia].previos + 1)
        }
      }
      this.diaHora[indiceDia][hora] = unDia.valores[hora]
    }

    this.idxTable[indiceDia].fecha = unDia.fecha
    this.idxTable[indiceDia].previos = this.idxTable[indiceDia].previos + 1
    this.idxTable[indiceDia].suma = UTIL.suma(unDia.valores)
    this.idxTable[indiceDia].promedio = UTIL.promedio(unDia.valores)
    this.idxTable[indiceDia].maximo = Math.max(...unDia.valores)
  }
  /**
   * Calcula los campos maximoAnual y totalAnual de diaHora
   */
  sintesis() {
    this.totalAnual = 0
    this.maximoAnual = -Infinity
    for (let i = 0; i < 365; i++) {
      if (this.idxTable[i].maximo > this.maximoAnual) {
        this.maximoAnual = this.idxTable[i].maximo
      }
      if (this.idxTable[i].previos > 0) {
        this.numeroDias++
      }
      this.totalAnual += this.idxTable[i].suma
    }
  }

  /**
   * Devuelve un vector de 12 posiciones con el sumatorio de la propiedad solicitada en el argumento para cada mes
   * @param {string} propiedad de la que solicita el resumen
   * @returns {Array(12)<number>} valores del sumatorio de la propiedad para cada mes
   */
  resumenMensual(propiedad) {
    let valorMensual = new Array(12).fill(0)
    for (let i = 0; i < 365; i++) {
      if (this.idxTable[i].fecha !== '')
        valorMensual[this.idxTable[i].fecha.getMonth()] += this.idxTable[i][propiedad]
    }
    return valorMensual
  }

  transformaFechas() {
    if (typeof this.idxTable[0].fecha === 'string')
      for (let dia = 0; dia < 365; dia++) {
        this.idxTable[dia].fecha = new Date(this.idxTable[dia].fecha)
      }
  }
}
export default DiaHora
