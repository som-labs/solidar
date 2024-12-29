import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, useLocation } from 'react-router-dom'

import Container from '@mui/material/Container'

// REACT Solidar Components
import AppFrame from '../components/AppFrame'
import Wizard from '../components/Wizard'

import LocationStep from './Location/Location'
import ConsumptionStep from './Consumption/Consumption'
import UnitsStep from './Units/Units'
import EnergyAllocationStep from './EnergyAllocation/EnergyAllocattion'
import EnergyBalanceStep from './EnergyBalance/EnergyBalance'
import EconomicBalanceStep from './EconomicBalance/EconomicBalance'
import EconomicAllocationStep from './EconomicAllocation/EconomicAllocattion'
import SummarySOMStep from './Summary/SOM/Summary'

import { ConsumptionContext } from './ConsumptionContext'
import { BasesContext } from './BasesContext'
import { AlertContext } from './components/Alert'
import { EconomicContext } from './EconomicContext'

// Solidar objects
import PreparaEnergyBalance from './EnergyBalance/PreparaEnergyBalance'
import TCB from './classes/TCB'
import * as UTIL from './classes/Utiles'
import InicializaAplicacion from './classes/InicializaAplicacion'

//InicializaAplicacion()

export default function Page() {
  const { t } = useTranslation()
  const { SLDRAlert } = useContext(AlertContext)
  const { validaBases } = useContext(BasesContext)
  const { validaTipoConsumo, repartoValido } = useContext(ConsumptionContext)
  const { ecoData, setEcoData } = useContext(EconomicContext)

  const [a] = useSearchParams()
  TCB.URLParameters = a

  let results
  InicializaAplicacion()

  function validaEnergyBalanceStep() {
    for (let base of TCB.BaseSolar) {
      if (!UTIL.ValidateEntero(base.instalacion.paneles)) {
        SLDRAlert(
          'VALIDACION',
          t('todas las bases deben tener un numero entero de paneles'),
          'error',
        )
        return false
      }
    }

    //If periodoAmortizacion is less than zero means it is bigger than maximum number of years expected for the economic balance and cannot continue.

    if (ecoData.periodoAmortizacion < 0) {
      SLDRAlert(
        'VALIDACION',
        t('ECONOMIC_BALANCE.MSG_NO_FINANCE', {
          periodo: Math.abs(ecoData.periodoAmortizacion),
        }),
        'error',
      )
      return false
    } else {
      return true
    }
  }

  function validaLocationStep() {
    results = validaBases()
    if (!results.status) SLDRAlert('VALIDACION', results.error, 'error')
    return results.status
  }

  async function validaConsumptionStep() {
    results = validaTipoConsumo()
    if (!results.status) {
      SLDRAlert('VALIDACION', results.error, 'error')
      return false
    }
    // Se crearan los objetos produccion, balance y economico
    // PENDIENTE: podria haber un warning de falta de espacio enviado desde Prepara...
    if (TCB.modoActivo === 'INDIVIDUAL') {
      results = await PreparaEnergyBalance()
      if (results.status) {
        setEcoData((prev) => ({ ...prev, ...TCB.economico }))
        TCB.readyToExport = true
      } else {
        console.log(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error)
        SLDRAlert(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error, 'Error')
      }
    }
    return results.status
  }

  async function validaUnitsStep() {
    //Verifica que al menos una unidad o una zona común tengan uso electrico asignado
    console.dir(TCB.Finca)

    let chk = false
    for (let _fnc of TCB.Finca) {
      if (_fnc.nombreTipoConsumo !== '') chk = true
      //return { status: true, error: '' }
    }

    for (let _zc of TCB.ZonaComun) {
      if (_zc.nombreTipoConsumo !== '') chk = true
      //return { status: true, error: '' }
    }

    if (chk) {
      results = await PreparaEnergyBalance()
      if (results.status) {
        setEcoData((prev) => ({ ...prev, ...TCB.economico }))
        TCB.readyToExport = true
      } else {
        console.log(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error)
        SLDRAlert(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error, 'Error')
      }
      return results.status
    } else {
      SLDRAlert(t('CONSUMPTION.ERROR_AL_MENOS_UN_USOELECTRICO'), results.error, 'Error')
      return false
    }
  }

  function validaAllocationStep() {
    if (!repartoValido) {
      SLDRAlert('VALIDACION', t('ENERGY_ALLOCATION.NO_BALANCE'), 'error')
      return false
    } else {
      return true
    }
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
          next={validaAllocationStep}
        />,
      )
    }

    sections.push(
      <EconomicBalanceStep
        key={'eb_sec'}
        label="economicbalance"
        title={t('ECONOMIC_BALANCE.TITLE')}
      />,
    )

    if (modo !== 'INDIVIDUAL') {
      sections.push(
        <EconomicAllocationStep
          key={'un_sec'}
          label="units"
          title={t('ECONOMIC_ALLOCATION.TITLE')}
          //next={}
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
