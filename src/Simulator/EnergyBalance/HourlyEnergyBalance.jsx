import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import Typography from '@mui/material/Typography'
import { Container } from '@mui/material'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function HourlyEnergyBalance() {
  const { t } = useTranslation()

  const graphElement = useRef()
  const graphWidth = useRef()
  const maxHour = useRef()
  const minHour = useRef()

  let hHora = []
  let hProduccion = []
  let hConsumo = []
  for (let hora = 0; hora < 24; hora++) {
    hHora.push(hora)
    hProduccion.push(UTIL.suma(TCB.produccion.getHora(hora)) / 365)
    hConsumo.push(UTIL.suma(TCB.consumo.getHora(hora)) / 365)
  }

  maxHour.current = Math.max(Math.max(...hConsumo), Math.max(...hProduccion))
  minHour.current = Math.min(Math.min(...hConsumo), Math.min(...hProduccion))
  const delta = (maxHour.current - minHour.current) / 7

  useEffect(() => {
    // Function to get the width of the element
    const getWidth = () => {
      if (graphElement.current) {
        graphWidth.current = graphElement.current.offsetWidth
      }
    }

    // Call the function to get the width after initial render
    getWidth()
    maxHour.current = Math.max(Math.max(...hConsumo), Math.max(...hProduccion))
    minHour.current = Math.min(Math.min(...hConsumo), Math.min(...hProduccion))
  }, [])

  var trace1 = {
    x: hHora,
    y: hConsumo,
    type: 'scatter',
    line: { shape: 'spline', width: 3, color: '#4671ad' },
    fill: 'tozeroy',
    fillcolor: '#a1bee5',
    name: t('Consumo.PROP.consumoHorario'),
  }

  var trace2 = {
    x: hHora,
    y: hProduccion,
    type: 'scatter',
    line: { shape: 'spline', width: 3, color: '#ff9700' },
    fill: 'tozeroy',
    fillcolor: 'rgba(255,193,0,0.4)',
    name: t('Produccion.PROP.produccionHoraria'),
  }

  var layout = {
    legend: {
      x: 0.3,
      xref: 'paper',
      y: -0.15,
      yref: 'paper',
      orientation: 'h',
    },

    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    width: 0.9 * graphWidth.current,
    autosize: true,
    xaxis: {
      dtick: 1,
    },
    yaxis: {
      zeroline: true,
      tickformat: '.2f',
      ticksuffix: ' kWh',
      showgrid: true,
      gridwidth: 1,
      gridcolor: 'grey',
      nticks: 7,
      range: [0, maxHour.current + delta],
    },

    margin: { b: 50, t: 50, r: 10, l: 100 },
  }

  return (
    <Container ref={graphElement}>
      <Plot data={[trace1, trace2]} layout={layout} />
    </Container>
  )
}
