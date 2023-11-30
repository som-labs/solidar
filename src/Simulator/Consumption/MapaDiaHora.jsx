import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import TCB from '../classes/TCB'
import Plot from 'react-plotly.js'

import * as UTIL from '../classes/Utiles'

import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import ProfileDayConsumption from './ProfileDayConsumption'

export default function MapaDiaHora({ activo }) {
  const { t, i18n } = useTranslation()
  const [diaActivo, setdiaActivo] = useState()
  const divGraph = useRef()

  if (activo === undefined) return
  console.log(activo)
  const consumo = TCB.TipoConsumo.find((t) => {
    return t.idTipoConsumo === activo.idTipoConsumo
  })
  console.log(consumo)

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
      t('CONSUMPTION.YAXIS_MAPA_CONSUMO_MONTH_DAY_DAY') +
      ': %{y}<br>' +
      t('CONSUMPTION.XAXIS_MAPA_CONSUMO_MONTH_DAY_HOUR') +
      ': %{x}<br>' +
      t('CONSUMPTION.HOOVER_MAPA_CONSUMO_MONTH_DAY') +
      ': %{z:.2f} kWh',
  }

  const layout_resumen = {
    xaxis: { title: t('GRAPHICS.LABEL_HORA'), dtick: 2 },
    yaxis: {
      tickvals: UTIL.indiceDia.map((e) => {
        return e[1]
      }),
      ticktext: mesMapa,
      tickangle: -45,
      tickline: true,
    },
    zaxis: { title: 'kWh' },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    autosize: true,
    margin: {
      l: 60,
      r: 0,
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
        xanchor: 'left',
        textangle: 0,
        ax: 2,
        ay: 15,
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
      <Box>
        <Typography variant="h4">{t('CONSUMPTION.TITLE_MAP_MONTH_DAY')}</Typography>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('CONSUMPTION.DESC_MAP_MONTH_DAY'),
          }}
        />
      </Box>

      <Box
        id="divGraph"
        sx={{
          ml: '0.3rem',
          display: 'flex',
          flexWrap: 'wrap',
          width: '100%',
          boxShadow: 2,
          border: 2,
          borderColor: 'primary.light',
        }}
        justifyContent="center"
      >
        <Typography variant="h5" align="center">
          {t('CONSUMPTION.LABEL_TITLE_MAP_MONTH_DAY')}
        </Typography>
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

      {diaActivo ? (
        <Box
          sx={{
            ml: '0.3rem',
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            boxShadow: 2,

            border: 2,
            borderColor: 'primary.light',
          }}
          justifyContent="center"
        >
          <div id="profile">
            <ProfileDayConsumption consumo={consumo} diaActivo={diaActivo} />
          </div>
        </Box>
      ) : (
        <></>
      )}
    </>
  )
}
