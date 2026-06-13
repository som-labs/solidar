import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, useLocation } from 'react-router-dom'

import Container from '@mui/material/Container'

// REACT Solidar Components
import AppFrame from '../components/AppFrame'
import Wizard from '../components/Wizard'

import LocationStep from './Location/Location'
import ConsumptionStep from './Consumption/Consumption'
import BateryStep from './Batery/Batery'
import EnergyBalanceStep from './EnergyBalance/EnergyBalance'
import EconomicBalanceStep from './EconomicBalance/EconomicBalance'
import SummaryClaraStep from './Summary/Clara/Summary'
import SummarySOMStep from './Summary/SOM/Summary'

import { ConsumptionContext } from './ConsumptionContext'
import { BasesContext } from './BasesContext'
import { AlertContext } from './components/Alert'
import { EconomicContext } from './EconomicContext'

// Solidar objects
import PreparaEnergyBalance from './EnergyBalance/PreparaEnergyBalance'
import TCB from './classes/TCB'
import Bateria from './classes/Bateria'
import Economico from './classes/Economico'
import * as UTIL from './classes/Utiles'
import InicializaAplicacion from './classes/InicializaAplicacion'

//InicializaAplicacion()

export default function Page() {
  const { t } = useTranslation()
  const { SLDRAlert } = useContext(AlertContext)
  const { validaBases } = useContext(BasesContext)
  const { validaTipoConsumo, bateria, bateriaValida, setBateria } =
    useContext(ConsumptionContext)
  const { ecoData, setEcoData } = useContext(EconomicContext)

  // const location = useLocation()
  // console.log(location)

  TCB.URLParameters = useSearchParams()[0]

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

  async function validaLocationStep() {
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

    console.log('llamamos a preparar energía salida consumption', TCB.bateria)
    results = await PreparaEnergyBalance()
    if (!results.status) {
      console.log(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error)
      SLDRAlert(t('Rendimiento.MSG_BASE_SIN_RENDIMIENTO'), results.error, 'Error')
    }
    return results.status
  }

  async function validaBateryStep() {
    // Se crearan los objetos produccion, balance y economico
    // PENDIENTE: podria haber un warning de falta de espacio enviado desde
    if (TCB.bateria) {
      if (!TCB.importando) {
        if (bateria && Object.keys(bateriaValida).length != 0) {
          const message = Object.entries(bateriaValida)
            .map(([key, value]) => `${key}: ${value}`)
            .join(`\n`)
          SLDRAlert(t('Bateria.MSG_ERROR_BATERIA'), message, 'Error')
          return false
        } else {
          TCB.bateria.updatePrice()
          TCB.bateria.fechaInicio = TCB.consumo.fechaInicio
          TCB.bateria.fechaFin = TCB.consumo.fechaFin
          TCB.bateria.sintesis()
          setBateria(TCB.bateria)
          TCB.requiereOptimizador = true
        }
      }
    }

    console.log('llamamos a preparar energía salida bateria', TCB.bateria)
    results = await PreparaEnergyBalance()
    if (results.status) {
      //When importing first time will not compute Economico next yes
      if (!TCB.importando) {
        TCB.economico = new Economico()
      }

      UTIL.debugLog('calculaResultados - economico global ', TCB.economico)
      if (TCB.economico.periodoAmortizacion > 20) {
        alert(TCB.i18next.t('ECONOMIC_BALANCE.WARNING_AMORTIZATION_TIME'))
      }

      setEcoData((prev) => ({ ...prev, ...TCB.economico }))
      TCB.readyToExport = true
      TCB.importando = false
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
          <Wizard
            variant="tabs"
            nextLabel={t('BASIC.LABEL_NEXT')}
            prevLabel={t('BASIC.LABEL_PREVIOUS')}
          >
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
            <BateryStep
              label="battery"
              title={t('Bateria.TITLE')}
              next={validaBateryStep}
            />
            <EnergyBalanceStep
              label="energybalance"
              title={t('ENERGY_BALANCE.TITLE')}
              next={validaEnergyBalanceStep}
            />
            <EconomicBalanceStep
              label="economicbalance"
              title={t('ECONOMIC_BALANCE.TITLE')}
            />
            {TCB.estiloActivo !== 'SOM' ? (
              <SummaryClaraStep label="summary" title={t('SUMMARY.TITLE')} />
            ) : (
              <SummarySOMStep label="summary" title={t('SUMMARY.TITLE')} />
            )}
          </Wizard>
        </Container>
      </AppFrame>
    </>
  )
}
