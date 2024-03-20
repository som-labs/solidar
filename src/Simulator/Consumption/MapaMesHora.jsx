import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import Typography from '@mui/material/Typography'
import { Box, Container } from '@mui/material'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import { isEmpty } from 'ol/extent'

export default function MapaMesHora({ activo }) {
  const { t } = useTranslation()
  const theme = useTheme()

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
  }, [])

  if (activo === isEmpty) return
  const consumo = activo
  let maxHora
  let maxMes
  let horas = []
  let meses = []
  let colores = []
  let valores = []
  let text = []
  let sizes = []

  const rangees = 3
  for (let i = 0; i <= rangees; i++) {
    horas.push([])
    meses.push([])
    colores.push([])
    valores.push([])
    text.push([])
    sizes.push([])
  }

  let maxConsumoMes = -Infinity
  let radio = 25
  const mesMapa = Array.from(i18nextMes())

  let fullValores = []
  for (let hora = 0; hora < 24; hora++) {
    let _valorHora = consumo.getHora(hora)
    let _consMes = new Array(12).fill(0)
    let _diasMes = new Array(12).fill(0)
    for (let dia = 0; dia < 365; dia++) {
      if (consumo.idxTable[dia].fecha !== '') {
        _consMes[consumo.idxTable[dia].fecha.getMonth()] += _valorHora[dia]
        _diasMes[consumo.idxTable[dia].fecha.getMonth()]++
      }
    }

    let valoresMes = []
    for (let mes = 0; mes < 12; mes++) {
      const valorMes = _consMes[mes] / _diasMes[mes]
      valoresMes.push(valorMes)
      if (maxConsumoMes < valorMes) {
        maxConsumoMes = valorMes
        maxHora = hora + 1
        maxMes = mes
      }
    }
    fullValores.push(valoresMes)
  }

  for (let hora = 0; hora < 24; hora++) {
    for (let mes = 0; mes < 12; mes++) {
      horas[0].push(hora + 1)
      meses[0].push(mesMapa[mes])
      valores[0].push(0)
    }
  }

  for (let hora = 0; hora < 24; hora++) {
    for (let mes = 0; mes < 12; mes++) {
      let pos = Math.trunc((fullValores[hora][mes] / maxConsumoMes) * rangees)
      pos = pos === 3 ? 3 : pos + 1
      horas[pos].push(hora + 1)
      meses[pos].push(mesMapa[mes])
      valores[pos].push(fullValores[hora][mes])
      text[pos].push(fullValores[hora][mes].toFixed(3) + 'kWh')
      sizes[pos].push((radio * fullValores[hora][mes]) / maxConsumoMes)
      let tono = parseInt((255 * fullValores[hora][mes]) / maxConsumoMes)
      let _r = tono
      let _g = 255 - tono
      let _b = 0
      colores[pos].push('rgb(' + _r + ',' + _g + ',' + _b + ')')
    }
  }

  // let tono
  // for (let valor of valores) {
  //   tono = parseInt((255 * valor) / maxConsumoMes)
  //   let _r = tono
  //   let _g = 255 - tono
  //   let _b = 0
  //   colores.push('rgb(' + _r + ',' + _g + ',' + _b + ')') //"rgb("+tono+",0,0)");
  //   sizes.push((radio * valor) / maxConsumoMes)
  // }

  function i18nextMes() {
    let _mes = []
    for (let i = 0; i < 12; _mes.push(t(UTIL.nombreMes[i++])));
    return _mes
  }

  // Function to convert the MapaMesHora data to CSV format only for Fernando
  // const convertToCSV = () => {
  //   const strHeader =
  //     i18nextMes().reduce((result, str) => result + ',' + str, 'Hora') + '\n'
  //   console.log(strHeader)
  //   let csv = Array(12).fill('')

  //   for (let hora = 0; hora < 24; hora++) {
  //     let valorHoraMes = [hora + 1]
  //     for (let mes = 0; mes < 12; mes++) {
  //       valorHoraMes.push(valores[hora * 12 + mes])
  //     }
  //     csv[hora] = [...valorHoraMes].join(',') // + '\n'
  //   }
  //   const finalRows = [...csv].join('\n')
  //   return strHeader + finalRows
  // }

  // Function to handle CSV export only for Fernando example
  // const handleExportCSV = () => {
  //   const csvData = convertToCSV()
  //   const blob = new Blob([csvData], { type: 'text/csv' })
  //   const url = window.URL.createObjectURL(blob)
  //   const link = document.createElement('a')
  //   link.href = url
  //   link.setAttribute('download', 'resumenMesHora.csv')
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)
  // }

  let traces = []
  const delta = maxConsumoMes / rangees
  for (let i = 0; i <= rangees; i++) {
    var data = {
      type: 'scatter',
      name:
        '<' +
        UTIL.formatoValor('energia', (i - 1) * delta) +
        ' - ' +
        UTIL.formatoValor('energia', i * delta),
      x: horas[i],
      y: meses[i],
      text: text[i],
      mode: 'markers',
      showlegend: true,
      hovertemplate:
        '%{yaxis.title.text}: %{y}<br>' +
        '%{xaxis.title.text}: %{x}<br>' +
        '%{text}<extra></extra>',
      marker: {
        symbol: 'circle',
        size: sizes[i],
        color: colores[i], //'rgba(200, 50, 100, .7)',
      },
    }
    if (i === 0) data.showlegend = false
    traces.push(data)
  }
  const layout = {
    font: {
      color: theme.palette.text.primary,
    },
    showlegend: true,
    width: 0.9 * graphWidth.current,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: {
      l: 0,
      r: 0,
      b: 65,
      t: 25,
    },
    legend: {
      x: 1,
      y: 0.5,
      orientation: 'v',
    },

    xaxis: {
      title: t('GRAPHICS.LABEL_HORA'),
      showgrid: false,
      showline: true,
      linecolor: 'rgb(102, 102, 102)',
      tickfont_color: 'rgb(102, 102, 102)',
      showticklabels: true,
      dtick: 2,
      ticks: 'outside',
      tickcolor: 'rgb(102, 102, 102)',
    },
    yaxis: {
      title: t('CONSUMPTION.YAXIS_MAPA_CONSUMO_MES_HORA'),
      ticktext: meses,
      showticklabels: true,
      automargin: true,
    },
    hovermode: 'closest',
    annotations: [
      {
        x: maxHora,
        y: maxMes,
        axref: 'x',
        ayref: 'y',
        xref: 'x',
        yref: 'y',
        text: t('CONSUMPTION.LABEL_MAPA_CONSUMO_MES_HORA', {
          maxConsumoMes: maxConsumoMes.toFixed(2),
        }),
        showarrow: true,
        arrowhead: 3,
        xanchor: 'center',
        ax: 12,
        ay: 12,
      },
    ],
  }

  const config = {
    // Disable selection to prevent click events from being sent
    // This prevents the selection of data points on click
    displayModeBar: false,
  }

  let title
  if (consumo.nombreTipoConsumo === 'Totales') {
    title = t('CONSUMPTION.TITLE_MAP_MONTH_HOUR_TOTAL')
  } else {
    title = t('CONSUMPTION.TITLE_MAP_MONTH_HOUR', {
      nombreTipoConsumo: activo.nombreTipoConsumo,
    })
  }
  return (
    <Container ref={graphElement}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flex: 1,
          textAlign: 'center',
        }}
        justifyContent="center"
      >
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body">{t('CONSUMPTION.DESC_MAP_MONTH_HOUR')}</Typography>

        <Box>
          {/* <Plot data={[data]} layout={layout} config={config} /> */}
          <Plot data={traces} layout={layout} config={config} />
        </Box>
        {/* <Button onClick={handleExportCSV}>Export to CSV</Button> */}
      </Box>
    </Container>
  )
}
