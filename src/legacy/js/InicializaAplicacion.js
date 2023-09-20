import TCB from "./TCB.js";
import * as UTIL from "./Utiles.js";
import Graficos from "./Graficos.js";
import { initIdioma, traduce} from "./Idioma.js";
import { gestionParametros } from "./gestionParametros.js";
import { inicializaWizard} from "./Wizard.js";
/*global bootstrap, Tabulator, COLECTIVO */

export default async function inicializaEventos() {

//Si recibimos argumento debug en la url ejecutamos con debug
  TCB.debug = UTIL.getParametrosEntrada('debug');
  UTIL.debugLog("_initEvents Debug activo: " + TCB.debug);

//Identificación de la sesión con objeto Date.now() de javascript.
  TCB.idSesion = Date.now();

//Definimos el modo de trabajo
  let _modo = UTIL.getParametrosEntrada('modo');
  if (_modo) {
    _modo = _modo.toUpperCase();
    if (TCB.modos.includes(_modo)) TCB.modoActivo = _modo;
  }
  UTIL.debugLog("_initEvents modo de trabajo: " + TCB.modoActivo);

//Definimos el titulo segun sea el modo
  const _menu = document.getElementById('menu_screen');
  _menu.setAttribute('data-i18n','main_LBL_titulo_'+TCB.modoActivo);
  _menu.classList.add('h2');


// Funcion para verificar que no se introducen valores negativos en los campos que tienen la clase .
// La validacion de html5 solo valida a nivel de submit del formulario pero no en cada campo
  var elems = document.getElementsByTagName("input");
  for(let i=0; i<elems.length; i++) {
      if (elems[i].type === 'number' && elems[i].min === '0') {
          elems[i].addEventListener("input", (e) => {
            e.target.checkValidity() ||(e.target.value='');
          })
      }
  }

  // Define la url base de la aplicación
  let fullPath = window.location.href;
  let ipos = fullPath.lastIndexOf("/");
  TCB.basePath = fullPath.slice(0, ipos + 1);
  UTIL.debugLog("_initEvents ejecutando desde " + TCB.basePath);

  // lectura del fichero de precios de instalación del servidor. Si falla se usan las de la TCB
  const ficheroPreciosInstalacion = "./datos/precios instalacion.json";
  UTIL.debugLog("Precios instalación leidos desde servidor:" + ficheroPreciosInstalacion);
  try {
    const precios = await fetch(ficheroPreciosInstalacion);
    if (precios.status === 200) {
      TCB.precioInstalacion = await precios.json();
    }
  } catch (err) {
    UTIL.debugLog("Error leyendo precios de instalación del servidor " + err.message + "<br>Seguimos con TCB");
  }

  // lectura del fichero de tarifas del servidor. Si falla se usan las de la TCB
  const ficheroTarifa = "./datos/tarifas.json";
  UTIL.debugLog("Tarifas leidas desde servidor:" + ficheroTarifa);
  try {
    const respuesta = await fetch(ficheroTarifa);
    if (respuesta.status === 200) {
      TCB.tarifas = await respuesta.json();
    }
  } catch (err) {
    UTIL.debugLog("Error leyendo tarifas del servidor " + err.message + "<br>Seguimos con TCB");
  }

  // Boton muestra/oculta ayuda
  document.getElementById("botonAyuda").addEventListener("click", function handleChange() { 
    var resultados = document.getElementById("panelDerecho");
    if (resultados.classList.contains( 'collapse' )) {
        resultados.classList.remove("collapse");
        resultados.classList.add("collapse.show");
    } else {
        resultados.classList.add("collapse");
    }
  });

  // Se incializan los tooltips
  TCB.tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  for (let tt of TCB.tooltipTriggerList) new bootstrap.Tooltip(tt);

  //Inicializacion proceso i18n
  await initIdioma();
  document.getElementById("idioma").value = TCB.i18next.language.substring(0,2);
  // Evento de cambio de idioma DOM.id: "idioma"
  const idioma = document.getElementById("idioma");
  idioma.addEventListener("change", function handleChange(event) {
      traduce(event.target.value);
  });
  
  //Inicializacion graficos Plotly
  TCB.graficos = new Graficos();

  // Evento del boton de instrucciones
  document.getElementById('botonInstrucciones').addEventListener("click", async function handleChange() {
    let tlng = TCB.i18next.language;
    if (TCB.modoActivo === COLECTIVO) {
      if (tlng !== 'es') {
        alert("Lo sentimos, las instrucciones aun no estan traducidas. Las mostraremos en castellano");
        tlng = 'es';
      }
      window.open('./locales/instrucciones/InstruccionesColectivo_'+tlng+'.html', '_blank');
    } else {
      if (tlng !== "es" && tlng !== "ca") {  //aun no traducido
        alert("Lo sentimos, las instrucciones aun no estan traducidas. Las mostraremos en castellano");
        tlng = 'es';
      }
      window.open('./locales/instrucciones/Instrucciones_'+tlng+'.html', '_blank');
    }
  });

  // Texto de bienvenida
  async function bienvenida() {
    let ficheroBienvenida;
    if (TCB.i18next.language !== "ca") //Por ahora el fichero de bienvenida solo tiene traducción al catalán el resto lo verá en castellano
      ficheroBienvenida = "./locales/" + 'es' + '-bienvenida.htm';
    else
      ficheroBienvenida = "./locales/" + 'ca' + '-bienvenida.htm';
    const text = await (await fetch(ficheroBienvenida)).text();
    const formBienvenida = document.getElementById("formularioBienvenida");
    document.getElementById('textoBienvenida').innerHTML = text;
    formBienvenida.style.display = "block";
    formBienvenida.classList.add("show");
    document.getElementById('cerrarBienvenida').addEventListener("click", async function handleChange() {
      localStorage.noMostrarMas = document.getElementById('noMostrarMas').checked;
      formBienvenida.style.display = "none";
      formBienvenida.classList.remove("show");
    });
  }

  // Formulario de bienvenida
  //localStorage.clear();
  const noMostrarMas = localStorage.getItem('noMostrarMas');
  if (noMostrarMas === 'false' || noMostrarMas === null) {
    bienvenida();
  }

  // Inicializa formulario de parametros
  UTIL.debugLog("_initEvents call gestionParametros");
  gestionParametros();

  //Funcion para limpiar el campo descripcion del formulario de contacto cada vez que se muestra el mismo. El resto de campos se mantienen.
  document.getElementById('formularioContacto').addEventListener('show.bs.modal', function () {
    document.getElementById('mensaje').value="";
  })

  // Define el formatter _formatoValor para usar en todos los campos de las tablas Tabulator
  Tabulator.extendModule("format", "formatters", {
    _formatoValor: function(cell, formatterParams) {
        let campo;
        if (formatterParams.campo === undefined) 
          campo = cell.getField();
        else
          campo = formatterParams.campo;
        return UTIL.formatoValor(campo, cell.getValue());
    }
  });

  await inicializaWizard();

  return true;
}
// Asignación de la función _Dispatch al objeto global window.
window.inicializaEventos = inicializaEventos;