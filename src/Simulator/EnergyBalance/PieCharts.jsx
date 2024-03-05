import { useEffect, useRef } from 'react'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import { Container } from '@mui/material'

export default function PieCharts(props) {
  const graphElement = useRef()
  const graphWidth = useRef()
  const { deficit, autoconsumo, excedente } = props.yearlyData

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
        colors: ['#B6722F', '#FFFF66'],
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
        colors: ['#e15759', '#FFFF66'],
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
    width: graphWidth.current,
    height: 350,
    title: 'Demanda Energética',
    showlegend: false,
    autosize: true,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    grid: { rows: 1, columns: 2 },
  }

  const config = {
    displayModeBar: false,
  }

  return (
    <Container ref={graphElement}>
      <Plot data={data1} layout={layout} config={config} />
    </Container>
  )
}
