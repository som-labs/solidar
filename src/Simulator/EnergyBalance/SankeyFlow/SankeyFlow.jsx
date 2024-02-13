import { useState, useEffect } from 'react'

import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

import CallSankey from './CallSankey'

export default function SankeyFlow(props) {
  const [dibujo, setDibujo] = useState(false)
  const [filteredData, filterData] = useState([])

  const { consumo, produccion, deficit, autoconsumo, excedente, consumoDiurno } =
    props.yearlyData
  console.log('FLOW props', props.yearlyData)

  useEffect(() => {
    filterData([
      {
        source: 'Consumo de red',
        target: 'Consumo Nocturno',
        value: consumo - consumoDiurno,
      },
      { source: 'Consumo de red', target: 'Consumo Diurno', value: deficit },
      { source: 'Producción paneles', target: 'Excedente', value: produccion },
      { source: 'Excedente', target: 'Volcado a red', value: excedente },
      { source: 'Producción paneles', target: 'Consumo Diurno', value: autoconsumo },
      { source: 'Consumo Diurno', target: 'Consumo total', value: consumoDiurno },
      {
        source: 'Consumo Nocturno',
        target: 'Consumo total',
        value: consumo - consumoDiurno,
      },
    ])
    setDibujo(true)
  }, [])

  if (dibujo) {
    console.log('TO CALLSANKEY', filteredData)
    return (
      <Container maxWidth="xl">
        <Grid item xs={12}>
          {filteredData.length > 0 && <CallSankey data={filteredData} />}
        </Grid>
      </Container>
    )
  }
}
