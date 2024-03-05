import { useRef, useEffect } from 'react'

import SankeyFun from './SankeyFun'
import TCB from '../../classes/TCB'
export default function CallSankey(props) {
  var svgRef = useRef(null)

  const consumo = TCB.consumo.totalAnual
  const produccion = TCB.produccion.totalAnual
  const deficit = TCB.balance.deficitAnual
  const autoconsumo = TCB.balance.autoconsumo
  const excedente = TCB.balance.excedenteAnual
  const consumoDiurno = TCB.balance.consumoDiurno

  useEffect(() => {
    const data = [
      { source: 'Producción paneles', target: 'Excedentes', value: excedente },
      {
        source: 'Producción paneles',
        target: 'Uso eléctrico diurno',
        value: autoconsumo,
      },

      {
        source: 'Energía de la red',
        target: 'Uso eléctrico nocturno',
        value: consumo - consumoDiurno,
      },
      {
        source: 'Energía de la red',
        target: 'Uso eléctrico diurno',
        value: consumoDiurno - autoconsumo,
      },

      { source: 'Excedentes', target: 'Vertido a red', value: excedente },

      {
        source: 'Uso eléctrico diurno',
        target: 'Uso de la energía total',
        value: consumoDiurno,
      },
      {
        source: 'Uso eléctrico nocturno',
        target: 'Uso de la energía total',
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
