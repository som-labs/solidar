import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

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
  const theme = useTheme()
  const graphElement = useRef()
  const graphWidth = useRef()
  const maxHour = useRef()
  const minHour = useRef()

  let mes =
    props.mes === '' || props.mes === undefined
      ? t('ENERGY_BALANCE.VALUE_FULL_YEAR')
      : props.mes

  let mProduccion
  let mConsumo

  let hHora = []
  let hProduccion = []
  let hConsumo = []
  let yProduccion = []
  let yConsumo = []

  useEffect(() => {
    // Function to get the width of the element
    const getWidth = () => {
      if (graphElement.current) {
        graphWidth.current = graphElement.current.offsetWidth * 0.9
      }
    }

    // Call the function to get the width after initial render
    getWidth()
    maxHour.current = Math.max(Math.max(...hConsumo), Math.max(...hProduccion))
    minHour.current = Math.min(Math.min(...hConsumo), Math.min(...hProduccion))
  }, [])

  for (let hora = 0; hora < 24; hora++) {
    hHora.push(hora)
    if (mes !== t('ENERGY_BALANCE.VALUE_FULL_YEAR')) {
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

  let data

  if (mes === t('ENERGY_BALANCE.VALUE_FULL_YEAR')) {
    const consumoAnual = {
      x: hHora,
      y: yConsumo,
      type: 'scatter',
      line: { shape: 'spline', width: 5, color: '#4671ad' },
      fill: 'tozeroy',
      fillcolor: '#a1bee5',
      name: t('ENERGY_BALANCE.LABEL_HOURLY_CONSUMPTION_YEAR'),
    }

    const produccionAnual = {
      x: hHora,
      y: yProduccion,
      type: 'scatter',
      line: { shape: 'spline', width: 5, color: '#ff9700' },
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
      fillcolor: 'rgba(102,178,255,0.4)', //'#a1bee5',
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
    font: {
      color: theme.palette.text.primary,
    },
    legend: {
      x: 0,
      xref: 'paper',
      y: -0.15,
      yref: 'paper',
      orientation: 'h',
    },

    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    width: graphWidth.current,
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
    displayModeBar: false,
  }

  return (
    <Container ref={graphElement}>
      <Plot data={data} layout={layout} config={config} />
    </Container>
  )
}
