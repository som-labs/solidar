import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import Typography from '@mui/material/Typography'
import { Box } from '@mui/material'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import { isEmpty } from 'ol/extent'

export default function MapaMesHora({ activo }) {
  const { t, i18n } = useTranslation()

  console.log(activo)
  if (activo === isEmpty) return
  const consumo = TCB.TipoConsumo.find((t) => {
    return t.idTipoConsumo === activo.idTipoConsumo
  })
  console.log(consumo)

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

  console.log(consumo)
  console.log(typeof consumo.idxTable[0].fecha)
  console.log('FECHA: ', consumo.idxTable[0])
  console.log('CONSUMO TABLE:', consumo)
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
    console.log(_consMes)
    console.log(_diasMes)
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

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          boxShadow: 2,
          flex: 1,
          border: 2,
          textAlign: 'center',
          borderColor: 'primary.light',
          // backgroundColor: 'rgba(220, 249, 233, 1)',
        }}
        justifyContent="center"
      >
        <Typography variant="h4">
          {t('CONSUMPTION.TITLE_MAP_MONTH_HOUR', {
            nombreTipoConsumo: activo.nombreTipoConsumo,
          })}
        </Typography>
        <Typography variant="body">{t('CONSUMPTION.DESC_MAP_MONTH_HOUR')}</Typography>
        <br></br>
        <br></br>
        <Box>
          <Plot
            data={[
              {
                type: 'scatter',
                name: t('CONSUMPTION.HOOVER_MAPA_CONSUMO_MES_HORA'),
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
                r: 0,
                b: 65,
                t: 25,
              },
              title: {
                text: t('CONSUMPTION.TITLE_MAPA_CONSUMO_MES_HORA'),
                xref: 'x',
                yref: 'y',
                x: 12,
                y: 14,
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
            }}
          />
        </Box>
      </Box>
    </>
  )
}
