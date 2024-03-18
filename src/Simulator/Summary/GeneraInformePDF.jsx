/**
 * @module  generaInformePDF
 * @fileoverview Módulo para la generación del informe de resultados finales en pdf
 * @version      Solidar.3
 * @author       José Luis García (SOM Madrid)
 * @copyright
 *
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
 */

// Solidar objects
import TCB from '../classes/TCB.js'
import * as UTIL from '../classes/Utiles.js'

import jsPDF from 'jspdf'
import 'jspdf-autotable'

var i
let pagina = 1
let currentY = 0
var doc

var img = new Image(160, 60)
// img.crossOrigin = ''
// img.src = '../datos/logo.png'

var margenIzquierdo
var margenDerecho
var pageWidth
var pageHeight
// Hoja DIN A4 - 210 x 297
var _hdr
var footer
var center
var baseTitulo
var postTitulo
var altoRenglon

async function GeneraInformePDF() {
  //(props)
  //const { t } = useTranslation()
  //   const { pdfSummary } = props
  //const { refs } = useContext(BasesContext)

  TCB.doc = newDoc() //Crea un nuevo pdf
  doc = TCB.doc

  img = new Image()
  img.crossOrigin = ''
  img.src = './datos/logo-pdf.png'

  pageWidth = doc.internal.pageSize.width //Optional
  pageHeight = doc.internal.pageSize.height //Optional
  margenIzquierdo = 25
  margenDerecho = pageWidth - 10
  // Hoja DIN A4 - 210 x 297
  _hdr = 15
  footer = pageHeight - 5
  center = (margenIzquierdo + margenDerecho) / 2

  baseTitulo = 10
  postTitulo = 4
  altoRenglon = 7

  i = 0
  //Volcamos las bases que incluyen el rendimiento, la produccion y la instalación de cada una de ellas
  nuevaLinea('Cabecera', null, null, 'REPORT.titulo')

  showTabla(TCB.BaseSolar)

  i = 0
  //Si hay mas de una base volcamos la produccion total
  if (TCB.BaseSolar.length > 1) {
    nuevaLinea('Titulo', null, null, 'REPORT.produccionTotal')
    nuevaLinea(
      'Dato',
      i++,
      'Produccion.PROP.totalAnual',
      UTIL.formatoValor('energia', TCB.produccion.totalAnual),
    )
    nuevaLinea(
      'Dato',
      i++,
      'Paneles',

      TCB.BaseSolar.reduce((sum, tBase) => sum + tBase.instalacion.paneles, 0).toFixed(0),
    )
    nuevaLinea(
      'Dato',
      i++,
      'Potencia',
      UTIL.formatoValor(
        'potencia',
        TCB.BaseSolar.reduce((sum, tBase) => sum + tBase.instalacion.potenciaTotal, 0),
      ),
    )
  }
  nuevaLinea('Pie', pagina++, true)

  //Volcamos los tipos de consumo
  i = 0
  nuevaLinea('Cabecera', null, null, 'REPORT.titulo')
  showTabla(TCB.TipoConsumo)

  nuevaLinea('Titulo', i++, null, 'REPORT.datosDeConsumo')
  nuevaLinea('Dato', i++, 'Tarifa.PROP.territorio', TCB.territorio, '')

  nuevaLinea(
    'Dato',
    i++,
    'Consumo.PROP.maximoAnual',
    UTIL.formatoValor('energia', TCB.consumo.maximoAnual),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Consumo.PROP.consumoDiario',
    UTIL.formatoValor('energia', TCB.consumo.totalAnual / 365),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Consumo.PROP.consumoMensual',
    UTIL.formatoValor('energia', TCB.consumo.totalAnual / 12),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Consumo.PROP.totalAnual',
    UTIL.formatoValor('energia', TCB.consumo.totalAnual),
  )

  i += 4
  nuevaLinea('Titulo', i++, null, 'REPORT.produccionMediaEsperada')
  nuevaLinea(
    'Dato',
    i++,
    'Produccion.PROP.produccionDiaria',
    UTIL.formatoValor('energia', TCB.produccion.totalAnual / 365),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Produccion.PROP.produccionMensual',
    UTIL.formatoValor('energia', TCB.produccion.totalAnual / 12),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Produccion.PROP.totalAnual',
    UTIL.formatoValor('energia', TCB.produccion.totalAnual),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Produccion.PROP.CO2AnualRenovable',
    UTIL.formatoValor('peso', TCB.produccion.CO2AnualRenovable),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Produccion.PROP.CO2AnualNoRenovable',
    UTIL.formatoValor('peso', TCB.produccion.CO2AnualNoRenovable),
  )

  doc.addImage({
    imageData: TCB.graphs.MonthEnergyBalance,
    x: margenIzquierdo,
    y: currentY,
    w: margenDerecho - margenIzquierdo,
    h: 100,
  })
  nuevaLinea('Pie', pagina++, true)

  i = 0
  nuevaLinea('Cabecera', null, null, 'REPORT.titulo')
  nuevaLinea('Titulo', i++, null, 'REPORT.balanceEnergia')
  nuevaLinea(
    'Dato',
    i++,
    'Balance.PROP.Produccion%Consumo',
    UTIL.formatoValor(
      'porciento',
      (TCB.produccion.totalAnual / TCB.consumo.totalAnual) * 100,
    ),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Balance.PROP.Consumo%Produccion',
    UTIL.formatoValor(
      'porciento',
      (TCB.consumo.totalAnual / TCB.produccion.totalAnual) * 100,
    ),
  )
  let p_autoconsumo = (TCB.balance.autoconsumo / TCB.produccion.totalAnual) * 100
  let p_autosuficiencia = (TCB.balance.autoconsumo / TCB.consumo.totalAnual) * 100
  nuevaLinea(
    'Dato',
    i++,
    'Balance.PROP.autoconsumoMedioAnual',
    UTIL.formatoValor('energia', TCB.balance.autoconsumo) +
      '-> ' +
      UTIL.formatoValor('porciento', p_autoconsumo),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Balance.PROP.autosuficienciaMediaAnual',
    UTIL.formatoValor('porciento', p_autosuficiencia),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Balance.PROP.autosuficienciaMaxima',
    UTIL.formatoValor('porciento', p_autosuficiencia + (100 - p_autoconsumo)),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Balance.PROP.excedenteAnual',
    UTIL.formatoValor('energia', TCB.balance.excedenteAnual) +
      ' -> ' +
      UTIL.formatoValor(
        'porciento',
        (TCB.balance.excedenteAnual / TCB.produccion.totalAnual) * 100,
      ),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Balance.PROP.deficitAnual',
    UTIL.formatoValor('energia', TCB.balance.deficitAnual) +
      ' -> ' +
      UTIL.formatoValor(
        'porciento',
        (TCB.balance.deficitAnual / TCB.consumo.totalAnual) * 100,
      ),
  )

  doc.addImage({
    imageData: TCB.graphs.MonthFiveParts,
    x: margenIzquierdo,
    y: currentY + 10,
    w: margenDerecho - margenIzquierdo,
    h: 100,
  })

  nuevaLinea('Pie', pagina++, true)

  i = 0
  nuevaLinea('Cabecera', null, null, 'REPORT.titulo')

  i += 4
  nuevaLinea('Titulo', i++, null, 'REPORT.tarifas')
  nuevaLinea('Dato', i++, 'Tarifa.PROP.tipoTarifa', TCB.tipoTarifa)
  let nPrecios
  if (TCB.tipoTarifa === '2.0TD') nPrecios = 4
  else nPrecios = 6

  for (let k = 0; k < nPrecios; k++) {
    nuevaLinea(
      'Dato',
      i++,
      'Tarifa.PROP.P' + k,
      UTIL.formatoValor('precioEnergia', TCB.tarifaActiva.precios[k]),
    )
  }

  showTabla(TCB.economico)

  let gastoSinPlacasAnual = UTIL.suma(TCB.economico.consumoOriginalMensual)
  let gastoConPlacasAnual = UTIL.suma(TCB.economico.consumoConPlacasMensualCorregido)

  nuevaLinea('Titulo', i++, null, 'REPORT.balanceFinanciero')

  nuevaLinea(
    'Dato',
    i++,
    'PARAMETROS.LABEL_IVAenergia',
    UTIL.formatoValor('porciento', TCB.parametros.IVAenergia),
  )

  nuevaLinea(
    'Dato',
    i++,
    'PARAMETROS.LABEL_IVAinstalacion',
    UTIL.formatoValor('porciento', TCB.parametros.IVAinstalacion),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Economico.PROP.noCompensadoAnual',
    UTIL.formatoValor('dinero', UTIL.suma(TCB.economico.perdidaMes)),
  )
  nuevaLinea(
    'Dato',
    i++,
    'Economico.PROP.ahorroAnualPorciento',
    UTIL.formatoValor(
      'porciento',
      ((gastoSinPlacasAnual - gastoConPlacasAnual) / gastoSinPlacasAnual) * 100,
    ),
  )
  nuevaLinea('Pie', pagina++, true)

  // Balance financiero
  i = 0
  nuevaLinea('Cabecera', null, null, 'REPORT.titulo')
  nuevaLinea('Titulo', i++, null, 'REPORT.balanceFinanciero')

  let tcolumns = [
    { header: TCB.i18next.t('ECONOMIC_BALANCE.LABEL_ANO'), dataKey: 'ano' },
    { header: TCB.i18next.t('ECONOMIC_BALANCE.LABEL_PREVIO'), dataKey: 'previo' },
    { header: TCB.i18next.t('ECONOMIC_BALANCE.LABEL_INVERSION'), dataKey: 'inversion' },
    { header: TCB.i18next.t('ECONOMIC_BALANCE.LABEL_AHORRO'), dataKey: 'ahorro' },
    { header: TCB.i18next.t('ECONOMIC_BALANCE.LABEL_IBI'), dataKey: 'IBI' },
    {
      header: TCB.i18next.t('ECONOMIC_BALANCE.LABEL_SUBVENCION'),
      dataKey: 'subvencion',
    },
    { header: TCB.i18next.t('ECONOMIC_BALANCE.LABEL_PENDIENTE'), dataKey: 'pendiente' },
  ]
  let trows = TCB.economico.cashFlow.map((row) => {
    //AA
    var tt = {}
    for (let objProp in row) {
      tt[objProp] = UTIL.formatoValor(objProp, row[objProp])
    }
    return tt
  })
  doc.autoTable({
    didDrawPage: function (data) {
      currentY = data.cursor.y
    },
    columns: tcolumns,
    body: trows,
    margin: { left: 25, top: 50 },
    theme: 'striped',
    startY: currentY,
    styles: {
      halign: 'right',
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      minCellHeight: 6,
    },
    headStyles: { halign: 'center', fillColor: [255, 255, 255], lineColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [229, 255, 204] },
  })

  doc.addImage({
    imageData: TCB.graphs.MonthSavings,
    x: margenIzquierdo,
    y: currentY + 5,
    w: margenDerecho - margenIzquierdo,
    h: 110,
  })

  nuevaLinea('Pie', pagina++, true)
  nuevaLinea('Disclaimer', i++, TCB.i18next.t('Economico.MSG_disclaimerAhorro'), '')
  currentY += 20
  nuevaLinea('Disclaimer', pagina++, TCB.i18next.t('REPORT.disclaimer1pdf'), '')
  nuevaLinea('Pie', pagina++, false)

  nuevaLinea('Fin')
  doc.save(TCB.nombreProyecto + '-Informe Solidar.pdf')

  // pdfSummary(false)
  // return ' '
}

function newDoc() {
  return new jsPDF('portrait', 'mm', 'a4')
}

function showTabla(tabla) {
  let tTabla = {}
  var data = []
  if (!Array.isArray(tabla)) {
    tTabla = UTIL.swapObjeto(tabla)
  } else {
    tTabla = UTIL.swapTabla(tabla)
  }

  for (let obj in tTabla) {
    i++
    if (obj === 'Instalacion') {
      nuevaLinea('Pie', pagina++, true)
      nuevaLinea('Cabecera', null, null, 'REPORT.titulo')
    }
    nuevaLinea('Titulo', i++, null, obj + '.NAME')
    data = []
    for (let prop in tTabla[obj]) {
      i++
      data.push([TCB.i18next.t(obj + '.PROP.' + prop)].concat(tTabla[obj][prop]))
    }

    doc.autoTable({
      willDrawCell: (data) => {
        data.cell.text = data.cell.raw
        data.cell.colSpan = TCB.BaseSolar.length + 1
      },
      didDrawPage: function (data) {
        currentY = data.cursor.y
      },
      body: data,
      startY: currentY,
      //tableWidth: 'wrap',
      //columnWidth: 'wrap',
      cellWidth: 'wrap',
      margin: { left: 25, top: 0, right: 10 },
      styles: {
        halign: 'right',
        textColor: [0, 0, 0],
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        minCellHeight: 5,
      },
      columnStyles: { 0: { halign: 'left', cellWidth: 56 } },
      theme: 'striped',
      alternateRowStyles: { fillColor: [229, 255, 204] },
    })
  }
}

function nuevaLinea(tipo, linea, propiedad, valor) {
  let lines
  let pages

  const _font = { Cabecera: 22, Titulo: 16, Normal: 12, Dato: 11, Pie: 10 }
  let hoy = new Date()

  doc.setFont(undefined)
  doc.setFontSize(_font[tipo])

  switch (tipo) {
    case 'Cabecera':
      doc.setLineWidth(1)
      doc.addImage(img, 165, 2)
      doc.text(TCB.i18next.t(valor), margenIzquierdo, _hdr, null, null, 'left')
      doc.line(margenIzquierdo, _hdr + 2, margenDerecho, _hdr + 2)
      doc.setFontSize(_font['Normal'])
      currentY = _hdr + baseTitulo
      doc.text(
        TCB.i18next.t('Proyecto.PROP.nombreProyecto', { nombre: TCB.nombreProyecto }),
        margenIzquierdo,
        currentY,
      )
      break

    case 'Titulo':
      currentY += baseTitulo
      doc.text(TCB.i18next.t(valor), center, currentY, null, null, 'center')
      doc.setLineWidth(1)
      currentY += postTitulo
      break

    case 'Normal':
      currentY += altoRenglon
      doc.text(valor, margenIzquierdo, currentY)
      break

    case 'Dato':
      currentY += altoRenglon
      doc.setLineWidth(0.1)
      if (linea % 2 == 0) doc.setFillColor(255, 255, 255)
      else doc.setFillColor(229, 255, 204)

      doc.rect(margenIzquierdo, currentY + 2, margenDerecho - margenIzquierdo, -7, 'DF')
      doc.setFillColor(255, 255, 255)
      doc.text(TCB.i18next.t(propiedad), margenIzquierdo + 1, currentY)
      doc.text(valor, margenDerecho - 1, currentY, { align: 'right' })
      break

    case 'Pie':
      doc.setFontSize(_font['Pie'])
      doc.setFillColor(0)
      doc.setLineWidth(1)
      doc.line(margenIzquierdo, footer - altoRenglon, margenDerecho, footer - altoRenglon)
      doc.text(UTIL.formatoValor('pdfpieDePagina', hoy), margenIzquierdo, footer)
      doc.textWithLink('Gentileza de Solidar Energia', margenDerecho, footer, {
        url: 'https://www.solidarenergia.es/',
        align: 'right',
      })
      if (propiedad) {
        if (valor !== undefined) doc.addPage(null, valor)
        else doc.addPage(null, 'p')
      }
      break

    case 'Disclaimer':
      // Texto de descargo de responsabilidad
      doc.setFontSize(12)
      lines = doc.splitTextToSize(propiedad, 170)
      doc.text(lines, center, currentY, { align: 'center' })
      break

    case 'Fin':
      doc.setFontSize(_font['Normal'])
      pages = doc.internal.getNumberOfPages()

      for (let j = 1; j < pages + 1; j++) {
        doc.setPage(j)
        const pageWidth = doc.internal.pageSize.width //Optional
        const pageHeight = doc.internal.pageSize.height //Optional
        const footer = pageHeight - 5
        const margenIzquierdo = 25
        const margenDerecho = pageWidth - 10
        const center = (margenIzquierdo + margenDerecho) / 2
        doc.text(j + ' de ' + pages, center, footer, { align: 'center' }) //Optional text styling});
      }
      break
  }
}

export { GeneraInformePDF }
