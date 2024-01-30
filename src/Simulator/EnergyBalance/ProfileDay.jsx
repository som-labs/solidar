import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import { Box, Button } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function ProfileDay(props) {
  const { t } = useTranslation()
  const { diaActivo, onClose } = props

  if (!diaActivo) {
    return <></>
  }

  let clickedDate = diaActivo
  let indexDay = UTIL.indiceDesdeDiaMes(clickedDate[0], clickedDate[1] - 1)

  const dia = clickedDate[0]
  const mes = t(UTIL.nombreMes[clickedDate[1] - 1])

  const trace1 = {
    y: TCB.consumo.diaHora[indexDay],
    type: 'scatter',
    showlegend: true,
    name: t('GRAPHICS.LABEL_CONSUMPTION'),
    line: { shape: 'spline', width: 3, color: 'rgb(0,0,255)' },
    fill: 'tozeroy',
  }

  const trace2 = {
    y: TCB.produccion.diaHora[indexDay],
    type: 'scatter',
    showlegend: true,
    name: t('GRAPHICS.LABEL_PRODUCTION'),
    line: { shape: 'spline', width: 3, color: 'rgb(0,255,0' },
    fill: 'tozeroy',
  }

  const maxDay = Math.max([
    Math.max(TCB.produccion.diaHora[indexDay]),
    Math.max(TCB.consumo.diaHora[indexDay]),
  ])

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    autosize: false,
    width: '100%',
    margin: {
      l: 50,
      r: 70,
      b: 20,
      t: 20,
    },
    xaxis: {
      title: t('GRAPHICS.LABEL_HORA'),
      dtick: 2,
      zeroline: false,
      range: [0, 23],
    },
    yaxis: {
      zeroline: true,
      title: 'kWh',
      showticklabels: true,
      showgrid: true,
      showline: true,
      linecolor: 'primary.light',
      tickfont_color: 'primary.light',
      ticks: 'outside',
      tickcolor: 'primary.light',
      tickmode: 'auto',
      range: [0, maxDay],
    },
    legend: {
      x: 0.3,
      xref: 'paper',
      y: -0.15,
      yref: 'paper',
      orientation: 'h',
    },
  }

  const config = {
    displayModeBar: false,
  }

  return (
    <Box
      sx={{
        width: '100%',
        mt: '2rem',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <DialogTitle>
        {t('ENERGY_BALANCE.TITLE_GRAFICO_PROFILE', { dia: dia, mes: mes })}
      </DialogTitle>
      <DialogContent>
        <Plot data={[trace1, trace2]} layout={layout} config={config} />
      </DialogContent>
      <DialogActions sx={{ mt: '1rem', mb: '2rem' }}>
        <Button onClick={onClose}>{t('BASIC.LABEL_CLOSE')}</Button>
      </DialogActions>
    </Box>
  )
}
