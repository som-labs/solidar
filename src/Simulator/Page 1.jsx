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
import EnergyAllocationStep from './EnergyAllocation/EnergyAllocation'
import EnergyBalanceStep from './EnergyBalance/EnergyBalance'
import EconomicBalanceStep from './EconomicBalance/EconomicBalance'
import EconomicAllocationStep from './EconomicAllocation/EconomicAllocation'
import SummaryClaraStep from './Summary/Clara/Summary'
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
  const { validaTipoConsumo } = useContext(ConsumptionContext)
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

    if (TCB.modoActivo === 'INDIVIDUAL') {
      //En modo individual no hay reparto de energia, por lo que se puede preparar el balance economico directamente
      return await PreparaEnergyBalance()
    } else {
      return true
    }
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
