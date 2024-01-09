import { useContext } from 'react' //DEMO: Detalle
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

// REACT Solidar Components
import PreciosTarifa from './PreciosTarifa'
import ConsumptionSummary from './ConsumptionSummary'
import { SLDRInfoBox, SLDRDetalle } from '../../components/SLDRComponents'
import { AlertContext } from '../components/Alert'

const ConsumptionStep = () => {
  const { t } = useTranslation()
  const { inLineHelp } = useContext(AlertContext)

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

        {inLineHelp && (
          <SLDRDetalle
            title="TITULO 1"
            text={t('LOCATION.IN_LINE_HELP.PRE_ADDRESS')}
          ></SLDRDetalle>
        )}

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
