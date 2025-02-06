import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import Container from '@mui/material/Container'

// REACT Solidar Components
import AppFrame from '../components/AppFrame'
import Wizard from '../components/Wizard'

import LocationStep from './Location/Location'
import ConsumptionStep from './Consumption/Consumption'
import UnitsStep from './Units/Units'
import EnergyAllocationStep from './EnergyAllocation/EnergyAllocation'
import EnergyBalanceStep from './EnergyBalance/EnergyBalance'
import EconomicBalanceStep from './EconomicBalance/EconomicBalance'
import EconomicAllocationStep from './EconomicAllocation/EconomicAllocation'
import SummarySOMStep from './Summary/SOM/Summary'

import { ConsumptionContext } from './ConsumptionContext'
import { BasesContext } from './BasesContext'
import { EconomicContext } from './EconomicContext'
//import { AlertContext } from './components/Alert'
import { useAlert } from '../components/AlertProvider.jsx'
// Solidar objects
import PreparaEnergyBalance from './classes/PreparaEnergyBalance.jsx'
import PreparaEconomicBalance from './classes/PreparaEconomicBalance.jsx'

import TCB from './classes/TCB'
import * as UTIL from './classes/Utiles'
import InicializaAplicacion from './classes/InicializaAplicacion'

//InicializaAplicacion()

export default function Page() {
  const { t } = useTranslation()
  const { SLDRAlert } = useAlert()
  //const { SLDRAlert } = useContext(AlertContext)
  const { validaBases, bases } = useContext(BasesContext)
  const {
    validaTipoConsumo,
    validaUnits,
    repartoValido,
    fincas,
    setFincas,
    zonasComunes,
    allocationGroup,
    tarifas,
  } = useContext(ConsumptionContext)
  const { ecoData, setEcoData } = useContext(EconomicContext)

  const [a] = useSearchParams()
  TCB.URLParameters = a

  let results
  InicializaAplicacion()

  async function validaLocationStep() {
    console.log('validaLocationStep')
    results = await validaBases()
    if (!results.status) SLDRAlert('VALIDACION', results.error, 'Error')
    return results.status
  }

  async function validaConsumptionStep() {
    console.log('validaConsumptionStep')
    results = validaTipoConsumo()
    if (!results.status) {
      SLDRAlert('VALIDACION', results.error, 'Error')
      return false
    }
    // Se crearan los objetos produccion, balance y economico
    // PENDIENTE: podria haber un warning de falta de espacio enviado desde Prepara...
    if (TCB.modoActivo === 'INDIVIDUAL') {
      results = await PreparaEnergyBalance()
      if (results.status) {
        // setEcoData((prev) => ({ ...prev, ...TCB.economico }))
        // TCB.readyToExport = true
      } else {
        SLDRAlert(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error, 'Error')
      }
    }
    return results.status
  }

  async function validaUnitsStep() {
    console.log('validaUnitsStep')
    results = validaUnits()
    if (!results.status) {
      SLDRAlert('VALIDACION', results.error, 'Error')
      return false
    } else {
      results = await PreparaEnergyBalance()
      if (results.status) {
        // setEcoData((prev) => ({ ...prev, ...TCB.economico }))
        // TCB.readyToExport = true
      } else {
        console.log(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error)
        SLDRAlert(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error, 'Error')
      }
      return results.status
    }
  }

  function validaEnergyBalanceStep() {
    console.log('validaEnergyBalanceStep')
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
      PreparaEconomicBalance()
      setEcoData(TCB.economico)

      //If periodoAmortizacion is less than zero means it is bigger than maximum number of years expected for the economic balance and cannot continue.
      if (ecoData.periodoAmortizacion < 0) {
        console.log(ecoData.periodoAmortizacion)
        SLDRAlert(
          'VALIDACION',
          t('ECONOMIC_BALANCE.MSG_NO_FINANCE', {
            periodo: Math.abs(ecoData.periodoAmortizacion),
          }),
          'error',
        )
        return false
      }
      return true
    }
  }

  function validaEnergyAllocationStep() {
    if (!repartoValido) {
      SLDRAlert('VALIDACION', t('ENERGY_ALLOCATION.NO_BALANCE'), 'Error')
      return false
    } else {
      PreparaEconomicBalance()
      setEcoData(TCB.economico)
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

  function validaEconomicBalance() {}

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
          //next={}
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
