import { useContext, Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'
import Plotly from 'plotly.js-dist'

// MUI objects
import { IconButton, Grid, Typography, Container, Box, Button } from '@mui/material'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
import AddBoxIcon from '@mui/icons-material/AddBox'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import UnitTypeBox from './UnitTypeBox'
import ZonaComunTypeBox from './ZonaComunTypeBox'
import { AlertContext } from '../components/Alert'
import HelpConsumption from '../Consumption/HelpConsumption'
// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'

//Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

//React global components
import { useDialog } from '../../components/DialogProvider'

export default function EnergyAllocationStep() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { inLineHelp } = useContext(AlertContext)
  const { fincas, setFincas, zonasComunes, setZonasComunes } =
    useContext(ConsumptionContext)

  const [allocation, setAllocation] = useState()
  const [openDialog, closeDialog] = useDialog()

  const allocationBox = useRef()
  const pieConsumption = useRef()
  const pieAllocation = useRef()

  const graphWidth = useRef()

  useEffect(() => {
    // Function to get the width of the element
    const getWidth = () => {
      if (allocationBox.current) {
        graphWidth.current = allocationBox.current.offsetWidth / 2
      }
    }

    // Call the function to get the width after initial render
    getWidth()
  }, [])

  function help(level) {
    if (level === 1)
      openDialog({
        children: <HelpConsumption onClose={() => closeDialog()} />,
      })
  }

  const uniqueConsumption = {}
  fincas.forEach((f) => {
    if (f.nombreTipoConsumo !== '') {
      const _consTC = TCB.TipoConsumo.find(
        (a) => a.nombreTipoConsumo === f.nombreTipoConsumo,
      ).totalAnual
      if (uniqueConsumption[f.grupo]) {
        uniqueConsumption[f.grupo] += _consTC
      } else {
        uniqueConsumption[f.grupo] = _consTC
      }
    }
  })

  zonasComunes.forEach((z) => {
    if (z.nombreTipoConsumo !== '') {
      const _consTC = TCB.TipoConsumo.find(
        (a) => a.nombreTipoConsumo === z.nombreTipoConsumo,
      ).totalAnual
      if (uniqueConsumption[z.nombre]) {
        uniqueConsumption[z.nombre] += _consTC
      } else {
        uniqueConsumption[z.nombre] = _consTC
      }
    }
  })
  setAllocation(uniqueConsumption)

  if (allocationBox.current) {
    // Extract labels and values from the new data
    const labels = Object.keys(uniqueConsumption)
    const values = Object.values(uniqueConsumption)

    // Trace configuration
    const traceConsumption = {
      labels: labels,
      values: values,
      type: 'pie',
      textinfo: 'label+percent',
      hoverinfo: 'label+value+percent',
      // marker: {
      //   colors: ['#ff7f0e', '#2ca02c', '#1f77b4'],
      // },
    }

    const traceAllocation = {
      labels: labels,
      values: allocation,
      type: 'pie',
      textinfo: 'label+percent',
      hoverinfo: 'label+value+percent',
      // marker: {
      //   colors: ['#ff7f0e', '#2ca02c', '#1f77b4'],
      // },
    }

    // Layout configuration
    const layoutConsumption = {
      title: 'Distribución consumo',
      height: 400,
      width: 400,
    }
    const layoutProduction = {
      title: 'Distribución producción',
      height: 400,
      width: 400,
    }

    // Use Plotly.react to efficiently update the chart
    Plotly.react(pieConsumption.current, [traceConsumption], layoutConsumption)
    Plotly.react(pieAllocation.current, [traceAllocation], layoutProduction)
  }

  return (
    <Container>
      <Grid container rowSpacing={3}>
        <Grid item xs={12}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ALLOCATION.DESCRIPTION_1'),
            }}
          />

          <IconButton
            onClick={() => help(1)}
            size="small"
            style={{
              color: theme.palette.helpIcon.main,
              fontSize: 'inherit',
              verticalAlign: 'text-center',
              transform: 'scale(0.8)',
              padding: 0,
            }}
          >
            <HelpIcon />
          </IconButton>
          <Typography variant="h4">
            {UTIL.formatoValor('energia', TCB.produccion.totalAnual)}
          </Typography>
        </Grid>

        <Box sx={{ border: 1, mt: 2, width: '100%' }}>
          Tipos
          {console.log(Object.keys(uniqueTypes))}
          {Object.keys(uniqueTypes).map((cons, index) => {
            return (
              <Fragment key={index}>
                <Grid
                  container
                  spacing={0.2}
                  alignItems="center"
                  justifyContent="space-evenly"
                >
                  <Grid item xs={3} sx={{ border: 0, textAlign: 'right', padding: 1 }}>
                    {cons}
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      fontWeight: 'bold',
                      border: 1,
                      borderRadius: 3,
                      textAlign: 'center',
                      padding: 0.5,
                      borderColor: 'primary.light',
                    }}
                  >
                    {UTIL.formatoValor(
                      'porciento',
                      Math.round((uniqueTypes[cons] / TCB.produccion.totalAnual) * 100),
                    )}
                  </Grid>
                </Grid>
              </Fragment>
            )
          })}
        </Box>
        <Box
          ref={allocationBox}
          justifyContent="space-between" // Equal spacing between boxes
          alignItems="center" // Vertically align items (optional)
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            border: 1,
            mt: 4,
          }}
        >
          <Box ref={pieConsumption} sx={{ display: 'flex', flex: 1 }}></Box>
          <Box ref={pieAllocation} sx={{ display: 'flex', flex: 1 }}></Box>
        </Box>

        <Grid item xs={12}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('UNITS.DESCRIPTION_2'),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            {Object.entries(uniqueTypes).map((key, value) => (
              <Fragment key={key}>
                <Box sx={{ display: 'flex', flex: 1 }}>
                  <UnitTypeBox tipo={key[0]}></UnitTypeBox>
                </Box>
              </Fragment>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: 2 }}
          >
            {TCB.ZonaComun.map((key, value) => (
              <Fragment key={key}>
                <Box sx={{ display: 'flex', flex: 1 }}>
                  <ZonaComunTypeBox zonaComun={key}></ZonaComunTypeBox>
                </Box>
              </Fragment>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Button>Exportar</Button>
      <Button>Importar</Button>
    </Container>
  )
}
