import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TCB from '../classes/TCB'
import Plot from 'react-plotly.js'
import * as UTIL from '../classes/Utiles'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

const ProfileDayConsumption = (data) => {
  const { t, i18n } = useTranslation()

  const [dia, setDia] = useState(data.diaActivo)
  const [consumo, setConsumo] = useState(data.consumo)

  console.dir(data.diaActivo)

  const fecha = UTIL.fechaDesdeIndice(data.diaActivo)
  console.log(fecha)

  var trace1 = {
    y: consumo.diaHora[data.diaActivo],
    type: 'scatter',
    showlegend: false,
    name: TCB.i18next.t('graficos_LBL_graficasConsumo'),
    line: { shape: 'spline', width: 3, color: 'rgb(0,0,255' },
  }

  var trace2 = {
    y: consumo.diaHora[data.diaActivo],
    type: 'bar',
    showlegend: false,
    width: 0.1,
    hoverinfo: 'none',
    marker: {
      color: consumo.diaHora[dia],
      cmax: consumo.cMaximoAnual,
      cmin: 0,
      colorscale: [
        ['0.0', 'rgb(250,250,250)'],
        ['0.10', 'rgb(240,240,240)'],
        ['0.20', 'rgb(230,200,200)'],
        ['0.5', 'rgb(220,120,150)'],
        ['1.0', 'rgb(254,79,67)'],
      ],
    },
  }
  var layout = {
    autosize: true,
    margin: {
      l: 50,
      r: 20,
      b: 65,
      t: 25,
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    title:
      TCB.i18next.t('graficos_LBL_graficasDia') +
      ': ' +
      fecha[0] +
      ' - ' +
      TCB.i18next.t(UTIL.nombreMes[parseInt(fecha[1])]),
    x: 10,
    y: 15,
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

export default ProfileDayConsumption
