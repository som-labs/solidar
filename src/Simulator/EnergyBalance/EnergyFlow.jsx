import React, { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import TCB from '../classes/TCB'
import Plot from 'react-plotly.js'
import * as UTIL from '../classes/Utiles'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import CardMedia from '@mui/material/CardMedia'

const EnergyFlow = () => {
  const { t, i18n } = useTranslation()
  const grafResumen = useRef()
  const graficoConsumo = useRef()
  const graficoExcedente = useRef()
  const graficoDeficit = useRef()
  const graficoProduccion = useRef()
  const bar = useRef()

  const stConsumo = 'fill: yellow; stroke: black; border-radius: 8em'
  const stDeficit = 'fill: orange; stroke: black; border-radius: 1em'
  const stAutoconsumo = 'fill: #39CC56; stroke: black; border-radius: 1em'
  const stExcedente = 'fill: orange; stroke: black; border-radius: 1em'
  const stProduccion = 'fill: aquamarine; stroke: black; border-radius: 1em'
  const stFlujo = 'fill: white; stroke: black; border-radius: 1em'
  const stTitulo = 'font-size: 13px; text-anchor: middle; dominant-baseline: middle'

  useEffect(() => {
    gestionResultados_BalanceResultados()
  }, [])

  const gestionResultados_BalanceResultados = () => {
    const svg = grafResumen.current
    console.dir(svg)
    var altoLinea = 25
    svg.setAttribute('height', 9 * altoLinea)
    //svg.innerHTML = ''

    const anchoEnergia =
      TCB.balance.autoconsumo + TCB.balance.deficitAnual + TCB.balance.excedenteAnual
    const anchoPanel = document.body.clientWidth * 0.8
    const scale = anchoPanel / anchoEnergia

    const wConsumo = TCB.consumo.cTotalAnual * scale
    const wProduccion = TCB.produccion.pTotalAnual * scale
    const wDeficit = TCB.balance.deficitAnual * scale
    const wAutoconsumo = TCB.balance.autoconsumo * scale
    const wExcedente = TCB.balance.excedenteAnual * scale

    const leftMargin = anchoPanel * 0.15
    let linea
    let gSymbol

    //REVISAR: No aparece el rectangulo
    linea = 1
    _drawRectText(
      svg,
      leftMargin,
      linea,
      wConsumo,
      TCB.i18next.t('cTotalAnual_LBL'),
      stFlujo,
      stTitulo,
    )

    gSymbol = graficoConsumo.current
    gSymbol.style.left = (leftMargin + wConsumo / 2 - 50).toFixed(0) + 'px'
    gSymbol.style.display = 'inline-block'

    // _drawRectText(
    //   svg,
    //   leftMargin + wDeficit + wAutoconsumo,
    //   linea,
    //   wExcedente,
    //   TCB.i18next.t('excedenteAnual_LBL'),
    //   stFlujo,
    //   stTitulo,
    // )

    gSymbol = graficoExcedente.current
    gSymbol.style.left =
      (leftMargin + wDeficit + wAutoconsumo + wExcedente / 2 - 150).toFixed(0) + 'px'
    gSymbol.style.display = 'inline-block'

    // linea = 2
    // _drawRectText(
    //   svg,
    //   leftMargin,
    //   linea,
    //   wConsumo,
    //   UTIL.formatoValor('energia', TCB.consumo.cTotalAnual),
    //   stConsumo,
    //   stTitulo,
    // )
    // _drawRectText(
    //   svg,
    //   leftMargin + wDeficit + wAutoconsumo,
    //   linea,
    //   wExcedente,
    //   UTIL.formatoValor('energia', TCB.balance.excedenteAnual),
    //   stExcedente,
    //   stTitulo,
    // )

    // linea = 3
    // _drawRectText(
    //   svg,
    //   leftMargin,
    //   linea,
    //   wDeficit,
    //   UTIL.formatoValor(
    //     'porciento',
    //     (TCB.balance.deficitAnual / TCB.consumo.cTotalAnual) * 100,
    //   ),
    //   stDeficit,
    //   stTitulo,
    // )
    // _drawRectText(
    //   svg,
    //   leftMargin + wDeficit,
    //   linea,
    //   wAutoconsumo,
    //   UTIL.formatoValor(
    //     'porciento',
    //     (TCB.balance.autoconsumo / TCB.consumo.cTotalAnual) * 100,
    //   ),
    //   stAutoconsumo,
    //   stTitulo,
    // )
    // _drawArrow(svg, leftMargin + wConsumo + wExcedente / 2 - 10, linea, 4, 'Excedente')
    // _drawArrow(svg, leftMargin + wDeficit / 2 - 10, linea + 1, 4, 'Deficit')

    // linea = 5
    // _drawElipseText(
    //   svg,
    //   leftMargin + wDeficit + wAutoconsumo / 2,
    //   linea,
    //   wAutoconsumo / 2,
    //   [
    //     TCB.i18next.t('graficos_LBL_graficasAutoconsumo'),
    //     UTIL.formatoValor('energia', TCB.balance.autoconsumo),
    //   ],
    //   stAutoconsumo,
    //   stTitulo,
    // )

    // linea = 7
    // _drawRectText(
    //   svg,
    //   leftMargin + wDeficit,
    //   linea,
    //   wAutoconsumo,
    //   UTIL.formatoValor(
    //     'porciento',
    //     (TCB.balance.autoconsumo / TCB.produccion.pTotalAnual) * 100,
    //   ),
    //   stAutoconsumo,
    //   stTitulo,
    // )
    // _drawRectText(
    //   svg,
    //   leftMargin + wDeficit + wAutoconsumo,
    //   linea,
    //   wExcedente,
    //   UTIL.formatoValor(
    //     'porciento',
    //     (TCB.balance.excedenteAnual / TCB.produccion.pTotalAnual) * 100,
    //   ),
    //   stExcedente,
    //   stTitulo,
    // )

    // linea = 8
    // _drawRectText(
    //   svg,
    //   leftMargin,
    //   linea,
    //   wDeficit,
    //   UTIL.formatoValor('energia', TCB.balance.deficitAnual),
    //   stDeficit,
    //   stTitulo,
    // )
    // _drawRectText(
    //   svg,
    //   leftMargin + wDeficit,
    //   linea,
    //   wProduccion,
    //   UTIL.formatoValor('energia', TCB.produccion.pTotalAnual),
    //   stProduccion,
    //   stTitulo,
    // )

    // linea = 9
    // _drawRectText(
    //   svg,
    //   leftMargin,
    //   linea,
    //   wDeficit,
    //   TCB.i18next.t('graficos_LBL_energiaRed'),
    //   stFlujo,
    //   stTitulo,
    // )
    gSymbol = graficoDeficit.current
    gSymbol.style.left = (leftMargin + wDeficit / 2 - 50).toFixed(0) + 'px'
    gSymbol.style.display = 'inline-block'

    // _drawRectText(
    //   svg,
    //   leftMargin + wDeficit,
    //   linea,
    //   wProduccion,
    //   TCB.i18next.t('graficos_LBL_energiaPaneles'),
    //   stFlujo,
    //   stTitulo,
    // )
    gSymbol = graficoProduccion.current
    gSymbol.style.left = (leftMargin + wDeficit + wProduccion / 2 - 150).toFixed(0) + 'px'
    gSymbol.style.display = 'inline-block'
  }

  return (
    <>
      <Container>
        <Box sx={{ display: 'flex' }}>
          <div ref={grafResumen}>
            <CardMedia
              component="img"
              src="./datos/consumo.svg"
              ref={graficoConsumo}
              alt="Consumos Totales"
              title="Consumos totales"
              sx={{
                height: 87,
                width: 100,
                position: 'relative',
                // display: 'none',
              }}
            />

            <CardMedia
              component="img"
              src="./datos/red.svg"
              ref={graficoExcedente}
              sx={{
                position: 'relative',
                // display: 'none',
                height: 87,
                width: 100,
              }}
              alt="Energía vertida a la red"
              title="Energía vertida a la red"
            />
            {/* 
            <svg
              ref={bar}
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="300"
            ></svg>
            */}
            <CardMedia
              component="img"
              src="./datos/red.svg"
              ref={graficoDeficit}
              sx={{
                position: 'relative',
                // display: 'none',
                height: 87,
                width: 100,
              }}
              alt="Energia recibida de la red"
              title="Energia recibida de la red"
            />

            <CardMedia
              component="img"
              src="./datos/paneles.svg"
              ref={graficoProduccion}
              sx={{
                position: 'relative',
                // display: 'none',
                height: 87,
                width: 100,
              }}
              alt="Producción en paneles"
              title="Producción en paneles"
            />
          </div>
        </Box>
      </Container>
    </>
  )
}

/**
 *
 * @param {*} svg
 * @param {*} x
 * @param {*} linea
 * @param {*} ancho
 * @param {*} texto
 * @param {*} estiloR
 * @param {*} estiloT
 */
function _drawRectText(svg, x, linea, ancho, texto, estiloR, estiloT) {
  // variable for the namespace
  const svgns = 'http://www.w3.org/2000/svg'

  const altoLinea = 25
  let y = (linea - 1) * altoLinea

  let rect = document.createElementNS(svgns, 'rect')
  rect.setAttribute('width', ancho)
  rect.setAttribute('height', altoLinea)
  rect.setAttribute('style', estiloR)
  rect.setAttribute('x', x)
  rect.setAttribute('y', y)
  rect.setAttribute('rx', 10)
  rect.setAttribute('ry', 10)
  console.dir(rect)
  svg.appendChild(rect)

  //   let text = document.createElementNS(svgns, 'text')
  //   text.setAttribute('style', estiloT)
  //   text.setAttribute('x', x + ancho / 2)
  //   text.setAttribute('y', y + altoLinea / 2)
  //   text.textContent = texto
  //   svg.appendChild(text)
}

function _drawElipseText(svg, x, linea, ancho, texto, estiloR, estiloT) {
  // variable for the namespace
  const svgns = 'http://www.w3.org/2000/svg'
  const altoLinea = 25

  let y = (linea - 1) * altoLinea + altoLinea / 2

  let rect = document.createElementNS(svgns, 'ellipse')
  rect.setAttribute('style', estiloR)
  rect.setAttribute('cx', x)
  rect.setAttribute('cy', y)
  rect.setAttribute('rx', ancho)
  rect.setAttribute('ry', (3 * altoLinea) / 2)
  svg.appendChild(rect)

  let labelText = document.createElementNS(svgns, 'text')
  labelText.setAttribute('style', estiloT)
  labelText.setAttribute('x', x)
  labelText.setAttribute('y', y - altoLinea / 2)
  labelText.textContent = texto[0]
  svg.appendChild(labelText)

  let valueText = document.createElementNS(svgns, 'text')
  valueText.setAttribute('style', estiloT)
  valueText.setAttribute('x', x)
  valueText.setAttribute('y', y + altoLinea / 2)
  valueText.textContent = texto[1]
  svg.appendChild(valueText)
}

function _drawArrow(svg, x, linea, lineas, tipoFlecha) {
  // variable for the namespace
  const svgns = 'http://www.w3.org/2000/svg'
  const altoLinea = 25
  let y = (linea - 1) * altoLinea

  var img = document.createElementNS(svgns, 'image')
  let alto = lineas * altoLinea

  const link = './datos/arrow' + tipoFlecha + '.svg'
  const XLink_NS = 'http://www.w3.org/1999/xlink'
  img.setAttributeNS(XLink_NS, 'xlink:href', link)
  img.setAttribute('height', alto)
  img.setAttribute('width', 50)
  img.setAttribute('x', x)
  img.setAttribute('y', y)

  svg.appendChild(img)
}
export default EnergyFlow
