import { useRef, useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

// Plotly objects
import Plot from 'react-plotly.js'

//React global components
import { BasesContext } from '../BasesContext'
import { EconomicContext } from '../EconomicContext'
import { EnergyContext } from '../EnergyContext'
import { GlobalContext } from '../GlobalContext'

// MUI objects
import { Typography, MenuItem, TextField, Container, Box } from '@mui/material'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function HourlyEnergyBalance(props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const graphElement = useRef()
  const graphWidth = useRef()
  const [layout, setLayout] = useState()
  const [traces, setTraces] = useState([])
  const [config, setConfig] = useState()
  const [mes, setMes] = useState(t('ENERGY_BALANCE.VALUE_FULL_YEAR'))
  const { report } = props
  const maxHour = useRef()
  const { consumoGlobal, setConsumoGlobal, calculaResultados, produccionGlobal } =
    useContext(EnergyContext)
  useEffect(() => {
    // Function to get the width of the element
    const getWidth = () => {
      if (graphElement.current) {
        graphWidth.current = graphElement.current.offsetWidth
      }
    }

    // Call the function to get the width after initial render
    getWidth()
    changeMes(mes)
  }, [])

  function changeMes(mes) {
    setMes(mes)
    let mProduccion
    let mConsumo

    let hHora = []
    let hProduccion = []
    let hConsumo = []
    let yProduccion = []
    let yConsumo = []

    for (let hora = 0; hora < 24; hora++) {
      hHora.push(hora)
      if (mes !== t('ENERGY_BALANCE.VALUE_FULL_YEAR')) {
        mProduccion = produccionGlobal
          .getHora(hora)
          .slice(UTIL.indiceDia[mes][1], UTIL.indiceDia[mes][2] + 1)
        hProduccion.push(UTIL.promedio(mProduccion))
        mConsumo = consumoGlobal
          .getHora(hora)
          .slice(UTIL.indiceDia[mes][1], UTIL.indiceDia[mes][2] + 1)
        hConsumo.push(UTIL.promedio(mConsumo))
      }
      yProduccion.push(UTIL.promedio(produccionGlobal.getHora(hora)))
      yConsumo.push(UTIL.promedio(consumoGlobal.getHora(hora)))
    }
    const maxHourMonth = Math.max(Math.max(...hConsumo), Math.max(...hProduccion))
    const maxHourYear = Math.max(Math.max(...yConsumo), Math.max(...yProduccion))
    maxHour.current = Math.max(maxHourMonth, maxHourYear)
    const delta = maxHour.current / 10 // - minHour.current) / 7

    if (mes === t('ENERGY_BALANCE.VALUE_FULL_YEAR')) {
      const consumoAnual = {
        x: hHora,
        y: yConsumo,
        type: 'scatter',
        line: { shape: 'spline', width: 5, color: theme.palette.balance.consumo },
        fill: 'tozeroy',
        name: t('ENERGY_BALANCE.LABEL_HOURLY_CONSUMPTION_YEAR'),
        hovertemplate:
          '%{xaxis.title.text}: %{x}<br>' +
          t('ENERGY_BALANCE.LABEL_HOURLY_CONSUMPTION_YEAR') +
          ' %{y}<br>' +
          '<extra></extra>',
      }

      const produccionAnual = {
        x: hHora,
        y: yProduccion,
        type: 'scatter',
        line: { shape: 'spline', width: 5, color: theme.palette.balance.produccion },
        fill: 'tozeroy',
        name: t('ENERGY_BALANCE.LABEL_HOURLY_PRODUCTION_YEAR'),
        range: [0, maxHour.current],
        hovertemplate:
          '%{xaxis.title.text}: %{x}<br>' +
          t('ENERGY_BALANCE.LABEL_HOURLY_PRODUCTION_YEAR') +
          ' %{y}<br>' +
          '<extra></extra>',
      }
      setTraces([consumoAnual, produccionAnual])
    }
    //Will compute average consumption and production per month
    else {
      const consumoAnual = {
        x: hHora,
        y: yConsumo,
        type: 'scatter',
        line: { shape: 'spline', width: 5, color: theme.palette.balance.consumo },
        name: t('ENERGY_BALANCE.LABEL_HOURLY_CONSUMPTION_YEAR'),
        range: [0, maxHour.current],
        hovertemplate:
          '%{xaxis.title.text}: %{x}<br>' +
          t('ENERGY_BALANCE.LABEL_HOURLY_CONSUMPTION_YEAR') +
          ' %{y}<br>' +
          '<extra></extra>',
      }

      const produccionAnual = {
        x: hHora,
        y: yProduccion,
        type: 'scatter',
        line: { shape: 'spline', width: 5, color: theme.palette.balance.produccion },
        name: t('ENERGY_BALANCE.LABEL_HOURLY_PRODUCTION_YEAR'),
        range: [0, maxHour.current],
        hovertemplate:
          '%{xaxis.title.text}: %{x}<br>' +
          t('ENERGY_BALANCE.LABEL_HOURLY_PRODUCTION_YEAR') +
          ' %{y}<br>' +
          '<extra></extra>',
      }

      const consumoMes = {
        x: hHora,
        y: hConsumo,
        type: 'scatter',
        line: { shape: 'spline', width: 1, color: theme.palette.balance.consumo },
        fill: 'tozeroy',
        name: t('ENERGY_BALANCE.LABEL_HOURLY_CONSUMPTION_MONTH'),
        range: [0, maxHour.current],
        hovertemplate:
          '%{xaxis.title.text}: %{x}<br>' +
          t('ENERGY_BALANCE.LABEL_HOURLY_CONSUMPTION_MONTH') +
          ' %{y}<br>' +
          '<extra></extra>',
      }

      const produccionMes = {
        x: hHora,
        y: hProduccion,
        type: 'scatter',
        line: { shape: 'spline', width: 1, color: theme.palette.balance.produccion },
        fill: 'tozeroy',
        name: t('ENERGY_BALANCE.LABEL_HOURLY_PRODUCTION_MONTH'),
        range: [0, maxHour.current],
        hovertemplate:
          '%{xaxis.title.text}: %{x}<br>' +
          t('ENERGY_BALANCE.LABEL_HOURLY_PRODUCTION_MONTH') +
          ' %{y}<br>' +
          '<extra></extra>',
      }

      setTraces([consumoAnual, produccionAnual, consumoMes, produccionMes])
    }

    const _layout = {
      font: {
        color: theme.palette.text.primary,
      },
      legend: {
        x: 0,
        xref: 'paper',
        y: -0.15,
        yref: 'paper',
        orientation: 'h',
      },

      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      width: graphWidth.current,
      autosize: true,
      xaxis: {
        title: t('BASIC.LABEL_HORA'),
        dtick: 1,
        gridcolor: 'black',
      },
      yaxis: {
        zeroline: true,
        tickformat: '.2f',
        ticksuffix: ' kWh',
        showgrid: true,
        gridwidth: 1,
        gridcolor: 'grey',
        nticks: 7,
        range: [0, maxHour.current + delta],
      },

      margin: { b: 50, t: 50, r: 10, l: 100 },
    }
    setLayout(_layout)

    const _config = {
      displayModeBar: false,
    }
    setConfig(_config)
  }

  return (
    <Container>
      {!report ? (
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Typography sx={theme.titles.level_2} textAlign={'center'}>
            {t('ENERGY_BALANCE.TITLE_HOURLY_PERIODO')}
          </Typography>
          <TextField
            sx={{ width: 200, height: 50, mt: '1rem', mb: '1rem', ml: '1rem' }}
            select
            value={mes}
            defaultValue={t('ENERGY_BALANCE.VALUE_FULL_YEAR')}
            onChange={(event) => changeMes(event.target.value)}
          >
            <MenuItem key={-1} value={t('ENERGY_BALANCE.VALUE_FULL_YEAR')}>
              {t('ENERGY_BALANCE.VALUE_FULL_YEAR')}
            </MenuItem>
            {UTIL.nombreMes.map((nombreMes, index) => (
              <MenuItem key={index} value={index}>
                {t(nombreMes)}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      ) : (
        ' '
      )}
      <Box ref={graphElement}>
        <Plot data={traces} layout={layout} config={config} />
      </Box>
    </Container>
  )
}
