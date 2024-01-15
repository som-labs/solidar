import TCB from './TCB.js'
import * as UTIL from './Utiles.js'
import DiaHora from './DiaHora.js'
/** 
 * @class Rendimiento
 * @classdesc clase responsable de obtener la información de PVGIS.
 La matriz diaHora contiene la potencia generada por un placa de 1kWp con las caracteristicas definidas por
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
    //Lamentablemente no se puede llamar una funcion asincrona desde el constructor de clase por lo que se debe llamar desde la instancia ya creada.
    //En este caso despues de crear un nuevo rendimiento se debe llamar await loadPVGISdata().

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

    if (base.requierePVGIS) {
      this.rendimientoCreado = false
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
        if (base.inclinacionPaneles === '') base.inclinacionPaneles = 0
        if (base.inclinacionTejado === '') base.inclinacionTejado = 0
        let inclinacion =
          parseFloat(base.inclinacionPaneles) + parseFloat(base.inclinacionTejado)
        addurl = '&angle=' + inclinacion
      }
      if (base.inAcimut === '') {
        base.inAcimut = 0
      }
      addurl += '&aspect=' + base.inAcimut
    }

    if (TCB.parametros.perdidasSistema != 0) {
      addurl += '&loss=' + TCB.parametros.perdidasSistema
    }

    addurl += '&pvtechchoice=' + TCB.parametros.tecnologia
    let [lon, lat] = base.lonlatBaseSolar.split(',')

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

    UTIL.debugLog('PVGIS url:' + url)

    try {
      const respuesta = await fetch(url)
      if (respuesta.status === 200) {
        var PVGISdata = await respuesta.json()
        if (PVGISdata.status !== undefined) {
          alert(TCB.i18next.t('rendimiento_MSG_errorFetch') + PVGISdata.message)
          return false
        }
        /*         var unDia = { dia: 0, mes: 0, valores: Array(24).fill(0) }; */
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
            //            this.horaInicio = hora;
          }

          if (_mes == 1 && _dia == 29) return //Ignoramos el 29/2 de los años bisiestos
          if (currFecha.getTime() == lastFecha.getTime()) {
            unDia.valores[hora] = parseFloat(element['P'])
          } else {
            if (i == 0) {
              unDia = {
                fecha: currFecha,
                /*                 dia: currFecha.getDate(),
                mes: currFecha.getMonth(), */
                valores: Array(24).fill(0),
              }
              unDia.valores[hora] = parseFloat(element['P'])
            } else {
              this.mete(unDia, 'PROMEDIO')
              unDia = {
                fecha: currFecha,
                /*                 dia: currFecha.getDate(),
                mes: currFecha.getMonth(), */
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
        base.rendimientoCreado = true
        base.requierePVGIS = false

        return true
      }
    } catch (err) {
      alert(TCB.i18next.t('rendimiento_MSG_errorFetch') + err.message)
      console.log('Error llamada PVGIS con :' + url)
      base.rendimientoCreado = 'error'
      return false
    }
  }
}
export default Rendimiento
