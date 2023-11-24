import React from 'react'
import { useTranslation } from 'react-i18next'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

import SummaryAutoproduccion from './SummaryAutoproduccion'
import SummaryConsumption from './SummaryConsumption'
import SummaryEconomicBalance from './SummaryEconomicBalance'
import SummaryEnergyBalance from './SummaryEnergyBalance'
import FinalNote from './FinalNote'

const SummaryStep = () => {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Container>
        <Typography variant="h3">{t('SUMMARY.TITLE')}</Typography>
        <Typography variant="body">{t('SUMMARY.DESCRIPTION')}</Typography>
      </Container>

      <Box
        sx={{
          display: 'flex',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1,
            boxShadow: 2,
            border: 2,
            borderColor: 'primary.light',
            mr: '0.3rem',
            mb: '0.3rem',
            borderRadius: 4,
          }}
        >
          <SummaryAutoproduccion></SummaryAutoproduccion>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1,
            boxShadow: 2,
            border: 2,
            borderColor: 'primary.light',
            mb: '0.3rem',
            borderRadius: 4,
          }}
        >
          <SummaryConsumption></SummaryConsumption>
        </Box>
      </Box>

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
            flex: 2,
            width: '50%',
            boxShadow: 2,
            border: 2,
            borderColor: 'primary.light',
            mr: '0.3rem',
            mb: '0.3rem',
            borderRadius: 4,
          }}
        >
          <SummaryEconomicBalance></SummaryEconomicBalance>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: 2,
            width: '50%',
            boxShadow: 2,
            border: 2,
            borderColor: 'primary.light',
            mb: '0.3rem',
            borderRadius: 4,
          }}
        >
          <SummaryEnergyBalance></SummaryEnergyBalance>
        </Box>
      </Box>

      <FinalNote></FinalNote>
    </>
  )
}

export default SummaryStep
