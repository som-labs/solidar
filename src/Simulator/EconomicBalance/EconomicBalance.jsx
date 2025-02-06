import { useTranslation } from 'react-i18next'

// MUI objects
import { Box, Grid, Typography, Container, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
//React global components
import { SLDRInfoBox, SLDRCollapsibleCard } from '../../components/SLDRComponents'

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
  const theme = useTheme()
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
          <Typography sx={theme.titles.level_1} textAlign={'center'}>
            {t('ECONOMIC_BALANCE.TITLE_MONTH_SAVINGS')}
          </Typography>
          <MonthSaving></MonthSaving>
        </Grid>

        <Grid item xs={12}>
          <SLDRCollapsibleCard
            expanded={false}
            title={t('ECONOMIC_BALANCE.TITLE_FINANCE_SUMMARY')}
          >
            <SLDRInfoBox>
              <FinanceSummary></FinanceSummary>
            </SLDRInfoBox>
          </SLDRCollapsibleCard>
        </Grid>
        <Grid item xs={12}>
          <SLDRCollapsibleCard
            expanded={false}
            title={t('ECONOMIC_BALANCE.TITLE_DATA_AS_PANELS')}
          >
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
          </SLDRCollapsibleCard>
        </Grid>
      </Grid>
    </Container>
  )
}
