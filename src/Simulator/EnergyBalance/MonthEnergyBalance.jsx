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

export default function MonthEnergyBalance() {
  const { t } = useTranslation()

  const graphElement = useRef()
  const graphWidth = useRef()
  const maxMonth = useRef()
  const minMonth = useRef()

  const consumo = TCB.consumo.resumenMensual('suma')
  const produccion = TCB.produccion.resumenMensual('suma')

  maxMonth.current = Math.max(Math.max(...consumo), Math.max(...produccion))
  minMonth.current = Math.min(Math.min(...consumo), Math.min(...produccion))
  const delta = (maxMonth.current - minMonth.current) / 7

  useEffect(() => {
    // Function to get the width of the element
    const getWidth = () => {
      if (graphElement.current) {
        graphWidth.current = graphElement.current.offsetWidth
      }
    }

    // Call the function to get the width after initial render
    getWidth()

    // // Add event listener for resizing (optional)
    // window.addEventListener('resize', getWidth)

    // // Cleanup by removing the event listener on component unmount (optional)
    // return () => {
    //   window.removeEventListener('resize', getWidth)
    // }

    maxMonth.current = Math.max(Math.max(...consumo), Math.max(...produccion))
    minMonth.current = Math.min(Math.min(...consumo), Math.min(...produccion))
  }, [])

  const i18nextMes = () => {
    let _mes = []
    for (let i = 0; i < 12; _mes.push(t(UTIL.nombreMes[i++])));
    return _mes
  }
  const mesMapa = Array.from(i18nextMes())

  var trace1 = {
    x: mesMapa,
    y: consumo,
    type: 'scatter',
    name: t('Consumo.PROP.consumoMensual'),
  }

  var trace2 = {
    x: mesMapa,
    y: produccion,
    type: 'scatter',
    name: t('Produccion.PROP.produccionMensual'),
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
    yaxis: {
      zeroline: true,
      tickformat: '.2f',
      ticksuffix: ' kWh',
      showgrid: true,
      gridwidth: 1,
      gridcolor: 'grey',
      nticks: 7,
      range: [0, maxMonth.current + delta],
    },

    margin: { b: 50, t: 50, r: 10, l: 100 },
  }

  return (
    <Container ref={graphElement}>
      <Typography variant="h4" textAlign={'center'}>
        {t('ENERGY_BALANCE.TITLE_GRAPH_MONTH_CONSUMO_PRODUCCION')}
      </Typography>
      <Typography
        variant="body"
        dangerouslySetInnerHTML={{
          __html: t('ENERGY_BALANCE.DESCRIPTION_MONTH_ENERGY_BALANCE'),
        }}
      />
      <Typography
        variant="h5"
        textAlign={'center'}
        sx={{ mt: '1rem' }}
        dangerouslySetInnerHTML={{
          __html: t('ENERGY_BALANCE.TITLE_GRAPH_MONTH_ENERGY_BALANCE', {
            potencia: UTIL.formatoValor(
              'potencia',
              TCB.produccion.potenciaTotalInstalada,
            ),
          }),
        }}
      ></Typography>
      <Plot data={[trace1, trace2]} layout={layout} />
    </Container>
  )
}
