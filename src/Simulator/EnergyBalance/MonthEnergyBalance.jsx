import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'

// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Container } from '@mui/material'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function MonthEnergyBalance(props) {
  const { t, i18n } = useTranslation()

  const { autoconsumo, excedente, deficit } = props.monthlyData

  const i18nextMes = () => {
    let _mes = []
    for (let i = 0; i < 12; _mes.push(TCB.i18next.t(UTIL.nombreMes[i++])));
    return _mes
  }
  const mesMapa = Array.from(i18nextMes())

  const trace_excedente = {
    x: mesMapa,
    y: excedente,
    name: TCB.i18next.t('GRAFICOS.LABEL_graficasExcedente'),
    type: 'bar',
  }

  const trace_deficit = {
    x: mesMapa,
    y: deficit,
    name: TCB.i18next.t('GRAFICOS.LABEL_graficasDeficit'),
    type: 'bar',
  }

  const trace_autoconsumo = {
    x: mesMapa,
    y: autoconsumo,
    name: TCB.i18next.t('GRAFICOS.LABEL_graficasAutoconsumo'),
    type: 'bar',
  }

  const layout = {
    legend: { orientation: 'h' },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    barmode: 'stack',
    yaxis: {
      title: 'kWh',
    },
  }

  return (
    <>
      <Container>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Typography variant="h4">
            {t('ENERGY_BALANCE.TITLE_MONTH_ENERGY_BALANCE')}
          </Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ENERGY_BALANCE.DESCRIPTION_MONTH_ENERGY_BALANCE'),
            }}
          />
          <br />
          <Typography variant="h5" textAlign={'center'}>
            {t('ENERGY_BALANCE.TITLE_GRAPH_MONTH_ENERGY_BALANCE', {
              potencia: UTIL.formatoValor('potencia', TCB.produccion.potenciaTotal),
            })}
          </Typography>
          <Plot
            data={[trace_deficit, trace_autoconsumo, trace_excedente]}
            layout={layout}
            style={{ width: '100%' }}
          />

          <br />
        </Box>
      </Container>
    </>
  )
}
