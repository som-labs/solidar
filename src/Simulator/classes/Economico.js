import TCB from './TCB'
import * as UTIL from './Utiles'
import Instalacion from './Instalacion'
/**
 * @class Economico
 * @classdesc Clase representa las condiciones economico financieras de la configuración global o de cada Finca individualmente
 */

//Numero maximo de años esperando cashflow positivo
const maxNumberCashFlow = 50

class Economico {
  constructor() {
    this._name = 'Economico'
    // Inicializa la tabla indice de acceso
    this.idxTable = Array(365)
    for (let i = 0; i < 365; i++) {
      let tmp = UTIL.fechaDesdeIndice(i)
      this.idxTable[i] = {
        dia: tmp[0],
        mes: tmp[1],
        consumoOriginal: 0,
        consumoConPlacas: 0,
        compensado: 0,
        ahorradoAutoconsumo: 0,
        diaSemana: 0,
      }
    }

    //Este array contiene lo pagado por consumo, lo cobrado por compensacion y el balance neto sin tener en cuenta posibles limites

    this.diaHoraPrecioOriginal = Array.from(Array(365), () => new Array(24).fill(0))
    this.diaHoraPrecioConPaneles = Array.from(Array(365), () => new Array(24).fill(0))
    this.diaHoraTarifaOriginal = Array.from(Array(365), () => new Array(24).fill(0))
    this.diaHoraTarifaConPaneles = Array.from(Array(365), () => new Array(24).fill(0))
    this.impuestoTotal = TCB.parametros.IVAEnergia + TCB.parametros.impuestoElectrico
    const coefImpuesto = (100 + this.impuestoTotal) / 100
    this.gastoSinPlacasAnual = 0
    this.gastoConPlacasAnual = 0
    this.consumoOriginalMensual = new Array(12).fill(0)
    this.consumoConPlacasMensual = new Array(12).fill(0)
    this.consumoConPlacasMensualCorregido = new Array(12).fill(0)
    this.compensadoMensual = new Array(12).fill(0)
    this.compensadoMensualCorregido = new Array(12).fill(0)

    this.huchaSaldo = new Array(12).fill(0)
    this.extraccionHucha = new Array(12).fill(0)

    this.ahorradoAutoconsumoMes = new Array(12).fill(0)
    this.perdidaMes = new Array(12).fill(0)
    this.ahorroAnual = 0
    this.TIRProyecto = 0
    this.VANProyecto = 0
    this.interesVAN = TCB.parametros.interesVAN

    //A efectos de fechas (fines de semana) por ahora usamos el TipoConsumo[0]
    let _tc = TCB.TipoConsumo[0]
    if (TCB.tipoTarifa === '2.0TD') TCB.consumo.periodo = new Array(3).fill(0)
    else TCB.consumo.periodo = new Array(6).fill(0)

    //Vamos a calcular el precio de la energia cada dia
    for (let dia = 0; dia < 365; dia++) {
      this.idxTable[dia].consumoOriginal = 0
      this.idxTable[dia].consumoConPlacas = 0
      this.idxTable[dia].ahorradoAutoconsumo = 0
      this.idxTable[dia].compensado = 0

      //LONGTERM: cambiar a calcular la fecha desde dia y no idxTable, solo debemos decidir que año se usa para saber sabados y domingos
      if (_tc.idxTable[dia].fecha !== '') {
        let diaSemana = _tc.idxTable[dia].fecha.getDay()
        let idxPeriodo
        //Vamos a calcular el precio de la energia cada hora
        for (let hora = 0; hora < 24; hora++) {
          if (TCB.tipoTarifa === '2.0TD') {
            if (diaSemana == 0 || diaSemana == 6) {
              //es un fin de semana por lo que tarifa P3 todo el dia
              this.diaHoraTarifaOriginal[dia][hora] = TCB.tarifaActiva.precios[3]
              idxPeriodo = 3
            } else {
              this.diaHoraTarifaOriginal[dia][hora] =
                TCB.tarifaActiva.precios[TCB.tarifaActiva.horas[hora]]
              idxPeriodo = TCB.tarifaActiva.horas[hora]
            }
          } else {
            if (diaSemana == 0 || diaSemana == 6) {
              this.diaHoraTarifaOriginal[dia][hora] = TCB.tarifaActiva.precios[6] //es un fin de semana por lo que tarifa P6 todo el dia
              idxPeriodo = 6
            } else {
              this.diaHoraTarifaOriginal[dia][hora] =
                TCB.tarifaActiva.precios[
                  [TCB.tarifaActiva.horas[this.idxTable[dia].mes][hora]]
                ]
              idxPeriodo = TCB.tarifaActiva.horas[this.idxTable[dia].mes][hora]
            }
          }

          // La tarifa original es -> this.diaHoraTarifaOriginal[dia][hora]
          this.diaHoraPrecioOriginal[dia][hora] =
            TCB.consumo.diaHora[dia][hora] *
            this.diaHoraTarifaOriginal[dia][hora] *
            coefImpuesto

          // Store energia consumed by fee period
          TCB.consumo.periodo[idxPeriodo - 1] += TCB.consumo.diaHora[dia][hora]
          if (idxPeriodo > 6) console.log(dia, hora)

          // Determinamos el precio de esa hora (la tarifa) segun sea el balance es decir teniendo en cuanta los paneles. Si es negativo compensa
          if (TCB.balance.diaHora[dia][hora] < 0) {
            //Aportamos energia a la red de distribución
            this.diaHoraTarifaConPaneles[dia][hora] = TCB.tarifaActiva.precios[0] //Es el precio de compensacion
            this.idxTable[dia].ahorradoAutoconsumo +=
              this.diaHoraPrecioOriginal[dia][hora] //Ahorro del gasto original

            this.diaHoraPrecioConPaneles[dia][hora] +=
              TCB.balance.diaHora[dia][hora] *
              this.diaHoraTarifaConPaneles[dia][hora] *
              coefImpuesto

            this.idxTable[dia].compensado += this.diaHoraPrecioConPaneles[dia][hora]
          } else {
            //Demandamos energia de la red de distribucion
            this.diaHoraTarifaConPaneles[dia][hora] =
              this.diaHoraTarifaOriginal[dia][hora]
            this.diaHoraPrecioConPaneles[dia][hora] =
              TCB.balance.diaHora[dia][hora] *
              this.diaHoraTarifaConPaneles[dia][hora] *
              coefImpuesto
            this.idxTable[dia].ahorradoAutoconsumo +=
              ((TCB.produccion.diaHora[dia][hora] * 100) / 100) *
              this.diaHoraTarifaOriginal[dia][hora] *
              coefImpuesto
          }
          this.idxTable[dia].consumoOriginal += this.diaHoraPrecioOriginal[dia][hora]
          this.idxTable[dia].consumoConPlacas += this.diaHoraPrecioConPaneles[dia][hora]
        }
      }
    }

    this.consumoOriginalMensual = this.resumenMensual('consumoOriginal')
    this.consumoConPlacasMensual = this.resumenMensual('consumoConPlacas')
    this.compensadoMensual = this.resumenMensual('compensado')
    this.ahorradoAutoconsumoMes = this.resumenMensual('ahorradoAutoconsumo')

    //calculate installation cost
    this.precioInstalacion = Instalacion.getInstallationPrice(
      TCB.produccion.potenciaTotalInstalada,
    )
    this.precioInstalacionCorregido = this.precioInstalacion

    //Se debe corregir que si la comercializadora limita economicamente la compensacion al consumo o compensar mediante bateria virtual

    this.correccionExcedentes(TCB.coefHucha, TCB.cuotaHucha)
    this.calculoFinanciero(100, 100)
  }

  /** Función para la gestion economica de excedentes de cada mes
   *
   * @param {*} coefHucha Porcentaje de excedentes que se transfieren a la hucha
   * @param {*} cuotaHucha Cuota mensual sin IVA que cobra la comercializadora por la gestión de la hucha.
   */
  correccionExcedentes(coefHucha, cuotaHucha) {
    const _cuotaHucha = (cuotaHucha * (100 + TCB.parametros.IVAInstalacion)) / 100

    for (let i = 0; i < 12; i++) {
      const consumoConCuota = this.consumoConPlacasMensual[i] + _cuotaHucha
      if (consumoConCuota < 0) {
        //el excedente supera lo que hay que pagar
        this.perdidaMes[i] = -consumoConCuota //en principio no se compensa y es perdida
        this.compensadoMensualCorregido[i] =
          this.compensadoMensual[i] + this.perdidaMes[i] + _cuotaHucha

        //Gestion de la batería virtual
        let huchaMes = (this.perdidaMes[i] * coefHucha) / 100 //Las perdidas pasan a la hucha corregidas por coefHucha

        if (i === 0) {
          this.huchaSaldo[i] = huchaMes //Se asume que el saldo de enero es cero.
        } else {
          this.huchaSaldo[i] = this.huchaSaldo[i - 1] + huchaMes
        }
        this.perdidaMes[i] -= huchaMes //El resto del coefHucha se asume como perdidas
      } else {
        this.perdidaMes[i] = 0
        this.compensadoMensualCorregido[i] = this.compensadoMensual[i] + _cuotaHucha

        ////La cuota por gestión de la hucha es un gasto fijo mensual independientemente del balance
        this.consumoConPlacasMensualCorregido[i] = consumoConCuota

        if (i > 0) {
          //i === 0 => enero no hay saldo en la hucha
          if (this.huchaSaldo[i - 1] <= this.consumoConPlacasMensualCorregido[i]) {
            //Saldo insuficiente
            this.extraccionHucha[i] = this.huchaSaldo[i - 1]
            this.consumoConPlacasMensualCorregido[i] -= this.extraccionHucha[i]
          } else {
            //Saldo suficiente
            this.extraccionHucha[i] = this.consumoConPlacasMensualCorregido[i]
            this.consumoConPlacasMensualCorregido[i] = 0
          }
          this.huchaSaldo[i] = this.huchaSaldo[i - 1] - this.extraccionHucha[i]
        }
      }
    }
    this.gastoSinPlacasAnual = UTIL.suma(this.consumoOriginalMensual)
    this.gastoConPlacasAnual = UTIL.suma(this.consumoConPlacasMensualCorregido)
  }

  /**
   * Suma el valor de los 365 dias de la columna prop de idxTabla.
   * Es la misma que DiaHora pero Economico no hereda DiaHora por eso hay que redefinirla.
   * @param {String} prop Propiedad a sumar
   * @returns {Number} Suma de los 365 valores de la propiedad prop
   */
  resumenMensual(prop) {
    let _consMes = new Array(12).fill(0)
    for (let i = 0; i < 365; i++) {
      _consMes[this.idxTable[i].mes] += this.idxTable[i][prop]
    }
    return _consMes
  }

  /**
   * Cálcula el resultado financiero del proyecto de instalación de los paneles
   * Tiene en cuenta las posibles bonificaciones de IBI
   * Tiene en cuenta las posibles subvenciones de la UE o no
   * Cálcula la tabla de amortización de la inversion con un mínimo de 10 años o hasta el año siguiente al que se acaba la bonificación del IBI
   * @param {number} coefEnergia Porcentaje de la inversión total que correponde a la Finca
   * @param {number} coefInversion Porcentaje del la producción total de energia que corresponde a la Finca
   */
  calculoFinanciero(coefEnergia, coefInversion) {
    //Es un participe que invierte pero no recibe energia. ¿existe?
    if (coefEnergia == 0) {
      this.VANProyecto = 'N/A'
      this.TIRProyecto = 'N/A'
      return
    }

    this.ahorroAnual =
      UTIL.suma(this.consumoOriginalMensual) -
      UTIL.suma(this.consumoConPlacasMensualCorregido)
    //Algunas cuotas de la hucha pueden producir ahorros negativos que no tienen sentido
    if (this.ahorroAnual <= 0) {
      UTIL.debugLog('Cuotas hucha generan ahorro negativo')
      return
    }

    //Datos de la bonificación del IBI
    const valorSubvencionIBI = TCB.valorSubvencionIBI
    const tiempoSubvencionIBI = TCB.tiempoSubvencionIBI
    const porcientoSubvencionIBI = TCB.porcientoSubvencionIBI

    // Calculo de la subvención
    var valorSubvencion
    var porcientoSubvencion

    valorSubvencion =
      TCB.valorSubvencion !== 0
        ? TCB.valorSubvencion
        : (TCB.porcientoSubvencion / 100) * this.precioInstalacionCorregido

    //porcientoSubvencion is used when given a valorSubvencion has to calculate it for different panels configuration
    porcientoSubvencion = (valorSubvencion / this.precioInstalacionCorregido) * 100

    /* Module to compute EU next Generation conditions
    if (
      (TCB.consumo.totalAnual / TCB.produccion.totalAnual) * 100 < 80 ||
      tipoSubvencionEU === 'Sin'
    ) {
      valorSubvencionEU = 0
    } else {
      if (TCB.produccion.potenciaTotalInstalada <= 10) {
        valorSubvencionEU =
          (TCB.subvencionEU[tipoSubvencionEU]['<=10kWp'] *
            TCB.produccion.potenciaTotalInstalada *
            coefInversion) /
          100
      } else {
        valorSubvencionEU =
          (TCB.subvencionEU[tipoSubvencionEU]['>10kWp'] *
            TCB.produccion.potenciaTotalInstalada *
            coefInversion) /
          100
      }
    }
    */

    //Preparación del cashflow
    this.periodoAmortizacion = 0
    let cuotaPeriodo = [] //Es el resultado neto negativo de inversión o positivo de ganancia de cada año
    this.cashFlow = [] //Es un objeto unFlow por cada año
    let cuota //Resultado neto del año

    let i = 1
    let unFlow = {}
    //InversionReal includes IVA
    const inversionReal = -this.precioInstalacionCorregido * (coefInversion / 100)

    unFlow = {
      ano: i,
      ahorro: this.ahorroAnual,
      previo: 0,
      inversion: inversionReal,
      subvencion: 0,
      IBI: 0,
      pendiente: inversionReal + this.ahorroAnual,
    }
    cuota = unFlow.inversion + unFlow.ahorro
    cuotaPeriodo.push(cuota)
    this.cashFlow.push(unFlow)
    this.periodoAmortizacion = null
    // Se genera la tabla hasta alcanzar el retorno de la inversión o la finalización de la subvención de IBI
    while (unFlow.ano < maxNumberCashFlow) {
      //Puede ser que la cuota de la hucha haga que el ahorro sea negativo. En ese caso mostramos los resultados de 10 años
      let exitCondition = true

      if (unFlow.pendiente < 0) {
        exitCondition = false
      } else {
        if (unFlow.ano < this.periodoAmortizacion + 4) {
          //Incluimos hasta 4 años despues del breakeven para el calculo financiero
          exitCondition = false
        } else {
          exitCondition = unFlow.ano < parseInt(tiempoSubvencionIBI) + 1 ? false : true
        }
      }

      if (exitCondition) break
      let lastPendiente = unFlow.pendiente

      unFlow = {}
      unFlow.ano = ++i
      unFlow.ahorro = this.ahorroAnual
      unFlow.previo = lastPendiente
      unFlow.inversion = 0 //LONGTERM: Cuidado probablemente en caso de prestamo cambie
      if (i == 2) {
        //La subvención se cobra con suerte despues de un año
        //unFlow.subvencion = (valorSubvencion * coefInversion) / 100
        unFlow.subvencion =
          (((this.precioInstalacionCorregido * coefInversion) / 100) *
            porcientoSubvencion) /
          100
      } else {
        unFlow.subvencion = 0
      }

      if (i - 1 <= tiempoSubvencionIBI) {
        unFlow.IBI = (valorSubvencionIBI * porcientoSubvencionIBI) / 100
      } else {
        unFlow.IBI = 0
      }
      cuota = unFlow.ahorro + unFlow.IBI + unFlow.subvencion
      cuotaPeriodo.push(cuota)
      unFlow.pendiente = unFlow.previo + cuota
      this.cashFlow.push(unFlow)

      this.periodoAmortizacion =
        unFlow.pendiente > 0 && !this.periodoAmortizacion
          ? unFlow.ano
          : this.periodoAmortizacion
    }

    if (this.periodoAmortizacion > 0) {
      if (cuotaPeriodo[0] < 0) {
        this.VANProyecto = this.VAN(this.interesVAN, cuotaPeriodo)
        this.TIRProyecto = this.TIR(this.interesVAN * 2, cuotaPeriodo)
      } else {
        //Estamos en una finca añadida que no tiene participación en la inversión. No tiene sentido el cashflow
        this.VANProyecto = 'N/A'
        this.TIRProyecto = 'N/A'
      }
    } else {
      this.periodoAmortizacion = -maxNumberCashFlow
      alert(
        'Probable número excesivo de paneles en la simulación -> retorno > ' +
          maxNumberCashFlow +
          ' años',
      )
    }

    if (coefInversion === 100) {
      //Vamos aguardar estas variables en TCB para el calculo económico global
      TCB.tiempoSubvencionIBI = tiempoSubvencionIBI
      TCB.valorSubvencionIBI = valorSubvencionIBI
      TCB.porcientoSubvencionIBI = porcientoSubvencionIBI
      TCB.valorSubvencion = valorSubvencion
      //TCB.tipoSubvencion = tipoSubvencion //Only for EU Next generation
    }

    this.tiempoSubvencionIBI = tiempoSubvencionIBI
    this.valorSubvencionIBI = valorSubvencionIBI
    this.porcientoSubvencionIBI = porcientoSubvencionIBI
    this.valorSubvencion = valorSubvencion
    //this.tipoSubvencion = tipoSubvencionEU //Only for EU Next generation
  }

  /**
   * Cálculo de la Tasa Interna de Retorno (TIR)
   * @param {number} initRate Tasa de interes de referencia
   * @param {Array<number>} args Cuotas de cada periodo
   * @returns {number} TIR
   */
  TIR(initRate, args) {
    var depth = 30
    var numberOfTries = 1

    var positive, negative
    args.forEach(function (value) {
      if (value > 0) positive = true
      if (value < 0) negative = true
    })
    if (!positive || !negative) throw new Error('TIR necesita al menos un valor negativo')

    let rate = initRate
    let delta = 1
    let flag = false
    while (numberOfTries < depth) {
      let _van = this.VAN(rate, args)
      if (_van < 0) {
        //delta = delta / 2;
        flag = true
        rate = rate - delta
        if (rate < 0) {
          alert(
            'Probable número excesivo de paneles -> mucha inversión -> retorno > 30 años',
          )
          numberOfTries = depth
        }
      } else {
        flag ? (delta /= 2) : (delta *= 2)
        rate = rate + delta
      }
      numberOfTries++
    }
    return rate
  }

  /**
   * Cálculo del Valor Actual Neto (VAN)
   * @param {number} initRate Tasa de interes de referencia
   * @param {Array<number>} units Cuotas de cada periodo
   * @returns {number} VAN
   */
  VAN(rate, units) {
    let _rate = rate / 100
    let _npv = units[0]
    for (var i = 1; i < units.length; i++) {
      _npv += units[i] / Math.pow(1 + _rate, i)
    }
    return Math.round(_npv * 100) / 100
  }
}
export default Economico
