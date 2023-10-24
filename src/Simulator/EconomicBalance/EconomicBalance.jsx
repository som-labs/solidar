import React, { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

import ReduccionIBI from './ReduccionIBI'
import SubvencionEU from './SubvencionEU'

import TCB from '../classes/TCB'
import Economico from '../classes/Economico'
import { Box } from '@mui/material'
import EconomicContext from './EconomicContext'

const EconomicBalanceStep = () => {
  const { t, i18n } = useTranslation()

  const [IBI, setIBI] = useState()
  const [EUBonus, setEUBonus] = useState()
  const [hucha, setHucha] = useState()

  useEffect(() => {
    // El economico del consumo global*/

    TCB.economico = new Economico()
  }, [])

  /** Muestra la tabla de cashflow el VAN y el TIR
   *
   */
  // async function muestraBalanceFinanciero() {
  //   _tablaEconomico.setData(TCB.economico.cashFlow)

  //   UTIL.muestra('VANProyecto', UTIL.formatoValor('dinero', TCB.economico.VANProyecto))
  //   UTIL.muestra('TIRProyecto', UTIL.formatoValor('porciento', TCB.economico.TIRProyecto))
  // }

  return (
    <>
      <Container>
        <Typography variant="h3">{t('ECONOMIC_BALANCE.TITLE')}</Typography>
        <Typography variant="body">{t('ECONOMIC_BALANCE.DESCRIPTION')}</Typography>
        <Typography variant="body">{t('ECONOMIC_BALANCE.SUBVENCIONES')}</Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              width: '50%',
            }}
          >
            <ReduccionIBI></ReduccionIBI>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              width: '50%',
            }}
          >
            <SubvencionEU></SubvencionEU>
          </Box>
        </Box>
        <Typography variant="h3">{t('ECONOMIC_BALANCE.SUMMARY')}</Typography>
        <Typography variant="h3">{t('ECONOMIC_BALANCE.YEAR_SAVING')}</Typography>
        <Typography variant="h3">{t('ECONOMIC_BALANCE.MONTH_SAVING')}</Typography>
        <Typography variant="h3">{t('ECONOMIC_BALANCE.DETAILED')}</Typography>
        <Typography variant="h3">{t('ECONOMIC_BALANCE.FINANCE')}</Typography>
        <Typography variant="body">VAN {TCB.economico.VANProyecto}</Typography>
        <Typography variant="body">TIR {TCB.economico.TIRProyecto}</Typography>
      </Container>
    </>
  )
}

export default EconomicBalanceStep
