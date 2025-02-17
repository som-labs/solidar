import DiaHora from './DiaHora'
import * as UTIL from './Utiles'
/**
 * @class Balance
 * @classdesc representa el balance energetico horario global de toda la configuración
 * @extends DiaHora
 */
class Balance extends DiaHora {
  deficitMaximo = 0
  excedenteMaximo = 0
  autoconsumo = 0
  excedenteAnual = 0
  deficitAnual = 0
  consumoDiurno = 0

  /**
   * @constructor
   * @param {Produccion} produccion Producción global de la configuración
   * @param {Consumo} consumo Consumo a satisfacer
   * @param {number} coefEnergia Coeficiente de energía asignado (0 - 1)
   */
  constructor(produccion, consumo, coefEnergia) {
    UTIL.debugLog('Generando balance')

    super()
    this._name = 'Balance'
    /**
     * Añade campos necesarios para el balance a la tabla IDX de DiaHora
     */
    for (let i = 0; i < 365; i++) {
      this.idxTable[i].deficit = 0
      this.idxTable[i].excedente = 0
      this.idxTable[i].autoconsumo = 0
      this.idxTable[i].consumoDiurno = 0
    }

    for (let idxDia = 0; idxDia < 365; idxDia++) {
      this.idxTable[idxDia].fecha = consumo.idxTable[idxDia].fecha
      for (let hora = 0; hora < 24; hora++) {
        if (produccion.diaHora[idxDia][hora] > 0) {
          this.idxTable[idxDia].consumoDiurno += consumo.diaHora[idxDia][hora]
          this.consumoDiurno += consumo.diaHora[idxDia][hora]
        }

        this.diaHora[idxDia][hora] =
          consumo.diaHora[idxDia][hora] - produccion.diaHora[idxDia][hora] * coefEnergia

        if (this.diaHora[idxDia][hora] < 0) {
          this.autoconsumo += consumo.diaHora[idxDia][hora]
          this.excedenteAnual += Math.abs(this.diaHora[idxDia][hora])
          this.idxTable[idxDia].autoconsumo += consumo.diaHora[idxDia][hora]
          this.idxTable[idxDia].excedente += Math.abs(this.diaHora[idxDia][hora])
        } else {
          this.deficitAnual += this.diaHora[idxDia][hora]
          this.idxTable[idxDia].deficit += this.diaHora[idxDia][hora]
          this.autoconsumo += produccion.diaHora[idxDia][hora] * coefEnergia
          this.idxTable[idxDia].autoconsumo +=
            produccion.diaHora[idxDia][hora] * coefEnergia
        }
      }
    }
    this.sintesis()

    for (let i = 0; i < 365; i++) {
      if (this.idxTable[i].maximo > this.excedenteMaximo) {
        this.excedenteMaximo = this.idxTable[i].maximo
      }
      if (this.idxTable[i].maximo < this.deficitMaximo) {
        this.deficitMaximo = this.idxTable[i].maximo
      }
    }
  }
}
export default Balance
