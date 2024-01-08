import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

// REACT Solidar Components
import PreciosTarifa from './PreciosTarifa'
import ConsumptionSummary from './ConsumptionSummary'
import { SLDRInfoBox } from '../../components/SLDRComponents'

const ConsumptionStep = () => {
  const { t } = useTranslation()

  return (
    <>
      <Container>
        <Typography variant="h3">{t('CONSUMPTION.TITLE')}</Typography>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('CONSUMPTION.TARIFA_DESCRIPTION'),
          }}
        />
        <br />
        <SLDRInfoBox>
          <PreciosTarifa></PreciosTarifa>
        </SLDRInfoBox>
        <Box sx={{ mt: '1rem' }}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('CONSUMPTION.TIPO_CONSUMO_DESCRIPTION'),
            }}
          />
          <ConsumptionSummary></ConsumptionSummary>
        </Box>
      </Container>
    </>
  )
}

export default ConsumptionStep
