import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Button, Grid, Typography, Container } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
// import PreciosTarifa from './PreciosTarifa'
// import ConsumptionSummary from './ConsumptionSummary'
import { SLDRInfoBox, SLDRDetalle, SLDRTooltip } from '../../components/SLDRComponents'
import { AlertContext } from '../components/Alert'
import BateryForm from './BateryForm'
import Bateria from '../classes/Bateria'
// import HelpConsumption from './HelpConsumption'
// import HelpDistribuidora from './HelpDistribuidora'
import TCB from '../classes/TCB'
//React global components
import { useDialog } from '../../components/DialogProvider'

const BateryStep = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { inLineHelp } = useContext(AlertContext)
  const [openDialog, closeDialog] = useDialog()
  const { bateria, setBateria, setBateriaValida } = useContext(ConsumptionContext)

  function help(level) {
    if (level === 1)
      openDialog({
        children: <HelpConsumption onClose={() => closeDialog()} />,
      })
  }

  function nuevaBateria(bateria) {
    const new_bateria = new Bateria(bateria)
    setBateria(new_bateria)
    TCB.bateria = new_bateria
    TCB.requiereOptimizador = true
  }

  function eliminarBateria() {
    setBateria(null)
    TCB.bateria = null
    TCB.requiereOptimizador = true
  }

  return (
    <Grid
      container
      sx={{ mb: '1rem', mt: '1rem' }}
      alignItems="center"
      justifyContent="space-evenly"
    >
      <Grid item xs={12} sx={{ mb: '1rem' }}>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('Bateria.DESCRIPTION'),
          }}
        />
      </Grid>
      <Grid item xs={12} textAlign="center">
        {/* ── Botón principal ── */}
        {!bateria ? (
          <SLDRTooltip
            title={<Typography>{t('Bateria.TOOLTIP_BUTTON_NUEVA_BATERIA')}</Typography>}
            placement="top"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={nuevaBateria}
            >
              {t('Bateria.LABEL_CREATE')}
            </Button>
          </SLDRTooltip>
        ) : (
          <SLDRTooltip
            title={<Typography>{t('Bateria.TOOLTIP_BUTTON_BORRA_BATERIA')}</Typography>}
            placement="top"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<DeleteIcon />}
              onClick={eliminarBateria}
            >
              {t('Bateria.LABEL_DELETE')}
            </Button>
          </SLDRTooltip>
        )}
        {bateria && (
          <BateryForm
            bateriaInicial={bateria}
            setBateriaValida={setBateriaValida}
            setBateria={setBateria}
            nuevaBateria={nuevaBateria}
          />
        )}
      </Grid>
    </Grid>
  )
}

export default BateryStep
