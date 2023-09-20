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
import TCB from "./TCB.js";
import * as UTIL from "./Utiles.js";
import Finca from "./Finca.js";
/*global Plotly, INDIVIDUAL*/

const { jsPDF } = window.jspdf;
var i;
let pagina = 1;
let currentY = 0;
var doc;

var img = new Image(160, 60);
img.crossOrigin = "";  
img.src = "./datos/logo.png";


function newDoc() {
  return new jsPDF('portrait', 'mm', 'a4');
}

function showTabla( tabla) {
  let tTabla = {};
  var data = [];

  if (!Array.isArray(tabla)) {
    tTabla = UTIL.swapObjeto( tabla);
  } else {
    tTabla = UTIL.swapTabla( tabla);
  }

  for (let obj in tTabla) {
    i++;
    nuevaLinea('Titulo', i++, null, 'objeto_'+obj);
    data = [];
    for (let prop in tTabla[obj]) {
      i++;
      data.push([TCB.i18next.t(prop+"_LBL")].concat(tTabla[obj][prop]));
    }

    doc.autoTable({
      willDrawCell: (data) => {
          data.cell.text = data.cell.raw;
          data.cell.colSpan = TCB.BaseSolar.length + 1;
      },
      didDrawPage: function(data) {
        currentY = data.cursor.y;
      },
      body: data,
      startY: currentY,
      //tableWidth: 'wrap',
      //columnWidth: 'wrap',
      cellWidth: 'wrap',
      margin:{left: 25, top: 0, right: 10},
      styles: {halign: 'right', textColor: [0, 0, 0], lineWidth: 0.1, minCellHeight: 6 },
      columnStyles: { 0: { halign: 'left', cellWidth: 56} },
      theme: 'striped',
      alternateRowStyles: {fillColor: [229,255,204]}
    })
  }
}

async function generaInformePDF() {

  TCB.doc = newDoc(); //Crea un nuevo pdf
  doc = TCB.doc;

  img = new Image();
  img.crossOrigin = "";  
  img.src = "./datos/logo-pdf.png";

  i = 0;
  //Volcamos las bases que incluyen el rendimiento, la produccion y la instalación de cada una de ellas
  nuevaLinea('Cabecera',null, null, 'main_LBL_titulo'); 
  showTabla (TCB.BaseSolar);
  nuevaLinea('Pie', pagina++, true);

  i = 0;
  //Si hay mas de una base volcamos la produccion total
  if (TCB.BaseSolar.length > 1) {
    nuevaLinea('Cabecera',null, null, 'main_LBL_titulo'); 
    //nuevaLinea('Titulo', i++, null, 'informe_LBL_produccionTotal');

    let lastY = currentY;
    showTabla(TCB.produccion);
    doc.setFillColor(255,255,255);
    doc.rect(25, lastY + 2, 175, 6, 'F');
    let futureY = currentY;
    currentY = lastY;
    nuevaLinea('Titulo',null, null, 'informe_LBL_produccionTotal');
    currentY = futureY;
    nuevaLinea('Pie', pagina++, true);
  }

  i = 0;
  //Los puntos de consumo solo se vuelcan cuando el modo no es INDIVIDUAL
  if (TCB.modoActivo !== INDIVIDUAL) {
    nuevaLinea('Cabecera',null, null, 'main_LBL_titulo'); 
    showTabla(TCB.PuntoConsumo);
    nuevaLinea('Pie', pagina++, true);
  }    

  //Volcamos los tipos de consumo
  i = 0;
  nuevaLinea('Cabecera',null, null, 'main_LBL_titulo');
  showTabla(TCB.TipoConsumo);
  nuevaLinea('Pie', pagina++, true);

  i = 0;
  nuevaLinea('Cabecera',null, null, 'main_LBL_titulo');
  nuevaLinea('Titulo',i++, null, 'informe_LBL_datosDeConsumo');
  nuevaLinea('Dato', i++, 'informe_LBL_localizacion', TCB.territorio,"");

  nuevaLinea('Dato', i++, 'cMaximoAnual_LBL', UTIL.formatoValor('energia',TCB.consumo.cMaximoAnual));
  nuevaLinea('Dato', i++, 'consumoDiario_LBL', UTIL.formatoValor('energia',TCB.consumo.cTotalAnual / 365));
  nuevaLinea('Dato', i++, 'consumoMensual_LBL', UTIL.formatoValor('energia',TCB.consumo.cTotalAnual / 12));
  nuevaLinea('Dato', i++, 'cTotalAnual_LBL', UTIL.formatoValor('energia',TCB.consumo.cTotalAnual));
   

    i += 2;
    nuevaLinea("Titulo", i++, null, 'informe_LBL_produccionMediaEsperada');
    nuevaLinea('Dato', i++, 'produccionDiaria_LBL', UTIL.formatoValor('energia',TCB.produccion.pTotalAnual / 365));
    nuevaLinea('Dato', i++, 'produccionMensual_LBL', UTIL.formatoValor('energia',TCB.produccion.pTotalAnual / 12));
    nuevaLinea('Dato', i++, 'produccionAnual_LBL', UTIL.formatoValor('energia',TCB.produccion.pTotalAnual));
    nuevaLinea('Dato', i++, 'kgCO2AnualRenovable_LBL', UTIL.formatoValor('peso',TCB.CO2AnualRenovable));
    nuevaLinea('Dato', i++, 'kgCO2AnualRenovable_LBL', UTIL.formatoValor('peso',TCB.CO2AnualNoRenovable));
    
    await Plotly.toImage('graf_1', { format: 'png', width: 800, height: 500 })
    .then(function (dataURL) {
        doc.addImage({imageData: dataURL, x: 40, y: 150, w:150, h:100})});
    nuevaLinea('Pie', pagina++, true);
    
    i = 0;
    nuevaLinea('Cabecera',null, null, 'main_LBL_titulo');
    nuevaLinea('Titulo',i++, null, 'informe_LBL_balanceEnergia');
    nuevaLinea('Dato', i++, 'Produccion%Consumo_LBL', 
      UTIL.formatoValor('porciento',((TCB.produccion.pTotalAnual / TCB.consumo.cTotalAnual) * 100)));
    nuevaLinea('Dato', i++, 'Consumo%Produccion_LBL', 
      UTIL.formatoValor('porciento',((TCB.consumo.cTotalAnual / TCB.produccion.pTotalAnual) * 100)));
    let p_autoconsumo = (TCB.balance.autoconsumo / TCB.produccion.pTotalAnual) * 100;
    let p_autosuficiencia = (TCB.balance.autoconsumo / TCB.consumo.cTotalAnual) * 100;
    nuevaLinea('Dato', i++, 'autoconsumoMedioAnual_LBL', 
      UTIL.formatoValor('energia',TCB.balance.autoconsumo) + "-> " + UTIL.formatoValor('porciento',p_autoconsumo));
    nuevaLinea('Dato', i++, 'autosuficienciaMediaAnual_LBL', UTIL.formatoValor('porciento',p_autosuficiencia));
    nuevaLinea('Dato', i++, 'autosuficienciaMaxima_LBL', UTIL.formatoValor('porciento',(p_autosuficiencia + (100 - p_autoconsumo))));
    nuevaLinea('Dato', i++, 'excedenteAnual_LBL', 
      UTIL.formatoValor('energia',TCB.balance.excedenteAnual) + " -> " + UTIL.formatoValor('porciento',(TCB.balance.excedenteAnual / TCB.produccion.pTotalAnual * 100)));
    nuevaLinea('Dato', i++, 'deficitAnual_LBL', 
      UTIL.formatoValor('energia',TCB.balance.deficitAnual) + " -> " + UTIL.formatoValor('porciento',(TCB.balance.deficitAnual / TCB.consumo.cTotalAnual * 100)));

   
/*       var nImage;
      await Plotly.toImage('graf_1', { format: 'png', width: 800, height: 500 }).then(function (dataURL) {
        nImage = document.createElement("img");
        nImage.src = dataURL;
        nImage.width = 600;
        nImage.height = 400;
        nImage.classList.add('imagen-centrada');
      });
      htdoc.appendChild(nImage); */


    await Plotly.toImage('graf_2', { format: 'png', width: 800, height: 500 }).then(function (dataURL) {
      doc.addImage({imageData: dataURL, x: 25, y: currentY + 10, w:160, h:100})});
    currentY += 100;

    await Plotly.toImage('graf_3', { format: 'png', width: 800, height: 500 }).then(function (dataURL) {
      doc.addImage({imageData: dataURL, x: 25, y: currentY, w:160, h:100})});
    nuevaLinea('Pie', pagina++, true);
  
    i = 0;
    nuevaLinea('Cabecera',null, null, 'main_LBL_titulo');
    showTabla(TCB.economico);

    let gastoSinPlacasAnual = UTIL.suma(TCB.economico.consumoOriginalMensual);
    let gastoConPlacasAnual = UTIL.suma(TCB.economico.consumoConPlacasMensualCorregido);
    nuevaLinea('Dato', i++, 'IVAenergia_LBL', UTIL.formatoValor('porciento',TCB.parametros.IVAenergia));
    nuevaLinea('Dato', i++, 'precioInstalacion_LBL', UTIL.formatoValor('dinero',TCB.produccion.precioInstalacion));
    nuevaLinea('Dato', i++, 'precioInstalacionCorregido_LBL', UTIL.formatoValor('dinero',TCB.produccion.precioInstalacionCorregido));
    nuevaLinea('Dato', i++, 'IVAinstalacion_LBL', UTIL.formatoValor('porciento',TCB.parametros.IVAinstalacion));
    nuevaLinea('Dato', i++, 'noCompensadoAnual_LBL', UTIL.formatoValor('dinero',UTIL.suma(TCB.economico.perdidaMes)));
    nuevaLinea('Dato', i++, 'ahorroAnualPorciento_LBL', UTIL.formatoValor('porciento',(gastoSinPlacasAnual - gastoConPlacasAnual) / gastoSinPlacasAnual * 100));

    await Plotly.toImage('graf_4', { format: 'png', width: 800, height: 500 }).then(function (dataURL) {
      doc.addImage({imageData: dataURL, x: 30, y: currentY + 10, w:160, h:100})});

    // Reparto
    if (TCB.modoActivo !== INDIVIDUAL) {
      nuevaLinea('Pie', pagina++, true, 'l');
      var tcolumns;
      var trows;
      i = 0;
      nuevaLinea('Cabecera',null, null, 'main_LBL_titulo');
      nuevaLinea('Titulo',i++, null, 'informe_LBL_reparto');
      tcolumns= [
        { header: TCB.i18next.t('nombreFinca_LBL'), dataKey: 'nombreFinca' },
        { header: TCB.i18next.t('uso_LBL'), dataKey: 'uso', cellWidth: 20 },
        { header: TCB.i18next.t('participacion_LBL'), dataKey: 'participacion' },
        { header: TCB.i18next.t('coefConsumo_LBL'), dataKey: 'coefConsumo'},
        { header: TCB.i18next.t('cTotalAnual_LBL'), dataKey: 'cTotalAnual'},
        { header: TCB.i18next.t('coefEnergia_LBL'), dataKey: 'coefEnergia'},
        { header: TCB.i18next.t('produccionTotal_LBL'), dataKey: 'produccionTotal'},
        { header: TCB.i18next.t('coefInversion_LBL'), dataKey: 'coefInversion'},
        { header: TCB.i18next.t('precioInstalacionCorregido_LBL'), dataKey: 'precioInstalacionCorregido'},
        { header: TCB.i18next.t('ahorroFincaAnual_LBL'), dataKey: 'ahorroFincaAnual'},
        { header: TCB.i18next.t('coefHucha_LBL'), dataKey: 'coefHucha'},
        { header: TCB.i18next.t('cuotaHucha_LBL'), dataKey: 'cuotaHucha'}
      ];
      trows = TCB.Participes.map( (row) => {  //AA
        let tt = Finca.getTabulatorRow('idFinca', row.idFinca);
        for (let objProp in tt) {tt[objProp] = UTIL.formatoValor(objProp, tt[objProp])}
        return tt;
      });
 
      doc.autoTable({
        didDrawPage: function(data) {
          currentY = data.cursor.y;
        },
        columns: tcolumns, 
        body: trows, 
        margin:{left: 25, top:50}, 
        theme : 'striped', 
        startY: currentY,
        styles: {halign: 'right', textColor: [0, 0, 0], lineWidth: 0.1, minCellHeight: 6 },
        headStyles: {halign: 'center', fillColor: [255, 255, 255], lineColor: [0, 0, 0]},
        columnStyles: {
          0: {cellWidth: 'auto' },
          1: {cellWidth: 25 },
          2: {cellWidth: 'auto' },
          3: {cellWidth: 20 },
          4: {cellWidth: 'auto' },
          5: {cellWidth: 20},
          6: {cellWidth: 'auto' },
          7: {cellWidth: 20},
          8: {cellWidth: 30},
          9: {cellWidth: 25},
          10: {cellWidth: 'auto'},
          11: {cellWidth: 'auto'}
        },
        alternateRowStyles: {fillColor: [229,255,204]},
      });
    } 
    nuevaLinea('Pie', pagina++, true, 'p');
    
    // Balance financiero
    i = 0;
    nuevaLinea('Cabecera',null, null, 'main_LBL_titulo');
    nuevaLinea('Titulo',i++, null, 'informe_LBL_balanceFinanciero');

    tcolumns= [
      { header: TCB.i18next.t('ano_LBL'), dataKey: 'ano' },
      { header: TCB.i18next.t('previo_LBL'), dataKey: 'previo' },
      { header: TCB.i18next.t('inversion_LBL'), dataKey: 'inversion' },
      { header: TCB.i18next.t('ahorro_LBL'), dataKey: 'ahorro'},
      { header: TCB.i18next.t('descuentoIBI'), dataKey: 'IBI'},
      { header: TCB.i18next.t('subvencionEU'), dataKey: 'subvencion'},
      { header: TCB.i18next.t('pendiente'), dataKey: 'pendiente'}
    ];
    trows = TCB.economico.cashFlow.map( (row) => {  //AA
        var tt = {};
        for (let objProp in row) {tt[objProp] = UTIL.formatoValor(objProp, row[objProp])}
        return tt;
    });
    doc.autoTable({
      didDrawPage: function(data) {
        currentY = data.cursor.y;
      },
      columns: tcolumns, 
      body: trows, 
      margin:{left: 25, top:50}, 
      theme : 'striped', 
      startY: currentY,
      styles: {halign: 'right', textColor: [0, 0, 0], lineWidth: 0.1, minCellHeight: 6 },
      headStyles: {halign: 'center', fillColor: [255, 255, 255], lineColor: [0, 0, 0]},
      alternateRowStyles: {fillColor: [229,255,204]},
    });  
      
    nuevaLinea('Dato', i++, 'VAN', UTIL.formatoValor('VAN', TCB.economico.VANProyecto));
    nuevaLinea('Dato', i++, 'TIR', UTIL.formatoValor('TIR', TCB.economico.TIRProyecto));
    currentY += 20;
    nuevaLinea('Disclaimer', i++, TCB.i18next.t('economico_MSG_disclaimerAhorro'),'');
    currentY += 20;
    nuevaLinea('Disclaimer', pagina++, TCB.i18next.t('informe_LBL_disclaimer1pdf'),'');
    nuevaLinea('Pie', pagina++, false);
    nuevaLinea('Fin');

    doc.save(TCB.nombreProyecto + '-Informe Solidar.pdf');

}

function nuevaLinea( tipo, linea, propiedad, valor) {
    // Hoja DIN A4 - 210 x 297

    const pageWidth = doc.internal.pageSize.width;  //Optional
    const pageHeight = doc.internal.pageSize.height;  //Optional

    const _hdr = 15;
    const footer = pageHeight - 5;
    const margenIzquierdo = 25;
    const margenDerecho = pageWidth - 10;
    const center = (margenIzquierdo + margenDerecho) / 2;

    const baseTitulo = 7;
    const postTitulo = 2;
    const altoRenglon = 7;

    let lines;
    let pages;

    const _font = {Cabecera: 22, Titulo: 16, Normal:12, Dato: 11, Pie:10}
    let hoy = new Date();

    doc.setFont(undefined);
    doc.setFontSize(_font[tipo]);

    switch (tipo) {
    case "Cabecera":
      doc.setLineWidth( 1 );
      doc.addImage(img, 165, 2);
      doc.text(TCB.i18next.t(valor), margenIzquierdo, _hdr, null, null, 'left');
      doc.line(margenIzquierdo, _hdr + 2, margenDerecho, _hdr + 2);
      doc.setFontSize(_font['Normal']);
      currentY = _hdr + baseTitulo;
      doc.text(TCB.i18next.t("nombreProyecto_LBL") + " " + TCB.nombreProyecto, margenIzquierdo, currentY);
      break;
    
    case "Titulo":
      currentY += baseTitulo;
      doc.text(TCB.i18next.t(valor), center, currentY, null, null, 'center');
      doc.setLineWidth( 1 );
      currentY += postTitulo;
      break;

    case "Normal":
      currentY += altoRenglon;
      doc.text( valor, margenIzquierdo, currentY);
      break;

    case "Dato":
      currentY += altoRenglon;
      doc.setLineWidth( 0.1 );
      if (linea % 2 == 0) 
        doc.setFillColor(255,255,255);
      else
        doc.setFillColor(229,255,204);

      doc.rect(margenIzquierdo, currentY + 2, margenDerecho - margenIzquierdo, -7, 'DF');
      doc.setFillColor(255,255,255);
      doc.text(TCB.i18next.t(propiedad), margenIzquierdo+1, currentY);
      doc.text(valor, margenDerecho-1, currentY, {align: 'right'});
      break;

    case "Pie":
      doc.setFontSize(_font['Pie']);
      doc.setFillColor(0);
      doc.setLineWidth( 1 );
      doc.line(margenIzquierdo, footer - altoRenglon, margenDerecho, footer - altoRenglon);
      doc.text(UTIL.formatoValor('pdfpieDePagina', hoy), margenIzquierdo, footer);
      doc.textWithLink('Gentileza de Solidar Energia', margenDerecho, footer, {url: 'https://www.solidarenergia.es/', align:'right'});
      if (propiedad) {
        if (valor !== undefined)
          doc.addPage(null, valor);
        else
          doc.addPage(null, 'p');
      }
      break;

    case "Disclaimer":
      // Texto de descargo de responsabilidad
      doc.setFontSize(12);
      lines = doc.splitTextToSize(propiedad, 170);
      doc.text(lines, center, currentY, {align:'center'});
      break;

    case "Fin":
      doc.setFontSize(_font['Normal']);
      pages = doc.internal.getNumberOfPages();     
      
      

      for (let j = 1; j < pages + 1 ; j++) {
            doc.setPage(j);
            const pageWidth = doc.internal.pageSize.width;  //Optional
            const pageHeight = doc.internal.pageSize.height;  //Optional
            const footer = pageHeight - 5;
            const margenIzquierdo = 25;
            const margenDerecho = pageWidth - 10;
            const center = (margenIzquierdo + margenDerecho) / 2;
            doc.text(j + " de " + pages, center, footer, {align: 'center'})  //Optional text styling});
      }
      break;
    }
  }

  export {generaInformePDF}