import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

// Plotly objects
import Plotly from 'plotly.js-dist'

// MUI objects
import Typography from '@mui/material/Typography'
import { Container } from '@mui/material'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function MonthFiveParts(props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const {
    autoconsumo,
    excedente,
    deficit,
    consumo,
    produccion,
    perdidas,
    descargas,
    cargas,
  } = props.monthlyData

  const autoconsumo_d = autoconsumo.map((v, i) => v - cargas[i])
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

    const traceWidth = 0.6
    const w_gruesa = 0.6
    const w_delgada = w_gruesa * 0.45
    const offset_izq = -w_delgada
    const offset_der = 0

    var trace_consumo = {
      x: mesMapa,
      y: consumo,
      offset: offset_der,
      type: 'scatter',
      name: t('Consumo.PROP.consumoMensual'),
      line: { shape: 'spline', width: 5, color: theme.palette.balance.consumo },
    }

    var trace_produccion = {
      x: mesMapa,
      y: produccion,
      offset: offset_izq,
      type: 'scatter',
      name: t('Produccion.PROP.produccionMensual'),
      line: { shape: 'spline', width: 5, color: theme.palette.balance.produccion },
    }

    let trace_cargas = {}
    let trace_autoconsumo = {}
    let trace_excedente = {}
    let trace_deficit = {}
    let trace_descargas = {}

    trace_autoconsumo = {
      width: traceWidth,
      x: mesMapa,
      y: autoconsumo_d,
      name: t('GRAFICOS.LABEL_graficasAutoconsumo'),
      type: 'bar',
      base: 0,
      marker: { color: theme.palette.balance.autoconsumo },
      hovertemplate: autoconsumo_d.map((e) => UTIL.formatoValor('energia', e)),
    }

    trace_excedente = {
      width: w_delgada,
      x: mesMapa,
      y: excedente,
      name: t('GRAFICOS.LABEL_graficasExcedente'),
      type: 'bar',
      base: autoconsumo_d,
      offset: offset_izq,
      offset_group: 'produccion',
      marker: { color: theme.palette.balance.excedente },
      hovertemplate: excedente.map((e) => UTIL.formatoValor('energia', e)),
    }

    trace_deficit = {
      width: w_delgada,
      x: mesMapa,
      y: deficit,
      name: t('GRAFICOS.LABEL_graficasDeficit'),
      type: 'bar',
      base: autoconsumo_d,
      offset: offset_der,
      offset_group: 'consumo',
      marker: { color: theme.palette.balance.deficit },
      hovertemplate: deficit.map((e) => UTIL.formatoValor('energia', e)),
    }

    if (TCB.bateria) {
      //Base de las partes altas = base_val + parte baja
      const base_cargas = autoconsumo_d.map((b, i) => b + excedente[i])
      const base_descargas = autoconsumo_d.map((b, i) => b + deficit[i])

      trace_cargas = {
        width: w_delgada,
        x: mesMapa,
        y: cargas,
        name: t('GRAFICOS.LABEL_graficasCargas'),
        type: 'bar',
        base: base_cargas,
        offset: offset_izq,
        marker: { color: 'Red' }, //{ color: theme.palette.balance.perdidas },
        hovertemplate: cargas.map((e) => UTIL.formatoValor('energia', e)),
      }

      trace_descargas = {
        width: w_delgada,
        x: mesMapa,
        y: descargas,
        name: t('GRAFICOS.LABEL_graficasDescargas'),
        type: 'bar',
        base: base_descargas,
        offset: offset_der,
        marker: { color: 'Green' }, //{ color: theme.palette.balance.bateria },
        hovertemplate: descargas.map((e) => UTIL.formatoValor('energia', e)),
      }
    }

    const data = [
      trace_consumo,
      trace_produccion,
      trace_excedente,
      trace_deficit,
      trace_autoconsumo,
      trace_descargas,
      trace_cargas,
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
