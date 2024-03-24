import { useEffect, useRef } from 'react'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import { Container, Typography } from '@mui/material'

export default function PieCharts(props) {
  const { t } = useTranslation()

  const graphElement = useRef()
  const graphWidth = useRef()
  const { deficit, autoconsumo, excedente } = props.yearlyData

  const theme = useTheme()

  useEffect(() => {
    // Function to get the width of the element
    const getWidth = () => {
      if (graphElement.current) {
        graphWidth.current = graphElement.current.offsetWidth * 0.9
      }
    }

    // Call the function to get the width after initial render
    getWidth()
  }, [])

  // Sample data
  const data1 = [
    {
      labels: ['Energia<br>de la red', 'Uso directo<br>de energía'],
      values: [deficit, autoconsumo],
      marker: {
        colors: [theme.palette.balance.deficit, theme.palette.balance.autoconsumo],
      },
      type: 'pie',
      textinfo: 'percent+label',
      insidetextorientation: 'horizontal',
      textposition: 'outside',
      hovertemplate: '<b>%{label}</b><br>%{percent}<br> %{value:.2f}kWh',
      domain: { row: 0, column: 0 },
    },
    //],

    // const data2 = [
    {
      labels: ['Vertido<br>a la red', 'Uso directo<br>de energía'],
      values: [excedente, autoconsumo],
      marker: {
        colors: [theme.palette.balance.excedente, theme.palette.balance.autoconsumo],
      },
      type: 'pie',
      textinfo: 'percent+label',
      insidetextorientation: 'horizontal',
      textposition: 'outside',
      hovertemplate: '<b>%{label}</b><br>%{percent}<br> %{value:.2f}kWh',
      domain: { row: 0, column: 1 },
    },
  ]

  const layout = {
    font: {
      color: theme.palette.text.primary,
    },

    width: graphWidth.current,
    height: 350,
    showlegend: false,
    autosize: true,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    grid: { rows: 1, columns: 2 },
    annotations: [
      {
        xref: 'paper',
        yref: 'paper',
        x: 0.12,
        y: 1.3,
        text: t('ENERGY_BALANCE.TITLE_GRAPH_DEMAND'),
        showarrow: false,
        font: {
          size: 16,
          color: theme.palette.text.primary,
        },
      },
      {
        xref: 'paper',
        yref: 'paper',
        x: 0.88,
        y: 1.3,
        text: t('ENERGY_BALANCE.TITLE_GRAPH_AUTOPRODUCIDA'), // Title for Subplot 2
        showarrow: false,
        font: {
          size: 16,
          color: theme.palette.text.primary,
        },
      },
    ],
  }

  const config = {
    displayModeBar: false,
  }

  return (
    <Container ref={graphElement}>
      <Typography variant="h5" textAlign={'center'} sx={{ mt: '1rem' }}>
        {t('ENERGY_BALANCE.TITLE_GRAPH_ENERGY_DEMAND')}
      </Typography>
      <Plot data={data1} layout={layout} config={config} />
    </Container>
  )
}
