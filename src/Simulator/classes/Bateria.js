import TCB from './TCB'
import DiaHora from './DiaHora'
/**
 * @class Bateria
 * @classdesc Clase representa la bateria de la instalacion.
 * @extends DiaHora
 */
class Bateria extends DiaHora {
  /**
   * @constructor
   * @param {Object} bateria A JS object to be used as template for a Solidar Bateria object
   */

  static CAMPOS = [
    { name: 'capacidad', min: 1, max: 50 },
    { name: 'socMax', min: 0, max: 1 },
    { name: 'socMin', min: 0, max: 1 },
    { name: 'eficiencia', min: 0.5, max: 1 },
    { name: 'maxCargaKw', min: 0, max: 20 },
    { name: 'maxDescargaKw', min: 0, max: 20 },
  ]

  constructor(bateria) {
    super() //En diaHora se almacenara la carga y descarga hora a hora de la bateria, se inicializa a 0 pero se va modificando en la simulacion

    this._name = 'Bateria'
    this.idBateria //Probablemente no se use
    this.nombreBateria
    this.capacidad = 5 // Capacidad total de la batería en kWh
    this.socMax = 0.9 // Estado de carga máximo como porcentaje (0-1)
    this.socMin = 0.1 // Estado de carga mínimo como porcentaje (0-1)
    this.eficiencia = 0.95 // Eficiencia round-trip como porcentaje (0-1)
    this.precio // Precio de la batería en euros
    this.maxCargaKw = 3.6 // Potencia máxima de carga en kW (opcional)
    this.maxDescargaKw = 3.6 // Potencia máxima de descarga en kW (opcional)
    this.SOC = 0 //Estado de carga actual en kWh, se inicializa a 0 pero se puede modificar para simular diferentes escenarios

    if (bateria && typeof bateria === 'object') {
      Object.assign(this, bateria)
    }
  } // End constructor

  static update(instance, bateria) {
    //Asignacion propiedades contenidas en el objeto de entrada salvo que sean un objeto
    for (const objProp in bateria) {
      if (typeof bateria[objProp] !== Object) {
        if (objProp === 'fecha' && typeof bateria[objProp] === 'string')
          instance[objProp] = new Date(bateria[objProp])
        instance[objProp] = bateria[objProp]
      }
    }
  }

  carga(fecha, dia, hora, energia) {
    // Veamos cuánto espacio hay en la batería para meter ese excedente

    const espacioDisponible = this.capacidad * this.socMax - this.SOC
    const maxCargaEstaHora =
      Math.min(this.maxCargaKw, espacioDisponible) / this.eficiencia // Limitado por potencia de carga y espacio disponible
    const carga_bruta = Math.min(energia, maxCargaEstaHora) // Lo que se podría dirigir a la batería esta hora
    const carga_neta = carga_bruta * this.eficiencia // Lo que realmente se mete en la batería esta hora teniendo en cuenta las pérdidas de carga que incluyen las perdidas de descarga
    this.SOC += carga_neta // Actualizamos el estado de carga de la batería
    const perdidas_carga = carga_bruta - carga_neta // La parte que se pierde por las ineficiencias de carga de la batería se considera pérdida de batería
    this.diaHora[dia][hora] = this.SOC // Guardamos la carga de la batería hora a hora en el objeto DiaHora de la batería
    this.idxTable[dia].fecha = fecha
    return { carga_neta, perdidas_carga }
  }

  descarga(fecha, dia, hora, energia) {
    //Hacemos corrección al estimar que todas las perdidas se producen al cargar.
    const energiaDisponible = this.SOC - this.socMin * this.capacidad // Energía disponible en la batería teniendo en cuenta el SOC mínimo
    const maxDescargaEstaHora = Math.min(this.maxDescargaKw, energiaDisponible) // Limitado por potencia de descarga y energía disponible
    const descarga_neta = Math.min(energia, maxDescargaEstaHora) // Lo que se podría sacar de la batería esta hora teniendo en cuenta las pérdidas de descarga
    const deDescargaBruto = descarga_neta // Math.sqrt(this.eficiencia) Lo que realmente se saca de la batería esta hora teniendo en cuenta las pérdidas de descarga
    const perdidas_descarga = deDescargaBruto - descarga_neta // La parte que se pierde por las ineficiencias de descarga de la batería se considera pérdida de batería
    this.SOC -= deDescargaBruto // Actualizamos el estado de carga}
    this.diaHora[dia][hora] = this.SOC // Guardamos la descarga de la batería hora a hora en el objeto DiaHora de la batería como valor negativo para diferenciarlo de la carga
    //Las perdidas de descarga deberían ser 0 en este metodo
    this.idxTable[dia].fecha = fecha
    return { descarga_neta, perdidas_descarga }
  }
}
export default Bateria
