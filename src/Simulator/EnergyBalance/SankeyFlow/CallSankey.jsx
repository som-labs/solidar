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
  const boxHeight = useRef(null)
  const { bases } = useContext(BasesContext)
  const [iconY, setIconY] = useState([])
  const [draw, setDraw] = useState(true)

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

  const setIconPosition = useCallback((values) => {
    //console.log('INCALLBACK', values)
    setIconY(values.map((element) => parseInt(element * boxHeight.current - 45) + 'px'))
    setDraw(false)
  }, [])

  useEffect(() => {
    // Function to get the height of the svg element
    const getWidth = () => {
      if (boxRef.current) {
        boxHeight.current = boxRef.current.offsetHeight
      }
    }

    // Call the function to get the width after initial render
    getWidth()
    setDraw(true)
  }, [bases])

  if (draw) {
    //console.log(iconY)
    SankeyFun(
      { links: data, svgRef, setIconPosition },
      {
        textColor: theme.palette.text.primary,
        colors: colors,
        linkMixBlendMode: current === 'light' ? 'multiply' : 'screen',
        height: 1200,
        width: 2000,
        nodeGroup: (d) => d.id, //.split(/\W/)[0], // take first word for color
      },
    )
  }

  //   if (iconPosition.length !== 0) setLoop(true)
  // }

  return (
    <>
      <Box ref={boxRef} sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
          }}
        >
          <CardMedia
            component="img"
            src={imgPaneles}
            sx={{
              height: 80,
              width: 80,
              position: 'absolute',
              top: iconY[0],
            }}
            alt="Producción en paneles"
            title="Producción en paneles"
          />

          <CardMedia
            component="img"
            src={imgRed}
            sx={{
              position: 'absolute',
              height: 80,
              width: 80,
              top: iconY[1],
            }}
            alt="Energia recibida de la red"
            title="Energia recibida de la red"
          />
        </Box>

        <Box sx={{ display: 'flex', flex: 9 }}>
          <svg ref={svgRef} />
        </Box>

        <Box display="flex" sx={{ flex: 1, position: 'relative' }} flexDirection="column">
          <CardMedia
            component="img"
            src={imgRed}
            sx={{
              height: 90,
              width: 90,
              position: 'absolute',
              top: iconY[5],
            }}
            alt="Energía vertida a la red"
            title="Energía vertida a la red"
          />

          <CardMedia
            component="img"
            src={imgConsumo}
            alt="Consumos Totales"
            title="Consumos totales"
            sx={{
              height: 90,
              width: 90,
              position: 'absolute',
              top: iconY[6],
            }}
          />
        </Box>
      </Box>
    </>
  )
}
