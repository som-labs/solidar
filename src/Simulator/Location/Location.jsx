import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Grid, IconButton, Container } from '@mui/material'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { SLDRDetalle, SLDRInfoBox } from '../../components/SLDRComponents'
import { AlertContext } from '../components/Alert'
import AddressSearch from './AddressSearch'
import PanelsSelector from './PanelsSelector.jsx'
import MapComponent from './MapComponent'
import BasesSummary from './BasesSummary'
import HelpAvailableAreas from './HelpAvailableAreas.jsx'
import { BasesContext } from '../BasesContext'

//React global components
import { useDialog } from '../../components/DialogProvider'

import TCB from '../classes/TCB'
import { transform } from 'ol/proj'

const LocationStep = () => {
  const { t } = useTranslation()
  const theme = useTheme()

  const { inLineHelp } = useContext(AlertContext)
  const [openDialog, closeDialog] = useDialog()
  const { map } = useContext(BasesContext)

  function help(level) {
    const title = t('LOCATION.HELP.TITLE_' + level)
    let lon, lat
    if (level === 3) {
      const center = map.getView().getCenter()
      const lonLat = transform(center, 'EPSG:3857', 'EPSG:4326')
      lon = lonLat[0]
      lat = lonLat[1]
    }

    openDialog({
      children: (
        <HelpAvailableAreas
          title={title}
          level={level}
          lon={lon}
          lat={lat}
          onClose={() => closeDialog()}
        />
      ),
    })
  }
  return (
    <Grid container rowSpacing={2}>
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
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('LOCATION.DESCRIPTION_ADDRESS'),
          }}
        />
      </Grid>

      {/* Campo  para introducir una direccion */}
      <Grid item xs={12}>
        <AddressSearch></AddressSearch>
      </Grid>

      {/* Box to define panels characteristics */}
      <Grid item xs={12}>
        <SLDRInfoBox>
          <PanelsSelector></PanelsSelector>
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

      <Grid container>
        <Grid item xs={12}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('LOCATION.PROMPT_DISPONIBLE'),
            }}
          />
          <IconButton
            onClick={() => help(1)}
            size="small"
            style={{
              fontSize: 'inherit',
              padding: 0,
              verticalAlign: 'text-center',
              transform: 'scale(0.8)',
            }}
          >
            <HelpIcon />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('LOCATION.PROMPT_SOMBRAS'),
            }}
          />
          <IconButton
            onClick={() => help(3)}
            size="small"
            style={{
              fontSize: 'inherit',
              padding: 0,
              verticalAlign: 'text-center',
              transform: 'scale(0.8)',
            }}
          >
            <HelpIcon />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body"
            style={{ lineHeight: 'inherit' }}
            dangerouslySetInnerHTML={{
              __html: t('LOCATION.PROMPT_DRAW'),
            }}
          />
          <IconButton
            onClick={() => help(2)}
            size="small"
            style={{
              fontSize: 'inherit',
              verticalAlign: 'text-center',
              transform: 'scale(0.8)',
              padding: 0,
            }}
          >
            <HelpIcon />
          </IconButton>
        </Grid>
      </Grid>

      <Grid
        item
        xs={12}
        sx={{ alignItems: 'center', alignContent: ' center', justifyContent: 'center' }}
      >
        <SLDRInfoBox sx={{ width: '100%' }}>
          <MapComponent></MapComponent>
        </SLDRInfoBox>
      </Grid>

      {inLineHelp && (
        <Grid item xs={12}>
          <SLDRDetalle
            title="TITULO 3"
            text={t('LOCATION.IN_LINE_HELP.PRE_TABLA')}
          ></SLDRDetalle>
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography sx={theme.titles.level_1} textAlign={'center'}>
          {t('LOCATION.LABEL_BASES_SUMMARY')}
        </Typography>
        <Typography variant="body">{t('LOCATION.PROMPT_BASES_SUMMARY')}</Typography>
        <BasesSummary></BasesSummary>
      </Grid>

      {inLineHelp && (
        <Grid item xs={12}>
          <SLDRDetalle
            title="TITULO 4"
            text={t('LOCATION.IN_LINE_HELP.POST_TABLA')}
          ></SLDRDetalle>
        </Grid>
      )}
    </Grid>
  )
}

export default LocationStep
