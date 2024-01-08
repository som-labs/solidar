import { useContext } from 'react' //DEMO: Detalle
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

// REACT Solidar Components
import { SLDRDetalle } from '../../components/SLDRComponents'
import { AlertContext } from '../components/Alert'
import MapComponent from './MapComponent'
import BasesSummary from './BasesSummary'

const LocationStep = () => {
  const { t } = useTranslation()
  //DEMO: Detalle
  const { inLineHelp } = useContext(AlertContext)

  return (
    <>
      <Container
        maxWidth="lg"
        //REVISAR: se pretende definir el formato de los headers de las tablas pero solo funciona el BackgroundColor
        // sx={{
        //   width: '100%',
        //   '.dataGrid-headers': {
        //     backgroundColor: 'rgb(200, 249, 233)',
        //     fontWeight: 'bold',
        //     textAlign: 'center',
        //   },
        // }}
      >
        <Typography variant="h3">{t('LOCATION.TITLE')}</Typography>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('LOCATION.DESCRIPTION'),
          }}
        />
        {inLineHelp && (
          <SLDRDetalle
            title="TITULO 1"
            text={t('LOCATION.IN_LINE_HELP.PRE_ADDRESS')}
          ></SLDRDetalle>
        )}
        {inLineHelp && (
          <SLDRDetalle
            title="TITULO 2"
            text={t('LOCATION.IN_LINE_HELP.PRE_MAPA')}
          ></SLDRDetalle>
        )}
        <MapComponent></MapComponent>
        {inLineHelp && (
          <SLDRDetalle
            title="TITULO 3"
            text={t('LOCATION.IN_LINE_HELP.PRE_TABLA')}
          ></SLDRDetalle>
        )}
        <BasesSummary></BasesSummary>
        {inLineHelp && (
          <SLDRDetalle
            title="TITULO 4"
            text={t('LOCATION.IN_LINE_HELP.POST_TABLA')}
          ></SLDRDetalle>
        )}
      </Container>
    </>
  )
}

export default LocationStep
