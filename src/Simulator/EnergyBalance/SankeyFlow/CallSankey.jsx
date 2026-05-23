import { useRef, useState, useEffect, useContext, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

// MUI objects
import { Box, CardMedia } from '@mui/material'

//Solidar assets
import imgConsumo from '../../assets/consumo.svg'
import imgRed from '../../assets/red.svg'
import imgPaneles from '../../assets/paneles.svg'

//React global components
import { BasesContext } from '../../BasesContext'
import SankeyFun from './SankeyFun'
import { ColorModeContext } from '../../../components/GlobalTheme'

import TCB from '../../classes/TCB'

export default function CallSankey(props) {
  const { t } = useTranslation()
  var svgRef = useRef(null)
  const boxRef = useRef(null)
  const [boxHeight, setBoxHeight] = useState(null)
  const { bases } = useContext(BasesContext)
  const {
    consumo,
    autoconsumo,
    excedente,
    consumoDiurno,
    cargas,
    perdidas,
    descarga_diurna,
    descarga_nocturna,
    deficit_diurno,
    deficit_nocturno,
  } = props.yearlyData

  const NAME_NODOS = {
    deRed: t('ENERGY_BALANCE.SANKEY.ENERGIA_RED'),
    aRed: t('ENERGY_BALANCE.SANKEY.VERTIDO_RED'),
    bateria: t('ENERGY_BALANCE.SANKEY.BATERIA'),
    paneles: t('ENERGY_BALANCE.SANKEY.PRODUCCION_PANELES'),
    usoDiurno: t('ENERGY_BALANCE.SANKEY.USO_DIURNO'),
    usoNocturno: t('ENERGY_BALANCE.SANKEY.USO_NOCTURNO'),
    perdidas: t('ENERGY_BALANCE.SANKEY.PERDIDAS'),
    usoTotal: t('ENERGY_BALANCE.SANKEY.USO_TOTAL'),
  }

  //Esto define el orden en el que salen los links del nodo
  const LINK_ORDER = [
    NAME_NODOS.perdidas,
    NAME_NODOS.aRed,
    NAME_NODOS.usoDiurno,
    NAME_NODOS.bateria,
    '_bypass',
    NAME_NODOS.usoNocturno,
    NAME_NODOS.usoTotal,
  ]

  const theme = useTheme()
  const { current } = useContext(ColorModeContext) //dark or light

  let data = []

  if (TCB.bateria)
    data.push({
      source: NAME_NODOS.paneles,
      target: NAME_NODOS.perdidas,
      value: perdidas,
    })

  data.push({
    source: NAME_NODOS.paneles,
    target: NAME_NODOS.aRed,
    value: excedente,
  })

  data.push({
    source: NAME_NODOS.paneles,
    target: NAME_NODOS.usoDiurno,
    value: autoconsumo - cargas,
  })

  if (TCB.bateria)
    data.push({
      source: NAME_NODOS.paneles,
      target: NAME_NODOS.bateria,
      value: cargas - perdidas,
    })

  if (TCB.bateria) {
    data.push({
      source: NAME_NODOS.deRed,
      target: '_bypass',
      value: deficit_diurno,
    })
    data.push({
      source: '_bypass',
      target: NAME_NODOS.usoDiurno,
      value: deficit_diurno,
    })
  } else {
    data.push({
      source: NAME_NODOS.deRed,
      target: NAME_NODOS.usoDiurno,
      value: deficit_diurno,
    })
  }
  data.push({
    source: NAME_NODOS.deRed,
    target: NAME_NODOS.usoNocturno,
    value: deficit_nocturno,
  })

  if (TCB.bateria) {
    data.push({
      source: NAME_NODOS.bateria,
      target: NAME_NODOS.usoDiurno,
      value: descarga_diurna,
    })
    data.push({
      source: NAME_NODOS.bateria,
      target: NAME_NODOS.usoNocturno,
      value: descarga_nocturna,
    })
  }

  data.push({
    source: NAME_NODOS.usoDiurno,
    target: NAME_NODOS.usoTotal,
    value: consumoDiurno,
  })

  data.push({
    source: NAME_NODOS.usoNocturno,
    target: NAME_NODOS.usoTotal,
    value: consumo - consumoDiurno,
  })

  const colors = [
    theme.palette.balance.produccion, //Producción paneles
    theme.palette.balance.deficit, //Consumo de red
    theme.palette.balance.consumoDiurno, //Cosumo diurno
    '#ff9da7', //Bateria
    theme.palette.balance.consumoNocturno, //Consumo nocturno
    theme.palette.balance.excedente, //Excedente
    '#af7aa1', //Perdidas
    theme.palette.balance.consumo, //Consumo total
    '#9c755f',
    '#bab0ab',
  ]

  useEffect(() => {
    // Function to get the height of the svg element
    const getHeight = () => {
      if (boxRef.current) {
        setBoxHeight(boxRef.current.offsetWidth)
      }
    }

    // Call the function to get the width after initial render
    getHeight()
  }, [bases])

  // Guard: si no hay datos, no renderizar nada
  if (!props.yearlyData || !props.yearlyData.consumo) return null

  // let alturaCalculada
  // if (TCB.bateria) {
  //   const totalFlujo = consumo + excedente + (TCB.bateria ? perdidas : 0)
  //   const alturaMinima = 1005
  //   alturaCalculada = Math.max(alturaMinima, totalFlujo / 5)
  // } else {
  //   alturaCalculada = 1000
  // }

  // Calcular factor de escala
  const maxHeight = autoconsumo + excedente + deficit_diurno + deficit_nocturno
  const umbral = 2000 // por encima de esto, escalar

  const escala = maxHeight > umbral ? umbral / maxHeight : 1

  // Escalar los valores para el layout
  const dataEscalada = data.map((d) => ({
    ...d,
    value: d.value * escala,
    valueReal: d.value,
  }))

  SankeyFun(
    { links: dataEscalada, svgRef },
    {
      textColor: theme.palette.text.primary,
      colors: colors,
      linkMixBlendMode: current === 'light' ? 'multiply' : 'screen',
      height: 1200,
      width: 2000,
      nodeGroup: (d) => d.id, //.split(/\W/)[0], // take first word for color
      nameNodos: NAME_NODOS,
      linkOrder: LINK_ORDER,
      energyScale: escala,
    },
  )

  return (
    <Box ref={boxRef} sx={{ display: 'flex' }}>
      <svg ref={svgRef} />
    </Box>
  )
}
