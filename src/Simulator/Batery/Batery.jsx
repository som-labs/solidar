import { useContext, useMemo, useState } from 'react'
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
  }

  function eliminarBateria() {
    setBateria(null)
    TCB.bateria = null
    calculaResultados()
    setStatsConBateria(null)
  }

  // Stats con batería — se actualizan cuando BateryForm recalcula
  const [statsConBateria, setStatsConBateria] = useState(null)

  function handleResultados() {
    const invierno = [],
      verano = [],
      medio = []
    for (let i = 0; i < 365; i++) {
      const mes = TCB.balance.idxTable[i].fecha.getMonth() + 1
      if (mes >= 11 || mes <= 2) invierno.push(TCB.balance.idxTable[i])
      else if (mes >= 5 && mes <= 8) verano.push(TCB.balance.idxTable[i])
      else medio.push(TCB.balance.idxTable[i])
    }

    const deficit = UTIL.statsSinCeros(TCB.balance.idxTable, 'excedente')
    const inv = UTIL.statsSinCeros(invierno, 'excedente')
    const ver = UTIL.statsSinCeros(verano, 'excedente')
    const med = UTIL.statsSinCeros(medio, 'excedente')
    const autoconsumo = TCB.balance.autoconsumo / TCB.produccion.totalAnual
    const autosuficiencia = TCB.balance.autoconsumo / TCB.consumo.totalAnual

    setStatsConBateria({
      deficitStats: deficit,
      inviernoStats: inv,
      veranoStats: ver,
      medioStats: med,
      autoconsumo: autoconsumo,
      autosuficiencia: autosuficiencia,
    })
  }

  return (
    <Grid
      container
      sx={{ mb: '1rem', mt: '1rem' }}
      alignItems="center"
      justifyContent="space-evenly"
    >
      <SLDRInfoBox>
        <Grid item xs={12} sx={{ mb: '1rem' }}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('Bateria.DESCRIPTION'),
            }}
          />
        </Grid>

        <Grid container rowSpacing={1}>
          <Grid item xs={12}>
            <Typography
              variant="body1"
              fontWeight={500}
              textAlign="center"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}
            >
              Datos sin batería
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              {'Mediana excedente diario invierno: ' +
                UTIL.formatoValor(
                  'produccionTotal',
                  TCB.statsSinBateria.inviernoStats.median,
                )}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              {'Mediana excedente diario intermedio: ' +
                UTIL.formatoValor(
                  'produccionTotal',
                  TCB.statsSinBateria.medioStats.median,
                )}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              {'Mediana excedente diario verano: ' +
                UTIL.formatoValor(
                  'produccionTotal',
                  TCB.statsSinBateria.veranoStats.median,
                )}
            </Typography>
          </Grid>

          <Grid item xs={4}>
            <Typography variant="body2">
              {'Excedente diario mínimo anual: ' +
                UTIL.formatoValor(
                  'produccionTotal',
                  TCB.statsSinBateria.deficitStats.min,
                )}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              {'Excedente diario mediana anual: ' +
                UTIL.formatoValor(
                  'produccionTotal',
                  TCB.statsSinBateria.deficitStats.median,
                )}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              {'Excedente diario máximo anual: ' +
                UTIL.formatoValor(
                  'produccionTotal',
                  TCB.statsSinBateria.deficitStats.max,
                )}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="center">
            <Typography variant="body2">
              {'Autosuficiencia: ' +
                UTIL.formatoValor('porciento', TCB.statsSinBateria.autosuficiencia * 100)}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="center">
            <Typography variant="body2">
              {'Autoconsumo: ' +
                UTIL.formatoValor('porciento', TCB.statsSinBateria.autoconsumo * 100)}
            </Typography>
          </Grid>
        </Grid>

        {statsConBateria && (
          <Grid container rowSpacing={1} sx={{ mt: '1rem' }}>
            <Grid item xs={12}>
              <Typography
                variant="body1"
                fontWeight={500}
                textAlign="center"
                sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}
              >
                Datos con batería
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                {'Mediana excedente diario invierno: ' +
                  UTIL.formatoValor(
                    'produccionTotal',
                    statsConBateria.inviernoStats.median,
                  )}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                {'Mediana excedente diario intermedio: ' +
                  UTIL.formatoValor('produccionTotal', statsConBateria.medioStats.median)}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                {'Mediana excedente diario verano: ' +
                  UTIL.formatoValor(
                    'produccionTotal',
                    statsConBateria.veranoStats.median,
                  )}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                {'Excedente diario mínimo anual: ' +
                  UTIL.formatoValor('produccionTotal', statsConBateria.deficitStats.min)}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                {'Excedente diario mediana anual: ' +
                  UTIL.formatoValor(
                    'produccionTotal',
                    statsConBateria.deficitStats.median,
                  )}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                {'Excedente diario máximo anual: ' +
                  UTIL.formatoValor('produccionTotal', statsConBateria.deficitStats.max)}
              </Typography>
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Typography variant="body2">
                {'Autosuficiencia: ' +
                  UTIL.formatoValor('porciento', statsConBateria.autosuficiencia * 100)}
              </Typography>
            </Grid>
            <Grid item xs={6} textAlign="center">
              <Typography variant="body2">
                {'Autoconsumo: ' +
                  UTIL.formatoValor('porciento', statsConBateria.autoconsumo * 100)}
              </Typography>
            </Grid>
          </Grid>
        )}
      </SLDRInfoBox>

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
              }}
              sx={{ mt: '1rem' }}
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
              sx={{ mt: '1rem' }}
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
            onResultados={handleResultados} // <-- nuevo
          />
        )}
      </Grid>
    </Grid>
  )
}

export default BateryStep
