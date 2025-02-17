import { useRef, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import { Box, Button, Typography } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { EnergyContext } from '../EnergyContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function ProfileDay(props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const { diaActivo, onClose } = props
  const { consumoGlobal, produccionGlobal } = useContext(EnergyContext)
  const divGraph = useRef()
  const graphElement = useRef()
  const graphWidth = useRef()

  //useEffect(() => {
  // Function to get the width of the element
  const getWidth = () => {
    if (graphElement.current) {
      graphWidth.current = graphElement.current.offsetWidth
    }
  }
  // Call the function to get the width after initial render
  getWidth()
  //}, [])

  if (!diaActivo) {
    return <></>
  }

  let clickedDate = diaActivo
  let indexDay = UTIL.indiceDesdeDiaMes(clickedDate[0], clickedDate[1] - 1)

  const dia = clickedDate[0]
  const mes = t(UTIL.nombreMes[clickedDate[1] - 1])

  const trace1 = {
    y: consumoGlobal.diaHora[indexDay],
    type: 'scatter',
    showlegend: true,
    name: t('GRAPHICS.LABEL_CONSUMPTION'),
    line: { shape: 'spline', width: 3, color: theme.palette.balance.consumo },
    fill: 'tozeroy',
  }

  const trace2 = {
    y: produccionGlobal.diaHora[indexDay],
    type: 'scatter',
    showlegend: true,
    name: t('GRAPHICS.LABEL_PRODUCTION'),
    line: { shape: 'spline', width: 3, color: theme.palette.balance.produccion },
    fill: 'tozeroy',
  }

  const maxDay = Math.max([
    Math.max(produccionGlobal.diaHora[indexDay]),
    Math.max(consumoGlobal.diaHora[indexDay]),
  ])

  const layout = {
    font: {
      color: theme.palette.text.primary,
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    width: graphWidth.current,
    height: graphWidth.current,
    autosize: true,
    margin: {
      l: 50,
      r: 70,
      b: 20,
      t: 20,
    },
    xaxis: {
      title: t('BASIC.LABEL_HORA'),
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
        <Typography sx={theme.titles.level_1} textAlign={'center'} gutterBottom>
          {t('ENERGY_BALANCE.TITLE_GRAFICO_PROFILE', { dia: dia, mes: mes })}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <div ref={divGraph}>
          <Plot data={[trace1, trace2]} layout={layout} config={config} />
        </div>
      </DialogContent>
      <DialogActions sx={{ mt: '1rem', mb: '2rem' }}>
        <Button onClick={onClose}>{t('BASIC.LABEL_CLOSE')}</Button>
      </DialogActions>
    </Box>
  )
}
