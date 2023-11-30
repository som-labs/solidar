import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TCB from '../classes/TCB'
import Plot from 'react-plotly.js'

import * as UTIL from '../classes/Utiles'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

//REVISAR: no aparece los valores de consumo en el eje Y
const ProfileDayConsumption = (data) => {
  const { t, i18n } = useTranslation()
  const [consumo, setConsumo] = useState(data.consumo)

  if (data.diaActivo === undefined) return <></>

  const fecha = UTIL.fechaDesdeIndice(data.diaActivo)
  const dia = fecha[0]
  const mes = TCB.i18next.t(UTIL.nombreMes[fecha[1]])
  let horas = []
  for (let i = 0; i < 24; i++) horas.push(i)

  var trace1 = {
    x: horas,
    y: consumo.diaHora[data.diaActivo],
    type: 'scatter',
    showlegend: false,
    name: t('CONSUMPTION.HOOVER_MAPA_CONSUMO_MONTH_DAY'),
    line: { shape: 'spline', width: 3, color: 'rgb(0,0,255' },
  }

  var trace2 = {
    x: horas,
    y: consumo.diaHora[data.diaActivo],
    type: 'bar',
    name: t('CONSUMPTION.HOOVER_MAPA_CONSUMO_MES_HORA'),
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

  const layout = {
    autosize: true,
    xaxis: {
      title: t('GRAPHICS.LABEL_HORA'),
      dtick: 2,
      zeroline: true,
    },
    margin: {
      l: 0,
      r: 0,
      b: 65,
      t: 0,
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    yaxis: {
      title: 'kWh',
      textcolor: 'red',
      showline: true,
      zeroline: true,
      zerolinecolor: '#969696',
      gridcolor: '#bdbdbd',
      gridwidth: 1,
    },
  }

  return (
    <>
      <Typography variant="h5" align="center">
        {t('CONSUMPTION.LABEL_TITLE_PROFILE_DAY', {
          dia: dia,
          mes: mes,
        })}
      </Typography>
      <Plot data={[trace1, trace2]} layout={layout} />
    </>
  )
}

export default ProfileDayConsumption
