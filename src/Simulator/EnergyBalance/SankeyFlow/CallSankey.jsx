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

export default function CallSankey(props) {
  const { t } = useTranslation()
  var svgRef = useRef(null)
  const boxRef = useRef(null)
  const [boxHeight, setBoxHeight] = useState(null)
  const { bases } = useContext(BasesContext)
  const { consumo, autoconsumo, excedente, consumoDiurno } = props.yearlyData

  const theme = useTheme()
  const { current } = useContext(ColorModeContext) //dark or light

  const data = [
    {
      source: t('ENERGY_BALANCE.SANKEY.PRODUCCION_PANELES'),
      target: t('ENERGY_BALANCE.SANKEY.EXCEDENTES'),
      value: excedente,
    },
    {
      source: t('ENERGY_BALANCE.SANKEY.PRODUCCION_PANELES'),
      target: t('ENERGY_BALANCE.SANKEY.USO_DIURNO'),
      value: autoconsumo,
    },

    {
      source: t('ENERGY_BALANCE.SANKEY.ENERGIA_RED'),
      target: t('ENERGY_BALANCE.SANKEY.USO_NOCTURNO'),
      value: consumo - consumoDiurno,
    },

    {
      source: t('ENERGY_BALANCE.SANKEY.ENERGIA_RED'),
      target: t('ENERGY_BALANCE.SANKEY.USO_DIURNO'),
      value: consumoDiurno - autoconsumo,
    },

    {
      source: t('ENERGY_BALANCE.SANKEY.EXCEDENTES'),
      target: t('ENERGY_BALANCE.SANKEY.VERTIDO_RED'),
      value: excedente,
    },

    {
      source: t('ENERGY_BALANCE.SANKEY.USO_DIURNO'),
      target: t('ENERGY_BALANCE.SANKEY.USO_TOTAL'),
      value: consumoDiurno,
    },
    {
      source: t('ENERGY_BALANCE.SANKEY.USO_NOCTURNO'),
      target: t('ENERGY_BALANCE.SANKEY.USO_TOTAL'),
      value: consumo - consumoDiurno,
    },
  ]

  const colors = [
    theme.palette.balance.produccion, //Producción paneles
    theme.palette.balance.deficit, //Consumo de red
    theme.palette.balance.excedente, //Excedente
    theme.palette.balance.consumoDiurno, //Cosumo diurno
    theme.palette.balance.consumoNocturno, //Consumo nocturno
    theme.palette.balance.excedente, //Excedente
    theme.palette.balance.consumo, //Consumo total
    '#af7aa1',
    '#ff9da7',
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

  SankeyFun(
    { links: data, svgRef },
    {
      textColor: theme.palette.text.primary,
      colors: colors,
      linkMixBlendMode: current === 'light' ? 'multiply' : 'screen',
      height: 900,
      width: 2000,
      nodeGroup: (d) => d.id, //.split(/\W/)[0], // take first word for color
    },
  )

  return (
    <Box ref={boxRef} sx={{ display: 'flex' }}>
      <svg ref={svgRef} />
    </Box>
  )
}
