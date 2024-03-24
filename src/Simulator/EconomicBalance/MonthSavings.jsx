import { useContext, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly library
import Plot from 'react-plotly.js'
import Plotly from 'plotly.js-dist'

// MUI objects
import { Typography, Container } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function MonthSaving() {
  const { t } = useTranslation()
  const theme = useTheme()

  const { ecoData, coefHucha } = useContext(EconomicContext)
  const graphElement = useRef()
  const graphWidth = useRef()

  useEffect(() => {
    // Function to get the width of the element
    const getWidth = () => {
      if (graphElement.current) {
        graphWidth.current = graphElement.current.offsetWidth
      }
    }

    // Call the function to get the width after initial render
    getWidth()

    if (graphElement.current) {
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
        font: {
          color: theme.palette.text.primary,
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        autosize: true,
        margin: {
          l: 40,
          r: 60,
          b: 0,
          t: 20,
        },
        barmode: 'relative',
        yaxis: {
          title: 'Euros',
          gridcolor: 'grey',
        },
        xaxis: {
          gridcolor: 'grey',
        },
        legend: {
          x: 0.1,
          y: -0.1,
          xref: 'paper',
          orientation: 'h',
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

      const config = {
        displayModeBar: false,
      }

      // Graph generation
      Plotly.react(graphElement.current, data, layout, config).then(function (gd) {
        Plotly.toImage(gd, { format: 'png', height: 500, width: 800 }).then(
          function (dataUri) {
            //Saving image for PDF report
            TCB.graphs.MonthSavings = dataUri
          },
        )
      })
    }
  }, [ecoData])

  return (
    <Container>
      <Typography sx={theme.titles.level_1} textAlign={'center'}>
        {t('ECONOMIC_BALANCE.TITLE_MONTH_SAVINGS')}
      </Typography>
      <div ref={graphElement}></div>
      {/* <Plot data={data} layout={layout} config={config} style={{ width: '100%' }} /> */}
    </Container>
  )
}
