import Bateria from './Bateria'
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
  perdidaAnual = 0
  descargaAnual = 0
  cargasAnuales = 0
  descarga_diurna = 0
  descarga_nocturna = 0
  deficit_diurno = 0
  deficit_nocturno = 0
  /**
   * @constructor
   * @param {Produccion} produccion Producción global de la configuración
   * @param {Consumo} consumo Consumo a satisfacer
   * @param {number} coefEnergia Coeficiente de energía asignado (0 - 100)
   * @param {Bateria} bateria Bateria de la instalación (opcional, se puede añadir después) - pendiente implementar
   */
  constructor(produccion, consumo, coefEnergia, bateria = null) {
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
      this.idxTable[i].perdidas = 0
      this.idxTable[i].descargas = 0
      this.idxTable[i].cargas = 0
    }

    for (let idxDia = 0; idxDia < 365; idxDia++) {
      this.idxTable[idxDia].fecha = consumo.idxTable[idxDia].fecha
      for (let hora = 0; hora < 24; hora++) {
        // Si hay producción en esa hora, se considera que el consumo a esa hora es diurno

        // if (produccion.diaHora[idxDia][hora] > 0) {
        //   this.idxTable[idxDia].consumoDiurno += consumo.diaHora[idxDia][hora]
        //   this.consumoDiurno += consumo.diaHora[idxDia][hora]
        // }

        // El balance neto de esa hora se calcula restando al consumo el porcentaje de producción asignado en caso colectivo (coefEnergia)
        this.diaHora[idxDia][hora] =
          consumo.diaHora[idxDia][hora] -
          (produccion.diaHora[idxDia][hora] * coefEnergia) / 100

        // Si el balance es negativo, significa que se ha autoconsumido toda la energía solar y quizas hay excedente. Si es positivo, significa que hay un déficit que no se ha podido cubrir con la producción solar asignada.
        let excedente_primario = 0
        let excedente_neto = 0
        let perdidas_carga = 0
        let perdidas_descarga = 0 //Con el metod de asignar todas las perdidas a la carga debería ser siempre 0
        let autoconsumo_directo = 0
        let deficit_primario = 0
        let deficit_neto = 0
        let carga_neta = 0
        let carga_bruta = 0
        let descarga_neta = 0

        if (this.diaHora[idxDia][hora] < 0) {
          //Tenemos excedente
          autoconsumo_directo = consumo.diaHora[idxDia][hora]
          excedente_primario = Math.abs(this.diaHora[idxDia][hora])
          deficit_primario = 0
          //
          if (bateria) {
            // Si hay batería, el excedente se calcula como la parte del consumo que se ha cubierto con producción solar menos el autoconsumo, es decir, lo que se ha podido meter en la batería. El resto del consumo cubierto por solar se considera autoconsumo aunque no se haya podido meter en la batería por limitaciones de potencia o capacidad.
            ;({ carga_neta, perdidas_carga } = bateria.carga(
              this.idxTable[idxDia].fecha,
              idxDia,
              hora,
              excedente_primario,
            ))

            carga_bruta = carga_neta + perdidas_carga
            excedente_neto = excedente_primario - carga_bruta
          } else {
            excedente_neto = excedente_primario
          }

          this.idxTable[idxDia].cargas += carga_bruta
          this.idxTable[idxDia].perdidas += perdidas_carga
          this.idxTable[idxDia].consumoDiurno += autoconsumo_directo
          this.idxTable[idxDia].excedente += excedente_neto
          this.idxTable[idxDia].autoconsumo += autoconsumo_directo + carga_bruta

          this.perdidaAnual += perdidas_carga
          this.cargasAnuales += carga_neta + perdidas_carga
          this.consumoDiurno += autoconsumo_directo
          this.excedenteAnual += excedente_neto
          this.autoconsumo += autoconsumo_directo + carga_bruta //La produccion de esa hora se ha utilizado o ha ido a perdidas de carga

          this.diaHora[idxDia][hora] = -excedente_neto // El balance neto de esa hora se actualiza a la energia realmente volcada a la red
        } else {
          //Tenemos deficit
          autoconsumo_directo = produccion.diaHora[idxDia][hora]
          excedente_primario = 0
          deficit_primario = this.diaHora[idxDia][hora]

          if (bateria) {
            // Si hay batería, el déficit se calcula como la parte del consumo que no se ha podido cubrir con producción solar menos lo que se ha podido sacar de la batería para cubrir ese déficit. Es decir, el déficit es lo que realmente falta para cubrir el consumo después de usar toda la producción solar asignada y toda la energía que se ha podido sacar de la batería.

            ;({ descarga_neta, perdidas_descarga } = bateria.descarga(
              this.idxTable[idxDia].fecha,
              idxDia,
              hora,
              deficit_primario,
            ))
            deficit_neto = deficit_primario - descarga_neta
          } else {
            deficit_neto = deficit_primario
          }

          this.idxTable[idxDia].descargas += descarga_neta
          if (produccion.diaHora[idxDia][hora] > 0) {
            this.descarga_diurna += descarga_neta
            this.deficit_diurno += deficit_neto
          } else {
            this.descarga_nocturna += descarga_neta
            this.deficit_nocturno += deficit_neto
          }
          this.idxTable[idxDia].perdidas += perdidas_descarga
          this.idxTable[idxDia].deficit += deficit_neto
          this.idxTable[idxDia].autoconsumo += autoconsumo_directo

          if (produccion.diaHora[idxDia][hora] > 0) {
            this.consumoDiurno += consumo.diaHora[idxDia][hora]
            this.idxTable[idxDia].consumoDiurno += consumo.diaHora[idxDia][hora]
          }

          this.deficitAnual += deficit_neto
          this.descargaAnual += descarga_neta
          this.perdidaAnual += perdidas_descarga
          this.autoconsumo += autoconsumo_directo

          this.diaHora[idxDia][hora] = deficit_neto // El balance neto de esa hora se actualiza
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
