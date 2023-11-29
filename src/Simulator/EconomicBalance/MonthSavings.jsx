import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Plot from 'react-plotly.js'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

import * as UTIL from '../classes/Utiles'
import EconomicContext from './EconomicContext'
import TCB from '../classes/TCB'

export default function MonthSaving(props) {
  const { t, i18n } = useTranslation()
  const [economico, setEconomico] = useState()
  const [dibujo, setDibujo] = useState(false)

  useEffect(() => {
    console.log(props.economico)
    setDibujo(true)
    setEconomico(props.economico)
  }, [])

  if (dibujo) {
    console.log(economico)
    console.log(economico.perdidasMes)

    const i18nextMes = () => {
      let _mes = []
      for (let i = 0; i < 12; _mes.push(TCB.i18next.t(UTIL.nombreMes[i++])));
      return _mes
    }
    const mesMapa = Array.from(i18nextMes())

    var _perdidas = new Array(12)
    var _compensado = new Array(12)
    for (let i = 0; i < 12; i++) {
      //las perdidas y lo compensado lo graficamos negativo
      _perdidas[i] = -economico.perdidaMes[i]
      _compensado[i] = -economico.compensadoMensualCorregido[i]
    }

    var trace_pagado = {
      x: mesMapa,
      y: economico.consumoConPlacasMensualCorregido,
      name: t('graficos_LBL_graficasGastoConPaneles'),
      type: 'scatter',
      line: { shape: 'line', width: 3, color: 'rgb(0,0,255' },
    }

    var trace_base = {
      x: mesMapa,
      y: economico.consumoConPlacasMensualCorregido,
      name: 'base',
      type: 'bar',
      hoverinfo: 'none',
      showlegend: false,
      marker: {
        color: 'rgba(1,1,1,0.0)',
      },
    }

    var trace_consumo = {
      x: mesMapa,
      y: economico.consumoOriginalMensual,
      name: t('graficos_LBL_graficasGastoSinPaneles'),
      type: 'scatter',
      line: { shape: 'line', width: 3, color: 'rgb(255,0,0)' },
    }

    var trace_compensa = {
      x: mesMapa,
      y: _compensado,
      width: 0.1,
      marker: { color: 'rgb(204, 186, 57)' },
      name: t('graficos_LBL_graficasCompensacion'),
      type: 'bar',
    }

    var trace_ahorro = {
      x: mesMapa,
      y: economico.ahorradoAutoconsumoMes,
      width: 0.1,
      marker: { color: 'rgb(104, 158, 43)' },
      name: t('graficos_LBL_graficasAutoconsumo'),
      type: 'bar',
    }

    var trace_perdida = {
      x: mesMapa,
      y: _perdidas,
      width: 0.5,
      name: t('graficos_LBL_graficasNoCompensado'),
      base: 0,
      type: 'bar',
    }

    let titulo
    titulo = t('graficos_LBL_tituloBalanceEconomicoGlobal', {
      potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal),
    })

    var layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      width: 800,
      height: 500,
      autoadjust: true,
      title: titulo,
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
    if (TCB.coefHucha > 0) {
      // this.opcion = 'ConHucha'
      var trace_huchaSaldo = {
        x: mesMapa,
        y: economico.huchaSaldo,
        name: t('graficos_LBL_huchaSaldo'),
        type: 'scatter',
        line: { shape: 'line', width: 3, color: 'orange' },
      }

      var trace_extraccionHucha = {
        x: mesMapa,
        y: economico.extraccionHucha,
        width: 0.1,
        marker: { color: 'rgb(0,255,0)' },
        name: t('graficos_LBL_extraccionHucha'),
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
            <Plot data={data} layout={{ layout }} style={{ width: '100%' }} />
            <br />
          </Box>
        </Container>
      </>
    )
  }
}
