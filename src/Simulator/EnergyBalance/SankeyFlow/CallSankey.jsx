import { useRef, useEffect } from 'react'

import SankeyFun from './SankeyFun'
import TCB from '../../classes/TCB'
export default function CallSankey(props) {
  var svgRef = useRef(null)
  console.log('EN CALLSANKEY', props)

  const consumo = TCB.consumo.cTotalAnual
  const produccion = TCB.produccion.pTotalAnual
  const deficit = TCB.balance.deficitAnual
  const autoconsumo = TCB.balance.autoconsumo
  const excedente = TCB.balance.excedenteAnual
  const consumoDiurno = TCB.balance.consumoDiurno

  useEffect(() => {
    // const { consumo, produccion, deficit, autoconsumo, excedente, consumoDiurno } =
    //   props.yearlyData
    console.log('EN CALLSANKEY', props)

    const data = [
      { source: 'Producción paneles', target: 'Excedente', value: excedente },
      {
        source: 'Producción paneles',
        target: 'Consumo diurno',
        value: autoconsumo,
      },

      {
        source: 'Consumo de red',
        target: 'Consumo nocturno',
        value: consumo - consumoDiurno,
      },
      {
        source: 'Consumo de red',
        target: 'Consumo diurno',
        value: consumoDiurno - autoconsumo,
      },

      { source: 'Excedente', target: 'Volcado a red', value: excedente },

      { source: 'Consumo diurno', target: 'Consumo total', value: consumoDiurno },
      {
        source: 'Consumo nocturno',
        target: 'Consumo total',
        value: consumo - consumoDiurno,
      },
    ]

    SankeyFun(
      { links: data, svgRef },
      {
        height: 1000,
        width: 2000,
        nodeGroup: (d) => d.id, //.split(/\W/)[0], // take first word for color
      },
    )
  }, [])

  return (
    <div className="sankey-chart">
      <svg ref={svgRef} />
    </div>
  )
}
