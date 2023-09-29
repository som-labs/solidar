import React from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import AppFrame from '../components/AppFrame'

import Wizard from '../components/Wizard'
import LocationStep from './Location/Location'
import ConsumptionStep from './Consumption/Consumption'
import EnergyBalanceStep from './EnergyBalance/EnergyBalance'
import EconomicBalanceStep from './EconomicBalance/EconomicBalance'
import SummaryStep from './Summary/Summary'

import TCB from './classes/TCB.js'

export default function Page() {
  const { t, i18n } = useTranslation()

  const validame = () => { 
    return false
    // if (TCB.BaseSolar.length > 0) {
    //   return false
    //  } else {
    //   return 'Debe existir al menos una base'
    //  } 
  }

  return (
    <>
      <AppFrame>
          <Wizard variant='tabs'>
            <LocationStep label="location" title={t("SIMULATOR.TITLE_LOCATION")} validate = {validame}/>
            <ConsumptionStep label="consumption" title={t("SIMULATOR.TITLE_CONSUMPTION")} /> 
            <EnergyBalanceStep label="energybalance" title={t("SIMULATOR.TITLE_ENERGY_BALANCE")} />
            <EconomicBalanceStep label="economicbalance" title={t("SIMULATOR.TITLE_ECONOMIC_BALANCE")} />
            <SummaryStep label="summary" title={t("SIMULATOR.TITLE_SUMMARY")} />
          </Wizard>
      </AppFrame>
    </>
  )
}
