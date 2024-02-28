import { useEffect, useRef } from 'react'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import { Grid, Typography, Container, Box } from '@mui/material'

export default function PieCharts(props) {
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

  const isEmpty = Object.keys(props).length === 0
  if (!isEmpty) {
    const { consumo, produccion, deficit, autoconsumo, excedente } = props.yearlyData
    // Sample data
    const data1 = [
      {
        labels: ['Energia<br>de la red', 'Uso directo<br>de energía'],
        values: [deficit, autoconsumo],
        type: 'pie',
        textinfo: 'percent+label',
        insidetextorientation: 'horizontal',
        textposition: 'outside',
        hovertemplate: '<b>%{label}</b><br>%{percent}<br> %{value:.2f}kWh',
      },
    ]

    const data2 = [
      {
        labels: ['Vertido<br>a la red', 'Uso directo<br>de energía'],
        values: [excedente, autoconsumo],
        type: 'pie',
        textinfo: 'percent+label',
        insidetextorientation: 'horizontal',
        textposition: 'outside',
        hovertemplate: '<b>%{label}</b><br>%{percent}<br> %{value:.2f}kWh',
      },
    ]

    const config = {
      displayModeBar: false,
    }

    return (
      <Container ref={graphElement}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flexFlow: 'row',
            flex: 2,
            textAlign: 'center',
          }}
          justifyContent="center"
        >
          <Box sx={{ flex: 1 }}>
            <Plot
              data={data1}
              layout={{
                width: 0.45 * graphWidth.current,
                height: 350,
                title: 'Demanda Energética',
                showlegend: false,
                autosize: true,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
              }}
              config={config}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Plot
              data={data2}
              layout={{
                width: 0.45 * graphWidth.current,
                height: 350,
                title: 'Energía autoproducida',
                showlegend: false,
                autosize: true,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
              }}
              config={config}
            />
          </Box>
        </Box>
      </Container>
    )
  }
}
