import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import { Typography, Container, Box } from '@mui/material'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import ProfileDayConsumption from './ProfileDayConsumption'

// Solidar objects
import * as UTIL from '../classes/Utiles'

export default function MapaDiaHora({ activo }) {
  const { t } = useTranslation()
  const [openDialog, closeDialog] = useDialog()

  const [diaActivo, setdiaActivo] = useState()
  const divGraph = useRef()

  if (activo === undefined) return
  const consumo = activo

  const i18nextMes = () => {
    let _mes = []
    for (let i = 0; i < 12; _mes.push(t(UTIL.nombreMes[i++])));
    return _mes
  }
  const mesMapa = Array.from(i18nextMes())

  const colorProfile = [
    [0.0, '#98FB98'],
    [0.2, '#ADFF2F'],
    [0.4, 'yellow'],
    [1.0, 'red'],
  ]

  const g_consumo = {
    z: consumo.diaHora,
    y: consumo.idxTable.map((e) => {
      if (e.fecha !== '')
        return e.fecha.getDate() + ' - ' + t(UTIL.nombreMes[e.fecha.getMonth()])
    }),
    type: 'heatmap',
    color: consumo.diaHora,
    colorscale: colorProfile,
    cmin: 0,
    cmax: 3,
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

  const layout = {
    xaxis: { title: t('GRAPHICS.LABEL_HORA'), dtick: 2 },
    yaxis: {
      tickvals: UTIL.indiceDia.map((e) => {
        return e[1]
      }),
      ticktext: mesMapa,
      tickangle: 0,
      tickline: true,
    },
    zaxis: { title: 'kWh' },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    autosize: true,
    margin: {
      l: 75,
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

  const config = {
    displayModeBar: false,
  }

  const handleClick = (evt) => {
    var posicion = divGraph.current.children[0].getBoundingClientRect()
    var yaxis = divGraph.current.children[0]._fullLayout.yaxis
    var t = divGraph.current.children[0]._fullLayout.margin.t
    let yInDataCoord = yaxis.p2c(evt.event.y - t - posicion.top)
    let dia = Math.round(yInDataCoord)
    setdiaActivo(dia)

    openDialog({
      children: <ProfileDayConsumption consumo={consumo} diaActivo={dia} />,
    })
  }

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flex: 1,
          textAlign: 'center',
        }}
        justifyContent="center"
      >
        <Typography variant="h4">{t('CONSUMPTION.TITLE_MAP_MONTH_DAY')}</Typography>
        <Typography
          variant="body"
          textAlign={'left'}
          dangerouslySetInnerHTML={{
            __html: t('CONSUMPTION.DESC_MAP_MONTH_DAY'),
          }}
        />
      </Box>

      <Box
        sx={{
          ml: '0.3rem',
          display: 'flex',
          flexWrap: 'wrap',
          width: '100%',
        }}
        justifyContent="center"
      >
        <Typography variant="h5" align="center">
          {t('CONSUMPTION.LABEL_TITLE_MAP_MONTH_DAY')}
        </Typography>
        <div ref={divGraph}>
          <Plot
            data={[g_consumo]}
            layout={layout}
            onClick={handleClick}
            config={config}
          />
        </div>
      </Box>
    </Container>
  )
}
