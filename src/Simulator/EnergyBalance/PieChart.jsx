import { useEffect, useRef } from 'react'
import { useTheme } from '@mui/material/styles'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import { Container } from '@mui/material'

export default function PieChart(props) {
  const graphElement = useRef()
  const graphWidth = useRef()
  const theme = useTheme()

  const { labels, values, colors } = props
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

  // Sample data
  const data1 = [
    {
      labels: labels,
      values: values,
      marker: {
        colors: colors,
      },
      type: 'pie',
      hole: 0.4,
      textinfo: 'percent',
      insidetextorientation: 'horizontal',
      textposition: 'inside',
      hovertemplate: '<b>%{label}</b><br>%{percent}<br> %{value:.2f}kWh<extra></extra>',
    },
  ]

  const layout = {
    font: {
      color: theme.palette.text.primary,
    },
    width: graphWidth.current,
    height: 200,
    showlegend: true,
    autosize: true,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    legend: {
      x: -0.1,
      xref: 'paper',
      y: 1.4,
      yref: 'paper',
      orientation: 'v',
    },
    margin: {
      l: 30,
      r: 30,
      b: 10,
      t: 10,
    },
  }

  const config = {
    displayModeBar: false,
  }

  return (
    <Container>
      <div ref={graphElement}>
        <Plot data={data1} layout={layout} config={config} />
      </div>
    </Container>
  )
}
