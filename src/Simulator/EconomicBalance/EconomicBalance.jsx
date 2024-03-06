import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { Box } from '@mui/material'

//React global components
import { SLDRInfoBox } from '../../components/SLDRComponents'

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

export default function EconomicBalanceStep() {
  const { t } = useTranslation()

  return (
    <>
      <Container>
        <Typography
          variant="body"
          textAlign={'center'}
          dangerouslySetInnerHTML={{
            __html: t('ECONOMIC_BALANCE.DESCRIPTION'),
          }}
        ></Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <SLDRInfoBox sx={{ mr: '0.3rem' }}>
            <ReduccionIBI></ReduccionIBI>
          </SLDRInfoBox>
          <SLDRInfoBox sx={{ mr: '0.3rem' }}>
            <SubvencionEU></SubvencionEU>
          </SLDRInfoBox>
          <SLDRInfoBox>
            <VirtualBattery></VirtualBattery>
          </SLDRInfoBox>
        </Box>
        <br />
        <Box
          sx={{
            display: 'flex',
            width: '100%',
          }}
        >
          <SLDRInfoBox sx={{ mr: '0.3rem' }}>
            <InstallationCost></InstallationCost>
          </SLDRInfoBox>
          <SLDRInfoBox>
            <AmortizationTime></AmortizationTime>
          </SLDRInfoBox>
        </Box>
        <SLDRInfoBox
          sx={{
            width: '80%',
            mt: '1rem',
            ml: 15,
          }}
        >
          <YearSaving></YearSaving>
        </SLDRInfoBox>
        <SLDRInfoBox sx={{ mt: '1rem' }}>
          <Typography variant="h4" textAlign={'center'}>
            {t('ECONOMIC_BALANCE.TITLE_MONTH_SAVINGS')}
          </Typography>
          <MonthSaving></MonthSaving>
        </SLDRInfoBox>
        <SLDRInfoBox
          sx={{
            mt: '1rem',
            mb: '1rem',
          }}
        >
          <FinanceSummary></FinanceSummary>
        </SLDRInfoBox>
        <Typography variant="body">
          {t('ECONOMIC_BALANCE.DESCRIPTION_DATA_AS_PANELS')}
        </Typography>
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
      </Container>
    </>
  )
}
