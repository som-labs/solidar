import { useContext } from 'react' //DEMO: Detalle
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Grid } from '@mui/material'

// REACT Solidar Components
import { SLDRDetalle, SLDRInfoBox } from '../../components/SLDRComponents'
import { AlertContext } from '../components/Alert'
import AddressSearch from './AddressSearch'
import PanelsSelector from './PanelsSelector.jsx'
import MapComponent from './MapComponent'
import BasesSummary from './BasesSummary'

const LocationStep = () => {
  const { t } = useTranslation()
  //DEMO: Detalle
  const { inLineHelp } = useContext(AlertContext)

  return (
    <Grid container rowSpacing={1}>
      <Grid item xs={12}>
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
        <AddressSearch></AddressSearch>
      </Grid>

      {/* Box to define panels characteristics */}
      <SLDRInfoBox>
        <PanelsSelector></PanelsSelector>
      </SLDRInfoBox>

      <Grid item xs={12}>
        {inLineHelp && (
          <SLDRDetalle
            title="TITULO 2"
            text={t('LOCATION.IN_LINE_HELP.PRE_MAPA')}
          ></SLDRDetalle>
        )}
      </Grid>

      <Grid
        item
        xs={10}
        sx={{ alignItems: 'center', alignContent: ' center', justifyContent: 'center' }}
      >
        <SLDRInfoBox sx={{ width: '80%', ml: 20 }}>
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
  )
}

export default LocationStep
