/**
 * @module  gestionReporte
 * @fileoverview Módulo para la gestión de los resúmenes finales en pantalla de los estudios
 * @version      Solidar.3
 * @author       José Luis García (SOM Madrid)
 * @copyright
 * 
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
*/
import TCB from "./TCB.js";
import * as UTIL from "./Utiles.js";
import * as Idioma from "./Idioma.js";
import { generaInformePDF } from "./generaInformePDF.js";
/*global INDIVIDUAL, COLECTIVO, Plotly, Tabulator*/

let htdoc;
var i;

export default function gestionReporte( accion) {
    switch (accion) {
      case "Inicializa":
        inicializaEventos();
        break;
      case "Valida":
        valida();
        break;
      case "Prepara":
        return prepara();
    }
  }

function inicializaEventos() {
  // Inicialización y evento asociado a la generación del informe pdf
  htdoc = document.getElementById('contenido');
  document.getElementById('botonInformePDF').addEventListener("click", procesaInformePDF);
  document.getElementById('informeResumen').addEventListener("click", procesaInformePDF);
  
}


function procesaInformePDF() { 
  TCB.economicoCreado = true; //AA
  if (TCB.economicoCreado) { //AA
    generaInformePDF();
  } else {
    alert(TCB.i18next.t('informe_MSG_procesarPrimero'));
}}

function valida() { //Nada que hacer, de aqui no se pasa a ningun nuevo tab
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
      data = [];
      for (let prop in tTabla[obj]) {
        i++;
        //console.log("1->"+obj+"--"+prop+"--"+tTabla[obj][prop]);
        data.push([TCB.i18next.t(prop + "_LBL")].concat(tTabla[obj][prop]));
      }
    }

    for (let obj in tTabla) {
        nuevaLinea('Titulo', i++, null, 'objeto_'+obj);
        for (let prop in tTabla[obj]) {
          //console.log("2->"+obj+"--"+prop+"--"+tTabla[obj][prop]);
          nuevaLinea('Dato', i++, prop + "_LBL", tTabla[obj][prop]);
        }
    }
}

async function prepara() {

  htdoc.innerHTML = ""; //Limpia el DIV donde se generar el resumen
  i = 1;

  //Volcamos las bases que incluyen el rendimiento, la produccion y la instalación de cada una de ellas
  nuevaLinea('Cabecera',null, null, 'main_LBL_titulo'); 
  nuevaLinea('Titulo', i++, null, 'informe_LBL_datosLocalizacionAportados');
  showTabla(TCB.BaseSolar);

  //Si hay mas de una base volcamos la produccion total
  if (TCB.BaseSolar.length > 1) {
    showTabla(TCB.produccion);
  }
  
  //Los puntos de consumo solo se vuelcan cuando el modo no es INDIVIDUAL
  if (TCB.modoActivo !== INDIVIDUAL) {
    nuevaLinea('Cabecera',null, null, 'main_LBL_titulo'); 
    showTabla(TCB.PuntoConsumo);
  }    

  //Volcamos los tipos de consumo
  var i = 1;
  nuevaLinea('Cabecera',null, null, 'main_LBL_titulo');
  showTabla(TCB.TipoConsumo);

  i = 1;
  nuevaLinea('Titulo',i++, null, 'informe_LBL_datosDeConsumo');
  nuevaLinea('Dato', i++, 'territorio_LBL', TCB.territorio,"");
  
    nuevaLinea('Dato', i++, 'cMaximoAnual_LBL', UTIL.formatoValor('energia',TCB.consumo.cMaximoAnual));
    nuevaLinea('Dato', i++, 'consumoDiario_LBL', UTIL.formatoValor('energia',TCB.consumo.cTotalAnual / 365));
    nuevaLinea('Dato', i++, 'consumoMensual_LBL', UTIL.formatoValor('energia',TCB.consumo.cTotalAnual / 12));
    nuevaLinea('Dato', i++, 'cTotalAnual_LBL', UTIL.formatoValor('energia',TCB.consumo.cTotalAnual));
   
/*     
    var nImage;
    await Plotly.toImage('graf_resumenConsumo', { format: 'png', width: 800, height: 500 }).then(function (dataURL) {
      nImage = document.createElement("img");
      nImage.src = dataURL;
      nImage.width = 600;
      nImage.height = 400;
      nImage.classList.add('imagen-centrada');
    });
    htdoc.appendChild(nImage); */

    i += 2;
    nuevaLinea("Titulo", i++, null, 'informe_LBL_produccionMediaEsperada');
    nuevaLinea('Dato', i++, 'produccionDiaria_LBL', UTIL.formatoValor('energia',TCB.produccion.pTotalAnual / 365));
    nuevaLinea('Dato', i++, 'produccionMensual_LBL', UTIL.formatoValor('energia',TCB.produccion.pTotalAnual / 12));
    nuevaLinea('Dato', i++, 'pTotalAnual_LBL', UTIL.formatoValor('energia',TCB.produccion.pTotalAnual));
    nuevaLinea('Dato', i++, 'kgCO2AnualRenovable_LBL', UTIL.formatoValor('peso',TCB.CO2AnualRenovable));
    nuevaLinea('Dato', i++, 'kgCO2AnualRenovable_LBL', UTIL.formatoValor('peso',TCB.CO2AnualNoRenovable));

    var nImage;
    await Plotly.toImage('graf_1', { format: 'png', width: 800, height: 500 }).then(function (dataURL) {
      nImage = document.createElement("img");
      nImage.src = dataURL;
      nImage.width = 800;
      nImage.height = 500;
      nImage.classList.add('imagen-centrada');
    });
    htdoc.appendChild(nImage);

    i = 1;
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

      htdoc.appendChild(document.getElementById("bar").cloneNode(true));


      await Plotly.toImage('graf_2', { format: 'png', width: 800, height: 500 }).then(function (dataURL) {
        nImage = document.createElement("img");
        nImage.src = dataURL;
        nImage.width = 800;
        nImage.height = 500;
        nImage.classList.add('imagen-centrada');
      });
      htdoc.appendChild(nImage);

      await Plotly.toImage('graf_3', { format: 'png', width: 800, height: 500 }).then(function (dataURL) {
        nImage = document.createElement("img");
        nImage.src = dataURL;
        nImage.width = 800;
        nImage.height = 500;
        nImage.classList.add('imagen-centrada');
      });
      htdoc.appendChild(nImage);


    i = 1;
    showTabla(TCB.economico);

    let gastoSinPlacasAnual = UTIL.suma(TCB.economico.consumoOriginalMensual);
    let gastoConPlacasAnual = UTIL.suma(TCB.economico.consumoConPlacasMensualCorregido);
    nuevaLinea('Dato', i++, 'IVAenergia_LBL', UTIL.formatoValor('porciento',TCB.parametros.IVAenergia));
    nuevaLinea('Dato', i++, 'IVAinstalacion_LBL', UTIL.formatoValor('porciento',TCB.parametros.IVAinstalacion));
    nuevaLinea('Dato', i++, 'noCompensadoAnual_LBL', UTIL.formatoValor('dinero',UTIL.suma(TCB.economico.perdidaMes)));
    nuevaLinea('Dato', i++, 'ahorroAnualPorciento_LBL', UTIL.formatoValor('porciento',(gastoSinPlacasAnual - gastoConPlacasAnual) / gastoSinPlacasAnual * 100));

    nuevaLinea('Disclaimer', i++, TCB.i18next.t("economico_MSG_disclaimerPrecioInstalacion"),'');
    nuevaLinea('Dato', i++, 'precioInstalacion_LBL', UTIL.formatoValor('dinero',TCB.produccion.precioInstalacion));

    //var nImage;
    await Plotly.toImage('graf_4', { format: 'png', width: 800, height: 500 }).then(function (dataURL) {
      nImage = document.createElement("img");
      nImage.src = dataURL;
      nImage.width = 800;
      nImage.height = 500;
      nImage.classList.add('imagen-centrada');
    });
    htdoc.appendChild(nImage);

    if (TCB.modoActivo === COLECTIVO) {
      i = 1;
      nuevaLinea('Cabecera',null, null, 'main_LBL_titulo');
      nuevaLinea('Titulo',i++, null, 'informe_LBL_reparto');
    
      const divRepartoOriginal = document.getElementById('reparto');
      var table1 = Tabulator.findTable(divRepartoOriginal)[0].getData();
      const divRPTReparto = document.createElement("div");
      divRPTReparto.classList.add("tTab");
      htdoc.appendChild(divRPTReparto);
      
      const _tablaReparto = new Tabulator(divRPTReparto, {
        layout:"fitColumns",
        index: "idFinca",
        data: table1,
        columns:[ 
          {title:"Id", field:"idFinca"},
          {title:"Nombre", field:"nombreFinca"},
          {title:"Uso", field:"uso", hozAlign:"center"},
          {title:"Coef Propiedad", field:"participacion", hozAlign:"right", topCalc:"sum", formatter: "_formatoValor", topCalcFormatter:"_formatoValor"},
          {title:"Coef Consumo", field:"coefConsumo", hozAlign:"right", topCalc:"sum", topCalcFormatter:"_formatoValor", 
          formatter: "_formatoValor"},
          {title:"Consumo", field:"cTotalAnual", hozAlign:"right", formatter: "_formatoValor"},
          {title:"Coef Energia", field:"coefEnergia",hozAlign:"right", topCalc:"sum", formatter: "_formatoValor", topCalcFormatter:"_formatoValor"},
          {title:"Producción", field:"produccionTotal", hozAlign:"right", formatter: "_formatoValor"},
          {title:"Coef Inversión", field:"coefInversion", hozAlign:"right", topCalc:"sum", formatter: "_formatoValor", topCalcFormatter:"_formatoValor"},
          {title:"Inversión", field:"precioInstalacion", hozAlign:"right", formatter: "_formatoValor"},
          {title:"Ahorro", field:"ahorroFincaAnual", hozAlign:"right", formatter: "_formatoValor", topCalc:"sum", topCalcFormatter:"_formatoValor"},
          {title:"Coef Hucha", field:"coefHucha", hozAlign:"right", formatter: "_formatoValor"},
          {title:"Cuota Hucha", field:"cuotaHucha", hozAlign:"right", formatter: "_formatoValor"}
        ],
      });
      _tablaReparto.on("tableBuilt", function(){
        Idioma.i18nTitulosTabla(_tablaReparto)});
    }

    nuevaLinea('Cabecera',null, null, 'main_LBL_titulo');
    nuevaLinea('Titulo',i++, null, 'informe_LBL_balanceFinanciero');

    const divEconomicoOriginal = document.getElementById('economico');
    var table = Tabulator.findTable(divEconomicoOriginal)[0].getData();

    const divRPTEconomico = document.createElement("div");
    divRPTEconomico.classList.add("tTab");
    htdoc.appendChild(divRPTEconomico);

    var formatoDinero = function(cell) {
      const valor = parseFloat(cell.getValue());
      const text = UTIL.formatoValor("dinero", valor);
      if (valor < 0) cell.getElement().style.color = "red";
      return text;
    }

     // eslint-disable-next-line no-unused-vars
     let _tablaRPTEconomico = new Tabulator(divRPTEconomico, {
      layout:"fitColumns", 
      index: "ano", 
      data: table,
      columns:[
        {title: "Año",  field: 'ano', hozAlign:"center", formatter: "_formatoValor"},
        {title: "Previo", field: 'previo', hozAlign:"right", formatter: formatoDinero}, 
        {title: "Inversión", field:"inversion", hozAlign:"right", formatter: formatoDinero},
        {title: "Ahorro", field: "ahorro", hozAlign:"right", formatter: formatoDinero},
        {title: "Descuento IBI", field:"IBI", hozAlign:"right", formatter: formatoDinero },
        {title: "Subvención EU", field:"subvencion", hozAlign:"right", formatter: formatoDinero},
        {title: "Pendiente", field:"pendiente", hozAlign:"right", formatter: formatoDinero}
      ]
    });
    _tablaRPTEconomico.on("tableBuilt", function(){
      Idioma.i18nTitulosTabla(_tablaRPTEconomico)});

    nuevaLinea('Dato', i++, 'VAN', UTIL.formatoValor('VAN', TCB.economico.VANProyecto)); //AA
    nuevaLinea('Dato', i++, 'TIR', UTIL.formatoValor('TIR', TCB.economico.TIRProyecto)); //AA

    let textNode = document.createElement("p");
    let att1 = document.createAttribute("style");
    att1.value = "text-align:center";
    textNode.setAttributeNode(att1);
    textNode.innerHTML = "<br><h5>" + TCB.i18next.t('economico_MSG_disclaimerAhorro');
    textNode.innerHTML += "<br><h5>" + TCB.i18next.t("informe_LBL_disclaimer1") + "<br>";
    textNode.innerHTML += TCB.i18next.t("informe_LBL_disclaimer2") + "</h5>";
    htdoc.appendChild(textNode);

    return true;
}



function nuevaLinea( tipo, linea, propiedad, valor) {

    let nLine = document.createElement("HR");
    let textNode;
    let divNode0, divNode1, divNode2;
    let att1;
    switch (tipo) {
      case "Cabecera":
        break;
      case "Titulo":
          textNode = document.createElement('p');
          textNode.classList.add("titulo");
          att1 = document.createAttribute("data-i18n");
          att1.value = valor;
          textNode.setAttributeNode(att1);
          textNode.innerHTML = TCB.i18next.t(valor);
          htdoc.appendChild(textNode);
          htdoc.appendChild(nLine);
          break;
      case "Normal":
          textNode = document.createElement("p");
          textNode.innerHTML = valor;
          att1 = document.createAttribute("style");
          att1.value = "text-align:center";
          textNode.setAttributeNode(att1);
          htdoc.appendChild(textNode);
          break;
      case "Dato":
          divNode0 = document.createElement("div");
          att1 = document.createAttribute("class");
          att1.value = "form-group row justify-content-center";
          divNode0.setAttributeNode(att1);
          htdoc.appendChild(divNode0);
          divNode1 = document.createElement("div");
          att1 = document.createAttribute("class");
          att1.value = "col-md-3 text-end";
          divNode1.setAttributeNode(att1);

          att1 = document.createAttribute("data-i18n");
          att1.value = propiedad;
          divNode1.setAttributeNode(att1);
          divNode1.innerText = TCB.i18next.t(propiedad);
          divNode0.appendChild(divNode1);

          if (Array.isArray(valor)) {
            for (let val=0; val < valor.length; val++) {
              divNode2 = document.createElement("div");
              att1 = document.createAttribute("class");
              att1.value = "col-md-1 text-end";
              divNode2.setAttributeNode(att1);
              divNode2.innerHTML = valor[val];
              divNode0.appendChild(divNode2);
            }
          } else {
            let divNode2 = document.createElement("div");
            att1 = document.createAttribute("class");
            att1.value = "col-md-2 text-end";
            divNode2.setAttributeNode(att1);
            divNode2.innerHTML = valor;
            divNode0.appendChild(divNode2);
          }
        break;
      case "Pie":
        break;
    }
  }

export {gestionReporte}