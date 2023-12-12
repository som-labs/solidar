import { useTranslation } from 'react-i18next'
import TCB from '../classes/TCB'
import Plot from 'react-plotly.js'
import * as UTIL from '../classes/Utiles'

import { Box, Typography, Container } from '@mui/material'

const PerfilDiario = (diaActivo) => {
  const { t, i18n } = useTranslation()

  if (diaActivo.children[1].length === 0) {
    return <></>
  }

  let clickedDate = diaActivo.children[1]
  let indexDay = UTIL.indiceDesdeDiaMes(clickedDate[0], clickedDate[1] - 1)

  const dia = clickedDate[0]
  const mes = TCB.i18next.t(UTIL.nombreMes[clickedDate[1] - 1])
  console.log(dia, mes)

  const trace1 = {
    y: TCB.consumo.diaHora[indexDay],
    type: 'scatter',
    showlegend: true,
    name: TCB.i18next.t('GRAPHICS.LABEL_CONSUMPTION'),
    line: { shape: 'spline', width: 3, color: 'rgb(0,0,255' },
    fill: 'tozeroy',
  }

  const trace2 = {
    y: TCB.produccion.diaHora[indexDay],
    type: 'scatter',
    showlegend: true,
    name: TCB.i18next.t('GRAPHICS.LABEL_PRODUCTION'),
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
    autosize: true,
    width: '100%',
    margin: {
      l: 50,
      r: 170,
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

  return (
    <Container>
      <Box
        sx={{
          width: '100%',
          mt: '2rem',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body" textAlign="center">
          {t('Perfil diario de consumo y produccion ') + dia + '/' + mes}
        </Typography>
        <Plot data={[trace1, trace2]} layout={layout} style={{ width: '100%' }} />
      </Box>
    </Container>
  )
}

export default PerfilDiario
