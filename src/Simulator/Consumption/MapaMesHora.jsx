import { useTranslation } from 'react-i18next'

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

  // console.log(activo)
  if (activo === isEmpty) return
  // const consumo = TCB.TipoConsumo.find((t) => {
  //   return t.idTipoConsumo === activo.idTipoConsumo
  // })
  // console.log(consumo)
  const consumo = activo

  let maxHora
  let maxMes
  let horas = []
  let meses = []
  let colores = []
  let valores = []
  let text = []
  let sizes = []
  let maxConsumoMes = -Infinity
  let radio = 20
  const mesMapa = Array.from(i18nextMes())

  // console.log('CONSUMO TABLE:', consumo)
  // console.log(typeof consumo.idxTable[0].fecha)
  // console.log('FECHA: ', consumo.idxTable[0])

  for (let hora = 0; hora < 24; hora++) {
    let _valorHora = consumo.getHora(hora)
    let _consMes = new Array(12).fill(0)
    let _diasMes = new Array(12).fill(0)
    for (let dia = 0; dia < 365; dia++) {
      // console.log('FECHA CONSUMO: ', consumo.idxTable[dia].fecha)
      // console.log('FECHA CONSUMO GET MONTH: ', consumo.idxTable[dia].fecha.getMonth())
      _consMes[consumo.idxTable[dia].fecha.getMonth()] += _valorHora[dia]
      _diasMes[consumo.idxTable[dia].fecha.getMonth()]++
    }
    for (let mes = 0; mes < 12; mes++) {
      horas.push(hora + 1)
      meses.push(mesMapa[mes])
      let valor = _consMes[mes] / _diasMes[mes]
      if (maxConsumoMes < valor) {
        maxConsumoMes = valor
        maxHora = hora + 1
        maxMes = mes
      }
      valores.push(valor)
      text.push(valor.toFixed(6) + 'kWh')
    }
  }

  let tono
  for (let valor of valores) {
    tono = parseInt((255 * valor) / maxConsumoMes)
    let _r = tono
    let _g = 255 - tono
    let _b = 0
    colores.push('rgb(' + _r + ',' + _g + ',' + _b + ')') //"rgb("+tono+",0,0)");
    sizes.push((radio * valor) / maxConsumoMes)
  }

  function i18nextMes() {
    let _mes = []
    for (let i = 0; i < 12; _mes.push(t(UTIL.nombreMes[i++])));
    return _mes
  }

  // Function to convert the MapaMesHora data to CSV format
  const convertToCSV = () => {
    const strHeader =
      i18nextMes().reduce((result, str) => result + ',' + str, 'Hora') + '\n'
    console.log(strHeader)
    let csv = Array(12).fill('')

    for (let hora = 0; hora < 24; hora++) {
      let valorHoraMes = [hora + 1]
      for (let mes = 0; mes < 12; mes++) {
        valorHoraMes.push(valores[hora * 12 + mes])
      }
      csv[hora] = [...valorHoraMes].join(',') // + '\n'
    }
    const finalRows = [...csv].join('\n')
    return strHeader + finalRows
  }

  // Function to handle CSV export only for Fernando example
  const handleExportCSV = () => {
    const csvData = convertToCSV()
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'resumenMesHora.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const data = {
    type: 'scatter',
    name: t('CONSUMPTION.HOOVER_MAPA_CONSUMO_MES_HORA'),
    x: horas,
    y: meses,
    text: text,
    mode: 'markers',
    hovertemplate:
      '%{yaxis.title.text}: %{y}<br>' + '%{xaxis.title.text}: %{x}<br>' + '%{text}',
    marker: {
      symbol: 'circle',
      size: sizes,
      color: colores, //'rgba(200, 50, 100, .7)',
    },
  }

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: {
      l: 70,
      r: 0,
      b: 65,
      t: 25,
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
      title_standoff: 40,
      showticklabels: true,
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
      //PENDIENTE: Resolver leyenda del grafico
      // {
      //   x: 25, // X-coordinate for the legend annotations
      //   y: [1, 5, 10], // Y-coordinates for each legend entry
      //   text: ['A', 'B', 'C'], // Text for each legend entry
      //   mode: 'markers',
      //   marker: {
      //     size: [maxConsumoMes * 0.1, maxConsumoMes * 0.5, maxConsumoMes], // Sizes for the circles in the legend (change as per your data)
      //     // sizemode: 'area', // Define marker size mode ('area' for the marker size in area)
      //     // sizeref: 0.1, // Reference scale for marker sizes
      //     symbol: 'circle', // Shape of the legend markers
      //     opacity: 1, // Opacity of the legend markers
      //     color: colores, // Color of the legend markers
      //   },
      //   //showlegend: false, // Hide default legend for the trace
      // },
    ],
  }

  const config = {
    // Disable selection to prevent click events from being sent
    // This prevents the selection of data points on click
    displayModeBar: false,
  }

  return (
    <Container>
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
          {t('CONSUMPTION.TITLE_MAP_MONTH_HOUR', {
            nombreTipoConsumo: activo.nombreTipoConsumo,
          })}
        </Typography>
        <Typography variant="body">{t('CONSUMPTION.DESC_MAP_MONTH_HOUR')}</Typography>

        <Box>
          <Plot data={[data]} layout={layout} config={config} />
        </Box>
        {/* <Button onClick={handleExportCSV}>Export to CSV</Button> */}
      </Box>
    </Container>
  )
}
