import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
// Plotly library
import Plot from 'react-plotly.js'
// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
// REACT Solidar Components
import EconomicContext from './EconomicContext'

import * as UTIL from '../classes/Utiles'

export default function MonthSaving() {
  const { t, i18n } = useTranslation()

  const { ecoData, coefHucha } = useContext(EconomicContext)
  const i18nextMes = () => {
    let _mes = []
    for (let i = 0; i < 12; _mes.push(t(UTIL.nombreMes[i++])));
    return _mes
  }
  const mesMapa = Array.from(i18nextMes())

  var _perdidas = new Array(12)
  var _compensado = new Array(12)
  for (let i = 0; i < 12; i++) {
    //las perdidas y lo compensado lo graficamos negativo
    _perdidas[i] = -ecoData.perdidaMes[i]
    _compensado[i] = -ecoData.compensadoMensualCorregido[i]
  }

  var trace_pagado = {
    x: mesMapa,
    y: ecoData.consumoConPlacasMensualCorregido,
    name: t('GRAFICOS.LABEL_graficasGastoConPaneles'),
    type: 'scatter',
    line: { shape: 'line', width: 3, color: 'rgb(0,0,255' },
  }

  var trace_consumo = {
    x: mesMapa,
    y: ecoData.consumoOriginalMensual,
    name: t('GRAFICOS.LABEL_graficasGastoSinPaneles'),
    type: 'scatter',
    line: { shape: 'line', width: 3, color: 'rgb(255,0,0)' },
  }

  var trace_base = {
    x: mesMapa,
    y: ecoData.consumoConPlacasMensualCorregido,
    name: 'base',
    type: 'bar',
    hoverinfo: 'none',
    showlegend: false,
    marker: {
      color: 'rgba(1,1,1,0.0)',
    },
  }

  var trace_compensa = {
    x: mesMapa,
    y: _compensado,
    width: 0.1,
    marker: { color: 'rgb(204, 186, 57)' },
    name: t('GRAFICOS.LABEL_graficasCompensacion'),
    type: 'bar',
  }

  var trace_ahorro = {
    x: mesMapa,
    y: ecoData.ahorradoAutoconsumoMes,
    width: 0.1,
    marker: { color: 'rgb(104, 158, 43)' },
    name: t('GRAFICOS.LABEL_graficasAutoconsumo'),
    type: 'bar',
  }

  var trace_perdida = {
    x: mesMapa,
    y: _perdidas,
    width: 0.5,
    name: t('GRAFICOS.LABEL_graficasNoCompensado'),
    base: 0,
    type: 'bar',
  }

  var layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    // width: 800,
    // height: 500,
    autosize: true,
    //autoadjust: true,
    barmode: 'relative',
    yaxis: {
      title: 'Euros',
      gridcolor: 'grey',
    },
    xaxis: {
      gridcolor: 'grey',
    },
  }

  let data
  if (coefHucha > 0) {
    // this.opcion = 'ConHucha'
    var trace_huchaSaldo = {
      x: mesMapa,
      y: ecoData.huchaSaldo,
      name: t('GRAFICOS.LABEL_SALDO_VIRTUAL_BATTERY'),
      type: 'scatter',
      line: { shape: 'line', width: 3, color: 'orange' },
    }

    var trace_extraccionHucha = {
      x: mesMapa,
      y: ecoData.extraccionHucha,
      width: 0.1,
      marker: { color: 'rgb(0,255,0)' },
      name: t('GRAFICOS.LABEL_EXTRACCION_VIRTUAL_BATTERY'),
      type: 'bar',
    }
    data = [
      trace_consumo,
      trace_pagado,
      trace_huchaSaldo,
      trace_base,
      trace_compensa,
      trace_ahorro,
      trace_extraccionHucha,
    ]
  } else {
    // this.opcion = 'SinHucha'
    data = [
      trace_consumo,
      trace_pagado,
      trace_base,
      trace_compensa,
      trace_ahorro,
      trace_perdida,
    ]
  }

  return (
    <>
      <Container>
        <Typography variant="h4" textAlign={'center'}>
          {t('ECONOMIC_BALANCE.TITLE_MONTH_SAVINGS')}
        </Typography>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('ECONOMIC_BALANCE.DESCRIPTION_MONTH_SAVINGS'),
          }}
        />

        <Typography variant="h5">
          {t('ECONOMIC_BALANCE.GRAPH_TITLE_MONTH_SAVINGS')}
        </Typography>
        <Plot data={data} layout={layout} style={{ width: '100%' }} />
        <br />
      </Container>
    </>
  )
}
