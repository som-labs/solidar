import { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import Container from '@mui/material/Container'

// REACT Solidar Components
import AppFrame from '../components/AppFrame'
import Wizard from '../components/Wizard'

import LocationStep from './Location/Location'
import ConsumptionStep from './Consumption/Consumption'
import EnergyBalanceStep from './EnergyBalance/EnergyBalance'
import EconomicBalanceStep from './EconomicBalance/EconomicBalance'
import SummaryStep from './Summary/Summary'

import { ConsumptionContext } from './ConsumptionContext'
import { BasesContext } from './BasesContext'
import { AlertContext } from './components/Alert'
import { EconomicContext } from './EconomicContext'

// Solidar objects
import PreparaEnergyBalance from './EnergyBalance/PreparaEnergyBalance'
import TCB from './classes/TCB'

import InicializaAplicacion from './classes/InicializaAplicacion'

InicializaAplicacion()

export default function Page() {
  const { t } = useTranslation()
  const { SLDRAlert } = useContext(AlertContext)
  const { validaBases } = useContext(BasesContext)
  const { validaTipoConsumo } = useContext(ConsumptionContext)
  const { setEcoData } = useContext(EconomicContext)

  let results

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
    results = await PreparaEnergyBalance()
    if (results.status) {
      setEcoData(TCB.economico)
    } else {
      console.log(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error)
      SLDRAlert(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error, 'Error')
    }
    return results.status
  }

  return (
    <>
      <AppFrame>
        <Container>
          <Wizard variant="tabs">
            <LocationStep
              label="location"
              title={t('LOCATION.TITLE')}
              next={validaLocationStep}
            />
            <ConsumptionStep
              label="consumption"
              title={t('CONSUMPTION.TITLE')}
              next={validaConsumptionStep}
            />
            <EnergyBalanceStep label="energybalance" title={t('ENERGY_BALANCE.TITLE')} />
            <EconomicBalanceStep
              label="economicbalance"
              title={t('ECONOMIC_BALANCE.TITLE')}
            />
            <SummaryStep label="summary" title={t('SUMMARY.TITLE')} />
          </Wizard>
        </Container>
      </AppFrame>
    </>
  )
}
