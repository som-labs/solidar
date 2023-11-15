import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import Typography from '@mui/material/Typography'
import { Box } from '@mui/material'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import { nuevoTotalPaneles } from '../classes/optimizador'
import calculaResultados from '../classes/calculaResultados'

export default function GraphAlternatives() {
  const { t, i18n } = useTranslation()

  var paneles = []
  var autoconsumo = []
  var TIR = []
  var autosuficiencia = []
  var precioInstalacion = []
  var consvsprod = []
  var ahorroAnual = []

  // Calcula el numero maximo de paneles que soportan todas la bases
  let numeroMaximoPaneles = 0
  let configuracionOriginal = []
  for (let i = 0; i < TCB.BaseSolar.length; i++) {
    numeroMaximoPaneles +=
      TCB.BaseSolar[i].configuracion.columnas * TCB.BaseSolar[i].configuracion.filas
    configuracionOriginal.push({ base: i, paneles: TCB.BaseSolar[i].instalacion.paneles })
  }

  // El maximo numero de paneles a graficar es el doble de lo propuesto o el máximo numero de paneles
  let maximoPanelesEnX =
    numeroMaximoPaneles > 2 * TCB.totalPaneles
      ? 2 * TCB.totalPaneles
      : numeroMaximoPaneles
  var intentos = [
    1,
    0.25 * maximoPanelesEnX,
    0.5 * maximoPanelesEnX,
    0.75 * maximoPanelesEnX,
    maximoPanelesEnX,
  ]
  intentos.sort((a, b) => a - b)

  // Bucle del calculo de resultados para cada alternativa propuesta
  intentos.forEach((intento) => {
    if (intento >= 1) {
      // Establecemos la configuracion de bases para este numero de paneles
      nuevoTotalPaneles(intento)

      // Se realizan todos los calculos
      calculaResultados()

      // El grafico de alternativas se genera solo para consumo individual
      //   TCB.Participes[0].balance = TCB.balance;
      //   TCB.Participes[0].economico = new Economico(TCB.Participes[0]);
      //   TCB.economico = TCB.Participes[0].economico;

      // Se extraen los valores de las variables que forman parte del grafico
      paneles.push(intento)
      autoconsumo.push((TCB.balance.autoconsumo / TCB.produccion.pTotalAnual) * 100)
      autosuficiencia.push((TCB.balance.autoconsumo / TCB.consumo.cTotalAnual) * 100)
      consvsprod.push((TCB.consumo.cTotalAnual / TCB.produccion.pTotalAnual) * 100)
      TIR.push(TCB.economico.TIRProyecto)
      precioInstalacion.push(TCB.produccion.precioInstalacionCorregido)
      ahorroAnual.push(TCB.economico.ahorroAnual)
    }
  })

  //Dejamos las cosas como estaban al principio antes del loop
  for (let i = 0; i < configuracionOriginal.length; i++) {
    TCB.BaseSolar[configuracionOriginal[i].base].instalacion.paneles =
      configuracionOriginal[i].paneles
  }

  calculaResultados()
  // El grafico de alternativas se genera solo para consumo individual
  //   TCB.Participes[0].balance = TCB.balance;
  //   TCB.Participes[0].economico = new Economico(TCB.Participes[0]);
  //   TCB.economico = TCB.Participes[0].economico;

  //Buscamos punto en el que la produccion represente el 80% del consumo anual total para definir el limite subvencion EU
  let i = 0
  let limiteSubvencion
  while (consvsprod[i] > 80 && i < 5) {
    i++
  }
  if (i < 5) {
    let pendiente = (consvsprod[i] - consvsprod[i - 1]) / (paneles[i] - paneles[i - 1])
    let dif = 80 - consvsprod[i - 1]
    limiteSubvencion = paneles[i - 1] + dif / pendiente
  } else {
    limiteSubvencion = undefined
  }

  //A efectos de la produccion en funcion del numero de paneles se asume que todas las bases tienen la misma potencia unitaria
  const potencia_kWp = TCB.BaseSolar[0].instalacion.potenciaUnitaria
  var trace_TIR = {
    x: paneles,
    y: TIR,
    name: 'TIR(%)',
    type: 'scatter',
  }

  var trace_autosuficiencia = {
    x: paneles,
    y: autosuficiencia,
    name: TCB.i18next.t('Autosuficiencia') + '(%)',
    type: 'scatter',
  }

  var trace_autoconsumo = {
    x: paneles,
    y: autoconsumo,
    name: TCB.i18next.t('Autoconsumo') + '(%)',
    type: 'scatter',
  }

  var trace_precioInstalacion = {
    x: paneles,
    y: precioInstalacion,
    name: TCB.i18next.t('Inversion') + '(€)',
    yaxis: 'y2',
    type: 'scatter',
  }

  var trace_ahorroAnual = {
    x: paneles,
    y: ahorroAnual,
    name: TCB.i18next.t('Ahorro') + '(€)',
    yaxis: 'y2',
    type: 'scatter',
  }

  var layout = {
    // paper_bgcolor: 'rgba(0,0,0,0)',
    // plot_bgcolor: 'rgba(0,0,0,0)',
    width: '100%',
    height: 500,
    title: TCB.i18next.t('graficos_LBL_alternativasPotencia', {
      potencia: UTIL.formatoValor('potencia', potencia_kWp),
    }),
    xaxis: {
      title: TCB.i18next.t('paneles'),
    },
    yaxis: {
      title: '%',
    },
    yaxis2: {
      title: 'Euros',
      overlaying: 'y',
      side: 'right',
    },
    legend: {
      x: 1.1,
      y: 1,
      orientation: 'v',
    },
    shapes: [
      {
        type: 'line',
        x0: TCB.totalPaneles,
        y0: 0,
        x1: TCB.totalPaneles,
        y1: 100,
        line: { color: 'rgb(55, 128, 191)', width: 3 },
      },
    ],
    annotations: [
      {
        x: TCB.totalPaneles,
        y: 100,
        xref: 'x',
        yref: 'y',
        text: TCB.totalPaneles + ' ' + TCB.i18next.t('graficos_LBL_paneles'),
        showarrow: true,
        arrowhead: 2,
        xanchor: 'left',
        hovertext: TCB.i18next.t('graficos_LBL_panelesActuales', {
          paneles: TCB.totalPaneles,
        }),
        ax: 20,
        ay: -20,
      },
    ],
  }
  //   if (numeroMaximoPaneles === paneles[4]) {
  //     layout.annotations.push({
  //       x: numeroMaximoPaneles,
  //       y: 100,
  //       xref: 'x',
  //       yref: 'y',
  //       text: TCB.i18next.t('graficos_LBL_numeroMaximoPaneles', {
  //         paneles: numeroMaximoPaneles,
  //       }),
  //       showarrow: true,
  //       arrowhead: 3,
  //       xanchor: 'right',
  //       hovertext: TCB.i18next.t('graficos_LBL_maximoPanelesExplicacion', {
  //         area: UTIL.formatoValor('superficie', TCB.areaTotal),
  //       }),
  //       ax: -20,
  //       ay: -5,
  //     })
  //     layout.shapes.push({
  //       type: 'line',
  //       x0: numeroMaximoPaneles,
  //       y0: 0,
  //       x1: numeroMaximoPaneles,
  //       y1: 100,
  //       line: { color: 'rgb(250, 20, 0)', width: 2 },
  //     })
  //   }

  //   if (limiteSubvencion !== undefined) {
  //     layout.annotations.push({
  //       x: limiteSubvencion,
  //       y: 80,
  //       xref: 'x',
  //       yref: 'y',
  //       text: TCB.i18next.t('limiteSubvencionEU_LBL'),
  //       showarrow: true,
  //       arrowhead: 3,
  //       xanchor: 'left',
  //       hovertext:
  //         limiteSubvencion.toFixed(1) + ' ' + TCB.i18next.t('graficos_LBL_paneles'),
  //       ax: 20,
  //       ay: 0,
  //     })
  //     layout.shapes.push(
  //       {
  //         type: 'line',
  //         x0: 0,
  //         y0: 80,
  //         x1: limiteSubvencion,
  //         y1: 80,
  //         line: { color: 'rgb(87, 202, 0)', width: 2 },
  //       },
  //       {
  //         type: 'line',
  //         x0: limiteSubvencion,
  //         y0: 0,
  //         x1: limiteSubvencion,
  //         y1: 80,
  //         line: { color: 'rgb(87, 202, 0)', width: 2 },
  //       },
  //     )
  //   }

  function handleClick(evt) {
    console.log(evt)
  }
  //     Plotly.react(donde, data, layout);

  //     var gd = document.getElementById(donde);
  //     var xInDataCoord;
  //     //var yInDataCoord;

  //     if (this.init) {
  //         this.init = false;
  //         gd.addEventListener('click', function(evt) {

  //             // Cuando click en zona del grafico llega un MouseEvent en caso contrario es un PointerEvent y lo ignoramos
  //             if (evt instanceof PointerEvent) return;

  //             if (TCB.totalPaneles != Math.round(xInDataCoord)) {
  //                 if (Math.round(xInDataCoord) > numeroMaximoPaneles) return;
  //                 TCB.totalPaneles = Math.round(xInDataCoord);
  //                 UTIL.debugLog("Grafico alternativas cambia a " + Math.round(TCB.totalPaneles ));

  //                 nuevoTotalPaneles ( TCB.totalPaneles);
  //                 calculaResultados();

  //                 gestionResultados('Prepara');  //Pensar esto no deberiamos llamar Prepara fuera del flujo normal
  //                 gestionEconomico('Prepara');
  //                 gestionGraficos('Prepara');
  //             }
  //         });

  //         gd.addEventListener('mousemove', function(evt) {

  //             if (evt instanceof PointerEvent) return;
  //             if (evt.pointerX === undefined) return; //console.log("label?");
  //             let tPaneles = gd.data[0].x;
  //             var bb = evt.target.getBoundingClientRect();
  //             xInDataCoord = gd._fullLayout.xaxis.p2d(evt.clientX - bb.left);
  //             //yInDataCoord = gd._fullLayout.yaxis.p2d(evt.clientY - bb.top);

  //             // Se limita el número de paneles que se puede seleccionar del gráfico desde 1 al máximo mostrado
  //             if (Math.round(xInDataCoord) > 0 && Math.round(xInDataCoord) <= tPaneles[tPaneles.length - 1]) {
  //                 Plotly.relayout(gd, 'title',
  //                     [TCB.i18next.t('graficos_LBL_alternativasPotencia', {potencia: UTIL.formatoValor('potencia', potencia_kWp)}),
  //                     TCB.i18next.t('graficos_LBL_cambiaPaneles', {paneles: Math.round(xInDataCoord)})].join("<br>"));
  //             }
  //         });
  //     }
  // }
  console.log(
    trace_TIR,
    trace_autoconsumo,
    trace_autosuficiencia,
    trace_precioInstalacion,
    trace_ahorroAnual,
  )

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          boxShadow: 2,
          flex: 1,
          border: 2,
          textAlign: 'center',
          borderColor: 'primary.light',
          '& .MuiDataGrid-cell:hover': {
            color: 'primary.main',
          },
          // backgroundColor: 'rgba(220, 249, 233, 1)',
        }}
        justifyContent="center"
      >
        <Typography variant="h4">{t('Grafico alternativas')}</Typography>
        <Typography variant="body">{t('abc')}</Typography>
        <br></br>
        <br></br>
        <Box>
          <Plot
            data={[
              trace_TIR,
              trace_autoconsumo,
              trace_autosuficiencia,
              trace_precioInstalacion,
              trace_ahorroAnual,
            ]}
            layout={{ layout }}
            style={{ width: '100%' }}
            onClick={(event) => handleClick(event)}
          />
        </Box>
      </Box>
    </>
  )
}
