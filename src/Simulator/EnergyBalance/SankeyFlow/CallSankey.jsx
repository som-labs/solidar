import { useRef, useEffect, useContext } from 'react'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import SankeyFun from './SankeyFun'
import TCB from '../../classes/TCB'
import { ColorModeContext } from '../../../components/GlobalTheme'

export default function CallSankey(props) {
  var svgRef = useRef(null)

  const consumo = TCB.consumo.totalAnual
  const produccion = TCB.produccion.totalAnual
  const deficit = TCB.balance.deficitAnual
  const autoconsumo = TCB.balance.autoconsumo
  const excedente = TCB.balance.excedenteAnual
  const consumoDiurno = TCB.balance.consumoDiurno

  const theme = useTheme()
  const { current } = useContext(ColorModeContext) //dark or light

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

    const colors = [
      theme.palette.balance.produccion, //Producción paneles
      theme.palette.balance.deficit, //Consumo de red
      theme.palette.balance.excedente, //Excedente
      '#FFFF66', //Cosumo diurno
      '#A0A0A0', //Consumo nocturno
      theme.palette.balance.excedente, //Excedente
      theme.palette.balance.consumo, //Consumo total
      '#af7aa1',
      '#ff9da7',
      '#9c755f',
      '#bab0ab',
    ]

    SankeyFun(
      { links: data, svgRef },
      {
        textColor: theme.palette.text.primary,
        colors: colors,
        linkMixBlendMode: current === 'light' ? 'multiply' : 'screen',
        height: 1000,
        width: 2000,
        nodeGroup: (d) => d.id, //.split(/\W/)[0], // take first word for color
      },
    )
  }, [current])

  return (
    <div className="sankey-chart">
      <svg ref={svgRef} />
    </div>
  )
}
