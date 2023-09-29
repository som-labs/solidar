import TCB from "./TCB.js";
import * as UTIL from "./Utiles.js";
/** 
 * @class DiaHora
 * @classdesc Es la clase base para todas las matrices diaHora de 365 filas y 24 columnas para almacenar los valores de los diversos objetos de la aplicacion
 */

class DiaHora {
    
/** @property {Array} idxTable Vector [365] objetos {} resumen de algunas propiedades de cada dia del año */
    idxTable = []; 
/** @property {Array} diaHora Matriz [365, 24] valores horarios de cada dia del año */
    diaHora = [];  
/** @property {number} numeroRegistros Numero de registros leidos desde la fuente */
    numeroRegistros = 0;
/** @property {number} numeroDias Numero de dias procesados desde la fuente */
    numeroDias = 0;
/** @property {Date} fechaFin Última fecha leida desde la fuente */
    fechaFin;
    horaFin;
    fechaInicio;
    horaInicio;
    maximoAnual = -Infinity;
    totalAnual = 0;
    datosCargados = false;

/**
 * @constructor
 */
    constructor( ) {
        this.inicializa();
    }

/** inicializa Inicializa la estructura DiaHora a cero */
    inicializa() {
        for (let i = 0; i < 365; i++) {
/*             let diaMes = UTIL.fechaDesdeIndice(i);
            this.idxTable[i] = { previos: 0, dia: diaMes[0], mes: diaMes[1], suma: 0, maximo: 0, promedio: 0, fecha:''}; */
            this.idxTable[i] = { previos: 0, suma: 0, maximo: 0, promedio: 0, fecha:''};
        }
        this.diaHora = Array.from(Array(365), () => new Array(24).fill(0));
    }

/**
 * @typedef {object} options Define la forma de interpretar el CSV
 * @property {Object} options Define la forma de interpretar el CSV
 * @property {string} options.delimiter Separador de campos
 * @property {string} options.decimal Separador de decimales
 * @property {number} options.factor Se multiplica los valores leidos por este factor. Si undefined -> 1
 * @property {string} options.fechaHdr Nombre del campo Fecha. Se convertirá a mayusuclas para buscar equivalencia
 * @property {string} options.horaHdr Nombre del campo Hora.  Se convertirá a mayusuclas para buscar equivalencia
 * @property {Array<string>} options.valorArr Array con los nombres de campos donde se almacena el valor a cargar. Por ejemplo: Consumo en Naturgy y Consumo_kWh en Iberdrola y VIESGO y AE_kWh en ENDESA.
*/
/** 
 * Carga los datos contenidos en fichero CSV con un registro por hora dentro de DiaHora.
 * @async
 * @param {File} csvFile Estructura desde donde se cargará los datos
 * @param {options} options Opciones de carga del csv
 */
    async loadFromCSV (csvFile, 
        options = {delimiter:";", 
                    decimal:",", 
                    fechaHdr:"FECHA",
                    horaHdr:"HORA", 
                    factor:1,
                    metodo:"SUSTITUYE"}) {

        this.datosCargados = false;                
        var lastLine;
        this.maximoAnual = -Infinity;
        this.totalAnual = 0;
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
        reader.onerror = () => {
            alert(
                TCB.i18next.t("consumo_MSG_errorLecturaFicheroCSV") +
                "\nReader.error: " + reader.error 
            );
            reject("...error de lectura");
        };
    
        reader.onload = (e) => {
            const data = e.target.result;
            //const data = UTIL.csvToArray(text, options.delimiter);

            //Procesamos los headers
            let chkValor = false;
            let chkFecha = false;
            let chkHora = false;
            let valorHdr; //Nombre del campo donde se almacena el valor a recoger

            try {
                var headers = data.slice(0, data.indexOf("\n")).split(options.delimiter);
                for (let i=0; i<headers.length; i++) {
                    headers[i] = headers[i].trim().toUpperCase();
                    if (headers[i] === options.fechaHdr) chkFecha = true;
                    if (headers[i] === options.horaHdr) chkHora = true;
                    if (options.valorArr.includes(headers[i])) {
                        chkValor = true;
                        valorHdr = headers[i];
                    }
                }
                if (! (chkValor && chkFecha && chkHora)) {
                    let failHdr = "";
                    if (!chkValor) failHdr += "Valor consumo"; 
                    if (!chkFecha) failHdr += options.fechaHdr;
                    if (!chkHora) failHdr += options.horaHdr;
                    alert (TCB.i18next.t("consumo_MSG_errorCabeceras", {cabeceras: failHdr}));
                    return [];
                }
            } catch (e) {
                alert("Posible error de formato fichero de consumos\n" + data[0]);
                return false;
            }
            UTIL.debugLog("Cabecera CSV:", headers);

            // usamos split para crear un array con cada fila del CSV
            const rows = data.slice(data.indexOf("\n") + 1).split("\n");
            if (rows.length == 0) return false;
            UTIL.debugLog("Consumo procesando " + rows.length + " registros del fichero " + csvFile.name);

            let lineas = [];
            rows.forEach( (row) => {
                if(row.length > 1) {
                    const values = row.split(options.delimiter);
                    const el = headers.reduce(function (object, header, index) {
                        object[header] = values[index].replace(/\042/g,''); //removemos las posibles comillas. Vienen en DATADIS
                        return object;
                    }, {});
                    lineas.push(el);
                }
            })

            // Procesamos los datos
            try {
                var lastFecha = new Date(1970, 1, 1);
                var hora;
                var unDia = { fecha: lastFecha, valores: Array(24).fill(0) }; //el mes es 0-11, la hora es 0-23

                // Se han detectado ficheros de Naturgy con registros vacios al final del mismo
                // si el campo fecha viene vacio consideramos que hay que ignorar el registro
                let vacio = false; 
                for (var i = 0; i < lineas.length; i++) {
                    lastLine = lineas[i];
                    if (lineas[i][options.fechaHdr] === "") {
                        vacio = true;
                        continue;
                    }
                    //Para gestionar fechas en formato dd/mm/aaaa como vienen en el CSV debamos invertir a aaaa/mm/dd en javascript
                    let posDia = options.fechaSwp ? 2 : 0;
                    let posMes = 1;
                    let posAno = options.fechaSwp ? 0 : 2;
                    let parts = lineas[i][options.fechaHdr].split("/"); 
                    let _dia = parts[posDia];
                    let _mes = parts[posMes] - 1; //_mes es el indice interno gestionado por JS pero es 1-24 en los ficheros de las distribuidoras
                    let _ano = parts[posAno];
                    if (_dia > 31 || _mes > 11) { //Es probable que hayan definido DATADIS para un CSV de distribuidora
                        throw TCB.i18next.t("fuenteTipoConsumoErronea_MSG");
                    }
                    let currFecha = new Date(_ano, _mes, _dia, 0, 0);

                    //La hora de la distribuidora viene en un número entero simple pero en DATADIS viene con HH:MM
                    hora = lineas[i][options.horaHdr].split(":")[0];
                    hora -= 1; //hora viene 1-24. Se cambia al interno 0-23

                    //Hay casos en ficheros CSV que aparece una hora 25 los dias de cambio de horario.
                    if (hora < 0) hora = 0;
                    if (hora >= 23) hora = 23;
        
                    if (_mes == 1 && _dia == 29) continue; //Ignoramos el 29/2 de los años bisiestos
                    //Registramos los datos del primer registro

                    if (i == 0) {
                        this.fechaInicio = currFecha;
                        this.horaInicio = hora + 1;
                    }
        
                    if (currFecha.getTime() == lastFecha.getTime()) {
                        //debemos cambiar la , por el . para obtener el valor
                        unDia.valores[hora] = parseFloat(lineas[i][valorHdr].replace(options.decimal, "." )) * options.factor;
                    } else {
                        if (i == 0) {
                            unDia = {
                            fecha: currFecha,
/*                              dia: currFecha.getDate(),
                                mes: currFecha.getMonth(), */
                            valores: Array(24).fill(0),
                            };
                            unDia.valores[hora] = parseFloat(lineas[i][valorHdr].replace(options.decimal, "." )) * options.factor;
                        } else {
                            this.mete(unDia, options.metodo);
                            unDia = {
                                fecha: currFecha,
/*                              dia: currFecha.getDate(),
                                mes: currFecha.getMonth(), */
                                valores: Array(24).fill(0),
                            };
                            unDia.valores[hora] = parseFloat(lineas[i][valorHdr].replace(options.decimal, "." )) * options.factor;
                        }
                        lastFecha = currFecha;
                        if (isNaN(unDia.valores[hora])) {
                            console.log(lastLine);
                            throw "Conversión consumo";
                        }
                    }
                }
                // Si el ultimo registro no vino vacio lo metemos
                if (!vacio) this.mete(unDia, options.metodo);
                this.fechaFin = lastFecha;
                this.horaFin = hora;
                this.numeroRegistros = lineas.length;
                this.datosCargados = true; 
                this.sintesis();
                resolve();
            } catch (error) {
                this.numeroRegistros = 0;
                this.datosCargados = false; 
                alert ("Error lectura en linea:\n" + JSON.stringify(lastLine) + "\n" + error);
                reject(error);
            }

            //Verificamos que tenemos 365 dias registrados.
            let todos = true;
            for (let i=0; i<365; i++) {
                if (this.idxTable[i].fecha === '') {
                    todos = false;
                    console.log( i + " esta sin fecha " + UTIL.fechaDesdeIndice(i));
                }
            }
            if (!todos) {
                alert ('Faltan dias para completar un año de datos');
                this.numeroRegistros = 0;
                return false;
            }
        };
        reader.readAsText(csvFile);
        });

    }
/**
 * Carga diaHora a partir de un objeto JSON
 * Por definir
 */
    async loadFromJSON () {
    }
/**
 * Suma a this.diaHora una nueva inDiaHora multiplicada por factor
 * @param {DiaHora} inDiaHora 
 * @param {number} factor 
 */
    sintetizaDiaHora( inDiaHora, factor) {
        for (let dia=0; dia<365; dia++) {
            for (let hora=0; hora<24; hora++) {
                this.diaHora[dia][hora] += inDiaHora.diaHora[dia][hora] * factor;
            }
            this.idxTable[dia].suma = this.idxTable[dia].suma + inDiaHora.idxTable[dia].suma * factor;
            this.idxTable[dia].promedio = (this.idxTable[dia].promedio + (inDiaHora.idxTable[dia].promedio * factor)) / (factor + 1);
            this.idxTable[dia].maximo = this.idxTable[dia].maximo > inDiaHora.idxTable[dia].maximo ?
                                                this.idxTable[dia].maximo : inDiaHora.idxTable[dia].maximo
            this.idxTable[dia].fecha = inDiaHora.idxTable[dia].fecha;
        }
        this.sintesis();
    }
/**
 * Suma diaHora de inDiaHora a this.diaHora y actualiza los campos de idxTable
 * @param {inDiaHora} inDiaHora
 */
    suma ( inDiaHora) {
        for (let dia=0; dia<365; dia++) {
            for (let hora=0; hora<24; hora++) {
              this.diaHora[dia][hora] += inDiaHora.diaHora[dia][hora];
            }
            this.idxTable[dia].fecha =  inDiaHora.idxTable[dia].fecha;
            this.idxTable[dia].suma += inDiaHora.idxTable[dia].suma;
            this.idxTable[dia].promedio = this.idxTable[dia].suma / 2;
            this.idxTable[dia].maximo = this.idxTable[dia].maximo > inDiaHora.idxTable[dia].maximo ?
                                                 this.idxTable[dia].maximo : inDiaHora.idxTable[dia].maximo
        }
        this.sintesis();
    }
/**
 * Devuelve el valor diaHora de los 365 dias a una determinada hora o array vacio si la hora no es valida
 * @param {number} hora Un numero entre 0 y 23
 * @returns {Array<number>} Array de 365 valores de diaHora a esa hora
 */
    getHora ( hora ) {
        let arrayHora = [];
        if (hora >= 0 && hora < 24) {
            for (let dia=0; dia<365; dia++) arrayHora.push(this.diaHora[dia][hora]);
        }
        return arrayHora;
    }
/**
 * Devuelve el valor de las 24 horas de un determinado dia o array vacio si el dia no es valido
 * @param {number} dia Un numero entre 0 y 364
 * @returns {Array<number>} Array de 24 valores de diaHora de ese dia
 */
    getDia ( dia ) {
        let arrayDia = [];
        if (dia >= 0 && dia<365) {
            for (let hora=0; hora<24; hora++) arrayDia.push(this.diaHora[dia][hora]);
        }
        return dia;
    }
/**
 * Carga diaHora de this a partir de otro objeto diaHora aplicandole un factor de escala.
 * @param {DiaHora} inDiaHora DiaHora origen
 * @param {number} factor 
 */
    escala ( inDiaHora, factor) {
        for (let dia = 0; dia < 365; dia++) {
            for (let hora = 0; hora < 24; hora++) {
                this.diaHora[dia][hora] = inDiaHora.diaHora[dia][hora] * factor;
            }
            this.idxTable[dia].fecha = inDiaHora.idxTable[dia].fecha;
            this.idxTable[dia].suma = inDiaHora.idxTable[dia].suma * factor;
            this.idxTable[dia].promedio = inDiaHora.idxTable[dia].promedio * factor;
            this.idxTable[dia].maximo = inDiaHora.idxTable[dia].maximo * factor;
        }
        this.maximoAnual = inDiaHora.maximoAnual * factor;
        this.totalAnual = inDiaHora.totalAnual * factor;
    }
/**
 * Introduce los valores de un dia en diaHora y actualiza la tabla idx del dia correspondiente
 * En caso de existir valores previos para ese dia calcula los promedios
 * @param {object} unDia Estructura a carga
 * @param {Date} unDia.fecha Fecha del registro al que se insertarán estos datos
 * @param {Array(24)<number>} unDia.valores Valores a insertar en esta fila
 */
    mete(unDia, metodo) {
        let _dia = unDia.fecha.getDate();
        let _mes = unDia.fecha.getMonth();
        var indiceDia = UTIL.indiceDesdeDiaMes(_dia, _mes);
        for (let hora = 0; hora < 24; hora++) {
            if (metodo === "PROMEDIO") {
                if (this.idxTable[indiceDia].previos > 0) {
                    //Implica que ya habia registros previos para ese dia por lo que recalculamos el promedio
                    unDia.valores[hora] =
                    (this.diaHora[indiceDia][hora] * this.idxTable[indiceDia].previos +
                        unDia.valores[hora]) / (this.idxTable[indiceDia].previos + 1);
                }
            } 
            this.diaHora[indiceDia][hora] = unDia.valores[hora];
        }

        this.idxTable[indiceDia].fecha = unDia.fecha;
        this.idxTable[indiceDia].previos = this.idxTable[indiceDia].previos + 1;
        this.idxTable[indiceDia].suma = UTIL.suma(unDia.valores);
        this.idxTable[indiceDia].promedio = UTIL.promedio(unDia.valores);
        this.idxTable[indiceDia].maximo = Math.max(...unDia.valores);
    }
/**
 * Calcula los campos maximoAnual y totalAnual de diaHora
 */
    sintesis() {
        this.totalAnual = 0;
        this.maximoAnual = -Infinity;

        for (let i = 0; i < 365; i++) {
          if (this.idxTable[i].maximo > this.maximoAnual) {
            this.maximoAnual = this.idxTable[i].maximo;
          }
          if (this.idxTable[i].previos > 0) this.numeroDias++;
          this.totalAnual += this.idxTable[i].suma;
        }

        UTIL.debugLog("Sintesis DiaHora:", 
        { desde: this.fechaInicio,
          hasta: this.fechaFin,
          maximo: this.maximoAnual.toFixed(2), 
          numeroDias: this.numeroDias,
          total: this.totalAnual.toFixed(2), 
        });   
    }

/**
 * Devuelve un vector de 12 posiciones con el sumatorio de la propiedad solicitada en el argumento para cada mes
 * @param {string} propiedad de la que solicita el resumen
 * @returns {Array(12)<number>} valores del sumatorio de la propiedad para cada mes
 */
    resumenMensual(propiedad) {
        let valorMensual = new Array(12).fill(0);
        for (let i = 0; i < 365; i++) {
            valorMensual[this.idxTable[i].fecha.getMonth()] += this.idxTable[i][propiedad];
        }
        return valorMensual;
    }

    transformaFechas() {
        if (typeof this.idxTable[0].fecha === 'string')
            for (let dia=0; dia<365; dia++) {
                this.idxTable[dia].fecha = new Date(this.idxTable[dia].fecha);
            } 
    }

}
export default DiaHora