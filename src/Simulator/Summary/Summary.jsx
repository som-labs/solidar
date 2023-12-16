import React from 'react'
import { useTranslation } from 'react-i18next'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

import { FooterBox, InfoBox } from '../../components/SLDRComponents'
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
        <InfoBox
          sx={{
            mr: '0.3rem',
            mb: '0.3rem',
          }}
        >
          <SummaryAutoproduccion></SummaryAutoproduccion>
        </InfoBox>
        <InfoBox sx={{ mb: '0.3rem' }}>
          <SummaryConsumption></SummaryConsumption>
        </InfoBox>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        <InfoBox
          sx={{
            mr: '0.3rem',
            mb: '0.3rem',
          }}
        >
          <SummaryEconomicBalance></SummaryEconomicBalance>
        </InfoBox>
        <InfoBox
          sx={{
            mb: '0.3rem',
          }}
        >
          <SummaryEnergyBalance></SummaryEnergyBalance>
        </InfoBox>
      </Box>

      <FinalNote></FinalNote>
    </>
  )
}

export default SummaryStep
