import * as UTIL from "./Utiles.js";
import TCB from "./TCB.js";
import * as IDIOMA from "./Idioma.js";
import Finca from "./Finca.js";
import TipoConsumo from "./TipoConsumo.js";
import {nuevoTotalPaneles} from "./optimizador.js";
import {calculaResultados} from "./calculaResultados.js";
import {gestionEconomico} from "./gestionEconomico.js";
import {gestionResultados} from "./gestionResultados.js";
import { gestionGraficos } from "./gestionGraficos.js";
/*global Plotly, INDIVIDUAL*/
/**
 * @class Graficos
 * @classdesc Clase donde se gestiona la creación de los gráficos de la aplicación
 */
class Graficos { 

    constructor() {
        this.init = true;
        this.grafico;
        
        // Estas variables se gestionan aqui para que i18n tenga disponibles sus valores a la hora de traducir
        this.maxConsumoMes;
        this.maxHora;
        this.maxMes;
        this.mesMapa = Array.from(IDIOMA.i18nextMes());
        this.opcion; //ConHucha o SinHucha
        this.fecha = [];
        this.valores = [];
        this.colores = [];
        this.horas = [];
        this.meses = [];
        this.text = [];
        this.sizes = [];
    }

    /** Función para traducir los textos i18n en los graficos plotly
     * 
     */
    i18nextGraficos() {
        let layout_update;
        let data_update;
        this.mesMapa =  Array.from(IDIOMA.i18nextMes());

        if( this.divMapaConsumo !== undefined) {
            layout_update = {
                xaxis:{title: TCB.i18next.t('graficos_LBL_graficasHora')},
                yaxis:{title: TCB.i18next.t('graficos_LBL_graficasDia'),
                    tickvals: UTIL.indiceDia.map((e) => {return (e[1])}),
                    ticktext: this.mesMapa
                },
                title: {
                    text: TCB.i18next.t('graficos_LBL_graficasConsumo'),
                    xref: 'paper',
                    x: 0,
                    yref: 'paper',
                    y: 1.1}
            };
            data_update = {
                name: TCB.i18next.t('graficos_LBL_graficasConsumo'),
                hovertemplate:
                "%{yaxis.title.text}: %{y}<br>" +
                "%{xaxis.title.text}: %{x}<br>" +
            TCB.i18next.t('graficos_LBL_graficasConsumo') + ": %{z:.2f} kWh"
            };
            Plotly.update(this.divMapaConsumo, data_update, layout_update);
        }

        if( this.divPerfilDiario !== undefined) {
            layout_update = {
                 title: TCB.i18next.t("graficos_LBL_graficasDia") + ": " + this.fecha[0] + " - " + 
                        TCB.i18next.t(this.mesMapa[parseInt(this.fecha[1])]), 
                xaxis: {title: TCB.i18next.t('graficos_LBL_graficasHora')}
            };
            data_update = {
                name: TCB.i18next.t('graficos_LBL_graficasConsumo')
            }
            Plotly.update(this.divPerfilDiario, data_update, layout_update);
        }

        if( this.divMapaMesHora !== undefined) {
            this.meses = [];
            for( let hora=0; hora<24; hora++) {
                for (let mes=0; mes<12; mes++) {
                    this.meses.push(this.mesMapa[mes]);
                }
            }
            layout_update = {
                title: {
                    text: TCB.i18next.t('graficos_LBL_mapaConsumoMesHora'),
                    xref: 'paper', 
                    yref: 'paper',
                    x: 0.5,
                    y: 1.1,
                    },
                xaxis: {title:TCB.i18next.t('graficos_LBL_graficasHora'), dtick:4},
                yaxis: {title: TCB.i18next.t('graficos_LBL_graficasMes'), ticktext: this.meses},
                annotations: [
                    {x: this.maxHora, y: this.maxMes,
                    axref: 'x', ayref: 'y',
                    xref: 'x', yref: 'y',
                    text: TCB.i18next.t('graficos_LBL_maxConsumoMes', {maxConsumoMes: this.maxConsumoMes.toFixed(2)}),
                    showarrow: true,
                    arrowhead: 3,
                    xanchor: 'center',
                    ax: 12,
                    ay: 13
                }
                ]
            }
            data_update = {
                name: TCB.i18next.t('graficos_LBL_tituloConsumoMedio'),
/*                 x: this.horas,
                y: this.meses,
                customdata: this.valores,
                text: this.text,
                marker: {symbol: 'circle',
                    size: this.sizes,  
                    line: {
                        color: 'rgba(156, 165, 196, 1.0)',
                        width: 1,
                    },
                }, */
            }
            Plotly.update(this.divMapaMesHora, data_update, layout_update);
        }

        if( this.divConsumosVersusGeneracion !== undefined) {

            layout_update = {
                title: TCB.i18next.t('graficos_LBL_produccionMediaMensual', {potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal)})
            }
            data_update = {
                name: [TCB.i18next.t('graficos_LBL_graficasConsumo'),
                        TCB.i18next.t('graficos_LBL_graficasProduccion')],
                x: [this.mesMapa, this.mesMapa]
            }
            Plotly.update(this.divConsumosVersusGeneracion, data_update, layout_update);
        }

        if (this.divConsumoGeneracion3D !== undefined) {
            layout_update = {
                title: {
                    text: TCB.i18next.t('graficos_LBL_graficasProduccion') + " vs " + TCB.i18next.t('graficos_LBL_graficasConsumo'),
                },
                scene: { /*{camera: {eye: {x: -1.5, y: -1.5, z: 0.5}}, */
                    xaxis:{title: TCB.i18next.t('graficos_LBL_graficasHora')},
                    yaxis:{title: TCB.i18next.t('graficos_LBL_graficasDia'),
                        tickvals: UTIL.indiceDia.map((e) => {return (e[1])}),
                        ticktext: this.mesMapa},
                    zaxis:{title: 'kWh'}
                },
            }

            data_update = {
                y: [
                TCB.produccion.idxTable.map((e) => {return (e.dia + " - " + TCB.i18next.t(UTIL.nombreMes[e.mes]))}),
                TCB.consumo.idxTable.map((e) => {return (e.dia + " - " + TCB.i18next.t(UTIL.nombreMes[e.mes]))})],
                name: [
                TCB.i18next.t('graficos_LBL_graficasConsumo'),
                TCB.i18next.t('graficos_LBL_graficasProduccion')],
                hovertemplate: [
                TCB.i18next.t('graficos_LBL_graficasHora') + ": %{y}<br>" +
                TCB.i18next.t('graficos_LBL_graficasHora') + ": %{x}<br>" +
                TCB.i18next.t('graficos_LBL_graficasProduccion') + ": %{z:.2f} kWh",
                TCB.i18next.t('graficos_LBL_graficasHora') + ": %{y}<br>" +
                TCB.i18next.t('graficos_LBL_graficasHora') + ": %{x}<br>" +
                TCB.i18next.t('graficos_LBL_graficasConsumo') + ": %{z:.2f} kWh"
                ]
            }
            Plotly.update(this.divConsumoGeneracion3D, data_update, layout_update);
        }

        if (this.divResPerfilDiario !== undefined) {
            layout_update = {
                title: TCB.i18next.t("graficos_LBL_graficasDia") + ": " + this.fecha[0] + " - " + TCB.i18next.t(UTIL.nombreMes[parseInt(this.fecha[1])-1]),
                xaxis: {title: TCB.i18next.t('graficos_LBL_graficasHora'), dtick: 4},
                yaxis: {title: 'kWh', showline: true, zeroline: true, zerolinecolor :'#969696', gridcolor : '#bdbdbd', gridwidth : 2 }
            }
            data_update = {
                name: [
                    TCB.i18next.t('graficos_LBL_graficasConsumo'),
                    TCB.i18next.t('graficos_LBL_graficasProduccion')],
            }
            Plotly.update(this.divResPerfilDiario, data_update, layout_update);
        }

        if (this.divBalanceProduccion !== undefined) {

            layout_update = {
                title: TCB.i18next.t('graficos_LBL_balanceProduccion', {potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal)})
            }
            data_update = {
                x: [this.mesMapa, this.mesMapa, this.mesMapa],
                name: [ 
                    TCB.i18next.t('graficos_LBL_graficasProduccion'),
                    TCB.i18next.t('graficos_LBL_graficasAutoconsumo'),
                    TCB.i18next.t('graficos_LBL_graficasExcedente')
                ]
            }
            Plotly.update(this.divBalanceProduccion, data_update, layout_update);
        }

        if (this.divBalanceConsumo !== undefined) {

            layout_update = {
                title: TCB.i18next.t('graficos_LBL_balanceConsumo', {potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal)})
            }
            data_update = {
                x: [this.mesMapa, this.mesMapa, this.mesMapa],
                name: [ 
                    TCB.i18next.t('graficos_LBL_graficasConsumo'),
                    TCB.i18next.t('graficos_LBL_graficasAutoconsumo'),
                    TCB.i18next.t('graficos_LBL_graficasDeficit')
                ]
            }
            Plotly.update(this.divBalanceConsumo, data_update, layout_update);
        }

        if (this.divBalanceEconomico !== undefined) {

            let titulo;
            if (TCB.modoActivo === INDIVIDUAL) {
                titulo = TCB.i18next.t('graficos_LBL_tituloBalanceEconomicoGlobal', {potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal)});
            }  else if (this.finca === undefined) {
                titulo = "Global: " + TCB.i18next.t('graficos_LBL_tituloBalanceEconomicoGlobal', {potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal)});
            } else {
                const _potenciaAsignada = TCB.produccion.potenciaTotal * this.finca.coefEnergia / 100;
                titulo = this.finca.nombreFinca + ": " + TCB.i18next.t('graficos_LBL_tituloBalanceEconomicoFinca', 
                {potencia: UTIL.formatoValor('potencia', _potenciaAsignada),
                paneles: (_potenciaAsignada / TCB.parametros.potenciaPanelInicio).toFixed(2)}); 
            }
            layout_update = {x: this.mesMapa, title: titulo};

            if (this.opcion === 'ConHucha') {
                data_update = {name: [
                    TCB.i18next.t('graficos_LBL_graficasGastoSinPaneles'),
                    TCB.i18next.t('graficos_LBL_graficasGastoConPaneles'),
                    TCB.i18next.t('graficos_LBL_huchaSaldo'),
                    '',
                    TCB.i18next.t('graficos_LBL_graficasCompensacion'),
                    TCB.i18next.t('graficos_LBL_graficasAutoconsumo'),
                    TCB.i18next.t('graficos_LBL_extraccionHucha')
                ], x: [this.mesMapa,this.mesMapa,this.mesMapa,this.mesMapa,this.mesMapa,this.mesMapa,this.mesMapa]}
            } else {
                data_update = {name: [
                    TCB.i18next.t('graficos_LBL_graficasGastoSinPaneles'),
                    TCB.i18next.t('graficos_LBL_graficasGastoConPaneles'),
                    '',
                    TCB.i18next.t('graficos_LBL_graficasCompensacion'),
                    TCB.i18next.t('graficos_LBL_graficasAutoconsumo'),
                    TCB.i18next.t('graficos_LBL_graficasNoCompensado')
                ],  x: [this.mesMapa,this.mesMapa,this.mesMapa,this.mesMapa,this.mesMapa,this.mesMapa]}
            }
            Plotly.update(this.divBalanceEconomico, data_update, layout_update);
        }

        if (this.divPlotAlternativas !== undefined) {
            layout_update = {
                title: TCB.i18next.t('graficos_LBL_alternativasPotencia', {potencia: UTIL.formatoValor('potencia',this.potencia_kWp)}),
                annotations: [
                    {
                        x: TCB.totalPaneles, y: 100,
                        xref: 'x', yref: 'y',
                        text: TCB.totalPaneles + " " + TCB.i18next.t("graficos_LBL_paneles"),
                        showarrow: true,
                        arrowhead: 2,
                        xanchor: 'left',
                        hovertext: TCB.i18next.t("graficos_LBL_panelesActuales",{paneles: TCB.totalPaneles}),
                        ax: 20,
                        ay: -20
                    }
                ],
                xaxis: {
                    title: TCB.i18next.t('graficos_LBL_paneles')
                }
            }
            data_update = { name: [
                'TIR(%)',
                TCB.i18next.t('graficos_LBL_graficasAutoconsumo') + "(%)",
                TCB.i18next.t('graficos_LBL_graficasAutosuficiencia') + "(%)",
                TCB.i18next.t('graficos_LBL_graficasInversion') + "(€)",
                TCB.i18next.t('graficos_LBL_graficasAhorro') + "(€)"
            ]
            }
            Plotly.update(this.divPlotAlternativas, data_update, layout_update);
        }

        if (this.divBalanceResultados !== undefined) {
            this.gestionResultados_BalanceResultados( this.divBalanceResultados)
        }

    }

    gestionGraficos_ConsumosVersusGeneracion(donde){

        this.divConsumosVersusGeneracion = donde;
        var resConsumo = TCB.consumo.resumenMensual('suma');
        var trace1 = {
            x: this.mesMapa,
            y: resConsumo,
            type: 'scatter',
            name: TCB.i18next.t('graficos_LBL_graficasConsumo')
        };

        var resProduccion = TCB.produccion.resumenMensual('suma');
        var trace2 = {
            x: this.mesMapa,
            y: resProduccion,
            type: 'scatter',
            name: TCB.i18next.t('graficos_LBL_graficasProduccion')
        };

        var layout = {
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            title: TCB.i18next.t('graficos_LBL_produccionMediaMensual', {potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal)}),
            yaxis: {
                title: 'kWh'
            }
        };
        
        var data = [trace1, trace2];
        Plotly.react(donde, data, layout);
    }

    gestionTipoConsumo_PerfilDiario (consumo, donde2, dia, fecha) {
        this.fecha[0]=fecha[0];
        this.fecha[1]=fecha[1];
        document.getElementById(donde2).style.display = "block";
        var trace1 = {
            y: consumo.diaHora[dia],
            type: 'scatter',
            showlegend : false,
            name: TCB.i18next.t('graficos_LBL_graficasConsumo'),
            line: {shape: 'spline', width:3, color:'rgb(0,0,255'}
        };

        var trace2 = {
            y: consumo.diaHora[dia],
            type: 'bar',
            showlegend : false,
            width: 0.1,
            hoverinfo: 'none',
            marker : {'color': consumo.diaHora[dia],
                cmax : consumo.cMaximoAnual,
                cmin : 0,
                colorscale: [
                ['0.0', 'rgb(250,250,250)'],
                ['0.10', 'rgb(240,240,240)'],
                ['0.20', 'rgb(230,200,200)'],
                ['0.5', 'rgb(220,120,150)'],
                ['1.0', 'rgb(254,79,67)']]}
        };
        var layout = {
            autosize: true,
            margin: {
                l: 50,
                r: 20,
                b: 65,
                t: 25
            },
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            title: TCB.i18next.t("graficos_LBL_graficasDia") + ": " + fecha[0] + " - " + TCB.i18next.t(UTIL.nombreMes[parseInt(fecha[1])]),
            x: 10,
            y: 15,
            xaxis: {title: TCB.i18next.t('graficos_LBL_graficasHora'), dtick: 4},
            yaxis: {title: 'kWh', showline: true, zeroline: true, zerolinecolor :'#969696', gridcolor : '#bdbdbd', gridwidth : 2 }
        };
        Plotly.react(donde2, [trace1, trace2], layout);
    }

    gestionTipoConsumo_MapaConsumo (consumo, donde1, donde2) {

        this.divMapaConsumo = donde1;
        this.divPerfilDiario = donde2;
        var g_consumo = {
            z: consumo.diaHora,
/*             y: consumo.idxTable.map((e) => {return (e.dia + " - " + TCB.i18next.t(UTIL.nombreMes[e.mes]))}), */
            y: consumo.idxTable.map((e) => { 
                if (e.fecha !== '') 
                    return (e.fecha.getDate() + " - " + TCB.i18next.t(UTIL.nombreMes[e.fecha.getMonth()]))
            }),
            type: 'heatmap',
            colorscale: 
             [
                ['0.0', 'rgb(255,255,224)'],
                ['0.10', 'rgb(255,255,224)'],
                ['0.10', 'rgb(144,238,144)'],
                ['0.25', 'rgb(144,238,144)'],
                ['0.25', 'rgb(0,255,255)'],
                ['0.5', 'rgb(0,255,255)'],
                ['0.5', 'rgb(255,127,80)'],
                ['0.75', 'rgb(255,127,80)'],
                ['1.0', 'rgb(254,0,0)']
            ],
            line: {
                width:0.1,
                smoothing: 0
            },
            zsmooth: 'best',
            connectgaps: true,
            //showlegend: true,
            showscale: true,
            hovertemplate:
            "%{yaxis.title.text}: %{y}<br>" +
            "%{xaxis.title.text}: %{x}<br>" +
           TCB.i18next.t('graficos_LBL_graficasConsumo') + ": %{z:.2f} kWh"
        };

        var layout_resumen = {
            xaxis:{title: TCB.i18next.t('graficos_LBL_graficasHora')},
            yaxis:{title: TCB.i18next.t('graficos_LBL_graficasDia'),
                tickvals: UTIL.indiceDia.map((e) => {return (e[1])}),
                ticktext: this.mesMapa,
            },
            title: {
                text: TCB.i18next.t('graficos_LBL_mapaConsumo'),
                xref: 'paper',
                x: 0.5,
                yref: 'paper',
                y: 1.1},
            zaxis:{title: 'kWh'},
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            autosize: true,
            margin: {
                l: 50,
                r: 30,
                b: 65,
                t: 25
            },
            annotations: [{
                x: 0, y: UTIL.indiceDesdeFecha(consumo.fechaInicio),
                xref: 'x', yref: 'y',
                text: 'Inicio',
                xanchor: 'right',
                textangle: 0,
                ax: -20,
                ay: 0
            }],
            shapes: [{
                  type: 'line',
                  x0: -0.5, y0: UTIL.indiceDesdeFecha(consumo.fechaInicio),
                  x1: 23.5, y1: UTIL.indiceDesdeFecha(consumo.fechaInicio),
                  line: {color: 'rgb(255, 0, 0)', width: 1}
            }],
        };

        this.g_gestionTipoConsumo_MapaConsumo = Plotly.react(donde1, [g_consumo], layout_resumen);

        var gd = document.getElementById(donde1);
        gd.addEventListener('click', function(evt) {
            document.getElementById(donde2).style.display = "block";
            var posicion = this.getBoundingClientRect();
            //var xaxis = this._fullLayout.xaxis;
            var yaxis = this._fullLayout.yaxis;
            //var l = this._fullLayout.margin.l;
            var t = this._fullLayout.margin.t;
            //var r = gd._fullLayout.margin.r;
            //var w = gd._fullLayout.margin.width;

            //let xInDataCoord = xaxis.p2c(evt.x - l - posicion.right);
            let yInDataCoord = yaxis.p2c(evt.y - t - posicion.top);

            let dia = Math.round(yInDataCoord);
            let fecha = UTIL.fechaDesdeIndice(dia);
            TCB.graficos.gestionTipoConsumo_PerfilDiario(consumo, donde2, dia, fecha);
        });

        let dia = UTIL.indiceDesdeFecha(consumo.fechaInicio);
        this.gestionTipoConsumo_PerfilDiario(consumo, donde2, dia, UTIL.fechaDesdeIndice(dia));
    }

    gestionTipoConsumo_MapaMesHora ( consumo, donde) {

        this.divMapaMesHora = donde;
        this.colores = [];
        this.valores = [];
        this.text = [];
        this.sizes = [];

        this.maxConsumoMes = -Infinity;
        let radio = 20;
        for( let hora=0; hora<24; hora++) {
            let _valorHora = consumo.getHora(hora);
            let _consMes = new Array(12).fill(0);
            let _diasMes = new Array(12).fill(0);

            for (let dia = 0; dia < 365; dia++) {
/*                 _consMes[consumo.idxTable[dia].mes] += _valorHora[dia];
                _diasMes[consumo.idxTable[dia].mes]++; */
                   _consMes[consumo.idxTable[dia].fecha.getMonth()] += _valorHora[dia];
                _diasMes[consumo.idxTable[dia].fecha.getMonth()]++;   
            }
            for (let mes = 0; mes < 12; mes++) {
                this.horas.push(hora+1);
                this.meses.push(this.mesMapa[mes]);
                let valor = _consMes[mes] / _diasMes[mes];
                if (this.maxConsumoMes < valor) {
                    this.maxConsumoMes =  valor;
                    this.maxHora = hora+1;
                    this.maxMes = mes;
                }
                this.valores.push(valor);
                this.text.push(valor.toFixed(2)+'kWh');
            }
        }

        let tono;
        for (let valor of this.valores) {
            tono = parseInt(255 * valor / this.maxConsumoMes);
            let _r = tono;
            let _g = 255 - tono;
            let _b = 0;
            this.colores.push('rgb(' + _r + ',' + _g + ',' + _b + ')'); //"rgb("+tono+",0,0)");
            this.sizes.push(radio * valor / this.maxConsumoMes);
        }

        var layout = {
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            margin: {
                l: 50,
                r: 20,
                b: 65,
                t: 25
            },
            title: {
                text: TCB.i18next.t('graficos_LBL_mapaConsumoMesHora'),
                xref: 'x', 
                yref: 'y',
                x: 12,
                y: 14,
                },
            xaxis: {
                title:TCB.i18next.t('graficos_LBL_graficasHora'),
                showgrid:false,
                showline:true,
                linecolor:'rgb(102, 102, 102)',
                tickfont_color:'rgb(102, 102, 102)',
                showticklabels:true,
                dtick:4,
                ticks:'outside',
                tickcolor:'rgb(102, 102, 102)',
                },
            yaxis:{title: TCB.i18next.t('graficos_LBL_graficasMes'),
                    ticktext: this.meses,
                    showline:true,
                },
            hovermode: 'closest',
            annotations: [
                    {x: this.maxHora, y: this.maxMes,
                    axref: 'x', ayref: 'y',
                    xref: 'x', yref: 'y',
                    text: TCB.i18next.t('graficos_LBL_maxConsumoMes', {maxConsumoMes: this.maxConsumoMes.toFixed(2)}),
                    showarrow: true,
                    arrowhead: 3,
                    xanchor: 'center',
                    ax: 12,
                    ay: 12
                    }
                ],

        }

        var trace = {
            type: 'scatter',
            name: TCB.i18next.t('graficos_LBL_tituloConsumoMedio'),
            x: this.horas,
            y: this.meses,
            text: this.text,
            mode: 'markers',
            hovertemplate:
            "%{yaxis.title.text}: %{y}<br>" +
            "%{xaxis.title.text}: %{x}<br>" +
            "%{text}",
            marker: {symbol: 'circle',
                    size: this.sizes,
                    color: this.colores //'rgba(200, 50, 100, .7)',  
                },

        }
        Plotly.newPlot(donde, [trace], layout);
    }

    gestionResultados_PerfilDiario ( donde, dia, fecha) {

        this.divResPerfilDiario = donde;

        this.fecha[0]=fecha[0];
        this.fecha[1]=fecha[1];
        document.getElementById(donde).style.display = "block";
        var trace1 = {
            y: TCB.consumo.diaHora[dia],
            type: 'scatter',
            showlegend : true,
            name: TCB.i18next.t('graficos_LBL_graficasConsumo'),
            line: {shape: 'line', width:3, color:'rgb(0,0,255'},
            fill: 'tozeroy',
            //fill: 'tonexty',
        };

        var trace2 = {
            y: TCB.produccion.diaHora[dia],
            type: 'scatter',
            showlegend : true,
            name: TCB.i18next.t('graficos_LBL_graficasProduccion'),
            line: {shape: 'line', width:3, color:'rgb(0,255,0'},
            fill: 'tozeroy',
        };

        var layout = {
            legend: {
                x: 0.9,
                xref: 'paper',
                y: 1.1,
                yref: 'paper'
              },
            autosize: true,
            margin: {
                l: 50,
                r: 20,
                b: 65,
                t: 25
            },
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            title: {
                text: TCB.i18next.t("graficos_LBL_graficasDia") + ": " + this.fecha[0] + " - " + TCB.i18next.t(UTIL.nombreMes[parseInt(this.fecha[1])-1]),
                xref: 'paper',
                x: 0,
                yref: 'paper',
                y: 1.1},
            xaxis: {title: TCB.i18next.t('graficos_LBL_graficasHora'), dtick: 4},
            yaxis: {title: 'kWh', showline: true, zeroline: true, zerolinecolor :'#969696', gridcolor : '#bdbdbd', gridwidth : 2 }
        };
        Plotly.react(donde, [trace1, trace2], layout);
    }
    
    gestionResultados_ConsumoGeneracion3D ( donde) {
        this.divConsumoGeneracion3D = donde;
        var g_produccion = {
            z: TCB.produccion.diaHora,
/*             y: TCB.consumo.idxTable.map((e) => {
                let mes = parseInt(e.mes) + 1;
                return (e.dia + "/" + mes)}), */
            y: TCB.consumo.idxTable.map((e) => {
                let mes = parseInt(e.fecha.getMonth()) + 1;
                return (e.fecha.getDate() + "/" + mes)}),
            name: TCB.i18next.t('graficos_LBL_graficasProduccion'),
            type: 'surface',
            colorscale: 'YlOrRd',
            opacity:1,
            showlegend: true,
            showscale: false,
            contours: {"x": {show: true, usecolormap: true, project:{y: true}}, 
                    "y": {show: true, usecolormap: true, project:{x: true}}
            },
            hovertemplate:
                TCB.i18next.t('graficos_LBL_graficasDia') + ": %{y}<br>" +
                TCB.i18next.t('graficos_LBL_graficasHora') + ": %{x}<br>" +
                TCB.i18next.t('graficos_LBL_graficasProduccion') + ": %{z:.2f} kWh"
            };

        var g_consumo = {
            z: TCB.consumo.diaHora,
            //y: TCB.consumo.idxTable.map((e) => {return (e.dia + " - " + TCB.i18next.t(UTIL.nombreMes[e.mes]))}),
            y: TCB.consumo.idxTable.map((e) => {
                let mes = parseInt(e.fecha.getMonth()) + 1;
                return (e.fecha.getDate() + "/" + mes)}),
            name: TCB.i18next.t('graficos_LBL_graficasConsumo'),
            type: 'surface',
            colorscale: 'Picnic',
            opacity:0.8,
            showlegend:true,
            showscale: false,
            hovertemplate:
                TCB.i18next.t('graficos_LBL_graficasDia') + ": %{y}<br>" +
                TCB.i18next.t('graficos_LBL_graficasHora') + ": %{x}<br>" +
                TCB.i18next.t('graficos_LBL_graficasConsumo') + ": %{z:.2f} kWh"
            };

        var layout_resumen = {
            legend: {
                x: 0.5,
                xanchor: 'left',
                y: 1.1
              },
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            title: {
                text: TCB.i18next.t('graficos_LBL_graficasProduccion') + " vs " + TCB.i18next.t('graficos_LBL_graficasConsumo'),
                x: 0.1,
                y: 1.1},
            scene: {camera: {eye: {x: -2, y: -1.5, z: 1}},
                xaxis:{title: TCB.i18next.t('graficos_LBL_graficasHora')},
                yaxis:{title: TCB.i18next.t('graficos_LBL_graficasDia'),
                    tickvals: UTIL.indiceDia.map((e) => {return (e[1])}),
                    ticktext: this.mesMapa},
            zaxis:{title: 'kWh'}},
            autosize: false,
            margin: {
                l: 0,
                r: 0,
                b: 65,
                t: 25
            },
            }
            
        Plotly.react(donde, [g_consumo, g_produccion], layout_resumen);
        let gd = document.getElementById('graf_resumenBalance');
        gd.on('plotly_click', function(data){
            this.fecha = data.points[0].y.split('/').map( (a) => {return parseInt(a)});
            let dia = UTIL.indiceDesdeDiaMes(this.fecha[0], this.fecha[1] - 1);
            TCB.graficos.gestionResultados_PerfilDiario("graf_perfilDiaMixto", dia, this.fecha );
        });
    }

    gestionGraficos_BalanceEnergia (donde1, donde2){
        const autoconsumo = TCB.balance.resumenMensual('autoconsumo');
        const excedente = TCB.balance.resumenMensual('excedente');
        const deficit = TCB.balance.resumenMensual('deficit');
        const consumo = TCB.consumo.resumenMensual('suma');
        const produccion = TCB.produccion.resumenMensual('suma');
        var trace_produccion = {
            x: this.mesMapa, //UTIL.nombreMes,
            y: produccion,
            name: TCB.i18next.t('graficos_LBL_graficasProduccion'),
            type: 'scatter'
        };
        
        var trace_consumo = {
            x: this.mesMapa, 
            y: consumo,
            name: TCB.i18next.t('graficos_LBL_graficasConsumo'),
            type: 'scatter'
        };

        var trace_excedente = {
            x: this.mesMapa,
            y: excedente,
            name: TCB.i18next.t('graficos_LBL_graficasExcedente'),
            type: 'bar'
        };

        var trace_deficit = {
            x: this.mesMapa, 
            y: deficit,
            name: TCB.i18next.t('graficos_LBL_graficasDeficit'),
            type: 'bar'
        };

        var trace_autoconsumo = {
            x: this.mesMapa,
            y: autoconsumo,
            name: TCB.i18next.t('graficos_LBL_graficasAutoconsumo'),
            type: 'bar'
        };

        var layout = {
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            title: TCB.i18next.t('graficos_LBL_balanceProduccion', {potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal)}),
            barmode: 'stack',
            yaxis: {
                title: 'kWh'
            }
        };
      
        this.divBalanceProduccion = donde1;
        var data = [trace_produccion, trace_autoconsumo, trace_excedente];
        Plotly.react(donde1, data, layout);

        layout = {
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            title: TCB.i18next.t('graficos_LBL_balanceConsumo', {potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal)}),
            barmode: 'stack',
            yaxis: {
                title: 'kWh'
            }
        };
        this.divBalanceConsumo = donde2;
        var data1 = [trace_consumo, trace_autoconsumo, trace_deficit];
        Plotly.react(donde2, data1, layout);
    }

    gestionEconomico_BalanceEconomico (donde1, economico, finca){

        this.divBalanceEconomico = donde1;
        this.finca = finca;

        var _perdidas = new Array(12);
        var _compensado = new Array(12);
        for (let i=0; i<12; i++) { //las perdidas y lo compensado lo graficamos negativo
            _perdidas[i] = -economico.perdidaMes[i]; 
            _compensado[i] = -economico.compensadoMensualCorregido[i]; 
        }

        var trace_pagado = {
            x: this.mesMapa,
            y: economico.consumoConPlacasMensualCorregido,
            name: TCB.i18next.t('graficos_LBL_graficasGastoConPaneles'),
            type: 'scatter',
            line: {shape: 'line', width:3, color:'rgb(0,0,255'}
        };

        var trace_base = {
            x: this.mesMapa,
            y: economico.consumoConPlacasMensualCorregido,
            name: 'base',
            type: 'bar',
             hoverinfo: 'none',
            showlegend: false, 
            marker: {
                color: 'rgba(1,1,1,0.0)'
            }
        };

        var trace_consumo = {
            x: this.mesMapa,
            y: economico.consumoOriginalMensual,
            name: TCB.i18next.t('graficos_LBL_graficasGastoSinPaneles'),
            type: 'scatter',
            line: {shape: 'line', width:3, color:'rgb(255,0,0)'}
        }

        var trace_compensa = {
            x: this.mesMapa,
            y: _compensado,
            width: 0.1,
            marker: {color: 'rgb(204, 186, 57)'},
            name: TCB.i18next.t('graficos_LBL_graficasCompensacion'),
            type: 'bar'
        }

        var trace_ahorro = {
            x: this.mesMapa,
            y: economico.ahorradoAutoconsumoMes,
            width: 0.1,
            marker: {color: 'rgb(104, 158, 43)'},
            name: TCB.i18next.t('graficos_LBL_graficasAutoconsumo'),
            type: 'bar'
        }

         var trace_perdida = {
            x: this.mesMapa,
            y: _perdidas,
            width: 0.5,
            name: TCB.i18next.t('graficos_LBL_graficasNoCompensado'),
            base:0,
            type: 'bar'
        } 

        let titulo;
        if (TCB.modoActivo === INDIVIDUAL) {
            titulo = TCB.i18next.t('graficos_LBL_tituloBalanceEconomicoGlobal', {potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal)});
        }  else if (finca === undefined) {
            titulo = "Global: " + TCB.i18next.t('graficos_LBL_tituloBalanceEconomicoGlobal', {potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal)});
        } else {
            const _potenciaAsignada = TCB.produccion.potenciaTotal * finca.coefEnergia / 100;
            titulo = finca.nombreFinca + ": " + TCB.i18next.t('graficos_LBL_tituloBalanceEconomicoFinca', 
            {potencia: UTIL.formatoValor('potencia', _potenciaAsignada),
            paneles: (_potenciaAsignada / TCB.parametros.potenciaPanelInicio).toFixed(2)}); 
        }

        var layout = {
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            width: 800,
            height: 500,
            autoadjust: true,
            title: titulo,
            barmode: 'relative',
            yaxis: {
                title: 'Euros',
                gridcolor:'grey',
            },
            xaxis: {
                gridcolor:'grey'
            }
        };

        let data;
        if (finca !== undefined && finca.coefHucha > 0) {
            this.opcion = "ConHucha";
            var trace_huchaSaldo = {
                x: this.mesMapa,
                y: economico.huchaSaldo,
                name: TCB.i18next.t('graficos_LBL_huchaSaldo'),
                type: 'scatter',
                line: {shape: 'line', width:3, color:'orange'}
            };

            var trace_extraccionHucha = {
                x: this.mesMapa,
                y: economico.extraccionHucha,
                width: 0.1,
                marker: {color: 'rgb(0,255,0)'},
                name: TCB.i18next.t('graficos_LBL_extraccionHucha'),
                type: 'bar'
            }
            data = [ trace_consumo, trace_pagado, trace_huchaSaldo, trace_base, trace_compensa, trace_ahorro, trace_extraccionHucha];
        } else {
            this.opcion = "SinHucha";
            data = [ trace_consumo, trace_pagado, trace_base, trace_compensa, trace_ahorro, trace_perdida];
        }
        Plotly.react(donde1, data, layout);
    }

    gestionEconomico_PlotAlternativas (donde, potencia_kWp, paneles, TIR, autoconsumo, autosuficiencia, precioInstalacion, ahorroAnual, limiteSubvencion) {

        this.divPlotAlternativas = donde;
        this.potencia_kWp = potencia_kWp;

        var trace_TIR = {
            x: paneles,
            y: TIR,
            name: 'TIR(%)',
            type: 'scatter'
        };

        var trace_autosuficiencia = {
            x: paneles,
            y: autosuficiencia,
            name: TCB.i18next.t('graficos_LBL_graficasAutosuficiencia') + "(%)",
            type: 'scatter'
        };

        var trace_autoconsumo = {
            x: paneles,
            y: autoconsumo,
            name: TCB.i18next.t('graficos_LBL_graficasAutoconsumo') + "(%)",
            type: 'scatter'
        };

        var trace_precioInstalacion = {
            x: paneles,
            y: precioInstalacion,
            name: TCB.i18next.t('graficos_LBL_graficasInversion') + "(€)",
            yaxis : 'y2',
            type: 'scatter'
        };

        var trace_ahorroAnual = {
            x: paneles,
            y: ahorroAnual,
            name: TCB.i18next.t('graficos_LBL_graficasAhorro') + "(€)",
            yaxis : 'y2',
            type: 'scatter'
        };

        var numeroMaximoPaneles = 0;
        TCB.BaseSolar.forEach ( (base) => { numeroMaximoPaneles +=  Math.trunc(base.potenciaMaxima / base.instalacion.potenciaUnitaria)});

        var layout = {
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            width: 800,
            height: 500,
            title: TCB.i18next.t('graficos_LBL_alternativasPotencia', {potencia: UTIL.formatoValor('potencia',potencia_kWp)}),
            xaxis: {
                title: TCB.i18next.t('graficos_LBL_paneles')
            },
            yaxis: {
                title: '%'
            },
            yaxis2: {
                title: 'Euros',
                overlaying: 'y',
                side: 'right'
            },
            legend: {
                x:1.1, y:1.,
                orientation:'v'
            },
            shapes: [
                {
                type: 'line',
                x0: TCB.totalPaneles, y0: 0,
                x1: TCB.totalPaneles, y1: 100,
                line: {color: 'rgb(55, 128, 191)', width: 3}
                },
            ],
            annotations: [
                {
                    x: TCB.totalPaneles, y: 100,
                    xref: 'x', yref: 'y',
                    text: TCB.totalPaneles + " " + TCB.i18next.t("graficos_LBL_paneles"),
                    showarrow: true,
                    arrowhead: 2,
                    xanchor: 'left',
                    hovertext: TCB.i18next.t("graficos_LBL_panelesActuales",{paneles: TCB.totalPaneles}),
                    ax: 20,
                    ay: -20
                }
            ]
        };
        if (numeroMaximoPaneles === paneles[4]) {
            layout.annotations.push(
                {
                    x: numeroMaximoPaneles, y: 100,
                    xref: 'x', yref: 'y',
                    text: TCB.i18next.t("graficos_LBL_numeroMaximoPaneles", {'paneles': numeroMaximoPaneles}),
                    showarrow: true,
                    arrowhead: 3,
                    xanchor: 'right',
                    hovertext: TCB.i18next.t("graficos_LBL_maximoPanelesExplicacion", {'area':UTIL.formatoValor('superficie',TCB.areaTotal)}),
                    ax: -20,
                    ay: -5
                });
            layout.shapes.push(
                {
                    type: 'line',
                    x0: numeroMaximoPaneles, y0: 0,
                    x1: numeroMaximoPaneles, y1: 100,
                    line: {color: 'rgb(250, 20, 0)', width: 2}
                })
        }

        if (limiteSubvencion !== undefined) {
            layout.annotations.push({
                x: limiteSubvencion, y: 80,
                xref: 'x', yref: 'y',
                text: TCB.i18next.t("limiteSubvencionEU_LBL"),
                showarrow: true,
                arrowhead: 3,
                xanchor: 'left',
                hovertext: limiteSubvencion.toFixed(1) + " " + TCB.i18next.t("graficos_LBL_paneles"),
                ax: 20,
                ay: 0
            });
            layout.shapes.push({
                type: 'line',
                x0: 0, y0: 80,
                x1: limiteSubvencion, y1: 80,
                line: {color: 'rgb(87, 202, 0)', width: 2}
            },{
                type: 'line',
                x0: limiteSubvencion, y0: 0,
                x1: limiteSubvencion, y1: 80,
                line: {color: 'rgb(87, 202, 0)', width: 2}
            })
        }

        var data = [trace_TIR, trace_autoconsumo, trace_autosuficiencia, trace_precioInstalacion, trace_ahorroAnual];

        Plotly.react(donde, data, layout);

        var gd = document.getElementById(donde);
        var xInDataCoord;
        //var yInDataCoord;
    
        if (this.init) {
            this.init = false;
            gd.addEventListener('click', function(evt) {

                // Cuando click en zona del grafico llega un MouseEvent en caso contrario es un PointerEvent y lo ignoramos
                if (evt instanceof PointerEvent) return;

                if (TCB.totalPaneles != Math.round(xInDataCoord)) {
                    if (Math.round(xInDataCoord) > numeroMaximoPaneles) return;
                    TCB.totalPaneles = Math.round(xInDataCoord);
                    UTIL.debugLog("Grafico alternativas cambia a " + Math.round(TCB.totalPaneles ));

                    nuevoTotalPaneles ( TCB.totalPaneles);
                    calculaResultados();

                    gestionResultados('Prepara');  //Pensar esto no deberiamos llamar Prepara fuera del flujo normal
                    gestionEconomico('Prepara');
                    gestionGraficos('Prepara');
                }
            });
            
            gd.addEventListener('mousemove', function(evt) {

                if (evt instanceof PointerEvent) return;
                if (evt.pointerX === undefined) return; //console.log("label?");
                let tPaneles = gd.data[0].x;
                var bb = evt.target.getBoundingClientRect();
                xInDataCoord = gd._fullLayout.xaxis.p2d(evt.clientX - bb.left);
                //yInDataCoord = gd._fullLayout.yaxis.p2d(evt.clientY - bb.top);

                // Se limita el número de paneles que se puede seleccionar del gráfico desde 1 al máximo mostrado
                if (Math.round(xInDataCoord) > 0 && Math.round(xInDataCoord) <= tPaneles[tPaneles.length - 1]) {
                    Plotly.relayout(gd, 'title', 
                        [TCB.i18next.t('graficos_LBL_alternativasPotencia', {potencia: UTIL.formatoValor('potencia', potencia_kWp)}), 
                        TCB.i18next.t('graficos_LBL_cambiaPaneles', {paneles: Math.round(xInDataCoord)})].join("<br>"));
                }
            });
        }
    }

    gestionResultados_BalanceResultados( donde) {

        this.divBalanceResultados = donde;

        const stConsumo = "fill: yellow; stroke: black; border-radius: 8em";
        const stDeficit = "fill: orange; stroke: black; border-radius: 1em";
        const stAutoconsumo = "fill: #39CC56; stroke: black; border-radius: 1em";
        const stExcedente = "fill: orange; stroke: black; border-radius: 1em";
        const stProduccion = "fill: aquamarine; stroke: black; border-radius: 1em";
        const stFlujo = "fill: white; stroke: black; border-radius: 1em";
        const stTitulo = "font-size: 13px; text-anchor: middle; dominant-baseline: middle";
        //const stFlujo = "font-size: 11px; text-anchor: middle; dominant-baseline: middle";

        const svg = document.getElementById(donde);
        var altoLinea = 25;
        svg.setAttribute("height", 9 * altoLinea);
        svg.innerHTML = "";

        const anchoEnergia = TCB.balance.autoconsumo + TCB.balance.deficitAnual + TCB.balance.excedenteAnual;
        const anchoPanel = document.body.clientWidth * 0.8;
        const scale = anchoPanel / anchoEnergia;

        const wConsumo = TCB.consumo.cTotalAnual * scale;
        const wProduccion = TCB.produccion.pTotalAnual * scale;
        const wDeficit = TCB.balance.deficitAnual * scale;
        const wAutoconsumo = TCB.balance.autoconsumo * scale;
        const wExcedente = TCB.balance.excedenteAnual * scale;

        const leftMargin = anchoPanel * 0.15;
        let linea;
        let gSymbol;

        linea = 1;
        this._drawRectText (svg, leftMargin, linea, wConsumo, 
            TCB.i18next.t("cTotalAnual_LBL"), stFlujo, stTitulo);

        gSymbol = document.getElementById("graficoConsumo");
        gSymbol.style.left =  (leftMargin + wConsumo / 2 - 50).toFixed(0) + "px";
        gSymbol.style.display = 'inline-block';

        this._drawRectText (svg, leftMargin + wDeficit + wAutoconsumo, linea, wExcedente, 
            TCB.i18next.t("excedenteAnual_LBL"), stFlujo, stTitulo);
        gSymbol = document.getElementById("graficoExcedente");
        gSymbol.style.left =  (leftMargin + wDeficit + wAutoconsumo + wExcedente / 2 - 150).toFixed(0) + "px";
        gSymbol.style.display = 'inline-block'

        linea = 2;
        this._drawRectText (svg, leftMargin, linea, wConsumo, 
            UTIL.formatoValor("energia", TCB.consumo.cTotalAnual), stConsumo, stTitulo);
        this._drawRectText (svg, leftMargin + wDeficit + wAutoconsumo, linea, wExcedente, 
            UTIL.formatoValor("energia",TCB.balance.excedenteAnual), stExcedente, stTitulo);
        
        linea = 3;
        this._drawRectText (svg, leftMargin, linea, wDeficit, 
            UTIL.formatoValor("porciento", TCB.balance.deficitAnual / TCB.consumo.cTotalAnual * 100), stDeficit, stTitulo);
        this._drawRectText (svg, leftMargin + wDeficit, linea, wAutoconsumo, 
            UTIL.formatoValor("porciento", TCB.balance.autoconsumo / TCB.consumo.cTotalAnual * 100), stAutoconsumo, stTitulo);
        this._drawArrow(svg, leftMargin + wConsumo + wExcedente / 2 - 10, linea , 4, 'Excedente');
        this._drawArrow(svg, leftMargin + wDeficit / 2 - 10, linea + 1, 4, 'Deficit');

        linea = 5;
        this._drawElipseText (svg, leftMargin + wDeficit + wAutoconsumo / 2, linea, wAutoconsumo / 2, 
            [TCB.i18next.t("graficos_LBL_graficasAutoconsumo"),UTIL.formatoValor("energia", TCB.balance.autoconsumo)], stAutoconsumo, stTitulo);

        linea = 7;
        this._drawRectText (svg, leftMargin + wDeficit, linea, wAutoconsumo, 
            UTIL.formatoValor("porciento", TCB.balance.autoconsumo / TCB.produccion.pTotalAnual  * 100), stAutoconsumo, stTitulo);
        this._drawRectText (svg, leftMargin + wDeficit + wAutoconsumo, linea, wExcedente, 
            UTIL.formatoValor("porciento", TCB.balance.excedenteAnual / TCB.produccion.pTotalAnual  * 100), stExcedente, stTitulo);

        linea = 8;
        this._drawRectText (svg, leftMargin, linea, wDeficit, 
            UTIL.formatoValor("energia", TCB.balance.deficitAnual), stDeficit, stTitulo);
        this._drawRectText (svg, leftMargin + wDeficit, linea, wProduccion, 
            UTIL.formatoValor("energia", TCB.produccion.pTotalAnual), stProduccion, stTitulo);

        linea = 9;
        this._drawRectText (svg, leftMargin, linea, wDeficit, 
            TCB.i18next.t("graficos_LBL_energiaRed"), stFlujo, stTitulo);
        gSymbol = document.getElementById("graficoDeficit");
        gSymbol.style.left =  (leftMargin + wDeficit / 2 - 50).toFixed(0) + "px";
        gSymbol.style.display = 'inline-block';

        this._drawRectText (svg, leftMargin + wDeficit, linea, wProduccion, 
            TCB.i18next.t("graficos_LBL_energiaPaneles"), stFlujo, stTitulo);
        gSymbol = document.getElementById("graficoProduccion");
        gSymbol.style.left =  (leftMargin + wDeficit + wProduccion / 2 - 150).toFixed(0) + "px";
        gSymbol.style.display = 'inline-block'

    }

    gestionResultados_TartaGrupos( donde) {

        let datos = new Array(Finca.getGrupos.values.length).fill(0);
        let tipos = Finca.getGrupos.values.map( (a) => {return a});
        let _pos;
        for (let finca of TCB.Participes) {
            if (finca.grupo === "Zonas Comunes") {
                _pos = tipos.push(finca.nombreFinca);
                datos[_pos-1] = UTIL.selectTCB('TipoConsumo', 'nombreTipoConsumo', 
                                                            finca.nombreTipoConsumo)[0].cTotalAnual;
            } else if (finca.nombreTipoConsumo !== 'Participe sin consumo') {
                let _pos = Finca.getGrupos.values.findIndex( (grupo) => {return finca.grupo === grupo});
                datos[_pos] += UTIL.selectTCB('TipoConsumo', 'nombreTipoConsumo', finca.nombreTipoConsumo)[0].cTotalAnual;
            }
        }

        let pdatos = [];
        let pgrupo = [];
        let pvalor = [];
        for (let i=0; i<datos.length; i++) {
            if (datos[i] !== 0) {
                pdatos.push(datos[i]);
                pvalor.push(UTIL.formatoValor('energia',datos[i]));
                pgrupo.push(tipos[i]); //Finca.getGrupos.values[i])
            }
        }

        var data = [{
            values: pdatos,
            labels: pgrupo,
            text: pvalor,
            type: 'pie',
            textinfo: "percent+text",
          }];
          
          var layout = {
            paper_bgcolor:'rgba(0,0,0,0)',
            plot_bgcolor:'rgba(0,0,0,0)',
            title: {
                text: TCB.i18next.t("Consumo por grupos"),
                xanchor: 'left',
                x: 0.,
                y: 1.5},
            legend: {
                x: 0.7,
                xanchor: 'left',
                y: 1.5
                },
/*             height: 300,
            width: 500, */
            automargin: true,
            autosize: true,
            /* margin: {
                l: 30,
                r: 0,
                b: 0,
                t: 25
            }, */
/*             margin: {
                l: 20,
                r: 0,
                b: 0,
                t: 70 
            },*/
          };
          
          Plotly.newPlot(donde, data, layout);
          
    }
    /**
     * 
     * @param {*} svg 
     * @param {*} x 
     * @param {*} linea 
     * @param {*} ancho 
     * @param {*} texto 
     * @param {*} estiloR 
     * @param {*} estiloT 
     */
    _drawRectText (svg, x, linea, ancho, texto, estiloR, estiloT) {
        // variable for the namespace 
        const svgns = "http://www.w3.org/2000/svg";

        const altoLinea = 25;
        let y = (linea - 1) * altoLinea;

        let rect = document.createElementNS(svgns, "rect");
        rect.setAttribute("style", estiloR);
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("rx", 10);
        rect.setAttribute("ry", 10);
        rect.setAttribute("width", ancho);
        rect.setAttribute("height", altoLinea);
        svg.appendChild(rect);

        let text = document.createElementNS(svgns, "text");
        text.setAttribute("style", estiloT);
        text.setAttribute("x" , x + ancho / 2);
        text.setAttribute("y" , y + altoLinea / 2);
        text.textContent = texto;
        svg.appendChild(text);
    }

    _drawElipseText (svg, x, linea, ancho, texto, estiloR, estiloT) {
        // variable for the namespace 
        const svgns = "http://www.w3.org/2000/svg";
        const altoLinea = 25;

        let y = (linea - 1) * altoLinea + altoLinea / 2;

        let rect = document.createElementNS(svgns, "ellipse");
        rect.setAttribute("style", estiloR);
        rect.setAttribute("cx", x);
        rect.setAttribute("cy", y);
        rect.setAttribute("rx", ancho);
        rect.setAttribute("ry", 3 * altoLinea / 2);
        svg.appendChild(rect);

        let labelText = document.createElementNS(svgns, "text");
        labelText.setAttribute("style", estiloT);
        labelText.setAttribute("x" , x);
        labelText.setAttribute("y" , y - altoLinea / 2);
        labelText.textContent = texto[0];
        svg.appendChild(labelText);

        let valueText = document.createElementNS(svgns, "text");
        valueText.setAttribute("style", estiloT);
        valueText.setAttribute("x" , x);
        valueText.setAttribute("y" , y + altoLinea / 2);
        valueText.textContent = texto[1];
        svg.appendChild(valueText);
    } 

    _drawArrow ( svg, x, linea, lineas, tipoFlecha) {
        // variable for the namespace 
        const svgns = "http://www.w3.org/2000/svg";
        const altoLinea = 25;
        let y = (linea - 1) * altoLinea;

        var img = document.createElementNS(svgns, 'image');
        let alto = lineas * altoLinea;

        const link='./datos/arrow' + tipoFlecha + '.svg';
        const XLink_NS = 'http://www.w3.org/1999/xlink'
        img.setAttributeNS(XLink_NS, 'xlink:href', link);
        img.setAttribute('height',alto);
        img.setAttribute('width',50);
        img.setAttribute('x', x);
        img.setAttribute('y', y);
        
        svg.appendChild(img);
    }

}
export default Graficos