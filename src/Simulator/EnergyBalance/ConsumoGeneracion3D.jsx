import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TCB from '../classes/TCB'
import Plot from 'react-plotly.js'
import * as UTIL from '../classes/Utiles'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

import PerfilDiario from './PerfilDiario'

const ConsumoGeneracion3D = () => {
  const { t, i18n } = useTranslation()
  const [diaActivo, setdiaActivo] = useState([])
  const mesMapa = Array.from(i18nextMes())

  var g_produccion = {
    z: TCB.produccion.diaHora,
    y: TCB.consumo.idxTable.map((e) => {
      let mes = parseInt(e.fecha.getMonth()) + 1
      return e.fecha.getDate() + '/' + mes
    }),
    name: TCB.i18next.t('ENERGY_BALANCE.LABEL_LEYENDA_PRODUCCION'),
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
      TCB.i18next.t('ENERGY_BALANCE.LABEL_LEYENDA_DIA') +
      ': %{y}<br>' +
      TCB.i18next.t('ENERGY_BALANCE.LABEL_LEYENDA_HORA') +
      ': %{x}<br>' +
      TCB.i18next.t('ENERGY_BALANCE.LABEL_LEYENDA_PRODUCCION') +
      ': %{z:.2f} kWh',
  }

  var g_consumo = {
    z: TCB.consumo.diaHora,
    y: TCB.consumo.idxTable.map((e) => {
      let mes = parseInt(e.fecha.getMonth()) + 1
      return e.fecha.getDate() + '/' + mes
    }),
    name: TCB.i18next.t('ENERGY_BALANCE.LABEL_LEYENDA_CONSUMO'),
    type: 'surface',
    colorscale: 'Picnic',
    opacity: 0.8,
    showlegend: true,
    showscale: false,
    hovertemplate:
      TCB.i18next.t('ENERGY_BALANCE.LABEL_LEYENDA_DIA') +
      ': %{y}<br>' +
      TCB.i18next.t('ENERGY_BALANCE.LABEL_LEYENDA_HORA') +
      ': %{x}<br>' +
      TCB.i18next.t('ENERGY_BALANCE.LABEL_LEYENDA_CONSUMO') +
      ': %{z:.2f} kWh',
  }

  var layout_resumen = {
    legend: {
      x: 0.5,
      xanchor: 'left',
      y: 1.1,
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    title: {
      text: 'Titulo',
      // t('ENERGY_BALANCE.LABEL_LEYENDA_PRODUCCION') +
      // ' vs ' +
      // t('ENERGY_BALANCE.LABEL_LEYENDA_CONSUMO'),
      x: 0.1,
      y: 0.1,
    },
    scene: {
      camera: { eye: { x: -2, y: -1.5, z: 1 } },
      //xaxis: { title: TCB.i18next.t('ENERGY_BALANCE.LABEL_LEYENDA_HORA') },
      xaxis: { title: 'HORA' },
      yaxis: {
        title: TCB.i18next.t('ENERGY_BALANCE.LABEL_LEYENDA_DIA'),
        tickvals: UTIL.indiceDia.map((e) => {
          return e[1]
        }),
        ticktext: mesMapa,
      },
      zaxis: { title: 'kWh' },
    },
    autosize: false,
    margin: {
      l: 0,
      r: 0,
      b: 65,
      t: 25,
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
    for (let i = 0; i < 12; _mes.push(TCB.i18next.t(UTIL.nombreMes[i++])));
    return _mes
  }

  return (
    <>
      <Container>
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ width: '50%' }}>
            <Plot
              data={[g_produccion, g_consumo]}
              layout={{ layout_resumen }}
              style={{ width: '100%' }}
              onClick={(event) => handleClick(event)}
            />
          </Box>
          <Box sx={{ width: '50%' }}>
            <PerfilDiario> {diaActivo} </PerfilDiario>
          </Box>
        </Box>
      </Container>
    </>
  )
}

export default ConsumoGeneracion3D
