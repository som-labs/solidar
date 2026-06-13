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
import * as UTIL from '../classes/Utiles'
//React global components
import { useDialog } from '../../components/DialogProvider'
import calculaResultados from '../classes/calculaResultados'

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
    calculaResultados()
  }

  const deficitStats = UTIL.statsSinCeros(TCB.balance.idxTable, 'excedente')
  const invierno = []
  const verano = []
  const medio = []
  for (let i = 0; i < 365; i++) {
    const mes = TCB.balance.idxTable[i].fecha.getMonth() + 1
    if (mes >= 10 || mes <= 3) {
      invierno.push(TCB.balance.idxTable[i])
    } else if (mes > 4 && mes < 9) {
      verano.push(TCB.balance.idxTable[i])
    } else {
      medio.push(TCB.balance.idxTable[i])
    }
  }
  const inviernoStats = UTIL.statsSinCeros(invierno, 'excedente')
  const veranoStats = UTIL.statsSinCeros(verano, 'excedente')
  const medioStats = UTIL.statsSinCeros(medio, 'excedente')

  console.log('bateria state:', bateria)

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

      <Grid item xs={12} sx={{ mb: '1rem' }}>
        <SLDRInfoBox>
          <Grid item xs={4}>
            <Typography variant="body2">
              {'Mediana excedente diario invierno: ' +
                UTIL.formatoValor('energia', inviernoStats.median)}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              {'Mediana excedente diario intermedio: ' +
                UTIL.formatoValor('energia', medioStats.median)}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              {'Mediana excedente diario verano: ' +
                UTIL.formatoValor('energia', veranoStats.median)}
            </Typography>
          </Grid>
        </SLDRInfoBox>
      </Grid>

      <Grid item xs={12} sx={{ mb: '1rem' }}>
        <SLDRInfoBox>
          <Grid item xs={4}>
            <Typography variant="body2">
              {'Excedente diario mínimo anual: ' +
                UTIL.formatoValor('energia', deficitStats.min)}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              {'Excedente diario mediana anual: ' +
                UTIL.formatoValor('energia', deficitStats.median)}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              {'Excedente diario máximo anual: ' +
                UTIL.formatoValor('energia', deficitStats.max)}
            </Typography>
          </Grid>
        </SLDRInfoBox>
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
              onClick={() => {
                const b = new Bateria()
                setBateria(b)
                TCB.bateria = b
                TCB.requiereOptimizador = true
              }}
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
