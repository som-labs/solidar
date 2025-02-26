import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

// MUI objects
import Container from '@mui/material/Container'

// REACT Solidar Global Components
import AppFrame from '../components/AppFrame'
import Wizard from '../components/Wizard'
import { useAlert } from '../components/AlertProvider.jsx'

// REACT Solidar local Components
import LocationStep from './Location/Location'
import ConsumptionStep from './Consumption/Consumption'
import UnitsStep from './Units/Units'
import EnergyAllocationStep from './EnergyAllocation/EnergyAllocation'
import EnergyBalanceStep from './EnergyBalance/EnergyBalance'
import EconomicBalanceStep from './EconomicBalance/EconomicBalance'
import EconomicAllocationStep from './EconomicAllocation/EconomicAllocation'
import SummarySOMStep from './Summary/SOM/Summary'

// REACT Solidar contexts
import { ConsumptionContext } from './ConsumptionContext'
import { BasesContext } from './BasesContext'
import { EconomicContext } from './EconomicContext'
import { GlobalContext } from './GlobalContext.jsx'
import { EnergyContext } from './EnergyContext.jsx'

// Solidar objects
import TCB from './classes/TCB'
import * as UTIL from './classes/Utiles'
import Consumo from './classes/Consumo.js'
import Economico from './classes/Economico.js'
import Balance from './classes/Balance.js'
import BaseSolar from './classes/BaseSolar.js'
import { optimizador } from './classes/optimizador.js'

export default function Page() {
  const { t } = useTranslation()
  const { SLDRAlert } = useAlert()
  const { validaBases, bases, tipoPanelActivo, modifyBase } = useContext(BasesContext)

  const {
    newBases,
    setNewBases,
    newPanelActivo,
    setNewPanelActivo,
    newTiposConsumo,
    newUnits,
    setNewUnits,
    setNewTiposConsumo,
    newEnergyBalance,
    setNewEnergyBalance,
    importando,
  } = useContext(GlobalContext)

  const {
    validaTipoConsumo,
    validaUnits,
    repartoValido,
    fincas,
    zonasComunes,
    tiposConsumo,
    getConsumoTotal,
    tarifas,
  } = useContext(ConsumptionContext)

  const { economicoGlobal, setEconomicoGlobal, setNewEconomicBalance, costeZCenFinca } =
    useContext(EconomicContext)

  const {
    consumoGlobal,
    setConsumoGlobal,
    calculaResultados,
    produccionGlobal,
    balanceGlobal,
    totalPaneles,
    setTotalPaneles,
  } = useContext(EnergyContext)

  const GetURLArguments = () => {
    const [a] = useSearchParams()
    TCB.URLParameters = a

    //Si recibimos argumento debug en la url ejecutamos con debug
    TCB.debug = UTIL.getParametrosEntrada('debug')
    UTIL.debugLog('GetURLArguments Debug activo: ' + TCB.debug)

    //Definimos el modo de trabajo [INDIVIDUAL / COLECTIVO]
    let _modo = UTIL.getParametrosEntrada('modo')
    if (_modo) {
      _modo = _modo.toUpperCase()
      if (TCB.modos.includes(_modo)) TCB.modoActivo = _modo
    }
    UTIL.debugLog('GetURLArguments modo de trabajo: ' + TCB.modoActivo)

    //Definimos el estilo. Por ahora puede ser SOM o GL. Cambia la pestaña de Resumen
    let _estilo = UTIL.getParametrosEntrada('estilo')
    if (_estilo) {
      _estilo = _estilo.toUpperCase()
      if (TCB.estilos.includes(_estilo)) TCB.estiloActivo = _estilo
    }
    UTIL.debugLog('GetURLArguments estilo de aplicacion: ' + TCB.estiloActivo)

    //Definimos si es un usuario especial
    TCB.user = UTIL.getParametrosEntrada('user')
    UTIL.debugLog('GetURLArguments usuario de la aplicacion: ' + TCB.user)
  }

  let results

  async function validaLocationStep() {
    results = await validaBases()
    if (!results.status) SLDRAlert('VALIDACION', results.error, 'Error')
    return results.status
  }

  async function validaConsumptionStep() {
    results = validaTipoConsumo()
    if (!results.status) {
      SLDRAlert('VALIDACION', results.error, 'Error')
      return false
    }

    if (TCB.modoActivo === 'INDIVIDUAL') return await PreparaEnergyBalance()
    else return true
  }

  async function PreparaEnergyBalance() {
    console.log('Preparando energy balance condiciones:', {
      newTiposConsumo: newTiposConsumo,
      newBases: newBases,
      newPanelActivo: newPanelActivo,
      newUnits: newUnits,
      importando: importando,
      totalPaneles: totalPaneles,
    })
    let newConsumo

    /* Condiciones bajo las cuales hay que hacer un recalculo del balanceEnergetico */
    if (newTiposConsumo || newUnits || importando) {
      /* Si han cambiado los tipos de consumo o estamos importando hay que reconstruir el consumoGlobal */

      newConsumo = new Consumo(tiposConsumo, fincas, zonasComunes)
      setConsumoGlobal(newConsumo)
      /* Calculamos el coeficiente del consumo de cada finca sobre el total */
      if (TCB.modoActivo !== 'INDIVIDUAL') {
        for (const f of fincas) {
          f.coefConsumo = getConsumoTotal(f.nombreTipoConsumo) / newConsumo.totalAnual
        }
      }
      UTIL.debugLog('PreparaEnergyBalance - Nuevo consumo global creado', newConsumo)
      setNewTiposConsumo(false)
    } else {
      newConsumo = consumoGlobal
    }

    if (newBases) {
      /* Si hay nuevos datos de bases. Comprobamos que estan cargados todos los rendimientos. Es el flag base.rendimiento.PVGISresults.status. True si todo OK, undefined si pendiente, False si error en PVGIS */
      let waitLoop = 0
      for (let base of bases) {
        var sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
        if (base.rendimiento.PVGISresults.status === undefined) {
          //Has to wait
          document.body.style.cursor = 'wait'
          SLDRAlert(
            'PVGIS',
            'Esperando datos PVGIS para base: ' + base.nombreBaseSolar,
            'Warning',
          )
          while (
            base.rendimiento.PVGISresults.status === undefined &&
            waitLoop++ < TCB.tiempoEsperaPVGIS
          ) {
            console.log(waitLoop + ' seg. (max: ' + TCB.tiempoEsperaPVGIS + ')')
            await sleep(1000)
          }
        }
        document.body.style.cursor = 'default'
        if (!base.rendimiento.PVGISresults.status) return base.rendimiento.PVGISresults

        if (waitLoop >= TCB.tiempoEsperaPVGIS) {
          SLDRAlert(
            'PVGIS',
            'Tiempo de respuesta excesivo en la llamada a PVGIS',
            'Error',
          )
          // PENDIENTE: reemplazar alert con confimr de espera. Como usar SLDRAlert desde aqui
          return {
            status: false,
            error: 'Tiempo de respuesta excesivo en la llamada a PVGIS',
          }
        }
        // PENDIENTE: limpiar alert de espera
        /* Si la base tiene configurada la inclinación óptima, la establecemos y volvemos a reconfigurar los paneles */
        if (base.inclinacionOptima) {
          base.inclinacion = base.rendimiento.inclinacion
          BaseSolar.configuraPaneles(base)
        }
      }
    }

    UTIL.debugLog('PreparaEnergyBalance - Todas las bases listas llama optimizador')
    // Se ejecuta el optimizador para determinar la configuración inicial propuesta

    if (newTiposConsumo || newBases || newPanelActivo || newUnits || totalPaneles === 0) {
      console.log('Optimizando....')
      let pendiente = optimizador(bases, newConsumo, tipoPanelActivo.potencia, modifyBase)
      if (pendiente > 0) {
        UTIL.debugLog(
          'PreparaEnergyBalance - No hay superficie suficiente. Falta: ' + pendiente,
        )
        //PENDIENTE: ver como procesamos este aviso
        SLDRAlert(
          'AREA LIMITADA',
          'No es posible instalar los paneles necesarios.\nPendiente: ' +
            UTIL.formatoValor('energia', pendiente) +
            '\nContinuamos con el máximo número de paneles posible',
          'Warning',
        )
      }
      setTotalPaneles(
        bases.reduce((a, b) => {
          return a + b.instalacion.paneles
        }, 0),
      )
      setNewEnergyBalance(true)
      calculaResultados(newConsumo)
    } else if (importando) calculaResultados(newConsumo)

    setNewTiposConsumo(false)
    setNewBases(false)
    setNewPanelActivo(false)
    setNewUnits(false)
    return results.status
  }

  async function PreparaEconomicBalance() {
    let cursorOriginal = document.body.style.cursor
    document.body.style.cursor = 'progress'
    //When importing first time will not compute Economico next yes

    if (!importando || !economicoGlobal || newEnergyBalance) {
      let newEconomico = new Economico(
        null,
        tarifas,
        tiposConsumo,
        consumoGlobal,
        balanceGlobal,
        produccionGlobal,
        economicoGlobal,
        zonasComunes,
        costeZCenFinca,
      )

      setEconomicoGlobal(newEconomico)
      UTIL.debugLog('calcula economico global ', newEconomico)
      if (newEconomico.periodoAmortizacion > 20) {
        SLDRAlert('ECONOMICO', t('ECONOMIC_BALANCE.WARNING_AMORTIZATION_TIME'), 'Warning')
      }

      //If periodoAmortizacion is less than zero means it is bigger than maximum number of years expected for the economic balance and cannot continue.
      if (newEconomico.periodoAmortizacion < 0) {
        SLDRAlert(
          'VALIDACION',
          t('ECONOMIC_BALANCE.MSG_NO_FINANCE', {
            periodo: Math.abs(newEconomico.periodoAmortizacion),
          }),
          'error',
        )
        return { status: false }
      }

      if (TCB.modoActivo !== 'INDIVIDUAL') {
        let consumoIndividual

        //Calcular balance y economico de zonas comunes para asignar ahorro a las fincas despues
        for (const _zc of zonasComunes) {
          consumoIndividual = tiposConsumo.find(
            (_tc) => _zc.nombreTipoConsumo === _tc.nombreTipoConsumo,
          )
          _zc.balance = new Balance(produccionGlobal, consumoIndividual, _zc.coefEnergia)
          _zc.economico = new Economico(
            _zc,
            tarifas,
            tiposConsumo,
            consumoGlobal,
            balanceGlobal,
            produccionGlobal,
            newEconomico,
            zonasComunes,
            costeZCenFinca,
          )
        }

        //Calcular balance y economico de las fincas

        for (let _f of fincas) {
          if (_f.participa && _f.nombreTipoConsumo !== '') {
            consumoIndividual = tiposConsumo.find(
              (_tc) => _tc.nombreTipoConsumo === _f.nombreTipoConsumo,
            )
            _f.balance = new Balance(produccionGlobal, consumoIndividual, _f.coefEnergia)
            _f.economico = new Economico(
              _f,
              tarifas,
              tiposConsumo,
              consumoGlobal,
              balanceGlobal,
              produccionGlobal,
              newEconomico,
              zonasComunes,
              costeZCenFinca,
            )
          }
        }
      }
      TCB.requiereReparto = false
    }

    document.body.style.cursor = cursorOriginal
    setNewEconomicBalance(true)
    return { status: true }
  }

  async function validaUnitsStep() {
    results = validaUnits()
    if (!results.status) {
      SLDRAlert('VALIDACION', results.error, 'Error')
      return false
    } else {
      return await PreparaEnergyBalance()
    }
  }

  async function validaEnergyBalanceStep() {
    for (const base of bases) {
      if (!UTIL.ValidateEntero(base.instalacion.paneles)) {
        SLDRAlert(
          'VALIDACION',
          t('todas las bases deben tener un numero entero de paneles'),
          'error',
        )
        return false
      }
    }

    if (TCB.modoActivo === 'INDIVIDUAL') {
      return await PreparaEconomicBalance().status
    }
  }

  async function validaEnergyAllocationStep() {
    if (!repartoValido) {
      SLDRAlert('VALIDACION', t('ENERGY_ALLOCATION.NO_BALANCE'), 'Error')
      return false
    } else {
      await PreparaEconomicBalance()

      //Asignacion del coste propio de cada unidad por el beta que le corresponde
      // setFincas((prev) =>
      //   prev.map((f, ndx) => {
      //     TCB.Finca[ndx].coste = UTIL.roundDecimales(
      //       ecoData.precioInstalacionCorregido * f.coefEnergia,
      //       2,
      //     )
      //     return TCB.Finca[ndx]
      //   }),
      // )
      return true
    }
  }

  function validaEconomicBalance() {
    /* 
    Se copia a TCB para aprovehar los informes previos.
    Analizar la posibilidad de rehacer usando la fuente disponible en los context
    */
    TCB.BaseSolar = bases
    TCB.consumo = consumoGlobal
    TCB.produccion = produccionGlobal
    TCB.balance = balanceGlobal
    TCB.economico = economicoGlobal
    console.log(economicoGlobal)
  }

  const getSections = (modo) => {
    let sections = [
      <LocationStep
        key={'loc_sec'}
        label="location"
        title={t('LOCATION.TITLE')}
        next={validaLocationStep}
      />,
      <ConsumptionStep
        key={'con_sec'}
        label="consumption"
        title={t('CONSUMPTION.TITLE')}
        next={validaConsumptionStep}
      />,
    ]

    if (modo !== 'INDIVIDUAL') {
      sections.push(
        <UnitsStep
          key={'un_sec'}
          label="units"
          title={t('UNITS.TITLE')}
          next={validaUnitsStep}
        />,
      )
    }

    sections.push(
      <EnergyBalanceStep
        key={'en_sec'}
        label="energybalance"
        title={t('ENERGY_BALANCE.TITLE')}
        next={validaEnergyBalanceStep}
      />,
    )

    if (modo !== 'INDIVIDUAL') {
      sections.push(
        <EnergyAllocationStep
          key={'un_sec'}
          label="units"
          title={t('ENERGY_ALLOCATION.TITLE')}
          next={validaEnergyAllocationStep}
        />,
      )

      sections.push(
        <EconomicAllocationStep
          key={'un_sec'}
          label="units"
          title={t('ECONOMIC_ALLOCATION.TITLE')}
          next={validaEconomicBalance}
        />,
      )
    } else {
      sections.push(
        <EconomicBalanceStep
          key={'eb_sec'}
          label="economicbalance"
          title={t('ECONOMIC_BALANCE.TITLE')}
          next={validaEconomicBalance}
        />,
      )
    }

    sections.push(
      <SummarySOMStep key={'sum_sec'} label="summary" title={t('SUMMARY.TITLE')} />,
    )

    return sections
  }

  GetURLArguments()
  return (
    <>
      <AppFrame>
        <Container>
          <Wizard
            variant="tabs"
            nextLabel={t('BASIC.LABEL_NEXT')}
            prevLabel={t('BASIC.LABEL_PREVIOUS')}
          >
            {getSections(TCB.modoActivo)}
          </Wizard>
        </Container>
      </AppFrame>
    </>
  )
}
