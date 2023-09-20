/**
 * @module  gestionEconomico
 * @fileoverview Módulo para la gestion del balance económico-financiero
 * @version      Solidar.3
 * @author       José Luis García (SOM Madrid)
 * @copyright
 * 
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
*/
import * as UTIL from "./Utiles.js";
import Economico from "./Economico.js";
import TCB from "./TCB.js";  
import { nuevoTotalPaneles } from "./optimizador.js";
import { calculaResultados } from "./calculaResultados.js";
import * as Idioma from "./Idioma.js";
/*global Tabulator, INDIVIDUAL */
const divEconomico = document.getElementById('economico');
var _tablaEconomico;

export default function gestionEconomico( accion, datos) {
  UTIL.debugLog("gestionPrecios: " + accion);
  switch (accion) {
  case "Inicializa":
      inicializaEventos();
      break;
  case "Valida":
      return valida();
  case "Prepara":
      prepara();
      break;
  case "Importa":
      importa(datos);
      break;
  case "Exporta":
      exporta();
      break;
  }
}

function inicializaEventos() {

    var formatoDinero = function(cell) {
      const valor = parseFloat(cell.getValue());
      const text = UTIL.formatoValor("dinero", valor);
      if (valor < 0) cell.getElement().style.color = "red";
      return text;
    }

    _tablaEconomico = new Tabulator(divEconomico, {
      columnDefaults: {headerTooltip: (e, col) => UTIL.hdrToolTip(e, col)},
      layout:"fitColumns", 
      index: "ano",
      columns:[
        {title: "Año",  field: 'ano', hozAlign:"center", formatter: "_formatoValor"},
        {title: "Previo", field: 'previo', hozAlign:"right", formatter: formatoDinero}, 
        {title: "Inversión", field:"inversion", hozAlign:"right", formatter: formatoDinero},
        {title: "Ahorro", field: "ahorro", hozAlign:"right", formatter: formatoDinero},
        {title: "Descuento IBI", field:"IBI", hozAlign:"right", formatter: formatoDinero },
        {title: "Subvención EU", field:"subvencion", hozAlign:"right", formatter: formatoDinero},
        {title: "Pendiente", field:"pendiente", hozAlign:"right", formatter: formatoDinero},
      ]
    });
    _tablaEconomico.on("tableBuilt", function(){
      Idioma.i18nTitulosTabla(_tablaEconomico)});

    if (TCB.modoActivo === INDIVIDUAL) {
      document.getElementById("coefHuchaGlobal").addEventListener("change", (e) => modificaCondicionHucha( e));
      document.getElementById("cuotaHuchaGlobal").addEventListener("change", (e) => modificaCondicionHucha( e));
    } else {
      document.getElementById("precioInstalacion").disabled = true;
      document.getElementById("gestionHucha").style.display = "none";
    }
    // ---> Eventos de la pestaña balance economico
    // Evento para gestionar la modificacion del precio de instalación
/*     let t = document.getElementById("precioInstalacion");
    let lng = TCB.i18next.language.substring(0,2) === 'es' ? 'ca' : TCB.i18next.language.substring(0,2);
    t.setAttribute("lng", lng);
    t.addEventListener("change", (e) => modificaPrecioInstalacion( e));
    t.addEventListener("focus", (e) => {
      e.target.type='number'; 
      e.target.value=UTIL.round2Decimales(TCB.produccion.precioInstalacion);
    })
    t.addEventListener("blur", (e) => {
      e.target.type='';
      e.target.value= UTIL.formatoValor('dinero', TCB.produccion.precioInstalacion);
    }) */


    //UTIL.preparaInput("precioInstalacion", modificaPrecioInstalacion, TCB.produccion.precioInstalacion);

    // Evento para cargar la subvención EU DOMid: "subvencionEU"
    // La subvención EU solo se puede aplicar cuando el autoconsumo es superior al 80%
    const tipoSubvencion = document.getElementById("tipoSubvencionEU");
    tipoSubvencion.addEventListener("change", function handleChange() {
      if (TCB.consumo.cTotalAnual / TCB.produccion.pTotalAnual * 100 < 80) {
        alert ("No es posible subvencion");
        tipoSubvencion.value = "Sin";
        return;
      }
      TCB.economico.calculoFinanciero(100, 100);
      muestraBalanceFinanciero();
    });
  
    // Evento para gestionar la subvención del IBI

    document.getElementById("valorSubvencionIBI").addEventListener("change", chkIBI);
    document.getElementById("porcientoSubvencionIBI").addEventListener("change", chkIBI);
    document.getElementById("tiempoSubvencionIBI").addEventListener("change", chkIBI);

} // Fin inicialización

async function prepara() {

  //UTIL.preparaInput("valorSubvencionIBI", chkIBI, TCB.valorSubvencionIBI);

  UTIL.preparaInput("precioInstalacion", modificaPrecioInstalacion, TCB.produccion.precioInstalacion);
  if (TCB.modoActivo === INDIVIDUAL) { //Si estamos en modo INDIVIDUAL no hay reparto por lo que se asigna todo a la Finca ficticia
      TCB.Participes[0].balance = TCB.balance;
      TCB.Participes[0].economico = new Economico(TCB.Participes[0]);
      TCB.economico = await TCB.Participes[0].economico;
      UTIL.preparaInput("coefHuchaGlobal", modificaCondicionHucha, TCB.Participes[0].coefHucha);
      UTIL.preparaInput("cuotaHuchaGlobal", modificaCondicionHucha, TCB.Participes[0].cuotaHucha);

  } else { //En modo COLECTIVO creamos el economico de cada finca y luego el global

    // El economico del consumo global
    TCB.economico = new Economico( );
  } 

  await muestraDatosEconomicos();
  await muestraBalanceFinanciero();
  await muestraGraficosEconomicos();
  return true;
}

function importa (datosImportar) {

  if (datosImportar.version === "3.0") {
    alert ("AVISO: Fichero importado de version 3.0 no incluye datos financieros\n Deben ser establecidos nuevamente");
  } else {

    TCB.tiempoSubvencionIBI = datosImportar.tiempoSubvencionIBI === "" ? 0 : datosImportar.tiempoSubvencionIBI;
    TCB.valorSubvencionIBI = datosImportar.valorSubvencionIBI === "" ? 0 : datosImportar.valorSubvencionIBI;
    TCB.porcientoSubvencionIBI = datosImportar.porcientoSubvencionIBI === "" ? 0 : datosImportar.porcientoSubvencionIBI;
    TCB.tipoSubvencionEU =  datosImportar.tipoSubvencionEU === "" ? "Sin" : datosImportar.tipoSubvencionEU;
    
    document.getElementById("valorSubvencionIBI").value = TCB.valorSubvencionIBI;
    document.getElementById("porcientoSubvencionIBI").value = TCB.porcientoSubvencionIBI * 100;
    document.getElementById("tiempoSubvencionIBI").value =  TCB.tiempoSubvencionIBI;
    document.getElementById("tipoSubvencionEU").value = TCB.tipoSubvencionEU;

    UTIL.muestra("precioInstalacion", TCB.produccion.precioInstalacion);

    if (TCB.modoActivo === INDIVIDUAL) {
      UTIL.muestra("coefHuchaGlobal", TCB.Participes[0].coefHucha);
      UTIL.muestra("cuotaHuchaGlobal", TCB.Participes[0].cuotaHucha);
    }
  }
}

function exporta () {

  TCB.datosProyecto.tiempoSubvencionIBI =   TCB.tiempoSubvencionIBI;
  TCB.datosProyecto.valorSubvencionIBI =  TCB.valorSubvencionIBI;
  TCB.datosProyecto.porcientoSubvencionIBI = TCB.porcientoSubvencionIBI;
  TCB.datosProyecto.valorSubvencionEU = TCB.valorSubvencionEU;
  TCB.datosProyecto.tipoSubvencionEU = TCB.tipoSubvencionEU;

}

function valida() {
    return true;
}

/** Modifica las condiciones de la bonificación del IBI
 * 
 * @param {Event} evento 
 * @returns 
 */
function chkIBI( evento) {

  //TCB.valorSubvencionIBI = parseFloat(document.getElementById("valorSubvencionIBI").getAttribute('dato-origen'));
  TCB.valorSubvencionIBI = document.getElementById("valorSubvencionIBI").value;
  console.log(TCB.valorSubvencionIBI);
  let porcientoSubvencionIBI = document.getElementById("porcientoSubvencionIBI").value;
  let tiempoSubvencionIBI = document.getElementById("tiempoSubvencionIBI").value;

  if (TCB.valorSubvencionIBI !== 0 && porcientoSubvencionIBI !== 0 && tiempoSubvencionIBI !== 0) {
      TCB.economico.calculoFinanciero(100, 100);
      muestraBalanceFinanciero();
  }
}

/** Modifica el precio de la instalación propuesto
 * 
 * @param {Event} evento 
 * @returns 
 */
async function modificaPrecioInstalacion(evento) {
  /* En los modos colectivo o comunidad el cambio del precio de la instalación afecta a todos los participes por lo que
  se debe hacer desde la pestaña de reparto */
  if (TCB.modoActivo !== INDIVIDUAL) {
    alert ("En modo COLECTIVO o COMUNIDAD el precio de la instalación se cambia en la pestaña de reparto");
    evento.target.value = UTIL.round2Decimales(TCB.produccion.precioInstalacion);
    return;
  }

  //Se actualizará el precio de las instalaciones de todas las bases de forma proporcional
  let correccionPrecioInstalacion = parseFloat(evento.target.value) / TCB.produccion.precioInstalacion;
  TCB.BaseSolar.forEach( (base) => {
    base.instalacion.precioInstalacion *= correccionPrecioInstalacion;
  });

  //Se actualiza el precio de la instalación total
  TCB.produccion.precioInstalacion = parseFloat(evento.target.value);
  UTIL.muestra('precioInstalacion', TCB.produccion.precioInstalacion);

  TCB.economico.calculoFinanciero(100, 100);
  await muestraBalanceFinanciero();
  await muestraGraficosEconomicos();
}

/** Procesa el cambio de la cuota o el coeficiente de la hucha
 * 
 * @param {Event} evento Disparado por el cambio de alguna de las variables de la hucha
 */
async function modificaCondicionHucha(evento) {
  let cuotaHucha;
  let coefHucha;
  if (evento.target.id === "coefHuchaGlobal") {
    coefHucha = parseFloat(evento.target.value);
    cuotaHucha = parseFloat(document.getElementById("cuotaHuchaGlobal").getAttribute('dato-origen'));
  } else if (evento.target.id === "cuotaHuchaGlobal") {
    cuotaHucha = parseFloat(evento.target.value);
    coefHucha = parseFloat(document.getElementById("coefHuchaGlobal").getAttribute('dato-origen'));
  }

  TCB.Participes[0].actualizaCondicionesHucha(coefHucha, cuotaHucha);
  TCB.economico = await TCB.Participes[0].economico;
  TCB.economico.calculoFinanciero(100, 100);
  muestraDatosEconomicos();
  muestraBalanceFinanciero();
  muestraGraficosEconomicos();
}

/** Muestra los datos en el formulario del módulo Economico
 * 
 */
async function muestraDatosEconomicos() {

  UTIL.muestra("gastoSinPlacasAnual", UTIL.formatoValor('dinero', TCB.economico.gastoSinPlacasAnual)); 
  UTIL.muestra("gastoConPlacasAnual", UTIL.formatoValor('dinero', TCB.economico.gastoConPlacasAnual)); 
  UTIL.muestra("ahorroAnual", UTIL.formatoValor('dinero', TCB.economico.ahorroAnual)); 
  UTIL.muestra("ahorroAnualPorciento", UTIL.formatoValor('porciento',((TCB.economico.gastoSinPlacasAnual - TCB.economico.gastoConPlacasAnual) / TCB.economico.gastoSinPlacasAnual * 100)));
  UTIL.muestra("noCompensadoAnual", UTIL.formatoValor('dinero', UTIL.suma(TCB.economico.perdidaMes))); 
  if (TCB.modoActivo === INDIVIDUAL) {
    UTIL.muestra("coefHuchaGlobal", UTIL.formatoValor('coefHuchaGlobal', TCB.Participes[0].coefHucha));
    UTIL.muestra("cuotaHuchaGlobal", UTIL.formatoValor('cuotaHuchaGlobal',TCB.Participes[0].cuotaHucha));
  } else {
    document.getElementById('bloqueGestionExcedentes').style.display = "none";
  }

  UTIL.muestra("precioInstalacion", UTIL.formatoValor('precioInstalacion',TCB.produccion.precioInstalacion));
  //UTIL.muestra("valorSubvencionIBI", UTIL.formatoValor('valorSubvencionIBI',TCB.valorSubvencionIBI));
  
/*   let t = document.getElementById("precioInstalacion");

  let lng = TCB.i18next.language.substring(0,2) === 'es' ? 'ca' : TCB.i18next.language.substring(0,2);
  t.setAttribute("lng", lng);
  t.setAttribute('type','');
  t.value= UTIL.formatoValor('dinero', TCB.produccion.precioInstalacion);
  //t.setAttribute('type','number');

  alert(UTIL.round2Decimales(TCB.produccion.precioInstalacion)); */

  //document.getElementById("precioInstalacion").setAttribute('value', TCB.produccion.precioInstalacion);

}

/** Muestra el gráfico de alternativas en el modo INDIVIDUAL y el gráfico comparativo de gasto mensual con y sin paneles
 * 
 */
async function muestraGraficosEconomicos() {
  if (TCB.modoActivo === INDIVIDUAL) {
    await graficoAlternativas();
    TCB.graficos.gestionEconomico_BalanceEconomico("graf_4", TCB.economico, TCB.Participes[0]);
  } else {
    TCB.graficos.gestionEconomico_BalanceEconomico("graf_4", TCB.economico);
  }
  return;
}
/**
 * Esta funcion produce el grafico de alternativas para lo que debe realizar todos los calculos para un numero 
 * determinado de alternativas que se definen dependiendo del numero maximo de paneles que soportan las bases definidas.
 * Solo es llamada en modo INDIVIDUAL
 */
async function graficoAlternativas() {

  var paneles = [];
  var autoconsumo = [];
  var TIR = [];
  var autosuficiencia = [];
  var precioInstalacion = [];
  var consvsprod = [];
  var ahorroAnual = [];

  // Calcula el numero maximo de paneles que soportan todas la bases
  let numeroMaximoPaneles = 0;
  let configuracionOriginal = [];

  //Se guarda la configuracion original de cada base en el array configuracionOriginal
  const tmpPrecio = TCB.produccion.precioInstalacion;
  for (let i=0; i<TCB.BaseSolar.length; i++) {
    numeroMaximoPaneles +=  Math.trunc(TCB.BaseSolar[i].potenciaMaxima / TCB.BaseSolar[i].instalacion.potenciaUnitaria);
    configuracionOriginal.push({base: i, paneles: TCB.BaseSolar[i].instalacion.paneles });
  }

  // El maximo numero de paneles a graficar es el doble de lo propuesto o el máximo numero de paneles
  let maximoPanelesEnX = numeroMaximoPaneles > (2 * TCB.totalPaneles) ? (2 * TCB.totalPaneles) : numeroMaximoPaneles;
  var intentos = [1, 0.25*maximoPanelesEnX, 0.5*maximoPanelesEnX,  0.75*maximoPanelesEnX, maximoPanelesEnX];
  intentos.sort((a, b) => a - b);

  // Bucle del calculo de resultados para cada alternativa propuesta
  intentos.forEach((intento) => {
    if (intento >= 1) {

      // Establecemos la configuracion de bases para este numero de paneles
      nuevoTotalPaneles (intento);

      // Se realizan todos los calculos
      calculaResultados();

      // El grafico de alternativas se genera solo para consumo individual
      TCB.Participes[0].balance = TCB.balance;
      TCB.Participes[0].economico = new Economico(TCB.Participes[0]);
      TCB.economico = TCB.Participes[0].economico;
      // Se extraen los valores de las variables que forman parte del grafico
      paneles.push(intento);
      autoconsumo.push((TCB.balance.autoconsumo / TCB.produccion.pTotalAnual) * 100);
      autosuficiencia.push((TCB.balance.autoconsumo / TCB.consumo.cTotalAnual) * 100);
      consvsprod.push((TCB.consumo.cTotalAnual/TCB.produccion.pTotalAnual) * 100);
      TIR.push(TCB.economico.TIRProyecto);
      precioInstalacion.push(TCB.produccion.precioInstalacion);
      ahorroAnual.push(TCB.economico.ahorroAnual);
    }
  });

  //Dejamos las cosas como estaban al principio antes del loop
  for (let i=0; i<configuracionOriginal.length; i++) {
    TCB.BaseSolar[configuracionOriginal[i].base].instalacion.paneles = configuracionOriginal[i].paneles;
  }

  await calculaResultados();
  TCB.produccion.precioInstalacion = tmpPrecio;

  // El grafico de alternativas se genera solo para consumo individual
  TCB.Participes[0].balance = TCB.balance;
  TCB.Participes[0].economico = new Economico(TCB.Participes[0]);
  TCB.economico = TCB.Participes[0].economico;

  //Buscamos punto en el que la produccion represente el 80% del consumo anual total para definir el limite subvencion EU
  let i = 0;
  let limiteSubvencion;
  while (consvsprod[i] > 80 && i < 5) {
    i++;
  }
  if (i < 5) {
    let pendiente = (consvsprod[i] - consvsprod[i-1]) / (paneles[i] - paneles[i-1]);
    let dif = 80 - consvsprod[i-1];
    limiteSubvencion = paneles[i-1] + dif / pendiente;
  } else {
    limiteSubvencion = undefined;
  }
  // Producimos el grafico
  TCB.graficos.gestionEconomico_PlotAlternativas(
    "graf_5",
    TCB.BaseSolar[0].instalacion.potenciaUnitaria,
    paneles,
    TIR,
    autoconsumo,
    autosuficiencia,
    precioInstalacion,
    ahorroAnual,
    limiteSubvencion
  );
}

/** Muestra la tabla de cashflow el VAN y el TIR
 * 
 */
async function muestraBalanceFinanciero() {

  _tablaEconomico.setData( TCB.economico.cashFlow);

  UTIL.muestra("VANProyecto", UTIL.formatoValor("dinero", TCB.economico.VANProyecto)); 
  UTIL.muestra("TIRProyecto", UTIL.formatoValor("porciento", TCB.economico.TIRProyecto)); 

}

export {gestionEconomico}