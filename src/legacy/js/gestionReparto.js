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
/*global Tabulator, COMUNIDAD, COLECTIVO */
// Estas variables son para cuando tengamos mas de un consumo en la tablaConsumos

const divReparto = document.getElementById('reparto');
var _tablaReparto;
var sumaCoefEnergia;
var sumaCoefInversion;
var coefPaticipacionTotal;
var coefParticipacionConsumo;
var energiaPreAsignada;
var preAsignados = 0;

var infoIcon = function(){ return "<i class='fa fa-info-circle'></i>" };

var distribuirCosteZonaComun = [
  {
      label:"Distribuir coste a seleccionados",
      action:function(e, cell){
        const campoDestino = cell.getRow().getData().nombreFinca;
      
        var selectedData = _tablaReparto.getSelectedData();
        let ponderacion = 0;
        for (let rowData of selectedData) {
          ponderacion += rowData.participacion;
        }
        for (let rowData of selectedData) {
          if (rowData.grupo !== 'Zonas Comunes') { //No se puede asignar coste de una zona comun a otra
            let participacion = rowData.participacion / ponderacion;
            let actFinca = UTIL.selectTCB('Participes', 'idFinca', rowData.idFinca)[0];//TCB.Participes.find( (finca) => {return finca.idFinca === rowData.idFinca});
            actFinca[campoDestino] = parseFloat(cell.getValue()) * participacion;
          }
        }
        validaResultados();
      }
  },
];

var seleccionaTodoVisible = [
  {
      label:"Seleccionar todo visible",
      action:function(e, cell){
        cell.getTable().selectRow(cell.getTable().getRows("active"));
      }
  },
];

var opcionesReparto = [
    {
      label:"Distribuir a residencial",
      action:function(e, column){
        let totalActual = 0;
        if (column.getField() === 'coefEnergia') totalActual = sumaCoefEnergia;
        if (column.getField() === 'coefInversion') totalActual = sumaCoefInversion;
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
        let totalActual = 0;
        if (column.getField() === 'coefEnergia') totalActual = sumaCoefEnergia;
        if (column.getField() === 'coefInversion') totalActual = sumaCoefInversion;
        const diferencia = 100 - totalActual;
        if (Math.round(diferencia) === 0) {
          alert ("nada que repartir");
          return;
        }

        const campo = column.getField();
        var selectedData = _tablaReparto.getSelectedData();
        let ponderacion = 0;
        for (let rowData of selectedData) {
          if (rowData.grupo !== 'Participe sin consumo') ponderacion += rowData.participacion;
        }
        for (let rowData of selectedData) {
          if (rowData.grupo !== 'Participe sin consumo')  {
            let participacion = rowData.participacion / ponderacion;
            let actFinca = UTIL.selectTCB('Participes', 'idFinca', rowData.idFinca)[0]; //TCB.Participes.find( (finca) => {return finca.idFinca === rowData.idFinca});
            actFinca[campo] = rowData[campo] + diferencia * participacion;
          }
        }
        validaResultados();
      }
    },
    {
      label:"Distribuir por participación",
      action: function (e, column) {
        const columna = column.getField();
        console.log(coefPaticipacionTotal);
        for (let finca of TCB.Participes) {
            finca[columna] = finca.participacion / coefPaticipacionTotal * 100;
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
const _epsilon = 0.1;

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
    
  async function inicializaEventos () {

    await muestraTablas();

    document.getElementById("botonDescargaReparto").addEventListener("click", function(){
      _tablaReparto.download("csv", "reparto-"+TCB.nombreProyecto+".csv", {delimiter:";", bom:true});
    });

    document.getElementById("botonRepartoParticipacion").addEventListener("click", repartoParticipacion);

    document.getElementById("botonRepartoConsumo").addEventListener("click", repartoConsumo);

    document.getElementById("botonRepartoParitario").addEventListener("click", repartoParitario);

    document.getElementById("nuevoPrecioInstalacion").addEventListener("change", (e) => cambiaPrecioInstalacion( e));

    if (TCB.modoActivo === COMUNIDAD) {
      document.getElementById("botonRepartoParticipacion").style.display = "none";
      document.getElementById("checkParticipacion").style.display = "none";
    }

    return true;
  }

  async function muestraTablas() {
    var grafIcon = function(){ 
      return "<i class='fa fa-line-chart'></i>";
    };

    TCB._tablaReparto = TCB._tablaReparto ?? new Tabulator( divReparto, {
      columnDefaults: {headerTooltip: (e, col) => UTIL.hdrToolTip(e, col)},
      selectable:true,
      selectableRangeMode:"click",
      //groupBy:"idPuntoConsumo",
      groupHeader:
        function(value, count){ //genera cabecera de los grupos. Muestra direccion del punto de consumo
            const pconsumo = UTIL.selectTCB('PuntoConsumo', 'idPuntoConsumo', value)[0];//TCB.PuntoConsumo.find( (pc) => {return pc.idPuntoConsumo === value});
            return pconsumo.direccion + "<span style='color:#d00; margin-left:10px;'>(" + count + " fincas)</span>";
        },
     // height: 430,
      //layout:"fitColumns",
      //responsiveLayout:"collapse",
      maxHeight:"100%",
      layout:"fitData", 
      resizable:"header",
      index: "idFinca", 
      layoutColumnsOnNewData:true,
      //frozenRows:1,
      columns:[
        {title:"Id", field:"idFinca", visible:false},
/*         {title:"Nombre", field:"nombreFinca", frozen: true, headerFilter:"input"}, */
        {title:"Nombre", field:"nombreFinca", headerFilter:"input", contextMenu:seleccionaTodoVisible},  
        {title:"Grupo", field:"grupo", hozAlign:"center", editor:"list",editorParams:Finca.getGrupos, 
        titleDownload:"grupo",headerFilter:"input"},
        {title:"Coef Propiedad", field:"participacion", hozAlign:"right", formatter: "_formatoValor"},
        {title:"Coef Consumo", field:"coefConsumo", hozAlign:"right",  headerWordWrap:true,
        formatter: "_formatoValor", mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales},
        {title:"Consumo", field:"cTotalAnual", hozAlign:"right", formatter: "_formatoValor", accessorDownload:UTIL.round2Decimales, topCalc:"sum", topCalcFormatter:"_formatoValor"},
        {title:"Coef Energia", field:"coefEnergia", editor:"number", topCalc: 'sum', topCalcFormatter: "_formatoValor",
        editorParams:{min:0, max:100, selectContents:true, verticalNavigation:"table"},
        hozAlign:"right", formatter: "_formatoValor", cellEdited: (cell) => cambioCoefEnergia(cell), headerMenu: opcionesReparto, mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales},
        {title:"Producción", field:"produccionTotal", hozAlign:"right", formatter: "_formatoValor", accessorDownload:UTIL.round2Decimales, topCalc:"sum", topCalcFormatter:"_formatoValor"},
        {title:"Coste", field:"coste", hozAlign:"right", formatter: "_formatoValor", accessorDownload:UTIL.round2Decimales, contextMenu:distribuirCosteZonaComun},
        {title:"Coef Inversión", field:"coefInversion", editor: "number", topCalc: 'sum', topCalcFormatter: "_formatoValor",
        hozAlign:"right", formatter: "_formatoValor", cellEdited: (cell) => cambioCoefInversion(cell), headerMenu: opcionesReparto, mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales},
        {title:"Inversión propia", field:"precioInstalacion", hozAlign:"right", formatter: "_formatoValor", accessorDownload:UTIL.round2Decimales, topCalc: "sum", topCalcFormatter: "_formatoValor"},
        
        /* Dado el tamaño de la tabla por ahora removemos las columnas de la hucha */
/*         {title:"Coef Hucha", field:"coefHucha", editor:"number", hozAlign:"right", formatter: "_formatoValor", cellEdited: (cell) => cambioCondicionHucha(cell), mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales},
        {title:"Cuota Hucha", field:"cuotaHucha", editor:"number", hozAlign:"right", formatter: "_formatoValor", cellEdited: (cell) => cambioCondicionHucha(cell), mutator:UTIL.round2Decimales, accessorDownload:UTIL.round2Decimales}, */

        {title:"Ahorro", field:"ahorroFincaAnual", hozAlign:"right", formatter: "_formatoValor", 
        topCalc: "sum", topCalcFormatter: "_formatoValor", accessorDownload:UTIL.round2Decimales},

        {titleFormatter:grafIcon, formatter:grafIcon, width:40, hozAlign:"center", headerSort:false, cellClick: (evt, cell) => informeEconomico(cell)},
        {titleFormatter:infoIcon, formatter:infoIcon, width:40, hozAlign:"center", headerSort:false, clickPopup: (evt, cell) => showEconomico(cell)},
      ]
    });
    TCB._tablaReparto.on("tableBuilt", function(){
      Idioma.i18nTitulosTabla(_tablaReparto);
    });
    _tablaReparto = TCB._tablaReparto;
  }

  function importa () {
    //primeraVez = false;
    return true;
  }

  function exporta () {
      //TCB.datosProyecto.Reparto = TCB.Reparto;
  }

  async function prepara () {

    //Limpiamos el area de gráficos económico
    document.getElementById("graf_ecoFinca").style.display = "none";

    //Calculamos los coeficientes de participacion, de consumo y la produccion preasignada en el módulo de resultados
    coefPaticipacionTotal = 0;
    coefParticipacionConsumo = 0;
    energiaPreAsignada = 0;  //es el coeficiente de energia preasignado en la fase de resultados
    preAsignados = 0; //es el número de zonas comunes preasignadas

    UTIL.preparaInput("nuevoPrecioInstalacion", cambiaPrecioInstalacion, TCB.produccion.precioInstalacion);
    UTIL.muestra("nuevoPrecioInstalacion", UTIL.formatoValor('nuevoPrecioInstalacion',TCB.produccion.precioInstalacion));

    for (let finca of TCB.Participes) {
      coefPaticipacionTotal += finca.participacion;
      /* El coef de consumo es el % del consumo de cada unidad sobre el total. 
      Solo se calcula para quienes tienen tipo de consumo asignado.
      Se calcula tambien total de la participación de los participes en coefParticipacionConsumo */
      if (finca.nombreTipoConsumo !== undefined && finca.nombreTipoConsumo !== 'Participe sin consumo') {
        const _tc = UTIL.selectTCB('TipoConsumo','nombreTipoConsumo',finca.nombreTipoConsumo)[0];  
        finca.coefConsumo = _tc.cTotalAnual / TCB.consumo.cTotalAnual * 100;
        coefParticipacionConsumo += finca.participacion;
      } else {
        finca.coefConsumo = 0;
      }

      if (finca.grupo === 'Zonas Comunes') {
        /* Hay que crear una propiedad en Finca que recibirá el coste que cada Finca aporta para cubrir el coste de esta Zona Comun
        Tambien hay que crear una columna en la tabla para reflejarlo. */
        let _colZC = _tablaReparto.getColumn(finca.nombreFinca);
        if (!_colZC) {
          Finca.prototype[finca.nombreFinca] = 0;
          await _tablaReparto.addColumn({title:finca.nombreFinca, field:finca.nombreFinca, formatter: (cell) => formatoNuevaColumna(cell), hozAlign:'right', topCalc: "sum", topCalcFormatter: (cell) => UTIL.n_formatoValor( cell, 'dinero'), minWidth: 20, accessorDownload:UTIL.round2Decimales}, true, "ahorroFincaAnual");
        }
        energiaPreAsignada += finca.coefEnergia;
        preAsignados++;
      }
    }
    
    document.getElementById("checkParticipacion").innerText = TCB.i18next.t("botonCheckParticipacion_LBL", {participacion: coefPaticipacionTotal.toFixed(2)});

    //La participacion que nos da DGC no es significativa en el modo COMUNIDAD
    if (TCB.modoActivo === COMUNIDAD) _tablaReparto.hideColumn("participacion");

/*  La primera vez hacemos una asignación de la energia remanente entre los participes que consumen y no son Zona Comun.
    En modo COMUNIDAD se hace un reparto paritario. En modo COLECTIVO se utilizan los coeficientes de participación */
    let remanente = 1 - (energiaPreAsignada / 100);
    const _coefParitario = remanente / (TCB.Participes.length - preAsignados) * 100;

    for (let finca of TCB.Participes) {
      if (finca.grupo === "Zonas Comunes") {
        finca.coefInversion = 0;
      } else if (finca.nombreTipoConsumo === undefined || finca.nombreTipoConsumo === 'Participe sin consumo' ) {
        finca.coefEnergia = 0;
        finca.coefInversion = 0;
      } else if (TCB.modoActivo === COLECTIVO) {
        finca.coefEnergia = remanente * finca.participacion / coefParticipacionConsumo * 100;
        finca.coefInversion = finca.coefEnergia;
      } else {
        finca.coefEnergia = _coefParitario;
        finca.coefInversion = finca.coefEnergia;
      }

      /* Asignamos la parte proporcional de la instalación a cada finca en función de la produccion asignada */
      finca.coste = TCB.produccion.precioInstalacion * finca.coefEnergia / 100;

    }
    validaResultados();

  }
  /**
 * No puede haber sobrantes ni faltantes de energía ni de dinero
 * @returns false si alguno de los coeficientes variables no suman 100%
 */
  function valida () {

    if (!validaCoeficientes()) {
      alert ("Los coeficientes de energia e inversion deben sumar ambos 100");
      return false;
    } else {
      return true;
    }
  }

  function formatoNuevaColumna( cell) {
    cell.getElement().style.backgroundColor ='aquamarine';
    return UTIL.n_formatoValor( cell, 'dinero')
  }
  /**
   * Realiza un reparto de los coeficientes de energia e inversión basado en el coeficiente de participación de la propiedad
   */
  function repartoParticipacion() {


    document.getElementById("graf_ecoFinca").style.display = "none";

    //Haremos una primera asignación de coeficientes basandonos en el % que representa la participacion de cada finca en la participacion total de los que participan.
    for (let finca of TCB.Participes) {
      let remanente = 1 - (energiaPreAsignada / 100);
      if (finca.grupo !== "Zonas Comunes") finca.coefEnergia = remanente * (finca.participacion / coefPaticipacionTotal) * 100;
    }
    validaResultados();
  }

  /**
   * Realiza un reparto de los coeficientes de energia e inversión a partes iguales entre todos los participes
   */
  function repartoParitario() {
    const _coef = 1 / _tablaReparto.getRows().length * 100;
    _tablaReparto.clearData();
    document.getElementById("graf_ecoFinca").style.display = "none";
    for (let finca of TCB.Participes) {
      finca.coefInversion = _coef;
      finca.coefEnergia = _coef;
      _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", finca.idFinca)]); 
    }
    validaResultados();
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
      const _finca = UTIL.selectTCB('Finca', 'idFinca', cell.getRow().getIndex())[0]; //TCB.Finca.find( (finca) => {return finca.idFinca === cell.getRow().getIndex()});
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
    let actFinca = UTIL.selectTCB('Participes', 'idFinca', idFinca)[0]; // TCB.Participes.find( (finca) => {return finca.idFinca === idFinca});
    if (actFinca.grupo === "Zonas Comunes") {
      alert ("se debe cambiar desde la pestaña de Balance Energia");
      _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", actFinca.idFinca)]);
    } else {
      actFinca.coefEnergia = cell.getValue();
      actFinca.coste = TCB.produccion.precioInstalacion * actFinca.coefEnergia / 100;
      _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", actFinca.idFinca)]);
      validaResultados();
    }
  }

    /**
   * Procesa el cambio de un coeficiente de inversión individual
   * @param {Tabulator.cell} cell Identifica la celda que ha sido modificada
   */
  function cambioCoefInversion( cell) {
    document.getElementById("graf_ecoFinca").style.display = "none";
    const idFinca = cell.getRow().getIndex();
    let actFinca = UTIL.selectTCB('Participes', 'idFinca', idFinca)[0];  //TCB.Participes.find( (finca) => {return finca.idFinca === idFinca});
    actFinca.coefInversion = cell.getValue();
    _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", actFinca.idFinca)]);
    validaResultados();
  }

  function cambioCondicionHucha ( cell) {
    const idFinca = cell.getRow().getIndex();
    let actFinca = UTIL.selectTCB('Participes', 'idFinca', idFinca)[0]; //TCB.Participes.find( (finca) => {return finca.idFinca === idFinca});
    let cuotaHucha = actFinca.cuotaHucha;
    let coefHucha = actFinca.coefHucha
    if (cell.getField() === "coefHucha") coefHucha = cell.getValue();
    if (cell.getField() === "cuotaHucha") cuotaHucha = cell.getValue();

    actFinca.actualizaCondicionesHucha(coefHucha, cuotaHucha);
    actFinca.economico.calculoFinanciero(actFinca.coefEnergia, actFinca.coefInversion);
    TCB.graficos.gestionEconomico_BalanceEconomico("graf_ecoFinca", actFinca.economico, actFinca);
    _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", actFinca.idFinca)]);
  }


/** Crea Balance y Economico para cada Finca segun los coefs asignados si esta dada una situacion de balance
 *  de inversión y energía
 */
  function validaResultados() {

    const estadoBalanceado = validaCoeficientes();

/*     if (estadoBalanceado)
      _tablaReparto.showColumn('ahorroFincaAnual');
     else
      _tablaReparto.hideColumn('ahorroFincaAnual'); */

    for (let finca of TCB.Participes) {
      if (estadoBalanceado) {
        if (finca.nombreTipoConsumo !== undefined && finca.nombreTipoConsumo !== 'Participe sin consumo') { //} && finca.grupo !== 'Zonas Comunes') {
          const _tc = UTIL.selectTCB('TipoConsumo','nombreTipoConsumo',finca.nombreTipoConsumo)[0];  
          finca.balance = new Balance( TCB.produccion, _tc, finca.coefEnergia);
          finca.economico = new Economico(finca);
        }
      }
      _tablaReparto.updateOrAddData([Finca.getTabulatorRow("idFinca", finca.idFinca)]);
    }
    _tablaReparto.recalc(); 

  }
  /** Verifica que se cumplen las condiones de sistema balanceado en energia e inversión
   * @returns {boolean} True si se cumplen las condiciones, False en caso contrario
   */
  function validaCoeficientes() {
  
    let _statusEnergia = actualizaEstadoEnergia();
    let _statusInversion = actualizaEstadoInversion();
    return (_statusEnergia && _statusInversion);

  }

  /** Verifica que el total de los coeficientes de energia es 100 y asigna color al boton correspondeinte
   * @returns {boolean} True si se cumplen las condiciones, False en caso contrario
   */
  function actualizaEstadoEnergia () {
    const btnEnergia = document.getElementById("checkEnergia");
    sumaCoefEnergia = TCB.Participes.reduce((a, b) => a + b.coefEnergia, 0);
    btnEnergia.innerHTML = TCB.i18next.t("botonCheckEnergia_LBL", {coefEnergia: UTIL.formatoValor('porciento', sumaCoefEnergia)});
    if (Math.round(Math.abs(100 - sumaCoefEnergia) > _epsilon)) {
      btnEnergia.style = "color: white; background-color: red;"
      _tablaReparto.getColumn('coefEnergia').getElement().style.backgroundColor ='red';
      return false;
    } else {
      btnEnergia.style = "color: white; background-color: green;"
      _tablaReparto.getColumn('coefEnergia').getElement().style.backgroundColor ='rgb(200, 249, 233)';
      return true;
    }
  }

  /** Verifica que la suma de todos los costes asignados a cada Finca es igual al total de la inversión
   * @returns {boolean} True si se cumplen las condiciones, False en caso contrario
   */
  function actualizaEstadoInversion () {
    const btnInversion = document.getElementById("checkInversion");
    const inversionTotal = TCB.produccion.precioInstalacion;
    sumaCoefInversion = TCB.Participes.reduce((a, b) => a + b.coefInversion, 0);
    let inversionAsignada = 0;

    for (let finca of TCB.Participes) {
      if (finca.grupo === "Zonas Comunes") {
        /* Si es una zona comun quiere decir que el resto de finca tiene una propiedad que contiene lo
        que cada finca debe aportar para cubrir el coste de esta zona */
        inversionAsignada += TCB.Participes.reduce( (a, b)=> {return a + b[finca.nombreFinca]}, 0);
      } else {
        inversionAsignada += finca.coefInversion * inversionTotal / 100;
      }
    }
    btnInversion.innerHTML = TCB.i18next.t("botonCheckInversion_LBL",
                            {inversion: UTIL.formatoValor('dinero', inversionTotal), 
                            asignado: UTIL.formatoValor('dinero', inversionAsignada)}
                            );

    if ( Math.round(Math.abs(inversionTotal - inversionAsignada)) > _epsilon) {
      btnInversion.style = "color: white; background-color: red;"
      _tablaReparto.getColumn('ahorroFincaAnual').getElement().style.backgroundColor ='red';
      return false;
    } else {
      btnInversion.style = "color: white; background-color: green;"
      _tablaReparto.getColumn('ahorroFincaAnual').getElement().style.backgroundColor ='rgb(200, 249, 233)';
      return true;
    }
  }

  function informeEconomico(cell) {
    if (valida()) { //Verificamos que ya se ha realizado algún reparto
      const selectedRows = _tablaReparto.getSelectedRows();
      for (let i=0; i<selectedRows.length; i++) {
        if ( selectedRows[i].getIndex() !== cell.getRow().getIndex()) {
          selectedRows[i].deselect();
        } else {
          const _finca = UTIL.selectTCB('Finca', 'idFinca', cell.getRow().getIndex())[0];  //TCB.Finca.find( (finca) => {return finca.idFinca === cell.getRow().getIndex()});
          if (_finca.nombreTipoConsumo !== 'Participe sin consumo') {
            document.getElementById("graf_ecoFinca").style.display = "block";
            TCB.graficos.gestionEconomico_BalanceEconomico("graf_ecoFinca", _finca.economico, _finca);
          } else {
            alert (TCB.i18next.t("No hay gráficos para participe sin consumo"));
          }
        }
      }
    }
  }

  function cambiaPrecioInstalacion(evento) {

    console.log("cambio");
    //Se actualizará el precio de las instalaciones de todas las bases de forma proporcional
    const correccionPrecioInstalacion = (parseFloat(evento.target.value) / TCB.produccion.precioInstalacion);
    TCB.BaseSolar.forEach( (base) => {
      base.instalacion.precioInstalacion *= correccionPrecioInstalacion;
    });

    //Se actualiza el precio de la instalación total
    TCB.produccion.precioInstalacion = parseFloat(evento.target.value);
    UTIL.muestra("nuevoPrecioInstalacion", TCB.produccion.precioInstalacion);

    TCB.Participes.forEach( (finca) => {
      finca.coste = TCB.produccion.precioInstalacion * finca.coefEnergia / 100;
    })
    validaResultados();
  }


  export {gestionReparto}