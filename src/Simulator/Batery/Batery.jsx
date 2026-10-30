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
import { SLDRInfoBox, SLDRTooltip, SLDRCollapsibleCard } from '../../components/SLDRComponents'
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

  function nuevaBateria() {
    const new_bateria = new Bateria()
    new_bateria.capacidad = Math.round(TCB.BaseSolar.reduce((sum, tBase) => sum + tBase.instalacion.potenciaTotal, 0) * 1.2)
    TCB.bateria = new_bateria
    setBateria(new_bateria)
    calculaResultados()
    handleResultados()

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
        <Grid item xs={12} sx={{ mb: '1rem' }}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('Bateria.DESCRIPTION'),
            }}
          />
        </Grid>

        {/* Datos sin bateria */}
        <Grid container rowSpacing={1} 
            sx={{
              '& .MuiGrid-item': {
                display: 'flex',
                alignItems: 'center',      // vertical
                justifyContent: 'center',  // horizontal
                textAlign: 'center',       // por si el texto ocupa varias líneas
                py: 1.,
                minHeight: 25,
              },
            }}>
          <Grid item xs={12}>
            <Typography
              variant="body1"
              fontWeight={500}
              textAlign="center"
              verticalAlign="middle"
              sx={{ borderBottom: '1px solid',  pb: 0.5 }}
            >
              {t('Bateria.LABEL_DATOS_SIN_BATERIA')}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ backgroundColor: 'lightgray' }}>
            <Typography variant="body2">
              {t('Bateria.LABEL_MEDIANA_EXCEDENTE_INVIERNO',{excedente:
                UTIL.formatoValor(
                  'produccionTotal',
                  TCB.statsSinBateria.inviernoStats.median,
                )})}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ backgroundColor: 'yellow' }}>
            <Typography variant="body2">
              {t('Bateria.LABEL_MEDIANA_EXCEDENTE_INTERMEDIO',{excedente:
                UTIL.formatoValor(
                  'produccionTotal',
                  TCB.statsSinBateria.medioStats.median,
              )})}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ backgroundColor: 'lightgreen' }}>
            <Typography variant="body2">
              {t('Bateria.LABEL_MEDIANA_EXCEDENTE_VERANO',{excedente:
                UTIL.formatoValor(
                  'produccionTotal',
                  TCB.statsSinBateria.veranoStats.median,
              )})}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ backgroundColor: 'lightgray' }}>
            <Typography variant="body2">
              {t('Bateria.LABEL_MINIMO_EXCEDENTE', {excedente:
                UTIL.formatoValor(
                  'produccionTotal',
                  TCB.statsSinBateria.deficitStats.min,
              )})}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ backgroundColor: 'yellow' }}>
            <Typography variant="body2">
              {t('Bateria.LABEL_MEDIANA_EXCEDENTE', {excedente:
                UTIL.formatoValor(
                  'produccionTotal',
                  TCB.statsSinBateria.deficitStats.median,
              )})}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ backgroundColor: 'lightgreen' }}>
            <Typography variant="body2">
              {t('Bateria.LABEL_MAXIMO_EXCEDENTE', {excedente:
                UTIL.formatoValor(
                  'produccionTotal',
                  TCB.statsSinBateria.deficitStats.max,
              )})}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="center" sx={{ border: '1px solid', borderColor: 'divider'}}>
            <SLDRTooltip title={t('Balance.TOOLTIP.autosuficienciaMediaAnual')}>
              <Typography variant="body2">
                {t('Balance.PROP.autosuficienciaMediaAnual') + ': ' +
                  UTIL.formatoValor('porciento', TCB.statsSinBateria.autosuficiencia * 100)}
              </Typography>
            </SLDRTooltip>
          </Grid>
          <Grid item xs={6} textAlign="center" sx={{ border: '1px solid', borderColor: 'divider'}}>
            <SLDRTooltip title={t('Balance.TOOLTIP.autoconsumoMedioAnual')}>
              <Typography variant="body2">
                {t('Balance.PROP.autoconsumoMedioAnual') + ': ' +
                  UTIL.formatoValor('porciento', TCB.statsSinBateria.autoconsumo * 100)}
              </Typography>
            </SLDRTooltip>
          </Grid>
        </Grid>

        {/* ── Botón principal ── */}
      <Grid item xs={12} textAlign="center">
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
              sx={{ mt: '1rem' }}
            >
              {t('Bateria.LABEL_CREATE') }
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
      </Grid>

      {/* Datos con bateria */}
      {statsConBateria && (
        <Grid container rowSpacing={1} 
          sx={{
            '& .MuiGrid-item': {
              display: 'flex',
              alignItems: 'center',      // vertical
              justifyContent: 'center',  // horizontal
              textAlign: 'center',       // por si el texto ocupa varias líneas
              py: 1.,
              minHeight: 25,
            },
          }}>

          <Grid item xs={12}>
            <Typography
              variant="body1"
              fontWeight={500}
              textAlign="center"
              verticalAlign="middle"
              sx={{ borderBottom: '1px solid', pb: 0.5 , mt: '1rem'}}
              dangerouslySetInnerHTML={{
                __html: t('Bateria.LABEL_DATOS_CON_BATERIA', { capacidad: UTIL.formatoValor('capacidad', bateria.capacidad) })
              }}
            >
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ backgroundColor: 'lightgray' }}>
            <Typography variant="body2">
              {t('Bateria.LABEL_MEDIANA_EXCEDENTE_INVIERNO',{excedente:
                UTIL.formatoValor(
                  'produccionTotal',
                  statsConBateria.inviernoStats.median,
              )})}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ backgroundColor: 'yellow' }}>
            <Typography variant="body2">
              {t('Bateria.LABEL_MEDIANA_EXCEDENTE_INTERMEDIO',{excedente:
                UTIL.formatoValor('produccionTotal', statsConBateria.medioStats.median)})}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ backgroundColor: 'lightgreen' }}>
            <Typography variant="body2">
              {t('Bateria.LABEL_MEDIANA_EXCEDENTE_VERANO',{excedente:
                UTIL.formatoValor(
                  'produccionTotal',
                  statsConBateria.veranoStats.median,
              )})}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ backgroundColor: 'lightgray' }}>
            <Typography variant="body2">
              {t('Bateria.LABEL_MINIMO_EXCEDENTE', {excedente:
                UTIL.formatoValor('produccionTotal', statsConBateria.deficitStats.min)})}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ backgroundColor: 'yellow' }}>
            <Typography variant="body2">
               {t('Bateria.LABEL_MEDIANA_EXCEDENTE', {excedente:
                UTIL.formatoValor(
                  'produccionTotal',
                  statsConBateria.deficitStats.median,
               )})}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ backgroundColor: 'lightgreen' }}>
            <Typography variant="body2">
              {t('Bateria.LABEL_MAXIMO_EXCEDENTE', {excedente:
                UTIL.formatoValor('produccionTotal', statsConBateria.deficitStats.max)})}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="center" sx={{ border: '1px solid', borderColor: 'divider'}}>
              <Typography variant="body2">
                {t('Balance.PROP.autosuficienciaMediaAnual') + ': ' +
                  UTIL.formatoValor('porciento', statsConBateria.autosuficiencia * 100)}
              </Typography>
    
          </Grid>
          <Grid item xs={6} textAlign="center" sx={{ border: '1px solid', borderColor: 'divider'}}>
              <Typography variant="body2">
                {t('Balance.PROP.autoconsumoMedioAnual') + ': ' +
                  UTIL.formatoValor('porciento', statsConBateria.autoconsumo * 100)}
              </Typography>
          </Grid>
        </Grid>
      )}

      {/* Detalles de la batería */}
      {bateria && (
        <Grid item xs={12} sx={{ mt: '1rem' }}>
          <Grid item xs={12}>
            <Typography
              variant="body"
              dangerouslySetInnerHTML={{
                __html: t('Bateria.DETALLES', { capacidad: UTIL.formatoValor('capacidad', bateria.capacidad) }),
              }}
            />   
          </Grid>
            <SLDRCollapsibleCard
              expanded={true}
              titleSX={theme.titles.level_1}
              title={t('Bateria.DETALLES_TECNICOS')}
            >
              <Grid item xs={12} sx={{ mt: '1rem' }}>
                <BateryForm
                  bateriaInicial={bateria}
                  setBateriaValida={setBateriaValida}
                  setBateria={setBateria}
                  onResultados={handleResultados} // <-- nuevo
                />
              </Grid>
            </SLDRCollapsibleCard>
        </Grid>
      )}
    </Grid>
  )
}

export default BateryStep
