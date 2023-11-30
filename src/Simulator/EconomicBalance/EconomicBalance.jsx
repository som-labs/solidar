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
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flex: 1,
              border: 2,
              borderColor: 'primary.light',
              mr: '0.3rem',
              borderRadius: 4,
            }}
          >
            <ReduccionIBI></ReduccionIBI>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flex: 1,
              border: 2,
              borderColor: 'primary.light',
              mr: '0.3rem',
              borderRadius: 4,
            }}
          >
            <SubvencionEU></SubvencionEU>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flex: 1,
              width: '50%',
              border: 2,
              borderColor: 'primary.light',
              mr: '0.3rem',
              borderRadius: 4,
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
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flex: 1,
              border: 2,
              borderColor: 'primary.light',
              mr: '0.3rem',
              borderRadius: 4,
            }}
          >
            <InstallationCost></InstallationCost>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flex: 1,
              border: 2,
              borderColor: 'primary.light',
              mr: '0.3rem',
              borderRadius: 4,
            }}
          >
            <AmortizationTime></AmortizationTime>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1,
            border: 2,
            width: '80%',
            borderColor: 'primary.light',
            borderRadius: 4,
            mt: '1rem',
            ml: 15,
          }}
        >
          <YearSaving></YearSaving>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            boxShadow: 2,
            flex: 1,
            border: 2,
            borderColor: 'primary.light',
            borderRadius: 4,
            mt: '1rem',
          }}
        >
          <MonthSaving></MonthSaving>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            boxShadow: 2,
            flex: 1,
            border: 2,
            borderColor: 'primary.light',
            borderRadius: 4,
            mt: '1rem',
          }}
        >
          <FinanceSummary></FinanceSummary>
        </Box>
        <Typography variant="h6" sx={{ mt: '1rem' }}>
          {t('ECONOMIC_BALANCE.DESCRIPTION_DATA_AS_PANELS')}
        </Typography>
        <Box
          sx={{
            mt: '1rem',
            display: 'flex',
            flexWrap: 'wrap',

            flex: 1,
            border: 1,
            borderColor: 'primary.light',
            borderRadius: 4,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <GraphAlternatives></GraphAlternatives>
        </Box>
      </Container>
    </>
  )
}
