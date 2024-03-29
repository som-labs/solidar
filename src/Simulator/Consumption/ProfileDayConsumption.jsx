import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import { Box, Button, Container, Typography } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'

// Solidar objects
import * as UTIL from '../classes/Utiles'

export default function ProfileDayConsumption(props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const { diaActivo, onClose } = props
  const [consumo] = useState(props.consumo)
  const graphElement = useRef()
  const graphWidth = useRef()

  // Function to get the width of the element
  const getWidth = () => {
    if (graphElement.current) {
      graphWidth.current = graphElement.current.offsetWidth
    }
  }
  // Call the function to get the width after initial render
  getWidth()

  if (diaActivo === undefined) return <></>

  const fecha = UTIL.fechaDesdeIndice(diaActivo)
  const dia = fecha[0]
  const mes = t(UTIL.nombreMes[fecha[1]])
  let horas = []
  for (let i = 0; i < 24; i++) horas.push(i)

  const colorProfile = [
    [0.0, '#98FB98'],
    [0.2, '#ADFF2F'],
    [0.4, 'yellow'],
    [1.0, 'red'],
  ]

  const trace1 = {
    x: horas,
    y: consumo.diaHora[diaActivo],
    type: 'scatter',
    showlegend: false,
    name: t('CONSUMPTION.HOOVER_MAPA_CONSUMO_MONTH_DAY'),
    line: { shape: 'spline', width: 3, color: 'rgb(0,0,255' },
  }

  const trace2 = {
    x: horas,
    y: consumo.diaHora[diaActivo],
    type: 'bar',
    name: t('CONSUMPTION.HOOVER_MAPA_CONSUMO_MES_HORA'),
    showlegend: false,
    width: 0.5,
    hoverinfo: 'none',
    marker: {
      color: consumo.diaHora[diaActivo],
      cmax: consumo.maximoAnual,
      cmin: 0,
      colorscale: colorProfile,
    },
  }

  const layout = {
    font: {
      color: theme.palette.text.primary,
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    width: graphWidth.current,
    autosize: true,
    margin: {
      l: 50,
      r: 10,
      b: 65,
      t: 20,
    },
    xaxis: {
      title: t('GRAPHICS.LABEL_HORA'),
      dtick: 1,
      zeroline: false,
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
      range: [0, consumo.maximoAnual],
    },
    annotations: [
      {
        x: 0,
        y: consumo.maximoAnual,
        xref: 'x',
        yref: 'y',
        text: 'Máximo anual',
        font: {
          color: 'red',
          size: 20,
        },
        xanchor: 'left',
        textangle: 0,
        ax: 2,
        ay: -15,
      },
    ],
    shapes: [
      {
        type: 'line',
        x0: -0.5,
        y0: consumo.maximoAnual,
        x1: 23.5,
        y1: consumo.maximoAnual,
        line: { color: 'rgb(255, 0, 0)', width: 3 },
      },
    ],
  }

  const config = {
    displayModeBar: false,
  }
  return (
    <Container ref={graphElement}>
      <Box>
        <DialogTitle>
          <Typography sx={theme.titles.level_1} textAlign={'center'} gutterBottom>
            {t('CONSUMPTION.LABEL_TITLE_PROFILE_DAY', {
              dia: dia,
              mes: mes,
            })}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {/* <Box
          sx={{
            width: '100%',
            mt: '2rem',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        > */}
          {/* <Typography variant="h5" align="center">
            {t('CONSUMPTION.LABEL_TITLE_PROFILE_DAY', {
              dia: dia,
              mes: mes,
            })}
          </Typography> */}
          <Plot data={[trace1, trace2]} layout={layout} config={config} />
          {/* </Box> */}
        </DialogContent>
        <DialogActions sx={{ mt: '1rem' }}>
          <Button onClick={onClose}>{t('BASIC.LABEL_CLOSE')}</Button>
        </DialogActions>
      </Box>
    </Container>
  )
}
