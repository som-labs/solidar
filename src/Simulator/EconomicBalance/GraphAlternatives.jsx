import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import Typography from '@mui/material/Typography'

// REACT Solidar Components
import EconomicContext from './EconomicContext'

// Solidar objects
import TCB from '../classes/TCB'
import { nuevoTotalPaneles } from '../classes/optimizador'
import calculaResultados from '../classes/calculaResultados'

export default function GraphAlternatives() {
  const { t } = useTranslation()
  const { ecoData } = useContext(EconomicContext)

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
    numeroMaximoPaneles += TCB.BaseSolar[i].columnas * TCB.BaseSolar[i].filas
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

  const maxPrecio = precioInstalacion[4]
  let tickVals = []
  for (let i = 0; i <= 10; i++) tickVals.push(Math.trunc((i * 0.1 * maxPrecio) / 10) * 10)
  var trace_TIR = {
    x: paneles,
    y: TIR,
    name: 'TIR(%)',
    yaxis: 'y',
    type: 'scatter',
  }

  var trace_autosuficiencia = {
    x: paneles,
    y: autosuficiencia,
    name: t('Autosuficiencia') + '(%)',
    yaxis: 'y',
    type: 'scatter',
  }

  var trace_autoconsumo = {
    x: paneles,
    y: autoconsumo,
    name: t('Autoconsumo') + '(%)',
    yaxis: 'y',
    type: 'scatter',
  }

  var trace_precioInstalacion = {
    x: paneles,
    y: precioInstalacion,
    name: t('Inversion') + '(€)',
    yaxis: 'y2',
    type: 'scatter',
  }

  var trace_ahorroAnual = {
    x: paneles,
    y: ahorroAnual,
    name: t('Ahorro') + '(€)',
    yaxis: 'y2',
    type: 'scatter',
  }

  var layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    autosize: true,
    margin: {
      l: 40,
      r: 60,
      b: 0,
      t: 10,
    },
    // width: '100%',
    // height: 500,
    xaxis: {
      tick0: 1,
      showgrid: false,
      showline: true,
      linecolor: 'primary.light',
      tickfont_color: 'primary.light',
      showticklabels: true,
      dtick: 1,
      ticks: 'outside',
      tickcolor: 'primary.light',
      range: [1, paneles[4]],
    },
    yaxis: {
      title: '%',
      showticklabels: true,
      showgrid: true,
      showline: true,
      linecolor: 'primary.light',
      tickfont_color: 'primary.light',
      ticks: 'outside',
      tickcolor: 'primary.light',
      tickmode: 'auto',
      nticks: 20,
      range: [0, 100],
    },
    yaxis2: {
      // title: 'Euros',
      overlaying: 'y',
      side: 'right',
      showticklabels: true,
      showgrid: true,
      gridwidth: 0.1,
      gridcolor: 'primary.light',
      showline: true,
      linecolor: 'primary.light',
      tickfont_color: 'primary.light',
      ticks: 'outside',
      tickcolor: 'primary.light',
      ticksuffix: '€',
      tickvals: tickVals,
      range: [0, maxPrecio],
    },
    legend: {
      x: 0.1,
      y: -0.1,
      xref: 'paper',
      orientation: 'h',
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
        y: 95,
        xref: 'x',
        yref: 'y',
        text: t('GRAFICOS.LABEL_panelesActuales', {
          paneles: TCB.totalPaneles,
        }),
        showarrow: true,
        arrowhead: 2,
        xanchor: 'left',
        hovertext: t('GRAFICOS.LABEL_panelesActuales', {
          paneles: TCB.totalPaneles,
        }),
        ax: 20,
        ay: -20,
      },
    ],
  }
  if (numeroMaximoPaneles === paneles[4]) {
    layout.annotations.push({
      x: numeroMaximoPaneles,
      y: 85,
      xref: 'x',
      yref: 'y',
      text: t('GRAFICOS.LABEL_numeroMaximoPaneles', {
        paneles: numeroMaximoPaneles,
      }),
      showarrow: true,
      arrowhead: 3,
      xanchor: 'right',
      ax: -20,
      ay: 0,
    })
    layout.shapes.push({
      type: 'line',
      x0: numeroMaximoPaneles,
      y0: 0,
      x1: numeroMaximoPaneles,
      y1: 100,
      line: { color: 'rgb(250, 20, 0)', width: 2 },
    })
  }

  if (limiteSubvencion !== undefined) {
    layout.annotations.push({
      x: limiteSubvencion,
      y: 65,
      xref: 'x',
      yref: 'y',
      text: t('GRAFICOS.LABEL_limiteSubvencionEU'),
      showarrow: true,
      arrowhead: 3,
      xanchor: 'left',
      hovertext: limiteSubvencion.toFixed(1) + ' ' + t('graficos_LBL_paneles'),
      ax: 20,
      ay: 0,
    })
    layout.shapes.push(
      {
        type: 'line',
        x0: 0,
        y0: 80,
        x1: limiteSubvencion,
        y1: 80,
        line: { color: 'rgb(87, 202, 0)', width: 2 },
      },
      {
        type: 'line',
        x0: limiteSubvencion,
        y0: 0,
        x1: limiteSubvencion,
        y1: 80,
        line: { color: 'rgb(87, 202, 0)', width: 2 },
      },
    )
  }
  //PENDIENTE: decidir si el click permite cambiar los paneles
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
  //                     [t('graficos_LBL_alternativasPotencia', {potencia: UTIL.formatoValor('potencia', potencia_kWp)}),
  //                     t('graficos_LBL_cambiaPaneles', {paneles: Math.round(xInDataCoord)})].join("<br>"));
  //             }
  //         });
  //     }
  // }

  return (
    <>
      <Typography variant="h4" sx={{ mb: '1rem' }}>
        {t('ECONOMIC_BALANCE.TITLE_DATA_AS_PANELS')}
      </Typography>

      <Plot
        data={[
          trace_TIR,
          trace_autoconsumo,
          trace_autosuficiencia,
          trace_precioInstalacion,
          trace_ahorroAnual,
        ]}
        layout={layout}
        config={{ displayModeBar: false }}
        onClick={(event) => handleClick(event)}
      />
    </>
  )
}
