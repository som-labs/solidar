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

  const layout = {
    legend: {
      x: 0.3,
      xref: 'paper',
      y: -0.1,
      yref: 'paper',
      orientation: 'h',
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    barmode: 'stack',
    autosize: true,
    yaxis: {
      zeroline: true,
      tickformat: '.2f',
      ticksuffix: ' kWh',
      showgrid: true,
      gridwidth: 1,
      gridcolor: 'grey',
    },
    width: graphWidth.current * 0.9,
    margin: { b: 10, t: 20, r: 40, l: 100 },
  }

  return (
    <Container ref={graphElement}>
      <Typography variant="h4" textAlign={'center'}>
        {t('ENERGY_BALANCE.TITLE_MONTH_ENERGY_BALANCE')}
      </Typography>
      <Typography
        variant="body"
        dangerouslySetInnerHTML={{
          __html: t('ENERGY_BALANCE.DESCRIPTION_MONTH_ENERGY_BALANCE'),
        }}
      />
      <Typography variant="h5" textAlign={'center'} sx={{ mt: '1rem' }}>
        {t('ENERGY_BALANCE.TITLE_GRAPH_MONTH_ENERGY_BALANCE', {
          potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal),
        })}
      </Typography>
      <Plot data={[trace_deficit, trace_autoconsumo, trace_excedente]} layout={layout} />
    </Container>
  )
}
