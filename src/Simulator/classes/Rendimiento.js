import TCB from './TCB'
import * as UTIL from './Utiles'
import DiaHora from './DiaHora'
/** 
 * @class Rendimiento
 * @classdesc clase responsable de obtener la información de PVGIS.
 La matriz diaHora contiene la potencia generada por una placa de 1kWp con las caracteristicas definidas por 
 su latitud, longitud, acimut respecto al sur e inclinacion de las placas con la horizontal
 Adicionalmente completa los datos de la instalación que se han utilizado desde PVGIS.
*/

class Rendimiento extends DiaHora {
  get fechaFin() {
    return this.PVGISfechaFin
  }
  get fechaInicio() {
    return this.PVGISfechaInicio
  }

  constructor(base) {
    super()
    this._name = 'Rendimiento'
    this.PVGISfechaInicio = new Date(1, 1, 1900)
    this.PVGISfechaFin = new Date(1, 1, 1900)

    // Datos provenientes de PVGIS
    this.radiation_db
    this.meteo_db
    this.year_min
    this.year_max
    this.system_loss
    this.technology
    this.inclinacion
    this.inclinacionOptimal
    this.acimut
    this.acimutOptimal
    this.unitarioTotal

    //PVGISresults reflects the result of the PVGIS call
    this.PVGISresults = { status: undefined, error: 'unknown' }

    if (base.requierePVGIS) {
      this.loadPVGISdata(base)
    } else {
      //estamos importando
      //Asignacion propiedades contenidas en el objeto de entrada
      for (const objProp in base) {
        if (typeof base[objProp] !== Object) {
          this[objProp] = base[objProp]
        }
      }
    }
  }

  async loadPVGISdata(base) {
    var addurl
    this.unitarioTotal = 0

    if (base.angulosOptimos) {
      addurl = '&optimalangles=1'
    } else {
      if (base.inclinacionOptima) {
        addurl = '&optimalinclination=1'
      } else {
        if (base.inclinacion === '') base.inclinacion = 0
        let inclinacion = parseFloat(base.inclinacion)
        addurl = '&angle=' + inclinacion
      }
      addurl += '&aspect=' + base.inAcimut
    }

    if (TCB.parametros.perdidasSistema != 0) {
      addurl += '&loss=' + TCB.parametros.perdidasSistema
    }

    addurl += '&pvtechchoice=' + TCB.tipoPanelActivo.tecnologia
    let [lon, lat] = base.lonlatBaseSolar.split(',')

    if (TCB.modoActivo === 'DESARROLLO')
      TCB.basePath = 'http://localhost/SOM/REACT/solidar/src/Simulator/'

    let url =
      TCB.basePath +
      'proxy PVGIS.php?' +
      'idSesion=' +
      TCB.idSesion +
      '&lat=' +
      lat +
      '&lon=' +
      lon +
      addurl

    let respuesta

    UTIL.debugLog('PVGIS url:' + url)
    try {
      respuesta = await fetch(url)
      if (respuesta.status === 200) {
        var PVGISdata = await respuesta.json()
        if (PVGISdata.status !== undefined) {
          this.PVGISresults = {
            status: false,
            error: TCB.i18next.t('Rendimiento.MSG_ERROR_PVGIS_FETCH', {
              err: PVGISdata.status + '(' + PVGISdata.message + ')',
              url: url,
            }),
          }
          return
        }
        var unDia = { fecha: '', valores: Array(24).fill(0) }
        let i = 0
        var hora
        var lastFecha = new Date(1970, 1, 1)

        this.system_loss = PVGISdata.inputs.pv_module.system_loss
        this.technology = PVGISdata.inputs.pv_module.technology
        this.inclinacionOptimal = PVGISdata.inputs.mounting_system.fixed.slope.optimal
        this.inclinacion = PVGISdata.inputs.mounting_system.fixed.slope.value
        this.acimut = PVGISdata.inputs.mounting_system.fixed.azimuth.value
        this.acimutOptimal = PVGISdata.inputs.mounting_system.fixed.azimuth.optimal
        this.radiation_db = PVGISdata.inputs.meteo_data.radiation_db
        this.meteo_db = PVGISdata.inputs.meteo_data.meteo_db
        this.year_min = PVGISdata.inputs.meteo_data.year_min
        this.year_max = PVGISdata.inputs.meteo_data.year_max

        PVGISdata.outputs.hourly.forEach((element) => {
          //Para gestionar fechas en formato dd/mm/aaaa como vienen en el CSV debamos invertir a aaaa/mm/dd en javascript
          let _dia = parseInt(element['time'].substr(6, 2))
          let _mes = parseInt(element['time'].substr(4, 2)) - 1 //_mes es el indice interno gestionado por JS
          let _ano = parseInt(element['time'].substr(0, 4))
          hora = parseInt(element['time'].substr(9, 2)) //hora es el indice en la tabla 0-23 y coincide con datos PVGIS

          let currFecha = new Date(_ano, _mes, _dia, 0, 0)
          if (i == 0) {
            this.PVGISfechaInicio = currFecha
          }

          if (_mes == 1 && _dia == 29) return //Ignoramos el 29/2 de los años bisiestos
          if (currFecha.getTime() == lastFecha.getTime()) {
            unDia.valores[hora] = parseFloat(element['P'])
          } else {
            if (i == 0) {
              unDia = {
                fecha: currFecha,
                valores: Array(24).fill(0),
              }
              unDia.valores[hora] = parseFloat(element['P'])
            } else {
              this.mete(unDia, 'PROMEDIO')
              unDia = {
                fecha: currFecha,
                valores: Array(24).fill(0),
              }
              unDia.valores[hora] = parseFloat(element['P'])
            }
            lastFecha = currFecha
          }
          i++
        })

        this.mete(unDia, 'PROMEDIO')
        for (let i = 0; i < 365; i++) this.unitarioTotal += this.idxTable[i].suma / 1000

        this.PVGISfechaFin = lastFecha
        this.numeroRegistros = i
        this.sintesis()
        base.requierePVGIS = false
        this.PVGISresults = {
          status: true,
          error: '',
        }
        return
      }
    } catch (err) {
      this.PVGISresults = {
        status: false,
        error: TCB.i18next.t('Rendimiento.MSG_ERROR_PVGIS_FETCH', {
          err: err.message,
          url: url,
        }),
      }
      return
    }
  }
}
export default Rendimiento
