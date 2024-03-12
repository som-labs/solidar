import { useContext } from 'react' //DEMO: Detalle
import { useTranslation } from 'react-i18next'

// MUI objects

import { IconButton, Grid, Typography, Box } from '@mui/material'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
// REACT Solidar Components
import PreciosTarifa from './PreciosTarifa'
import ConsumptionSummary from './ConsumptionSummary'
import { SLDRInfoBox, SLDRDetalle } from '../../components/SLDRComponents'
import { AlertContext } from '../components/Alert'
import HelpExcedentCompensation from './HelpExcedentCompensation'

//React global components
import { useDialog } from '../../components/DialogProvider'

const ConsumptionStep = () => {
  const { t } = useTranslation()
  const { inLineHelp } = useContext(AlertContext)
  //REVISAR: como meter el icono en el medio del texto
  const [openDialog, closeDialog] = useDialog()

  function help() {
    openDialog({
      children: <HelpExcedentCompensation onClose={() => closeDialog()} />,
    })
  }

  return (
    <>
      <Grid container rowSpacing={1}>
        <Grid item xs={12}>
          <Typography variant="h3">{t('CONSUMPTION.TITLE')}</Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('CONSUMPTION.TARIFA_DESCRIPTION_1'),
            }}
          />
          <IconButton
            onClick={() => help()}
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
        <Grid>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('CONSUMPTION.TARIFA_DESCRIPTION_2', { icono: '<HelpIcon />' }),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <SLDRInfoBox>
            <PreciosTarifa></PreciosTarifa>
          </SLDRInfoBox>
        </Grid>
        <Grid>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('CONSUMPTION.TIPO_CONSUMO_DESCRIPTION'),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <ConsumptionSummary></ConsumptionSummary>
        </Grid>
      </Grid>
    </>
  )
}

export default ConsumptionStep
