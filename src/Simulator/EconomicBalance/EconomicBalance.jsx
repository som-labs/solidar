import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { Box, Grid } from '@mui/material'

//React global components
import { SLDRInfoBox } from '../../components/SLDRComponents'

// REACT Solidar Components
import ReduccionIBI from './ReduccionIBI'
import Subvencion from './Subvencion'
import InstallationCost from './InstallationCost'
import VirtualBattery from './VirtualBattery'
import AmortizationTime from './AmortizationTime'
import YearSaving from './YearSavings'
import MonthSaving from './MonthSavings'
import FinanceSummary from './FinanceSummary'
import GraphAlternatives from './GraphAlternatives'

export default function EconomicBalanceStep() {
  const { t } = useTranslation()

  return (
    <Container>
      <Grid container rowSpacing={4}>
        <Grid item xs={12}>
          <Typography
            variant="body"
            textAlign={'center'}
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.DESCRIPTION'),
            }}
          ></Typography>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              width: '100%',
              gap: '15px',
            }}
          >
            <SLDRInfoBox sx={{ borderRight: '1px solid grey' }}>
              <ReduccionIBI></ReduccionIBI>
            </SLDRInfoBox>
            <SLDRInfoBox sx={{ borderRight: '1px solid grey' }}>
              <Subvencion></Subvencion>
            </SLDRInfoBox>
            <SLDRInfoBox sx={{ borderRight: '1px solid grey' }}>
              <VirtualBattery></VirtualBattery>
            </SLDRInfoBox>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              gap: '15px',
            }}
          >
            <SLDRInfoBox sx={{ borderTop: '3px solid #96b633' }}>
              <InstallationCost></InstallationCost>
            </SLDRInfoBox>
            {/* //REVISAR: porque nofunciona? //borderTop: '3px solid $
            {theme.palette.primary.main}', */}
            <SLDRInfoBox sx={{ borderTop: '3px solid #96b633' }}>
              <YearSaving></YearSaving>
            </SLDRInfoBox>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <SLDRInfoBox sx={{ bgcolor: '#96b633AA' }}>
            <AmortizationTime></AmortizationTime>
          </SLDRInfoBox>
        </Grid>
        <Grid item xs={12}>
          <SLDRInfoBox>
            <MonthSaving></MonthSaving>
          </SLDRInfoBox>
        </Grid>
        <Grid item xs={12}>
          <SLDRInfoBox>
            <FinanceSummary></FinanceSummary>
          </SLDRInfoBox>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body">
            {t('ECONOMIC_BALANCE.DESCRIPTION_DATA_AS_PANELS')}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <SLDRInfoBox
            sx={{
              mt: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
              flexFlow: 'column',
            }}
          >
            <GraphAlternatives></GraphAlternatives>
          </SLDRInfoBox>
        </Grid>
      </Grid>
    </Container>
  )
}
