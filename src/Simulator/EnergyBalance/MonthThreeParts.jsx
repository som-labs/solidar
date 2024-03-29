import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

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

  const { autoconsumo, excedente, deficit } = props.monthlyData

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

    const trace_excedente = {
      x: mesMapa,
      y: excedente,
      name: t('GRAFICOS.LABEL_graficasExcedente'),
      type: 'bar',
    }

    const trace_deficit = {
      x: mesMapa,
      y: deficit,
      name: t('GRAFICOS.LABEL_graficasDeficit'),
      type: 'bar',
    }

    const trace_autoconsumo = {
      x: mesMapa,
      y: autoconsumo,
      name: t('GRAFICOS.LABEL_graficasAutoconsumo'),
      type: 'bar',
    }

    const data = [trace_excedente, trace_deficit, trace_autoconsumo]
    const layout = {
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
      barmode: 'stack',
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
          TCB.graphs.MonthThreeParts = dataUri
        },
      )
    })
  }

  return (
    <Container>
      <Typography variant="h5" textAlign={'center'} sx={{ mt: '1rem' }}>
        {t('ENERGY_BALANCE.TITLE_GRAPH_MONTH_THREE_PARTS')}
      </Typography>
      <div style={{ height: 500, width: '100%' }} ref={graphElement}></div>
    </Container>
  )
}
