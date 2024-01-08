import { useContext } from 'react' //DEMO: Detalle
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Box } from '@mui/material'

// REACT Solidar Components
import { SLDRDetalle, SLDRInfoBox } from '../../components/SLDRComponents'
import { AlertContext } from '../components/Alert'
import AddressSearch from './AddressSearch'
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
        <br />
        <Typography variant="body">{t('LOCATION.DESCRIPTION_ADDRESS')}</Typography>
        <br />

        {/* Campo  para introducir una direccion */}
        <SLDRInfoBox
          sx={{
            mr: '0.3rem',
            mb: '0.3rem',
          }}
        >
          <AddressSearch></AddressSearch>
        </SLDRInfoBox>

        {inLineHelp && (
          <SLDRDetalle
            title="TITULO 2"
            text={t('LOCATION.IN_LINE_HELP.PRE_MAPA')}
          ></SLDRDetalle>
        )}
        <SLDRInfoBox
          sx={{
            mr: '0.3rem',
            mb: '0.3rem',
          }}
        >
          <MapComponent></MapComponent>
        </SLDRInfoBox>
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
