import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Box, Paper, Grid } from '@mui/material'

import { SLDRInfoBox } from '../../components/SLDRComponents'
import MicroMap from '../Location/MicroMap'
import SummaryAutoproduccion from './SummaryAutoproduccion'
import SummaryConsumption from './SummaryConsumption'
import SummaryEconomicBalance from './SummaryEconomicBalance'
import SummaryEnergyBalance from './SummaryEnergyBalance'
import Reports from './Reports'

const SummaryStep = () => {
  const { t } = useTranslation()
  const contentRef = useRef(null)

  return (
    <Paper elevation={10} style={{ padding: 16 }}>
      <Container ref={contentRef}>
        {/* <Typography variant="body">{t('SUMMARY.DESCRIPTION')}</Typography> */}
        <Grid container rowSpacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'row', mt: '1rem', gap: 2 }}>
              <SLDRInfoBox>
                <SummaryAutoproduccion></SummaryAutoproduccion>
              </SLDRInfoBox>
              <SLDRInfoBox>
                <SummaryConsumption></SummaryConsumption>
              </SLDRInfoBox>
              {/* <SLDRInfoBox>
                <MicroMap></MicroMap>
              </SLDRInfoBox> */}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                width: '100%',
                gap: 2,
              }}
            >
              <SLDRInfoBox>
                <SummaryEconomicBalance></SummaryEconomicBalance>
              </SLDRInfoBox>
              <SLDRInfoBox>
                <SummaryEnergyBalance></SummaryEnergyBalance>
              </SLDRInfoBox>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Reports ref={contentRef}></Reports>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4 }}>
              <Typography variant="h4">{t('BASIC.LABEL_AVISO')}</Typography>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('SUMMARY.LABEL_DISCLAIMER_1'),
                }}
              />
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('SUMMARY.LABEL_DISCLAIMER_2'),
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Paper>
  )
}

export default SummaryStep
