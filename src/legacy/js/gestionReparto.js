/**
 * @module  gestionReparto
 * @fileoverview Módulo para la asignación de los coeficientes de reparto
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
import Economico from "./Economico.js";
import TipoConsumo from "./TipoConsumo.js";
import Balance from "./Balance.js";
import Finca from "./Finca.js";
/*global Tabulator */
// Estas variables son para cuando tengamos mas de un consumo en la tablaConsumos

var primeraVez = true;
const divReparto = document.getElementById('reparto');
var _tablaReparto;

var infoIcon = function(){ return "<i class='fa fa-info-circle'></i>" };

var opcionesReparto = [
    {
      label:"Distribuir a residencial",
      action:function(e, column){
        const totalActual = _tablaReparto.getCalcResults().top[column.getField()];
        const diferencia = 100 - totalActual;
        if (Math.round(diferencia) === 0) {
          alert ("nada que repartir");
          return;
        }
        //const ponderacion = _tablaReparto.getCalcResults().top.participacion;
        let ponderacion = 0;
        for (let cell of column.getCells()) {
          let rowData = cell.getRow().getData();
          if (rowData.uso === 'Residencial') {
            ponderacion += rowData.participacion;
          }
        }

        for (let cell of column.getCells()) {
          let rowData = cell.getRow().getData();
          if (rowData.uso === 'Residencial') {
            let participacion = rowData.participacion / ponderacion;
            cell.setValue(cell.getValue() + diferencia * participacion);
          }
        }
        validaResultados();
      }
    },
    {
      label:"Distribuir a seleccionados",
      action:function(e, column){
        const totalActual = _tablaReparto.getCalcResults().top[column.getField()];
        const diferencia = 100 - totalActual;
        if (Math.round(diferencia) === 0) {
          alert ("nada que repartir");
          return;
        }
        //let ponderacion = _tablaReparto.getCalcResults().top.participacion;
        const campo = column.getField();
        var selectedData = _tablaReparto.getSelectedData();
        let ponderacion = 0;
        for (let rowData of selectedData) {
          ponderacion += rowData.participacion;
        }
        for (let rowData of selectedData) {
            let participacion = rowData.participacion / ponderacion;
            let actFinca = TCB.Participes.find( (finca) => {return finca.idFinca === rowData.idFinca});
            actFinca[campo] = rowData[campo] + diferencia * participacion;
        }
        validaResultados();
      }
    },
    {
      label:"Distribuir por participación",
      action: function (e, column) {
        const columna = column.getField()
        const ponderacion = _tablaReparto.getCalcResults().top.participacion;
        for (let finca of TCB.Participes) {
            finca[columna] = finca.participacion / ponderacion * 100;
            _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", finca.idFinca)]); 
        }
        validaResultados();
        return true;
      }
    },
    {
      label:"Copiar energía -> inversión",
      action: function () {
        for (let finca of TCB.Participes) {
          finca.coefInversion = finca.coefEnergia;
          _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", finca.idFinca)]); 
      }
      validaResultados();
      }
    },
    {
      label:"Copiar inversión -> energía",
      action: function () {
        for (let finca of TCB.Participes) {
          finca.coefEnergia = finca.coefInversion;
          _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", finca.idFinca)]); 
      }
      validaResultados();
      }
    }
  ];

var not100 = function (cell) {
  if (Math.round(cell.getValue()) !== 100) {
    return "<span style='color:red'>"+UTIL.formatoValor('porciento', cell.getValue())+"</span>";
  } else {
    return "<span style='color:black'>"+UTIL.formatoValor('porciento', cell.getValue())+"</span>";
  }
}
/** Es la función llamada desde el Wizard para la gestion de la ventana de consumos
 * 
 * @param {*} accion [Inicializa, Valida, Prepara, Importa]
 * @param {*} datos En el caso de importacion de datos los datos a importar
 * @returns {boolean} true si todo ha ido bien false si algo ha fallado
 */ 

async function gestionReparto( accion, datos) {
    UTIL.debugLog("gestionReparto: " + accion);
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
      case "Importa":
        status = importa();
        break;
      case "Exporta":
        status = exporta(datos);
        break;
    }
    return status;
  }
  
  var pendienteEnergia = function (valores) {
    let total = 0;
    for (let val of valores) {total += val}
    return TCB.produccion.pTotalAnual - total;
  };
  var pendienteInversion = function (valores) {
    let total = 0;
    for (let val of valores) {total += val}
    return TCB.produccion.precioInstalacionCorregido - total;
  };
    
  function inicializaEventos () {

    muestraTablas();

    document.getElementById("botonDescargaReparto").addEventListener("click", function(){
      _tablaReparto.download("csv", "reparto-"+TCB.nombreProyecto+".csv", {delimiter:";", bom:true});
    });

    document.getElementById("botonRepartoParticipacion").addEventListener("click", repartoParticipacion);

    document.getElementById("botonRepartoConsumo").addEventListener("click", repartoConsumo);

    document.getElementById("botonValidaResultados").addEventListener("click", () => {

      valida();
    });
    return true;
  }

  function muestraTablas() {
    var grafIcon = function(){ 
      return "<i class='fa fa-line-chart'></i>";
    };
    _tablaReparto = new Tabulator(divReparto, {
      columnDefaults: {headerTooltip: (e, col) => UTIL.hdrToolTip(e, col)},
      selectable:true,
     // height: 430,
      layout:"fitColumns",
      index: "idFinca", 
      columns:[
        {title:"Id", field:"idFinca"},
        {title:"Nombre", field:"nombreFinca"},
        {title:"Uso", field:"uso", hozAlign:"center", editor:"input"},
        {title:"Coef Propiedad", field:"participacion", hozAlign:"right", topCalc:"sum", formatter: "_formatoValor", topCalcFormatter:"_formatoValor"},
        {title:"Coef Consumo", field:"coefConsumo", hozAlign:"right", topCalc:"sum", topCalcFormatter:"_formatoValor", 
        formatter: "_formatoValor", mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales},
        {title:"Consumo", field:"cTotalAnual", hozAlign:"right", formatter: "_formatoValor"},

        {title:"Coef Energia", field:"coefEnergia", editor:"number", 
        editorParams:{min:0, max:100, selectContents:true, verticalNavigation:"table"},
        hozAlign:"right", topCalc:"sum", 
        formatter: "_formatoValor", topCalcFormatter: not100, 
        cellEdited: (cell) => cambioCoefEnergia(cell), headerMenu: opcionesReparto, mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales},
        {title:"Producción", field:"produccionTotal", hozAlign:"right", formatter: "_formatoValor", topCalc: pendienteEnergia, topCalcFormatter:"_formatoValor", accessorDownload:UTIL.round2Decimales},
        {title:"Coef Inversión", field:"coefInversion", editor: "number", 
        hozAlign:"right", topCalc:"sum", 
        formatter: "_formatoValor", topCalcFormatter: not100,
        cellEdited: (cell) => cambioCoefInversion(cell), headerMenu: opcionesReparto, mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales},
        {title:"Inversión", field:"precioInstalacionCorregido", hozAlign:"right", formatter: "_formatoValor", topCalc: pendienteInversion, topCalcFormatter:"_formatoValor", accessorDownload:UTIL.round2Decimales},

        {title:"Coef Hucha", field:"coefHucha", editor:"number", hozAlign:"right", formatter: "_formatoValor", cellEdited: (cell) => cambioCondicionHucha(cell), mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales},
        {title:"Cuota Hucha", field:"cuotaHucha", editor:"number", hozAlign:"right", formatter: "_formatoValor", cellEdited: (cell) => cambioCondicionHucha(cell), mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales},

        {title:"Ahorro", field:"ahorroFincaAnual", hozAlign:"right", formatter: "_formatoValor", topCalc:"sum", topCalcFormatter:"_formatoValor", accessorDownload:UTIL.round2Decimales},
        {formatter:grafIcon, width:40, hozAlign:"center", headerSort:false, cellClick: (evt, cell) => informeEconomico(cell)},
        {formatter:infoIcon, width:40, hozAlign:"center", headerSort:false, clickPopup: (evt, cell) => showEconomico(cell)},
      ]
    });
    _tablaReparto.on("tableBuilt", function(){
      Idioma.i18nTitulosTabla(_tablaReparto)});
  }

  function importa () {
    primeraVez = false;
    return true;
  }

  function exporta () {
      //TCB.datosProyecto.Reparto = TCB.Reparto;
  }

  async function prepara () {

    var col;
    col = _tablaReparto.getColumn("cTotalAnual");
    col.updateDefinition({title:"Consumo\n" + UTIL.formatoValor("cTotalAnual",TCB.consumo.cTotalAnual)});
    col = _tablaReparto.getColumn("produccionTotal");
    col.updateDefinition({title:"Energia\n" + UTIL.formatoValor("produccionTotal",TCB.produccion.pTotalAnual)});
    col = _tablaReparto.getColumn("precioInstalacionCorregido");
    col.updateDefinition({title:"Inversión\n" + UTIL.formatoValor("precioInstalacionCorregido",TCB.produccion.precioInstalacionCorregido)});

    document.getElementById("graf_ecoFinca").style.display = "none";

    muestraReparto( primeraVez );
    primeraVez = false;

    for (let finca of TCB.Participes) {
      _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", finca.idFinca)]); 
    }
  }
  /**
 * No puede haber sobrantes ni faltantes de energía ni de dinero
 * @returns false si alguno de los coeficientes variables no suman 100%
 */
  function valida () {
    var results = _tablaReparto.getCalcResults();
    if (Math.round(results.top.coefEnergia) !== 100) {
      alert ("El coeficiente de energia debe ser 100%");
      return false;
    }
    if (Math.round(results.top.coefInversion) !== 100) {
      alert ("El coeficiente de inversión debe ser 100%");
      return false;
    }
    validaResultados();
    return true;
  }

/**
 * Asigna coeficientes de consumo a cada Finca en base a su TipoConsumo. Puede poner el resto de coeficientes a cero.
 * @param {boolean} aCero Si true pone los coeficientes de energía e inversion a cero
 */
  function muestraReparto ( aCero) {
    for (let finca of TCB.Participes) {
      const objTipoConsumo = TipoConsumo.findxNombre(finca.nombreTipoConsumo);
      finca.coefConsumo = objTipoConsumo.cTotalAnual / TCB.consumo.cTotalAnual * 100;
      if (aCero) {
        finca.coefEnergia = 0;
        finca.coefInversion = 0;
      }
      document.getElementById("graf_ecoFinca").style.display = "none";
      _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", finca.idFinca)]); 
    }
  }

  /**
   * Realiza un reparto de los coeficientes de energia e inversión basado en el coeficiente de participación de la propiedad
   */
  function repartoParticipacion() {

    _tablaReparto.clearData();
    document.getElementById("graf_ecoFinca").style.display = "none";
    // Debemos hacer una pasada para saber cual es el total de participacion que esta en el proyecto
    var participacionTotal = 0;  
    for (let finca of TCB.Participes) {
        participacionTotal += finca.participacion;
    }

    //Haremos una primera asignación de coeficientes basandonos en el % que representa la participacion de cada finca en la participacion total de los que participan.
    for (let finca of TCB.Participes) {
      finca.coefInversion = finca.participacion / participacionTotal * 100;
      finca.coefEnergia = finca.participacion / participacionTotal * 100;
      validaResultados();
      _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", finca.idFinca)]);

    }
  }
/**
 * Asigna a los coeficientes de energia e inversion los mismos valores que el coeficiente de consumo
 */
  function repartoConsumo() {
    document.getElementById("graf_ecoFinca").style.display = "none";
    for (let finca of TCB.Participes) {
      finca.coefInversion = finca.coefConsumo;
      finca.coefEnergia = finca.coefConsumo;
      _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", finca.idFinca)]); 
    }
    validaResultados();
  }

  /**
   * Muestra los atributos de cada finca en el formulario de propiedades
   * @param {Tabulator.cell} cell Identifica la fila que contiene la Finca de la que se quieren ver las propiedades
   */
  function showEconomico(cell) {
    if (valida) {
      const _finca = TCB.Finca.find( (finca) => {return finca.idFinca === cell.getRow().getIndex()});
      UTIL.formularioAtributos (_finca );
    } else {
      alert("Solo cuando coefs 100%");
    }
  }

  /**
   * Procesa el cambio de un coeficiente de energia individual
   * @param {Tabulator.cell} cell Identifica la celda que ha sido modificada
   */
  function cambioCoefEnergia( cell) {
    document.getElementById("graf_ecoFinca").style.display = "none";
    const idFinca = cell.getRow().getIndex();
    let actFinca = TCB.Participes.find( (finca) => {return finca.idFinca === idFinca});
    actFinca.coefEnergia = cell.getValue();
    _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", actFinca.idFinca)]);
  }

    /**
   * Procesa el cambio de un coeficiente de inversión individual
   * @param {Tabulator.cell} cell Identifica la celda que ha sido modificada
   */
  function cambioCoefInversion( cell) {
    document.getElementById("graf_ecoFinca").style.display = "none";
    const idFinca = cell.getRow().getIndex();
    let actFinca = TCB.Participes.find( (finca) => {return finca.idFinca === idFinca});
    actFinca.coefInversion = cell.getValue();
    _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", actFinca.idFinca)]);
  }

  function cambioCondicionHucha ( cell) {
    const idFinca = cell.getRow().getIndex();
    let actFinca = TCB.Participes.find( (finca) => {return finca.idFinca === idFinca});
    let cuotaHucha = actFinca.cuotaHucha;
    let coefHucha = actFinca.coefHucha
    if (cell.getField() === "coefHucha") coefHucha = cell.getValue();
    if (cell.getField() === "cuotaHucha") cuotaHucha = cell.getValue();

    actFinca.actualizaCondicionesHucha(coefHucha, cuotaHucha);
    actFinca.economico.calculoFinanciero(actFinca.coefEnergia, actFinca.coefInversion);
    TCB.graficos.gestionEconomico_BalanceEconomico("graf_ecoFinca", actFinca.economico, actFinca);
    _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", actFinca.idFinca)]);
  }

/**
 * Crea Balance y Economico para cada Finca segun los coefs asigandos
 */
  function validaResultados() {

    for (let finca of TCB.Participes) {
      const tc = TipoConsumo.findxNombre(finca.nombreTipoConsumo);
      finca.balance = new Balance( TCB.produccion, tc, finca.coefEnergia);
      finca.economico = new Economico(finca);
      _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", finca.idFinca)]);
    }

  }

  function informeEconomico(cell) {
    if (valida()) { //Verificamos que ya se ha realizado algún reparto
      const selectedRows = _tablaReparto.getSelectedRows();
      for (let i=0; i<selectedRows.length; i++) {
        if ( selectedRows[i].getIndex() !== cell.getRow().getIndex()) {
          selectedRows[i].deselect();
        } else {
          const _finca = TCB.Finca.find( (finca) => {return finca.idFinca === cell.getRow().getIndex()});
          document.getElementById("graf_ecoFinca").style.display = "block";
          TCB.graficos.gestionEconomico_BalanceEconomico("graf_ecoFinca", _finca.economico, _finca);
        }
      }
    }
  }

  export {gestionReparto}