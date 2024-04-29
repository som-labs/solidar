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

export default function MonthSavingStack() {
  const { t } = useTranslation()
  const theme = useTheme()

  const { ecoData } = useContext(EconomicContext)
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

      const trace_pagado = {
        x: mesMapa,
        y: ecoData.consumoConPlacasMensualCorregido,
        name: t('REPORT.PAGADO_COMERCIALIZADORA'),
        width: 0.8,
        marker: { color: '#819368' },
        type: 'bar',
        text: ecoData.consumoConPlacasMensualCorregido.map((p) =>
          UTIL.formatoValor('dinero', p),
        ),
        textposition: 'auto',
      }

      const trace_compensa = {
        x: mesMapa,
        y: _compensado,
        width: 0.8,
        marker: { color: '#997171' },
        name: t('REPORT.COMPENSADO'),
        type: 'bar',
        text: _compensado.map((p) => UTIL.formatoValor('dinero', p)),
        textposition: 'auto',
      }

      const trace_ahorro = {
        x: mesMapa,
        y: ecoData.ahorradoAutoconsumoMes,
        width: 0.8,
        marker: { color: '#C7A6CF' },
        name: t('REPORT.AUTOCONSUMO'),
        type: 'bar',
        text: ecoData.ahorradoAutoconsumoMes.map((p) => UTIL.formatoValor('dinero', p)),
        textposition: 'auto',
      }

      const layout = {
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
        height: 400,
        barmode: 'relative',
        yaxis: {
          title: 'Euros',
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

      // this.opcion = 'SinHucha'
      data = [trace_pagado, trace_compensa, trace_ahorro]

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
      <div ref={graphElement}></div>
      {/* <Plot data={data} layout={layout} config={config} style={{ width: '100%' }} /> */}
    </Container>
  )
}
