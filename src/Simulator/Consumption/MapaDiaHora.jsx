import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import TCB from '../classes/TCB'
import Plot from 'react-plotly.js'

import * as UTIL from '../classes/Utiles'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

import ProfileDayConsumption from './ProfileDayConsumption'

const MapaDiaHora = (tconsumo) => {
  const { t, i18n } = useTranslation()
  const [diaActivo, setdiaActivo] = useState([])
  const divGraph = useRef()

  if (tconsumo.children === undefined) {
    return <></>
  }

  const consumo = tconsumo.children

  const i18nextMes = () => {
    let _mes = []
    for (let i = 0; i < 12; _mes.push(TCB.i18next.t(UTIL.nombreMes[i++])));
    return _mes
  }
  const mesMapa = Array.from(i18nextMes())

  const g_consumo = {
    z: consumo.diaHora,
    y: consumo.idxTable.map((e) => {
      if (e.fecha !== '')
        return (
          e.fecha.getDate() + ' - ' + TCB.i18next.t(UTIL.nombreMes[e.fecha.getMonth()])
        )
    }),
    type: 'heatmap',
    colorscale: [
      ['0.0', 'rgb(255,255,224)'],
      ['0.10', 'rgb(255,255,224)'],
      ['0.10', 'rgb(144,238,144)'],
      ['0.25', 'rgb(144,238,144)'],
      ['0.25', 'rgb(0,255,255)'],
      ['0.5', 'rgb(0,255,255)'],
      ['0.5', 'rgb(255,127,80)'],
      ['0.75', 'rgb(255,127,80)'],
      ['1.0', 'rgb(254,0,0)'],
    ],
    line: {
      width: 0.1,
      smoothing: 0,
    },
    zsmooth: 'best',
    connectgaps: true,
    showscale: true,
    hovertemplate:
      '%{yaxis.title.text}: %{y}<br>' +
      '%{xaxis.title.text}: %{x}<br>' +
      TCB.i18next.t('graficos_LBL_graficasConsumo') +
      ': %{z:.2f} kWh',
  }

  const layout_resumen = {
    xaxis: { title: TCB.i18next.t('graficos_LBL_graficasHora') },
    yaxis: {
      title: TCB.i18next.t('graficos_LBL_graficasDia'),
      tickvals: UTIL.indiceDia.map((e) => {
        return e[1]
      }),
      ticktext: mesMapa,
    },
    title: {
      text: TCB.i18next.t('graficos_LBL_mapaConsumo'),
      xref: 'paper',
      x: 0.5,
      yref: 'paper',
      y: 1.1,
    },
    zaxis: { title: 'kWh' },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    autosize: true,
    margin: {
      l: 50,
      r: 30,
      b: 65,
      t: 25,
    },
    annotations: [
      {
        x: 0,
        y: UTIL.indiceDesdeFecha(consumo.fechaInicio),
        xref: 'x',
        yref: 'y',
        text: 'Inicio',
        xanchor: 'right',
        textangle: 0,
        ax: -20,
        ay: 0,
      },
    ],
    shapes: [
      {
        type: 'line',
        x0: -0.5,
        y0: UTIL.indiceDesdeFecha(consumo.fechaInicio),
        x1: 23.5,
        y1: UTIL.indiceDesdeFecha(consumo.fechaInicio),
        line: { color: 'rgb(255, 0, 0)', width: 1 },
      },
    ],
  }

  const handleClick = (evt) => {
    var posicion = divGraph.current.children[0].getBoundingClientRect()
    var yaxis = divGraph.current.children[0]._fullLayout.yaxis
    var t = divGraph.current.children[0]._fullLayout.margin.t
    let yInDataCoord = yaxis.p2c(evt.event.y - t - posicion.top)
    let dia = Math.round(yInDataCoord)
    setdiaActivo(dia)
  }

  return (
    <>
      <Container>
        <Typography variant="h4">
          {t('CONSUMPTION.TITLE_MAP_MONTH_HOUR', {
            nombreTipoConsumo: consumo.nombreTipoConsumo,
          })}
        </Typography>
        <Box sx={{ display: 'flex', width: '100%' }}>
          <Box sx={{ width: '50%' }}>
            <Typography variant="body">{t('CONSUMPTION.DESC_MAP_MONTH_HOUR')}</Typography>
            <br></br>
            <br></br>
            <div ref={divGraph}>
              <Plot
                data={[g_consumo]}
                layout={layout_resumen}
                style={{ width: '100%' }}
                onClick={(event) => handleClick(event)}
              />
            </div>
          </Box>
          <Box sx={{ width: '50%' }}>
            <ProfileDayConsumption consumo={consumo} diaActivo={diaActivo} />
          </Box>
        </Box>
      </Container>
    </>
  )
}

export default MapaDiaHora
