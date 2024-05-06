import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@mui/material/styles'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import { Container } from '@mui/material'

export default function PieChart(props) {
  const graphElement = useRef()
  const graphWidth = useRef()
  const theme = useTheme()

  const [layout, setLayout] = useState()

  const { labels, values, colors, title } = props
  useEffect(() => {
    // Function to get the width of the element
    const getWidth = () => {
      if (graphElement.current) {
        graphWidth.current = graphElement.current.offsetWidth
      }
    }

    // Call the function to get the width after initial render
    getWidth()
    setLayout({
      font: {
        color: theme.palette.text.primary,
      },
      title: {
        text: title,
        xref: 'paper',
        x: 0.5, // Horizontal position (0 to 1)
        xanchor: 'center',

        yref: 'paper',
        y: 1.1, // Vertical position (0 to 1)
        // Anchor point on x-axis (left, center, right)
        yanchor: 'center', // Anchor point on y-axis (top, middle, bottom)
      },

      width: graphWidth.current,
      height: 250,
      showlegend: true,
      autosize: true,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      // legend: {
      //   x: 0,
      //   xref: 'r',
      //   y: -0.1,
      //   yref: 'paper',
      //   orientation: 'v',
      // },

      margin: {
        l: 40,
        r: 0,
        b: 10,
        t: 30,
      },
    })
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
      redius: 1,
      hole: 0.4,
      textinfo: 'percent',
      insidetextorientation: 'horizontal',
      textposition: 'inside',
      hovertemplate: '<b>%{label}</b><br>%{percent}<br> %{value:.2f}kWh<extra></extra>',
    },
  ]

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
