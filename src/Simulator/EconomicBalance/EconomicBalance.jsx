import React, { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

import ReduccionIBI from './ReduccionIBI'
import SubvencionEU from './SubvencionEU'
import InstallationCost from './InstallationCost'
import VirtualBattery from './VirtualBattery'
import AmortizationTime from './AmortizationTime'

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
              boxShadow: 2,
              border: 2,
              borderColor: 'primary.light',
              '& .MuiDataGrid-cell:hover': {
                color: 'primary.main',
              },
            }}
          >
            <ReduccionIBI></ReduccionIBI>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              width: '50%',
              boxShadow: 2,
              border: 2,
              borderColor: 'primary.light',
              '& .MuiDataGrid-cell:hover': {
                color: 'primary.main',
              },
            }}
          >
            <SubvencionEU></SubvencionEU>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              width: '50%',
              boxShadow: 2,
              border: 2,
              borderColor: 'primary.light',
              '& .MuiDataGrid-cell:hover': {
                color: 'primary.main',
              },
            }}
          >
            <VirtualBattery></VirtualBattery>
          </Box>
        </Box>
        <br />
        <Box
          sx={{
            display: 'flex',
            width: '100%',
          }}
        >
          {/* REVISAR: Como asignar el espacio entre boxes para dejar 50% width en cada uno y un espacio intermedio usar flex=1*/}
          <Box
            sx={{
              mr: '0.3rem',
              display: 'flex',
              flexWrap: 'wrap',
              boxShadow: 2,
              flex: 1,
              border: 2,
              borderColor: 'primary.light',
              '& .MuiDataGrid-cell:hover': {
                color: 'primary.main',
              },
            }}
          >
            <InstallationCost></InstallationCost>
          </Box>
          <Box
            sx={{
              ml: '0.3rem',
              display: 'flex',
              flexWrap: 'wrap',
              boxShadow: 2,
              flex: 1,
              border: 2,
              borderColor: 'primary.light',
              '& .MuiDataGrid-cell:hover': {
                color: 'primary.main',
              },
            }}
          >
            <AmortizationTime></AmortizationTime>
          </Box>
        </Box>
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
