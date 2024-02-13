import React, { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CardMedia from '@mui/material/CardMedia'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function EnergyFlow(props) {
  const { t, i18n } = useTranslation()

  const [anchoPanel, setAnchoPanel] = useState()
  const [leftMargin, setLeftMargin] = useState()
  const [dibujo, setDibujo] = useState(false)
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

  const { consumo, produccion, deficit, autoconsumo, excedente } = props.yearlyData
  console.log('ENERGYFLOW props', props.yearlyData)

  useEffect(() => {
    if (grafResumen.current) {
      setAnchoPanel(grafResumen.current.getBoundingClientRect().width * 0.9)
      setLeftMargin(grafResumen.current.getBoundingClientRect().width * 0.05)
      setDibujo(true)
    }
  }, [])

  if (dibujo) {
    bar.current.innerHTML = ''
    var altoLinea = 25
    const anchoEnergia = autoconsumo + deficit + excedente
    const scale = anchoPanel / anchoEnergia

    const wConsumo = consumo * scale
    const wProduccion = produccion * scale
    const wDeficit = deficit * scale
    const wAutoconsumo = autoconsumo * scale
    const wExcedente = excedente * scale

    let linea
    let gSymbol

    linea = 1
    _drawRectText(
      bar.current,
      leftMargin,
      linea,
      wConsumo,
      t('Consumo.PROP.cTotalAnual'),
      stFlujo,
      stTitulo,
    )

    gSymbol = graficoConsumo.current
    gSymbol.style.left = (leftMargin + wConsumo / 2 - 50).toFixed(0) + 'px'
    gSymbol.style.display = 'inline-block'

    _drawRectText(
      bar.current,
      leftMargin + wDeficit + wAutoconsumo,
      linea,
      wExcedente,
      t('ENERGY_BALANCE.LABEL_EXCEDENTE_ANUAL'),
      stFlujo,
      stTitulo,
    )

    gSymbol = graficoExcedente.current
    gSymbol.style.left =
      (leftMargin + wDeficit + wAutoconsumo + wExcedente / 2 - 150).toFixed(0) + 'px'
    gSymbol.style.display = 'inline-block'

    linea = 2
    _drawRectText(
      bar.current,
      leftMargin,
      linea,
      wConsumo,
      UTIL.formatoValor('energia', consumo),
      stConsumo,
      stTitulo,
    )
    _drawRectText(
      bar.current,
      leftMargin + wDeficit + wAutoconsumo,
      linea,
      wExcedente,
      UTIL.formatoValor('energia', excedente),
      stExcedente,
      stTitulo,
    )

    linea = 3
    _drawRectText(
      bar.current,
      leftMargin,
      linea,
      wDeficit,
      UTIL.formatoValor('porciento', (deficit / consumo) * 100),
      stDeficit,
      stTitulo,
    )
    _drawRectText(
      bar.current,
      leftMargin + wDeficit,
      linea,
      wAutoconsumo,
      UTIL.formatoValor('porciento', (autoconsumo / consumo) * 100),
      stAutoconsumo,
      stTitulo,
    )
    _drawArrow(
      bar.current,
      leftMargin + wConsumo + wExcedente / 2 - 10,
      linea,
      4,
      'Excedente',
    )
    _drawArrow(bar.current, leftMargin + wDeficit / 2 - 10, linea + 1, 4, 'Deficit')

    linea = 5
    _drawElipseText(
      bar.current,
      leftMargin + wDeficit + wAutoconsumo / 2,
      linea,
      wAutoconsumo / 2,
      [t('ENERGY_BALANCE.LABEL_AUTOCONSUMO'), UTIL.formatoValor('energia', autoconsumo)],
      stAutoconsumo,
      stTitulo,
    )

    linea = 7
    _drawRectText(
      bar.current,
      leftMargin + wDeficit,
      linea,
      wAutoconsumo,
      UTIL.formatoValor('porciento', (autoconsumo / produccion) * 100),
      stAutoconsumo,
      stTitulo,
    )
    _drawRectText(
      bar.current,
      leftMargin + wDeficit + wAutoconsumo,
      linea,
      wExcedente,
      UTIL.formatoValor('porciento', (excedente / produccion) * 100),
      stExcedente,
      stTitulo,
    )

    linea = 8
    _drawRectText(
      bar.current,
      leftMargin,
      linea,
      wDeficit,
      UTIL.formatoValor('energia', deficit),
      stDeficit,
      stTitulo,
    )
    _drawRectText(
      bar.current,
      leftMargin + wDeficit,
      linea,
      wProduccion,
      UTIL.formatoValor('energia', produccion),
      stProduccion,
      stTitulo,
    )

    linea = 9
    _drawRectText(
      bar.current,
      leftMargin,
      linea,
      wDeficit,
      t('ENERGY_BALANCE.LABEL_ENERGIA_RED'),
      stFlujo,
      stTitulo,
    )
    gSymbol = graficoDeficit.current
    gSymbol.style.left = (leftMargin + wDeficit / 2 - 50).toFixed(0) + 'px'
    gSymbol.style.display = 'inline-block'

    _drawRectText(
      bar.current,
      leftMargin + wDeficit,
      linea,
      wProduccion,
      t('ENERGY_BALANCE.LABEL_ENERGIA_PANELES'),
      stFlujo,
      stTitulo,
    )
    gSymbol = graficoProduccion.current
    gSymbol.style.left = (leftMargin + wDeficit + wProduccion / 2 - 150).toFixed(0) + 'px'
    gSymbol.style.display = 'inline-block'
  }
  return (
    <>
      <Container>
        <Box
          ref={grafResumen}
          sx={{
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              mb: 3,
              flexDirection: 'column',
            }}
          >
            <Typography variant="h4" textAlign={'center'}>
              {t('ENERGY_BALANCE.FLOW_TITLE')}
            </Typography>
            <Typography
              variant="body"
              dangerouslySetInnerHTML={{
                __html: t('ENERGY_BALANCE.FLOW_DESCRIPTION'),
              }}
            />
          </Box>

          <Box
            id="rootBox"
            sx={{
              width: '100%',
              ml: 0,
              mb: 3,
            }}
          >
            <Box>
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
                }}
              />

              <CardMedia
                component="img"
                src="./datos/red.svg"
                ref={graficoExcedente}
                sx={{
                  position: 'relative',
                  height: 87,
                  width: 100,
                }}
                alt="Energía vertida a la red"
                title="Energía vertida a la red"
              />
              <Box sx={{ width: '100%', height: parseInt(10 * altoLinea), mt: 1 }}>
                <svg
                  ref={bar}
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                ></svg>
              </Box>
              <CardMedia
                component="img"
                src="./datos/red.svg"
                ref={graficoDeficit}
                sx={{
                  position: 'relative',
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
                  height: 87,
                  width: 100,
                }}
                alt="Producción en paneles"
                title="Producción en paneles"
              />
            </Box>
          </Box>
        </Box>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('ENERGY_BALANCE.DESCRIPTION_YEAR_ENERGY_BALANCE', {
              consumoTotal: UTIL.formatoValor('energia', TCB.consumo.cTotalAnual),
              porcientoAutoconsumo: UTIL.formatoValor(
                'porciento',
                (TCB.balance.autoconsumo / TCB.consumo.cTotalAnual) * 100,
              ),
              porcientoDemanda: UTIL.formatoValor(
                'porciento',
                (TCB.balance.deficitAnual / TCB.consumo.cTotalAnual) * 100,
              ),
              porcientoAutoproduccion: UTIL.formatoValor(
                'porciento',
                (TCB.balance.autoconsumo / TCB.produccion.pTotalAnual) * 100,
              ),
              produccionTotal: UTIL.formatoValor('energia', TCB.produccion.pTotalAnual),
              porcientoVertido: UTIL.formatoValor(
                'porciento',
                (TCB.balance.excedenteAnual / TCB.produccion.pTotalAnual) * 100,
              ),
            }),
          }}
        />
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

  svg.appendChild(rect)

  let text = document.createElementNS(svgns, 'text')
  text.setAttribute('style', estiloT)
  text.setAttribute('x', x + ancho / 2)
  text.setAttribute('y', y + altoLinea / 2)
  text.textContent = texto
  svg.appendChild(text)
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
