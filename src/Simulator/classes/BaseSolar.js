import TCB from './TCB'
import * as UTIL from './Utiles'
import Rendimiento from './Rendimiento'
/**
 * @class BaseSolar
 * @classdesc Clase para definir las bases solares en las que se instalarán las fuentes de producción
 */
class BaseSolar {
  #inclinacion

  /**
   * @constructor
   * @param {Object} area Descripción de la base donde se instalarán los paneles
   */
  constructor(area) {
    Object.defineProperties(this, {
      // potenciaMaxima: {
      //   enumerable: true,
      //   set(valor) {}, //Esta aqui para evitar error al intentar set desde update
      //   get() {
      //     return (this.columnas * this.filas * this.tipoPanelActivo.potencia) / 1000
      //   },
      // },
      anchoReal: {
        enumerable: true,
        set(valor) {}, //Esta aqui para evitar error al intentar set desde update
        get() {
          //El ancho corregido por la inclinacion del tejado en caso inclinado
          if (this.roofType === 'Inclinado')
            return this.ancho / Math.cos((this.inclinacion * Math.PI) / 180)
          else return this.ancho
        },
      },
      areaReal: {
        enumerable: true,
        set(valor) {}, //Esta aqui para evitar error al intentar set desde update
        get() {
          //El ancho corregido por la inclinacion del tejado en caso inclinado
          if (this.roofType === 'Inclinado')
            return this.area / Math.cos((this.inclinacion * Math.PI) / 180)
          else return this.area
        },
      },
      panelesMaximo: {
        enumerable: true,
        set(valor) {}, //Esta aqui para evitar error al intentar set desde update
        get() {
          return this.filas * this.columnas
        },
      },
    })

    this._name = 'BaseSolar'
    this.idBaseSolar = area.idBaseSolar
    this.nombreBaseSolar = area.nombreBaseSolar
    this.lonlatBaseSolar = area.lonlatBaseSolar

    //Dimensiones. El ancho es la dirección perpendicular a la cumbrera
    this.roofType = area.roofType // configuracion en el tejado
    //                                inclinado => tejado inclinado
    //                                horizontal => paneles inclinados
    this.cumbrera = area.cumbrera //Longitud de la base en la parte alta cuando roofType === inclinado
    this.ancho = area.ancho //Longitud de la dimension transversal a la cumbrera medida en el mapa
    this.area = area.area //Superficie plana sobre el mapa
    //Configuracion de los paneles
    this.filas // = 0
    this.columnas // = 0
    this.modoInstalacion

    //Angulos optimos de la configuracion
    this.angulosOptimos = area.angulosOptimos
    this.inclinacionOptima = area.inclinacionOptima

    //La inclinacion real se gestiona por el setter ya que su cambio implica cambio de areas
    //CUIDADO: roofType debe estar predefinido para que la configuración de paneles sea correcto.
    this.inclinacion = area.inclinacion
    //BaseSolar.configuraInclinacion(this)

    this.inAcimut = area.inAcimut

    this.rendimientoCreado = false //true si ya tiene cargados los datos de PVGIS y se ha calculado su rendimiento
    this.requierePVGIS = true //Flag para controlar si es necesario llamar a PVGIS o no despues de cambios

    this.rendimiento = {}
    this.instalacion = {}
    this.produccion = {}

    // Si hay una base como argumento de entrada se copian todas las propiedades a la nueva base
    this.updateBase(area)
    UTIL.debugLog('Nueva base solar creada', this)
  }
  /**
   * Crea el objeto Rendimiento de una BaseSolar
   * @see Rendimiento
   */
  async cargaRendimiento() {
    // if (this.rendimientoCreado) {
    //   this.rendimiento = {}
    //   this.rendimientoCreado = false
    // }
    this.rendimiento = new Rendimiento(this)
  }

  static configuraPaneles(area, tipoPanelActivo) {
    let hColumnas
    let hFilas
    let vColumnas
    let vFilas
    let hGap
    let vGap
    let config = {}

    const { roofType, cumbrera, anchoReal, inclinacion, lonlatBaseSolar } = area

    if (roofType === 'Inclinado') {
      /* Modificación 10/12/24 en caso de ser inclinado quitamos el margen del calculo de area disponible
      // Opcion largo panel paralelo a cumbrera
      // hColumnas = Math.trunc(
      //   (cumbrera - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.largo,
      // )
      // hFilas = Math.trunc(
      //   (anchoReal - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.ancho,
      // )

      // // Opcion largo panel perpendicular a cumbrera
      // vColumnas = Math.trunc(
      //   (cumbrera - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.ancho,
      // )
      // vFilas = Math.trunc(
      //   (anchoReal - 2 * TCB.parametros.margen) / TCB.tipoPanelActivo.largo,
      // )
    */

      // Opcion largo panel paralelo a cumbrera
      hColumnas = Math.trunc(cumbrera / tipoPanelActivo.largo)
      hFilas = Math.trunc(anchoReal / tipoPanelActivo.ancho)
      // Opcion largo panel perpendicular a cumbrera
      vColumnas = Math.trunc(cumbrera / tipoPanelActivo.ancho)
      vFilas = Math.trunc(anchoReal / tipoPanelActivo.largo)

      // Elegimos la configuracion que nos permite mas paneles
    } else {
      //Caso tejado horizontal u optimo
      const latitud = parseFloat(lonlatBaseSolar.split(',')[1])
      // Opcion largo panel paralelo a la cumbrera
      hGap =
        tipoPanelActivo.ancho * Math.cos((inclinacion * Math.PI) / 180) +
        (tipoPanelActivo.ancho * Math.sin((inclinacion * Math.PI) / 180)) /
          Math.tan(((61 - latitud) * Math.PI) / 180)
      hColumnas = Math.trunc(
        (cumbrera - 2 * TCB.parametros.margen) / tipoPanelActivo.largo,
      )
      hFilas = Math.trunc((anchoReal - 2 * TCB.parametros.margen) / hGap)
      //En el caso de una sola fila podría suceder que la inclinación indique un ancho entre filas superior al ancho pero igualmente entra un panel
      hFilas = hFilas === 0 ? 1 : hFilas

      //console.log('HORIZONTAL', hGap, hColumnas, hFilas)
      // Opcion largo panel perpendicular a cumpbrera
      vGap =
        tipoPanelActivo.largo * Math.cos((inclinacion * Math.PI) / 180) +
        (tipoPanelActivo.largo * Math.sin((inclinacion * Math.PI) / 180)) /
          Math.tan(((61 - latitud) * Math.PI) / 180)
      vColumnas = Math.trunc(
        (cumbrera - 2 * TCB.parametros.margen) / tipoPanelActivo.ancho,
      )
      vFilas = Math.trunc((anchoReal - 2 * TCB.parametros.margen) / vGap)
      //En el caso de una sola fila podría suceder que la inclinación indique un ancho entre filas superior al ancho pero igualmente entra un panel
      vFilas = vFilas === 0 ? 1 : vFilas

      //console.log('VERTICAL', vGap, vColumnas, vFilas)
    }

    if (hColumnas * hFilas > vColumnas * vFilas) {
      config = { columnas: hColumnas, filas: hFilas, modoInstalacion: 'Horizontal' }
    } else {
      config = { columnas: vColumnas, filas: vFilas, modoInstalacion: 'Vertical' }
    }
    //console.log('Configura paneles retorna', config)
    return config
  }

  updateBase(newData) {
    //Asignacion propiedades contenidas en el objeto de entrada salvo que sean un objeto
    for (const objProp in newData) {
      if (typeof newData[objProp] !== Object) {
        // Si la propiedad es un objeto no lo copiamos

        //console.log(objProp, Object.getOwnPropertyDescriptor(this, objProp))
        //if (Object.getOwnPropertyDescriptor(this, objProp).writable !== undefined)
        if (objProp === 'fecha' && typeof newData[objProp] === 'string')
          // Si la propiedad es modificable
          // Si es una fecha en modo string la convertimos a Date
          newData[objProp] = new Date(newData[objProp])
        else {
          //console.log(objProp, newData[objProp])
          this[objProp] = newData[objProp]
        }
      }
    }
  }
}
export default BaseSolar
