import { useContext } from 'react' //DEMO: Detalle
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Box, Grid } from '@mui/material'

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
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12}>
          <Typography variant="h3">{t('LOCATION.TITLE')}</Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('LOCATION.DESCRIPTION'),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          {inLineHelp && (
            <SLDRDetalle
              title="TITULO 1"
              text={t('LOCATION.IN_LINE_HELP.PRE_ADDRESS')}
            ></SLDRDetalle>
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body">{t('LOCATION.DESCRIPTION_ADDRESS')}</Typography>
        </Grid>

        {/* Campo  para introducir una direccion */}
        <Grid item xs={12}>
          <SLDRInfoBox>
            <AddressSearch></AddressSearch>
          </SLDRInfoBox>
        </Grid>
        <Grid item xs={12}>
          {inLineHelp && (
            <SLDRDetalle
              title="TITULO 2"
              text={t('LOCATION.IN_LINE_HELP.PRE_MAPA')}
            ></SLDRDetalle>
          )}
        </Grid>
        <Grid item xs={12}>
          <SLDRInfoBox>
            <MapComponent></MapComponent>
          </SLDRInfoBox>
        </Grid>
        <Grid item xs={12}>
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
        </Grid>
      </Grid>
    </>
  )
}

export default LocationStep
