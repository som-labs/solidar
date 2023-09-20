/**
 * @module  gestionProyecto
 * @fileoverview Módulo para la gestion de la información general de proyecto.
 *                No es parte del wizard
 * @version      Solidar.3
 * @author       José Luis García (SOM Madrid)
 * @copyright
 * 
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
*/
import TCB from "./TCB.js";
import * as UTIL from "./Utiles.js";
import { gestionLocalizacion } from "./gestionLocalizacion.js";
import { gestionResultados } from "./gestionResultados.js";
import { gestionEconomico } from "./gestionEconomico.js";
import * as GestionParametros from "./gestionParametros.js";
import { gestionTipoConsumo } from "./gestionTipoConsumo.js";
import { gestionReparto } from "./gestionReparto.js";
import { gestionFincas } from "./gestionFincas.js";
/*global INDIVIDUAL*/
/**
 * Es la función llamada desde InicializaAplicacion para cargar la informacion de proyecto y el boton de salvar
 * 
 */

async function inicializaEventos () {
  // Evento para registrar el nombre del proyecto activo en TCB
  let proyecto = document.getElementById("nombreProyecto");
  proyecto.addEventListener("change", async function handleChange(event) {
      TCB.nombreProyecto = event.target.value;
  });

  // Evento para importar un proyecto
  const importar = document.getElementById("importarProyecto");
  importar.addEventListener('click', async () => {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.solimp';
    input.onchange = () => {
      UTIL.debugLog("Importando datos desde: "+ input.files[0].name);
      importarProyecto (input.files[0]);
    };
    input.click();
  });

  // Evento para salvar el proyecto
  const botonExportar = document.getElementById("botonExportar");
  botonExportar.addEventListener("click", function handleChange(event) {
      exportarProyecto (event);
  });
}

async function gestionProyecto( accion) {
  UTIL.debugLog("gestionProyecto: " + accion);
  let status;
  switch (accion) {
    case "Inicializa":
      status = inicializaEventos();
      break;
    case "Valida":
      status = valida();
      break;
    case "Prepara":
      status = prepara();
      break;
  }
  return status;
}

function prepara() {
  return true;
}

function valida () {
  return true;
}

async function obtenerDatos (fichero) {
  var datos;
  let reader = new FileReader();
  return new Promise((resolve, reject) => {

    reader.onerror = (err) => {
      alert(TCB.i18next.t("precios_MSG_errorLecturaFicheroImportacion") + "\nReader.error: " + err);
      reject("...error de lectura");
    }

    reader.onload = (e) => {
      try {
        datos = JSON.parse(e.target.result);
        resolve(datos);
       } catch (err) {
        alert(TCB.i18next.t("precios_MSG_errorLecturaFicheroImportacion") + "\nParser.error: " + err);
        reject();
      }
    }
   
    reader.readAsText(fichero);
  });
}

/**
 * Proceso de importación de un proyecto solimp
 * @param {File} fichero Objeto File asociado al fichero solimp a importar
 * @returns {boolean} true si todo ha ido bien false si algo ha fallado
 */
async function importarProyecto(fichero) {

  //Si ya existe alguna base o punto de consumo pedimos confirmación de borrado
  if (TCB.BaseSolar.length > 0 || TCB.PuntoConsumo.length > 0) {
    if (!confirm(TCB.i18next.t("importarProyecto_MSG_confirmaReemplazo"))) return false;
  }

  //Limpiamos todas las estructuras
  TCB.PuntoConsumo = [];
  TCB.TipoConsumo = [];
  TCB.BaseSolar = [];
  TCB.Participes = [];
  TCB.Finca = [];

  // Variables de totalización
  TCB.consumo = {};    // Este campo contiene la suma de todos las consumos[]
  TCB.economico = {};   // Este campo contiene la suma de todos las consumos.economico[]
  TCB.produccion = {};  // Este campo contiene la suma de todos las bases.produccion[]
  TCB.balance = {};     // Este campo contiene el balance global de la instalación

  TCB.totalPaneles = 0;
  TCB.areaTotal = 0,

  TCB.importando = true;
  TCB.requiereOptimizador = false;

  let cursorOriginal = document.body.style.cursor;
  document.body.style.cursor = "wait" //"progress";
  document.getElementById('botonSiguiente').disabled = true;

  const datosImportar = await obtenerDatos(fichero);

  //Verificamos que hay compatibilidad de modos.
  if (datosImportar.modoActivo !== TCB.modoActivo) {
    alert ("El fichero de importacion es de modo " + datosImportar.modoActivo + " pero esta ejecutando en modo " + TCB.modoActivo + "\nLos modos deben coincidir");
    return;
  }

  // Aqui va la logica que verifica la compatibilidad de versiones de ficheros solimp

  if (datosImportar.version === undefined) {
    alert ("Lamentablemente no se puede importar un fichero Solimp de versiones anteriores a 3.1");
    return;
  }
  //Vamos a cambiar algunos campos por cambio de version
  if (datosImportar.version === "3.1") {

      datosImportar.produccion.pMaximoAnual = datosImportar.produccion.maximoAnual;
      delete datosImportar.produccion.maximoAnual;

      datosImportar.produccion.pTotalAnual = datosImportar.produccion.ptotalAnual;
      delete datosImportar.produccion.ptotalAnual;

      datosImportar.consumo.maximoAnual = datosImportar.consumo.cMaximoAnual;
      delete datosImportar.consumo.cMaximoAnual;

      datosImportar.consumo.totalAnual = datosImportar.consumo.ctotalAnual;
      delete datosImportar.consumo.ctotalAnual;

      datosImportar.TipoConsumo.forEach( (tipo) => {
        tipo.maximoAnual = tipo.tcMaximoAnual;
        delete tipo.tcMaximoAnual;

        tipo.totalAnual = tipo.ctotalAnual;
        delete tipo.ctotalAnual;

        tipo.datosCargados = tipo.csvCargado;
        delete tipo.csvCargado;
      })
  }
  
  // Se importan los parametros tal como estaban en el momento de exportar
  TCB.nombreProyecto = datosImportar.nombreProyecto;
  document.getElementById('nombreProyecto').value = TCB.nombreProyecto;
  GestionParametros.importa( datosImportar);

  // Se reinicializa el contador de feature ID
  TCB.featIdUnico = parseInt(datosImportar.featIdUnico);
  TCB.idFinca = parseInt(datosImportar.idFinca);
  const btnLabel = document.getElementById("importarProyecto");
  btnLabel.disabled = true;

  if (datosImportar.version !== "3.1") {
    TCB.conversionCO2 = datosImportar.conversionCO2;
    TCB.CO2AnualRenovable = datosImportar.CO2AnualRenovable;
    TCB.CO2AnualNoRenovable = datosImportar.CO2AnualNoRenovable;
  }

  btnLabel.innerText = TCB.i18next.t('importarProyecto_MSG_importando') + ' Bases ';
  await gestionLocalizacion( 'Importa', datosImportar);
  await gestionTipoConsumo( 'Importa', datosImportar);
  await gestionFincas( 'Importa', datosImportar);
  await gestionResultados( 'Importa', datosImportar);
  await gestionEconomico( 'Importa', datosImportar);
  gestionReparto( 'Importa');

  btnLabel.innerText = TCB.i18next.t('importarProyecto_LBL');
  btnLabel.disabled = false;
  document.getElementById('botonSiguiente').disabled = false;
  document.body.style.cursor = cursorOriginal;
  TCB.importando = false;
  alert (TCB.i18next.t("importarProyecto_MSG_success"));

}

function exportarProyecto () {

    if(Object.entries(TCB.balance).length === 0) {
      alert("Debe definir bases, consumos y balance antes de salvar el proyecto");
      return false;
    }

    TCB.datosProyecto.fechaExportacion = new Date();
    TCB.datosProyecto.nombreProyecto = TCB.nombreProyecto;
    TCB.datosProyecto.modoActivo = TCB.modoActivo;
    TCB.datosProyecto.parametros = TCB.parametros;
    //TCB.datosProyecto.precioInstalacion = TCB.precioInstalacion;
    TCB.datosProyecto.featIdUnico = TCB.featIdUnico;     // Generador de identificadores de objeto unicos
    TCB.datosProyecto.idFinca = TCB.idFinca;    
    TCB.datosProyecto.totalPaneles = TCB.totalPaneles;
    TCB.datosProyecto.areaTotal = TCB.areaTotal;
    TCB.datosProyecto.conversionCO2 = TCB.conversionCO2;
    TCB.datosProyecto.CO2AnualRenovable = TCB.CO2AnualRenovable;
    TCB.datosProyecto.CO2AnualNoRenovable = TCB.CO2AnualNoRenovable;

    gestionLocalizacion('Exporta');
    gestionTipoConsumo('Exporta');
    gestionResultados('Exporta'); 
    gestionFincas('Exporta');
    if (TCB.modoActivo !== INDIVIDUAL) gestionReparto('Exporta');
    gestionEconomico('Exporta'); 
    export2txt (TCB.datosProyecto);
}

function export2txt(originalData) {
 
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(originalData, null, 2)], {
    type: "text/plain"
  }));
  const date = new Date();
  let fName = TCB.nombreProyecto + "(" + date.getFullYear();
  fName += (date.getMonth()+1).toLocaleString(TCB.i18next.language, {minimumIntegerDigits: 2, useGrouping: false});
  fName +=  date.getDate().toLocaleString(TCB.i18next.language, {minimumIntegerDigits: 2, useGrouping: false});
  fName +=  "-"+ date.getHours().toLocaleString(TCB.i18next.language, {minimumIntegerDigits: 2, useGrouping: false});
  fName +=  date.getMinutes().toLocaleString(TCB.i18next.language, {minimumIntegerDigits: 2, useGrouping: false});
  fName += ").solimp"
  a.setAttribute("download", fName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a); 
}

export {gestionProyecto}