import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

// Plotly objects
import Plot from 'react-plotly.js'
import Plotly from 'plotly.js-dist'

// MUI objects
import Typography from '@mui/material/Typography'
import { Container } from '@mui/material'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function MonthThreeParts(props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { autoconsumo, excedente, deficit, consumo, produccion } = props.monthlyData

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

  if (graphElement.current) {
    const i18nextMes = () => {
      let _mes = []
      for (let i = 0; i < 12; _mes.push(t(UTIL.nombreMes[i++])));
      return _mes
    }
    const mesMapa = Array.from(i18nextMes())

    var trace_consumo = {
      x: mesMapa,
      y: consumo,
      type: 'scatter',
      name: t('Consumo.PROP.consumoMensual'),
      line: { shape: 'spline', width: 5, color: theme.palette.balance.consumo },
    }

    var trace_produccion = {
      x: mesMapa,
      y: produccion,
      type: 'scatter',
      name: t('Produccion.PROP.produccionMensual'),
      line: { shape: 'spline', width: 5, color: theme.palette.balance.produccion },
    }

    const traceWidth = 0.6

    const trace_autoconsumo = {
      width: traceWidth,
      x: mesMapa,
      y: autoconsumo,
      name: t('GRAFICOS.LABEL_graficasAutoconsumo'),
      type: 'bar',
      base: 0,
      marker: { color: theme.palette.balance.autoconsumo },
      hovertemplate: autoconsumo.map((e) => UTIL.formatoValor('energia', e)),
    }

    const trace_excedente = {
      width: traceWidth * 0.45,
      x: mesMapa,
      y: excedente,
      name: t('GRAFICOS.LABEL_graficasExcedente'),
      type: 'bar',
      base: trace_autoconsumo.y,
      offset: -traceWidth * 0.5,
      marker: { color: theme.palette.balance.excedente },
      hovertemplate: excedente.map((e) => UTIL.formatoValor('energia', e)),
    }

    const trace_deficit = {
      width: traceWidth * 0.45,
      x: mesMapa,
      y: deficit,
      name: t('GRAFICOS.LABEL_graficasDeficit'),
      type: 'bar',
      base: trace_autoconsumo.y,
      offset: traceWidth * 0.05,
      marker: { color: theme.palette.balance.deficit },
      hovertemplate: deficit.map((e) => UTIL.formatoValor('energia', e)),
    }

    const data = [
      trace_consumo,
      trace_produccion,
      trace_excedente,
      trace_deficit,
      trace_autoconsumo,
    ]
    const layout = {
      font: {
        color: theme.palette.text.primary,
      },
      barmode: 'relative',
      legend: {
        x: 0.3,
        xref: 'paper',
        y: -0.15,
        yref: 'paper',
        orientation: 'h',
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      width: graphWidth.current,
      autosize: true,
      yaxis: {
        zeroline: true,
        tickformat: '.2f',
        ticksuffix: ' kWh',
        showgrid: true,
        gridwidth: 1,
        gridcolor: 'grey',
      },

      margin: { b: 10, t: 20, r: 40, l: 100 },
    }
    const config = {
      displayModeBar: false,
    }

    // Graph generation
    Plotly.react(graphElement.current, data, layout, config).then(function (gd) {
      Plotly.toImage(gd, { format: 'png', height: 500, width: 800 }).then(
        function (dataUri) {
          //Saving image for PDF report
          TCB.graphs.MonthFiveParts = dataUri
        },
      )
    })
  }

  return (
    <Container>
      <div style={{ height: 500, width: '100%' }} ref={graphElement}></div>
    </Container>
  )
}
