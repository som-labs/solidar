import TCB from './TCB'
import * as UTIL from './Utiles'

async function InicializaAplicacion() {
  //Si recibimos argumento debug en la url ejecutamos con debug
  TCB.debug = UTIL.getParametrosEntrada('debug')
  UTIL.debugLog('_initEvents Debug activo: ' + TCB.debug)

  //Identificación de la sesión con objeto Date.now() de javascript.
  TCB.idSesion = Date.now()

  //Definimos el modo de trabajo
  let _modo = UTIL.getParametrosEntrada('modo')
  if (_modo) {
    _modo = _modo.toUpperCase()
    if (TCB.modos.includes(_modo)) TCB.modoActivo = _modo
  }
  UTIL.debugLog('_initEvents modo de trabajo: ' + TCB.modoActivo)

  // Define la url base de la aplicación
  if (TCB.modoActivo === 'DESARROLLO') {
    TCB.basePath = 'http://localhost/SOM/REACT/solidar/'
  } else {
    let fullPath = window.location.href
    let ipos = fullPath.lastIndexOf('/')
    TCB.basePath = fullPath.slice(0, ipos + 1)
  }
  UTIL.debugLog('_initEvents ejecutando desde ' + TCB.basePath)

  // lectura del fichero de precios de instalación del servidor. Si falla se usan las de la TCB
  const ficheroPreciosInstalacion = './datos/precios instalacion.json'
  UTIL.debugLog('Precios instalación leidos desde servidor:' + ficheroPreciosInstalacion)
  try {
    const precios = await fetch(ficheroPreciosInstalacion)
    if (precios.status === 200) {
      TCB.precioInstalacion = await precios.json()
    }
  } catch (err) {
    UTIL.debugLog(
      'Error leyendo precios de instalación del servidor ' +
        err.message +
        '<br>Seguimos con TCB',
    )
  }

  // lectura del fichero de tipos de paneles.
  const ficheroTipoPaneles = './datos/tipoPaneles.json'
  UTIL.debugLog('Tipos de paneles leidos desde servidor:' + ficheroTipoPaneles)
  let tipoPaneles
  try {
    const paneles = await fetch(ficheroTipoPaneles)
    if (paneles.status === 200) {
      TCB.tipoPaneles = await paneles.json()
      //First entry used as default
      TCB.tipoPanelActivo = TCB.tipoPaneles[0]
    }
  } catch (err) {
    UTIL.debugLog(
      'Error leyendo tipos de paneles del servidor ' +
        err.message +
        '<br>Seguimos con TCB',
    )
  }

  // lectura del fichero de tarifas del servidor. Si falla se usan las de la TCB
  //if (!UTIL.cargaTarifasDesdeSOM() ) { //Dejamos esta llamada hasta que el tiempo de respuesta de SOM sea aceptable
  const ficheroTarifa = './datos/tarifas.json'

  try {
    const respuesta = await fetch(ficheroTarifa)
    if (respuesta.status === 200) {
      UTIL.debugLog('Tarifas leidas desde servidor:' + ficheroTarifa)
      TCB.tarifas = await respuesta.json()
    }
  } catch (err) {
    UTIL.debugLog(
      'Error leyendo tarifas del servidor ' + err.message + '<br>Seguimos con TCB',
    )
  }
  TCB.tarifaActiva = TCB.tarifas[TCB.nombreTarifaActiva]

  // // Evento del boton de instrucciones
  // document.getElementById('botonInstrucciones').addEventListener("click", async function handleChange() {
  //   let tlng = TCB.i18next.language;
  //   if (TCB.modoActivo === COLECTIVO) {
  //     if (tlng !== 'es') {
  //       alert("Lo sentimos, las instrucciones aun no estan traducidas. Las mostraremos en castellano");
  //       tlng = 'es';
  //     }
  //     window.open('./locales/instrucciones/InstruccionesColectivo_'+tlng+'.html', '_blank');
  //   } else {
  //     if (tlng !== "es" && tlng !== "ca") {  //aun no traducido
  //       alert("Lo sentimos, las instrucciones aun no estan traducidas. Las mostraremos en castellano");
  //       tlng = 'es';
  //     }
  //     window.open('./locales/instrucciones/Instrucciones_'+tlng+'.html', '_blank');
  //   }
  // });

  // // Texto de bienvenida
  // async function bienvenida() {
  //   let ficheroBienvenida;
  //   if (TCB.i18next.language !== "ca") //Por ahora el fichero de bienvenida solo tiene traducción al catalán el resto lo verá en castellano
  //     ficheroBienvenida = "./locales/" + 'es' + '-bienvenida.htm';
  //   else
  //     ficheroBienvenida = "./locales/" + 'ca' + '-bienvenida.htm';
  //   const text = await (await fetch(ficheroBienvenida)).text();
  //   const formBienvenida = document.getElementById("formularioBienvenida");
  //   document.getElementById('textoBienvenida').innerHTML = text;
  //   formBienvenida.style.display = "block";
  //   formBienvenida.classList.add("show");
  //   document.getElementById('cerrarBienvenida').addEventListener("click", async function handleChange() {
  //     localStorage.noMostrarMas = document.getElementById('noMostrarMas').checked;
  //     formBienvenida.style.display = "none";
  //     formBienvenida.classList.remove("show");
  //   });
  // }

  // // Formulario de bienvenida
  // //localStorage.clear();
  // const noMostrarMas = localStorage.getItem('noMostrarMas');
  // if (noMostrarMas === 'false' || noMostrarMas === null) {
  //   bienvenida();
  // }

  return true
}

export default InicializaAplicacion
