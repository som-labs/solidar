import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import TCB from '../classes/TCB'
import Plot from 'react-plotly.js'
// import TCBContext from '../../TCBContext'
import * as UTIL from '../classes/Utiles'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

const MapaMesHora = (tconsumo) => {
  const { t, i18n } = useTranslation()

  //REVISAR esta parte. Porque esta siendo llamada muchas veces y porque hay que usar children
  if (tconsumo.children === undefined) {
    return <></>
  }

  const consumo = tconsumo.children

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

  for (let hora = 0; hora < 24; hora++) {
    let _valorHora = consumo.getHora(hora)
    let _consMes = new Array(12).fill(0)
    let _diasMes = new Array(12).fill(0)
    for (let dia = 0; dia < 365; dia++) {
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
      text.push(valor.toFixed(2) + 'kWh')
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

  return (
    <>
      <Container>
        <Typography variant="h4">
          {t('CONSUMPTION.TITLE_MAP_MONTH_HOUR', {
            nombreTipoConsumo: consumo.nombreTipoConsumo,
          })}
        </Typography>
        <Typography variant="body">{t('CONSUMPTION.DESC_MAP_MONTH_HOUR')}</Typography>
        <br></br>
        <br></br>
        <Plot
          data={[
            {
              type: 'scatter',
              name: TCB.i18next.t('graficos_LBL_tituloConsumoMedio'),
              x: horas,
              y: meses,
              text: text,
              mode: 'markers',
              hovertemplate:
                '%{yaxis.title.text}: %{y}<br>' +
                '%{xaxis.title.text}: %{x}<br>' +
                '%{text}',
              marker: {
                symbol: 'circle',
                size: sizes,
                color: colores, //'rgba(200, 50, 100, .7)',
              },
            },
          ]}
          layout={{
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: {
              l: 70,
              r: 20,
              b: 65,
              t: 25,
            },
            title: {
              text: TCB.i18next.t('graficos_LBL_mapaConsumoMesHora'),
              xref: 'x',
              yref: 'y',
              x: 12,
              y: 14,
            },
            xaxis: {
              title: TCB.i18next.t('graficos_LBL_graficasHora'),
              showgrid: false,
              showline: true,
              linecolor: 'rgb(102, 102, 102)',
              tickfont_color: 'rgb(102, 102, 102)',
              showticklabels: true,
              dtick: 4,
              ticks: 'outside',
              tickcolor: 'rgb(102, 102, 102)',
            },
            yaxis: {
              title: TCB.i18next.t('graficos_LBL_graficasMes'),
              ticktext: meses,
              showline: true,
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
                text: TCB.i18next.t('graficos_LBL_maxConsumoMes', {
                  maxConsumoMes: maxConsumoMes.toFixed(2),
                }),
                showarrow: true,
                arrowhead: 3,
                xanchor: 'center',
                ax: 12,
                ay: 12,
              },
            ],
          }}
        />
      </Container>
    </>
  )
}

function i18nextMes() {
  let _mes = []
  for (let i = 0; i < 12; _mes.push(TCB.i18next.t(UTIL.nombreMes[i++])));
  return _mes
}

export default MapaMesHora
