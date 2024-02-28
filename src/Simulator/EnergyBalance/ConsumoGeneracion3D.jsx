import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import { Box, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/InfoRounded'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import ProfileDay from './ProfileDay'
import { SLDRTooltip } from '../../components/SLDRComponents'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function ConsumoGeneracion3D() {
  const { t } = useTranslation()
  const [openDialog, closeDialog] = useDialog()
  const graphWidth = useRef()

  const meses = Array.from(i18nextMes())
  var g_produccion = {
    z: TCB.produccion.diaHora,
    y: TCB.consumo.idxTable.map((e) => {
      let mes = parseInt(e.fecha.getMonth()) + 1
      return e.fecha.getDate() + '/' + mes
    }),
    name: t('GRAPHICS.LABEL_PRODUCTION'),
    type: 'surface',
    colorscale: 'YlOrRd',
    opacity: 1,
    showlegend: true,
    showscale: false,
    contours: {
      x: {
        show: true,
        usecolormap: true,
        highlightcolor: '#42f5e3',
        project: { x: true },
      },
      y: {
        show: true,
        usecolormap: true,
        highlightcolor: '#42f5e3',
        project: { y: true },
      },
    },
    hovertemplate:
      t('GRAPHICS.LABEL_DIA') +
      ': %{y}<br>' +
      t('GRAPHICS.LABEL_HORA') +
      ': %{x}<br>' +
      t('GRAPHICS.LABEL_PRODUCTION') +
      ': %{z:.2f} kWh',
  }

  var g_consumo = {
    z: TCB.consumo.diaHora,
    y: TCB.consumo.idxTable.map((e) => {
      let mes = parseInt(e.fecha.getMonth()) + 1
      return e.fecha.getDate() + '/' + mes
    }),
    name: t('GRAPHICS.LABEL_CONSUMPTION'),
    type: 'surface',
    colorscale: 'Picnic',
    opacity: 0.8,
    showlegend: true,
    showscale: false,
    hovertemplate:
      t('GRAPHICS.LABEL_DIA') +
      ': %{y}<br>' +
      t('GRAPHICS.LABEL_HORA') +
      ': %{x}<br>' +
      t('GRAPHICS.LABEL_CONSUMPTION') +
      ': %{z:.2f} kWh',
    contours: {
      x: {
        show: true,
        usecolormap: true,
        highlightcolor: 'blue',
        project: { x: true },
      },
      y: {
        show: true,
        usecolormap: true,
        highlightcolor: 'blue',
        project: { y: true },
      },
      type: 'fill',
    },
  }
  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    width: graphWidth.current,
    scene: {
      zaxis: { title: 'kWh' },
      camera: { eye: { x: -2.5, y: -2.5, z: 1 } },
      clickmode: 'event+select',
      xaxis: { title: t('GRAPHICS.LABEL_HORA'), dtick: 2 },
      yaxis: {
        title_standoff: 1,
        title_position: 'left',
        title: t('GRAPHICS.LABEL_MES'),
        tickvals: UTIL.indiceDia.map((e) => {
          return e[1]
        }),
        ticktext: meses,
        tickangle: -10,
        tickline: true,
      },
      aspectratio: {
        // Define the aspect ratio to elongate one specific axis (e.g., the x-axis)
        x: 2,
        y: 2,
        z: 1,
      },
    },
    legend: {
      x: 0.3,
      xref: 'paper',
      y: 0.95,
      yref: 'paper',
      orientation: 'h',
    },
    margin: {
      l: 0,
      r: 0,
      b: 10,
      t: 0,
    },
  }
  const config = {
    displayModeBar: false,
  }

  const handleClick = (event) => {
    let fecha = event.points[0].y.split('/').map((a) => {
      return parseInt(a)
    })
    openDialog({
      children: <ProfileDay diaActivo={fecha} onClose={closeDialog} />,
    })
  }

  function i18nextMes() {
    let _mes = []
    for (let i = 0; i < 12; _mes.push(t(UTIL.nombreMes[i++])));
    return _mes
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flexFlow: 'row',
          flex: 1,
          textAlign: 'center',
        }}
        justifyContent="center"
      >
        <Typography variant="h4" textAlign={'center'}>
          {t('ENERGY_BALANCE.TITLE_GRAFICO_CONSUMOGENERACION3D')}
        </Typography>
        {/* <SLDRTooltip
          title={t('ENERGY_BALANCE.TOOLTIP_GRAFICO_CONSUMOGENERACION3D')}
          placement="top"
        >
          {' '}
          <InfoIcon />
        </SLDRTooltip> */}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          width: '100%',
        }}
        justifyContent="center"
      >
        <Plot
          data={[g_produccion, g_consumo]}
          layout={layout}
          onClick={handleClick}
          config={config}
        />
      </Box>
    </>
  )
}
