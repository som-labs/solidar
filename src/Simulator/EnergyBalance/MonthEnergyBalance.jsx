import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Container } from '@mui/material'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function MonthEnergyBalance(props) {
  const { t, i18n } = useTranslation()
  const { resumen } = props

  const i18nextMes = () => {
    let _mes = []
    for (let i = 0; i < 12; _mes.push(TCB.i18next.t(UTIL.nombreMes[i++])));
    return _mes
  }
  const mesMapa = Array.from(i18nextMes())

  var resConsumo = TCB.consumo.resumenMensual('suma')
  var trace1 = {
    x: mesMapa,
    y: resConsumo,
    type: 'scatter',
    name: t('GRAPHICS.LABEL_CONSUMPTION'),
  }

  var trace2 = {
    x: mesMapa,
    y: resumen,
    type: 'scatter',
    name: t('GRAPHICS.LABEL_PRODUCTION'),
  }

  var layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    yaxis: {
      title: 'kWh',
    },
  }

  return (
    <>
      <Container>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Typography variant="h4">
            {t('ENERGY_BALANCE.TITLE_MONTH_ENERGY_BALANCE')}
          </Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ENERGY_BALANCE.DESCRIPTION_MONTH_ENERGY_BALANCE'),
            }}
          />
          <br />
          <Typography variant="h5" textAlign={'center'}>
            {t('ENERGY_BALANCE.TITLE_GRAPH_MONTH_ENERGY_BALANCE', {
              potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal),
            })}
          </Typography>
          <Plot data={[trace1, trace2]} layout={layout} style={{ width: '100%' }} />

          <br />
        </Box>
      </Container>
    </>
  )
}
