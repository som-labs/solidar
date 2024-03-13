import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Box, Paper } from '@mui/material'

import { SLDRInfoBox } from '../../components/SLDRComponents'
import SummaryAutoproduccion from './SummaryAutoproduccion'
import SummaryConsumption from './SummaryConsumption'
import SummaryEconomicBalance from './SummaryEconomicBalance'
import SummaryEnergyBalance from './SummaryEnergyBalance'
import Reports from './Reports'

const SummaryStep = () => {
  const { t } = useTranslation()
  const contentRef = useRef(null)

  return (
    <>
      <Paper elevation={10} style={{ padding: 16 }}>
        <Container ref={contentRef}>
          <Typography variant="body">{t('SUMMARY.DESCRIPTION')}</Typography>

          <Box
            sx={{
              display: 'flex',
              gap: '10px',
            }}
          >
            <SLDRInfoBox>
              <SummaryAutoproduccion></SummaryAutoproduccion>
            </SLDRInfoBox>
            <SLDRInfoBox>
              <SummaryConsumption></SummaryConsumption>
            </SLDRInfoBox>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              width: '100%',
              gap: '10px',
            }}
          >
            <SLDRInfoBox>
              <SummaryEconomicBalance></SummaryEconomicBalance>
            </SLDRInfoBox>
            <SLDRInfoBox>
              <SummaryEnergyBalance></SummaryEnergyBalance>
            </SLDRInfoBox>
          </Box>

          <Reports ref={contentRef}></Reports>

          <Typography variant="h4" sx={{ mt: '1rem' }}>
            {t('BASIC.LABEL_AVISO')}
          </Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('SUMMARY.LABEL_disclaimer1'),
            }}
          />
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('SUMMARY.LABEL_disclaimer2'),
            }}
          />
        </Container>
      </Paper>
    </>
  )
}

export default SummaryStep
