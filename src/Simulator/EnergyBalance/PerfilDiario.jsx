import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import TCB from '../classes/TCB'
import Plot from 'react-plotly.js'
import * as UTIL from '../classes/Utiles'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

const PerfilDiario = (diaActivo) => {
  const { t, i18n } = useTranslation()

  if (diaActivo.children[1].length === 0) {
    return <></>
  }

  let clickedDate = diaActivo.children[1]
  let indexDay = UTIL.indiceDesdeDiaMes(clickedDate[0], clickedDate[1] - 1)

  var trace1 = {
    y: TCB.consumo.diaHora[indexDay],
    type: 'scatter',
    showlegend: true,
    name: TCB.i18next.t('GRAPHICS.LABEL_CONSUMPTION'),
    line: { shape: 'line', width: 3, color: 'rgb(0,0,255' },
    fill: 'tozeroy',
  }

  var trace2 = {
    y: TCB.produccion.diaHora[indexDay],
    type: 'scatter',
    showlegend: true,
    name: TCB.i18next.t('GRAPHICS.LABEL_PRODUCTION'),
    line: { shape: 'line', width: 3, color: 'rgb(0,255,0' },
    fill: 'tozeroy',
  }

  var layout = {
    legend: {
      x: 0.9,
      xref: 'paper',
      y: 1.1,
      yref: 'paper',
    },
    autosize: true,
    margin: {
      l: 50,
      r: 20,
      b: 65,
      t: 25,
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    title: {
      text:
        TCB.i18next.t('graficos_LBL_graficasDia') +
        ': ' +
        clickedDate[0] +
        ' - ' +
        TCB.i18next.t(UTIL.nombreMes[parseInt(clickedDate[1]) - 1]),
      xref: 'paper',
      x: 0,
      yref: 'paper',
      y: 1.1,
    },
    xaxis: { title: TCB.i18next.t('graficos_LBL_graficasHora'), dtick: 4 },
    yaxis: {
      title: 'kWh',
      showline: true,
      zeroline: true,
      zerolinecolor: '#969696',
      gridcolor: '#bdbdbd',
      gridwidth: 2,
    },
  }

  return (
    <>
      <Container>
        <Typography variant="body">
          {t('Aqui va el perfil diario de consumo y produccion')}
        </Typography>
        <Plot data={[trace1, trace2]} layout={{ layout }} style={{ width: '100%' }} />
      </Container>
    </>
  )
}

export default PerfilDiario
