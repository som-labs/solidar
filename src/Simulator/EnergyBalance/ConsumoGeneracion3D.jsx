import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

// REACT Solidar Components
import PerfilDiario from './PerfilDiario'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function ConsumoGeneracion3D() {
  const { t, i18n } = useTranslation()
  const [diaActivo, setdiaActivo] = useState([])
  const mesMapa = Array.from(i18nextMes())

  var g_produccion = {
    z: TCB.produccion.diaHora,
    y: TCB.consumo.idxTable.map((e) => {
      let mes = parseInt(e.fecha.getMonth()) + 1
      return e.fecha.getDate() + '/' + mes
    }),
    name: t('GRAPHICS.LABEL_PRODUCTION'),
    type: 'surface',
    colorscale: 'YlOrRd',
    opacity: 1,
    showlegend: true,
    showscale: false,
    contours: {
      x: { show: true, usecolormap: true, project: { y: true } },
      y: { show: true, usecolormap: true, project: { x: true } },
    },
    hovertemplate:
      t('GRAPHICS.LABEL_DIA') +
      ': %{y}<br>' +
      t('GRAPHICS.LABEL_HORA') +
      ': %{x}<br>' +
      t('GRAPHICS.LABEL_PRODUCTION') +
      ': %{z:.2f} kWh',
  }

  var g_consumo = {
    z: TCB.consumo.diaHora,
    y: TCB.consumo.idxTable.map((e) => {
      let mes = parseInt(e.fecha.getMonth()) + 1
      return e.fecha.getDate() + '/' + mes
    }),
    name: t('GRAPHICS.LABEL_CONSUMPTION'),
    type: 'surface',
    colorscale: 'Picnic',
    opacity: 0.8,
    showlegend: true,
    showscale: false,
    hovertemplate:
      t('GRAPHICS.LABEL_DIA') +
      ': %{y}<br>' +
      t('GRAPHICS.LABEL_HORA') +
      ': %{x}<br>' +
      t('GRAPHICS.LABEL_CONSUMPTION') +
      ': %{z:.2f} kWh',
  }

  var layout_resumen = {
    legend: {
      x: 0.2,
      xanchor: 'left',
      y: 1.0,
      orientation: 'h',
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { title: 'dia' }, //{ title: t('GRAPHICS.LABEL_HORA') },
    yaxis: {
      title: t('GRAPHICS.LABEL_DIA'),
      tickvals: UTIL.indiceDia.map((e) => {
        return e[1]
      }),
      ticktext: mesMapa,
    },
    zaxis: { title: 'kWh' },
    scene: {
      camera: { eye: { x: -2, y: -1.5, z: 1 } },
      //xaxis: { title: t('GRAPHICS.LABEL_HORA') },
    },
    autosize: true,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0,
    },
  }

  const handleClick = (event) => {
    let fecha = event.points[0].y.split('/').map((a) => {
      return parseInt(a)
    })
    setdiaActivo(fecha)
  }

  function i18nextMes() {
    let _mes = []
    for (let i = 0; i < 12; _mes.push(t(UTIL.nombreMes[i++])));
    return _mes
  }

  return (
    <>
      <Container>
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ display: 'flex', flex: 1 }}>
            <Plot
              data={[g_produccion, g_consumo]}
              layout={layout_resumen}
              onClick={(event) => handleClick(event)}
            />
          </Box>
          {diaActivo && (
            <Box sx={{ display: 'flex', flex: 1 }}>
              <PerfilDiario> {diaActivo} </PerfilDiario>
            </Box>
          )}
        </Box>
      </Container>
    </>
  )
}
