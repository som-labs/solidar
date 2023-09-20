    import TCB from "./TCB.js";
    import {gestionLocalizacion} from "./gestionLocalizacion.js";
    import {gestionResultados} from "./gestionResultados.js";
    import {gestionTipoConsumo} from "./gestionTipoConsumo.js";
    import {gestionFincas} from "./gestionFincas.js";
    import {gestionReparto} from "./gestionReparto.js";
    import {gestionEconomico} from "./gestionEconomico.js";
    import {gestionReporte} from "./gestionReporte.js";
    import {gestionGraficos } from "./gestionGraficos.js";
    import {gestionProyecto} from "./gestionProyecto.js";
    
    // ---> Eventos de control del wizard y la ayuda. El esquema de tabs a presentar depende del modo de trabajo
    var tabs;
    const esquemaPresentacion =  
    { 'COLECTIVO': [
            {"id":"localizacion-tab", "nombre":"main_TAB_localizacion", "interno":"localizacion", "gestor":"gestionLocalizacion", "siguiente":"tipoConsumo-tab"},
            {"id":"tipoConsumo-tab", "nombre":"main_TAB_tipoConsumo", "interno":"tipoConsumo", "gestor":"gestionTipoConsumo",      "siguiente":"fincas-tab"},
            {"id":"fincas-tab", "nombre":"main_TAB_fincas", "interno":"fincas", "gestor":"gestionFincas", 
            "siguiente":"resultados-tab"},
            {"id":"resultados-tab", "nombre":"main_TAB_resultados", "interno":"resultados", "gestor":"gestionResultados", "siguiente":"economico-tab"},
            {"id":"reparto-tab", "nombre":"main_TAB_reparto", "interno":"reparto", "gestor":"gestionReparto", 
            "siguiente":"economico-tab"},
            {"id":"economico-tab", "nombre":"main_TAB_economico", "interno":"economico", "gestor":"gestionEconomico", "siguiente":"graficos-tab"},
            {"id":"graficos-tab", "nombre":"main_TAB_graficos", "interno":"graficos", "gestor":"gestionGraficos",                "siguiente":"reporte-tab"},
            {"id":"reporte-tab", "nombre":"main_TAB_reporte", "interno":"reporte",  "gestor":"gestionReporte", 
            "siguiente":""}
          ],
      'INDIVIDUAL':[
          {"id":"localizacion-tab", "nombre":"main_TAB_localizacion", "interno":"localizacion", "gestor":"gestionLocalizacion", "siguiente":"tipoConsumo-tab"},
          {"id":"tipoConsumo-tab", "nombre":"main_TAB_tipoConsumo", "interno":"tipoConsumo", "gestor":"gestionTipoConsumo",      "siguiente":"resultados-tab"},
          {"id":"resultados-tab", "nombre":"main_TAB_resultados", "interno":"resultados", "gestor":"gestionResultados", "siguiente":"economico-tab"},
          {"id":"economico-tab", "nombre":"main_TAB_economico", "interno":"economico", "gestor":"gestionEconomico", "siguiente":"graficos_tab"},
          {"id":"graficos-tab", "nombre":"main_TAB_graficos", "interno":"graficos", "gestor":"gestionGraficos",                "siguiente":"reporte-tab"},
          {"id":"reporte-tab", "nombre":"main_TAB_reporte", "interno":"reporte",  "gestor":"gestionReporte", 
          "siguiente":""}
        ],
      'COMUNIDAD':[
        {"id":"localizacion-tab", "nombre":"main_TAB_localizacion", "interno":"localizacion", "gestor":"gestionLocalizacion", "siguiente":"tipoConsumo-tab"},
        {"id":"tipoConsumo-tab", "nombre":"main_TAB_tipoConsumo", "interno":"tipoConsumo", "gestor":"gestionTipoConsumo",      "siguiente":"fincas-tab"},
        {"id":"fincas-tab", "nombre":"main_TAB_fincas", "interno":"fincas", "gestor":"gestionFincas", 
        "siguiente":"resultados-tab"},
        {"id":"resultados-tab", "nombre":"main_TAB_resultados", "interno":"resultados", "gestor":"gestionResultados", "siguiente":"economico-tab"},
        {"id":"reparto-tab", "nombre":"main_TAB_reparto", "interno":"reparto", "gestor":"gestionReparto", 
        "siguiente":"economico-tab"},
        {"id":"economico-tab", "nombre":"main_TAB_economico", "interno":"economico", "gestor":"gestionEconomico", "siguiente":""},
        ]
      }

    async function inicializaWizard() {

      tabs = esquemaPresentacion[TCB.modoActivo];

        gestionProyecto('Inicializa');
        // Botones de siguiente y anterior
        document.getElementById("botonSiguiente").addEventListener("click", function handleChange() { eventoWizard('Siguiente')});
        document.getElementById("botonAnterior").addEventListener("click", function handleChange() { eventoWizard('Anterior')});
        tabs.forEach ((tab) => {
          document.getElementById("nav-"+tab.interno+"-tab").style.display = 'block';
          const funcionInicializacion = tab.gestor;
          eval (funcionInicializacion)( 'Inicializa');
        })
    // Se carga la pestaña inicial que es la de localización
      gestionLocalizacion('Prepara');
      muestraPestana('localizacion');
    }

    async function eventoWizard( hacia) {
        let status;
        let gestor;

      // ¿que panel esta activo y en que direccion nos queremos mover?
      //el orden lo da tabs
      const current = document.getElementsByClassName("tab-pane active")[0];
      let tabIndex = tabs.findIndex((tab) => { return (tab.id === current.id) });
      if (hacia === 'Siguiente') {
        if (tabs[tabIndex].siguiente !== "") {
            gestor = tabs[tabIndex].gestor;
            
            status = await eval (gestor)("Valida");
            if (status) { //Valida que se puede salir de esta pestaña
                tabIndex += 1;
                gestor = tabs[tabIndex].gestor;
                eval (gestor)("Prepara"); // Se ejecuta antes de mostrar la pestaña
                muestraPestana(tabs[tabIndex].interno);
            }
        }
      } else {
        tabIndex -= 1;
        if (tabIndex >= 0) muestraPestana(tabs[tabIndex].interno);
      }
    }
    
    async function muestraPestana ( nombre) {
        document.getElementById('offcanvasAyudaTitulo').innerHTML = TCB.i18next.t("ayuda_TIT_"+ nombre);
        //Esta es la version buena cuando esten todos los idiomas disponibles
        //const ficheroAyuda = "./locales/" + TCB.i18next.language.substring(0,2) + '-ayuda-' + nombre + '.htm'; 
        const ficheroAyuda = "./locales/" + 'es' + '-ayuda-' + nombre + '.htm';
        const text = await (await fetch(ficheroAyuda)).text();
        document.getElementById('texto').innerHTML = text;

        var current = document.getElementsByClassName("active");
        let activos = current.length;
        for (let i=0; i<activos; i++) {
          current[0].classList.remove("active");
        }

        var resultados = document.getElementById("nav-"+nombre+"-tab");
        resultados.classList.add("active");
        resultados.classList.add("show");
        var resultados_tab = document.getElementById(nombre+"-tab");
        resultados_tab.classList.add("active");
        resultados_tab.classList.add("show");
      }

      export {inicializaWizard}