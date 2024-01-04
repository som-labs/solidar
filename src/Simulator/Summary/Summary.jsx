import React from 'react'
import { useTranslation } from 'react-i18next'

import { Typography, Container, Box, Paper } from '@mui/material'

import { SLDRFooterBox, SLDRInfoBox } from '../../components/SLDRComponents'
import SummaryAutoproduccion from './SummaryAutoproduccion'
import SummaryConsumption from './SummaryConsumption'
import SummaryEconomicBalance from './SummaryEconomicBalance'
import SummaryEnergyBalance from './SummaryEnergyBalance'
import FinalNote from './FinalNote'

const SummaryStep = () => {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Paper elevation={10} style={{ padding: 16 }}>
        <Container>
          <Typography variant="h3">{t('SUMMARY.TITLE')}</Typography>
          <Typography variant="body">{t('SUMMARY.DESCRIPTION')}</Typography>
        </Container>

        <Box
          sx={{
            display: 'flex',
          }}
        >
          <SLDRInfoBox
            sx={{
              mr: '0.3rem',
              mb: '0.3rem',
            }}
          >
            <SummaryAutoproduccion></SummaryAutoproduccion>
          </SLDRInfoBox>
          <SLDRInfoBox sx={{ mb: '0.3rem' }}>
            <SummaryConsumption></SummaryConsumption>
          </SLDRInfoBox>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <SLDRInfoBox
            sx={{
              mr: '0.3rem',
              mb: '0.3rem',
            }}
          >
            <SummaryEconomicBalance></SummaryEconomicBalance>
          </SLDRInfoBox>
          <SLDRInfoBox
            sx={{
              mb: '0.3rem',
            }}
          >
            <SummaryEnergyBalance></SummaryEnergyBalance>
          </SLDRInfoBox>
        </Box>

        <FinalNote></FinalNote>
      </Paper>
    </>
  )
}

export default SummaryStep
