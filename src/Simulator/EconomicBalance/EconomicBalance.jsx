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
import { FooterBox, InfoBox } from '../../components/SLDRComponents'

export default function EconomicBalanceStep() {
  const { t, i18n } = useTranslation()

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
          <InfoBox sx={{ mr: '0.3rem' }}>
            <ReduccionIBI></ReduccionIBI>
          </InfoBox>
          <InfoBox sx={{ mr: '0.3rem' }}>
            <SubvencionEU></SubvencionEU>
          </InfoBox>
          <InfoBox>
            <VirtualBattery></VirtualBattery>
          </InfoBox>
        </Box>
        <br />
        <Box
          sx={{
            display: 'flex',
            width: '100%',
          }}
        >
          <InfoBox sx={{ mr: '0.3rem' }}>
            <InstallationCost></InstallationCost>
          </InfoBox>
          <InfoBox>
            <AmortizationTime></AmortizationTime>
          </InfoBox>
        </Box>
        <InfoBox
          sx={{
            width: '80%',
            mt: '1rem',
            ml: 15,
          }}
        >
          <YearSaving></YearSaving>
        </InfoBox>
        <InfoBox sx={{ mt: '1rem' }}>
          <MonthSaving></MonthSaving>
        </InfoBox>
        <InfoBox
          sx={{
            mt: '1rem',
            mb: '1rem',
          }}
        >
          <FinanceSummary></FinanceSummary>
        </InfoBox>
        <Typography variant="body">
          {t('ECONOMIC_BALANCE.DESCRIPTION_DATA_AS_PANELS')}
        </Typography>
        <InfoBox
          sx={{
            mt: '1rem',
            justifyContent: 'center',
            alignItems: 'center',

            flexFlow: 'column',
          }}
        >
          <GraphAlternatives></GraphAlternatives>
        </InfoBox>
      </Container>
    </>
  )
}
