import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { IconButton, Grid, Typography, Container } from '@mui/material'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import PreciosTarifa from './PreciosTarifa'
import ConsumptionSummary from './ConsumptionSummary'
import { SLDRInfoBox, SLDRDetalle } from '../../components/SLDRComponents'
import { useAlert } from '../../components/AlertProvider.jsx'
import { AlertContext } from '../components/Alert'
import HelpConsumption from './HelpConsumption'
import HelpDistribuidora from './HelpDistribuidora'

//React global components
import { useDialog } from '../../components/DialogProvider'

const ConsumptionStep = () => {
  const { t } = useTranslation()
  const theme = useTheme()

  const [openDialog, closeDialog] = useDialog()

  function help(level) {
    if (level === 1)
      openDialog({
        children: <HelpConsumption onClose={() => closeDialog()} />,
      })
  }

  return (
    <Container>
      <Grid container rowSpacing={3}>
        <Grid item xs={12}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('CONSUMPTION.TARIFA_DESCRIPTION_1'),
            }}
          />
          <IconButton
            onClick={() => help(1)}
            size="small"
            style={{
              color: theme.palette.helpIcon.main,
              fontSize: 'inherit',
              verticalAlign: 'text-center',
              transform: 'scale(0.8)',
              padding: 0,
            }}
          >
            <HelpIcon />
          </IconButton>
        </Grid>

        <Grid item xs={12}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('CONSUMPTION.TARIFA_DESCRIPTION_2'),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <SLDRInfoBox>
            <PreciosTarifa></PreciosTarifa>
          </SLDRInfoBox>
        </Grid>

        <Grid item xs={12}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('CONSUMPTION.TIPO_CONSUMO_DESCRIPTION_1'),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <ConsumptionSummary></ConsumptionSummary>
        </Grid>
      </Grid>
    </Container>
  )
}

export default ConsumptionStep
