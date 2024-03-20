import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import { Typography, Container, Box, Tooltip } from '@mui/material'
import InfoIcon from '@mui/icons-material/InfoRounded'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import ProfileDayConsumption from './ProfileDayConsumption'

// Solidar objects
import * as UTIL from '../classes/Utiles'

export default function MapaDiaHora({ activo }) {
  const { t } = useTranslation()
  const theme = useTheme()

  const [openDialog, closeDialog] = useDialog()

  const [diaActivo, setdiaActivo] = useState()
  const divGraph = useRef()
  const graphElement = useRef()
  const graphWidth = useRef()

  useEffect(() => {
    // Function to get the width of the element
    const getWidth = () => {
      if (graphElement.current) {
        graphWidth.current = graphElement.current.offsetWidth
      }
    }
    // Call the function to get the width after initial render
    getWidth()
  }, [])

  if (activo === undefined) return
  const consumo = activo

  const i18nextMes = () => {
    let _mes = []
    for (let i = 0; i < 12; _mes.push(t(UTIL.nombreMes[i++])));
    return _mes
  }
  const mesMapa = Array.from(i18nextMes())

  // main: isDarkMode ? '#333333' : '#F8F8F8',

  const colorProfile = [
    [0.0, '#7FAF7F'],
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
      ': %{z:.2f} kWh<extra></extra>',
  }

  const layout = {
    font: {
      color: theme.palette.text.primary,
    },
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
    width: 0.8 * graphWidth.current,
    height: 0.6 * graphWidth.current,
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
        font: {
          color: 'black',
          size: 16,
        },
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
      children: (
        <ProfileDayConsumption consumo={consumo} diaActivo={dia} onClose={closeDialog} />
      ),
    })
  }

  return (
    <Container ref={graphElement}>
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
        <Typography variant="h5" align="center" sx={{ mt: '1rem' }}>
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
