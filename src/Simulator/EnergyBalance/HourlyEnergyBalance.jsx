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

export default function HourlyEnergyBalance(props) {
  const { t } = useTranslation()
  const graphElement = useRef()
  const graphWidth = useRef()
  const maxHour = useRef()
  const minHour = useRef()
  const { mes = '' } = props

  let mProduccion
  let mConsumo

  let hHora = []
  let hProduccion = []
  let hConsumo = []
  let yProduccion = []
  let yConsumo = []

  for (let hora = 0; hora < 24; hora++) {
    hHora.push(hora)
    if (mes !== '') {
      mProduccion = TCB.produccion
        .getHora(hora)
        .slice(UTIL.indiceDia[mes][1], UTIL.indiceDia[mes][2] + 1)
      hProduccion.push(UTIL.promedio(mProduccion))
      mConsumo = TCB.consumo
        .getHora(hora)
        .slice(UTIL.indiceDia[mes][1], UTIL.indiceDia[mes][2] + 1)
      hConsumo.push(UTIL.promedio(mConsumo))
    }
    yProduccion.push(UTIL.promedio(TCB.produccion.getHora(hora)))
    yConsumo.push(UTIL.promedio(TCB.consumo.getHora(hora)))
  }

  maxHour.current = Math.max(Math.max(...yConsumo), Math.max(...yProduccion))
  minHour.current = Math.min(Math.min(...yConsumo), Math.min(...yProduccion))
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

  let data

  if (mes === '') {
    const consumoAnual = {
      x: hHora,
      y: yConsumo,
      type: 'scatter',
      line: { shape: 'spline', width: 3, color: '#4671ad' },
      fill: 'tozeroy',
      fillcolor: '#a1bee5',
      name: t('ENERGY_BALANCE.LABEL_HOURLY_CONSUMPTION_YEAR'),
    }

    const produccionAnual = {
      x: hHora,
      y: yProduccion,
      type: 'scatter',
      line: { shape: 'spline', width: 3, color: '#ff9700' },
      fill: 'tozeroy',
      fillcolor: 'rgba(255,193,0,0.4)',
      name: t('ENERGY_BALANCE.LABEL_HOURLY_PRODUCTION_YEAR'),
    }
    data = [consumoAnual, produccionAnual]
  }
  //Will compute average consumption and production per month
  else {
    const consumoAnual = {
      x: hHora,
      y: yConsumo,
      type: 'scatter',
      line: { shape: 'spline', width: 5, color: '#4671ad' },
      name: t('ENERGY_BALANCE.LABEL_HOURLY_CONSUMPTION_YEAR'),
    }

    const produccionAnual = {
      x: hHora,
      y: yProduccion,
      type: 'scatter',
      line: { shape: 'spline', width: 5, color: '#ff9700' },
      name: t('ENERGY_BALANCE.LABEL_HOURLY_PRODUCTION_YEAR'),
    }

    const consumoMes = {
      x: hHora,
      y: hConsumo,
      type: 'scatter',
      line: { shape: 'spline', width: 1, color: '#4671ad' },
      fill: 'tozeroy',
      fillcolor: 'rgba(161,120,0,0.4)', //'#a1bee5',
      name: t('ENERGY_BALANCE.LABEL_HOURLY_CONSUMPTION_MONTH'),
    }

    const produccionMes = {
      x: hHora,
      y: hProduccion,
      type: 'scatter',
      line: { shape: 'spline', width: 1, color: '#ff9700' },
      fill: 'tozeroy',
      fillcolor: 'rgba(255,193,0,0.4)',
      name: t('ENERGY_BALANCE.LABEL_HOURLY_PRODUCTION_MONTH'),
    }

    data = [consumoAnual, produccionAnual, consumoMes, produccionMes]
  }

  var layout = {
    legend: {
      x: 0,
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

  const config = {
    // Disable selection to prevent click events from being sent
    // This prevents the selection of data points on click
    displayModeBar: false,
  }

  return (
    <Container ref={graphElement}>
      <Plot data={data} layout={layout} config={config} />
    </Container>
  )
}
