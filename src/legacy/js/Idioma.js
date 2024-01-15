/**
 * @module  Idioma
 * @fileoverview Módulo para la gestion de las traducciones
 * @version      Solidar.3
 * @author       José Luis García (SOM Madrid)
 * @copyright
 * 
 * History
 * v 01/04/2023 - Version inicial documentada para Solidar.3
*/
import * as UTIL from "./Utiles.js";
import TCB from "./TCB.js";
/*global Tabulator, i18nextBrowserLanguageDetector, i18nextHttpBackend, idioma*/
/**  Inicializacion proceso i18n
 * @async
 */
async function initIdioma() {

    UTIL.debugLog("_initEvents call i18next");
    TCB.i18next = window.i18next;
    TCB.i18next.use(i18nextBrowserLanguageDetector);
    TCB.i18next.use(i18nextHttpBackend);

    await TCB.i18next.init({
        debug: TCB.debug,
        fallbackLng: 'es',
        locales: ['es', 'ca', 'ga', 'en', 'eu'],
        backend: {loadPath: './locales/{{lng}}.json'}       
        }, (err) => { //,t)
            if (err) return console.error(err);
            traduce(TCB.i18next.language);
        });
    UTIL.debugLog("i18next cambiando idioma a " + idioma.value);

}

/** Función de traducción de todos los mensajes de la aplicación
 * 
 * @param {String} idioma 
 */
function traduce( idioma) {

    idioma = idioma.substring(0,2); //Ignoramos los casos en-US o es-ES
    TCB.i18next.changeLanguage(idioma, (err) => { //,t
        if (err) return console.log(err);

        //Loop para traducir todos los nodos que contengan el atributo data-i18n
        let t_i18n = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < t_i18n.length; i++) { 
            t_i18n[i].innerHTML = TCB.i18next.t(t_i18n[i].getAttribute("data-i18n")); 
        }

        // loop para traducir todos los tooltips usando el id del elemento seguido de _TT
        //const _toolTips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...TCB.tooltipTriggerList].forEach((element) => {
            element.title = TCB.i18next.t(element.id+"_TT");
        });

/*         console.log(_toolTips);
        for (const tt of _toolTips) {
            console.log(tt);
            const tooltip = bootstrap.Tooltip.getInstance(tt);
            tooltip.setContent({ '.tooltip-inner': i18next.t(tt.id+"_TT") })
        } */

        // loop para traducir todos los headers de las tablas Tabulator
        let t_tabs = document.querySelectorAll('.tTab');
        for (let tab of t_tabs) {
            const table = Tabulator.findTable(tab)[0];
            if (table !== undefined) {
                i18nTitulosTabla( table);
            }    
        }
   
        TCB.graficos.i18nextGraficos();
    })
}

function i18nextMes() {
    let _mes = [];
    for( let i=0; i<12; _mes.push(TCB.i18next.t(UTIL.nombreMes[i++])));
    return _mes;
}

/** Función para traducir los headers de las tablas Tabulator utilizando i18next
 * 
 * @param {Tabulator.Table} tabla 
 */
async function i18nTitulosTabla( tabla) {
    const cols = tabla.getColumns();
    for (const col of cols) {
      if (col.getField() !== undefined) {
          const prop = col.getField() + "_LBL";

          if (col.getField() !== "nombreTipoConsumo") col.updateDefinition({'title':TCB.i18next.t(prop)});
      }
    }

}

export {initIdioma, traduce, i18nTitulosTabla, i18nextMes}

