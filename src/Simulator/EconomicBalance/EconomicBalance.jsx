import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { Box } from '@mui/material'

// REACT Solidar Components
import ReduccionIBI from './ReduccionIBI'
import SubvencionEU from './SubvencionEU'
import InstallationCost from './InstallationCost'
import VirtualBattery from './VirtualBattery'
import AmortizationTime from './AmortizationTime'
import YearSaving from './YearSavings'
import MonthSaving from './MonthSavings'
import FinanceSummary from './FinanceSummary'
import GraphAlternatives from './GraphAlternatives'

// REACT Solidar Components
import EconomicContext from '../EconomicBalance/EconomicContext'

// Solidar objects
import TCB from '../classes/TCB'
import Economico from '../classes/Economico'

const EconomicBalanceStep = () => {
  const { t, i18n } = useTranslation()

  const {
    IBI,
    setIBI,
    subvencionEU,
    setSubvencionEU,
    valorSubvencionEU,
    setValorSubvencionEU,
    precioInstalacionCorregido,
    setPrecioInstalacionCorregido,
    recognition,
    setRecognition,
    fee,
    setFee,
    periodoAmortizacion,
    setPeriodoAmortizacion,
    cashFlow,
    setCashFlow,
  } = useContext(EconomicContext)

  useEffect(() => {
    // El economico del consumo global*/
    TCB.economico = new Economico()
    setCashFlow(TCB.economico.cashFlow)
    setPeriodoAmortizacion(TCB.economico.periodoAmortizacion)
  }, [])

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
          {/* Asignar el espacio entre boxes para dejar 50% width en cada uno y un espacio intermedio usar flex=X como proporcion*/}
          <Box
            sx={{
              mr: '0.3rem',
              display: 'flex',
              flexWrap: 'wrap',
              boxShadow: 2,
              flex: 1,
              border: 2,
              borderColor: 'primary.light',
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
            }}
          >
            <AmortizationTime></AmortizationTime>
          </Box>
        </Box>
        <Box
          sx={{
            mr: '0.3rem',
            display: 'flex',
            flexWrap: 'wrap',
            boxShadow: 2,
            flex: 1,
            border: 2,
            borderColor: 'primary.light',
          }}
        >
          <YearSaving></YearSaving>
        </Box>
        <Box
          sx={{
            mr: '0.3rem',
            display: 'flex',
            flexWrap: 'wrap',
            boxShadow: 2,
            flex: 1,
            border: 2,
            borderColor: 'primary.light',
          }}
        >
          <MonthSaving></MonthSaving>
        </Box>
        <Box
          sx={{
            mr: '0.3rem',
            display: 'flex',
            flexWrap: 'wrap',
            boxShadow: 2,
            flex: 1,
            border: 2,
            borderColor: 'primary.light',
          }}
        >
          <FinanceSummary></FinanceSummary>
        </Box>
        <Typography variant="h3">{t('ECONOMIC_BALANCE.SEGUNNUMEROPANELES')}</Typography>
        <Box
          sx={{
            mr: '0.3rem',
            display: 'flex',
            flexWrap: 'wrap',
            boxShadow: 2,
            flex: 1,
            border: 2,
            borderColor: 'primary.light',
          }}
        >
          {/* <GraphAlternatives></GraphAlternatives> */}
        </Box>
      </Container>
    </>
  )
}

export default EconomicBalanceStep
