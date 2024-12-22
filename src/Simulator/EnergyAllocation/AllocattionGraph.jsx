import { useContext, Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'
import Plotly from 'plotly.js-dist'

// MUI objects
import {
  IconButton,
  Grid,
  Typography,
  Container,
  Box,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material'
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
import Finca from '../classes/Finca'

//React global components
import { useDialog } from '../../components/DialogProvider'

export default function AllocationGraph(props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { inLineHelp } = useContext(AlertContext)

  const { repartoValido, setRepartoValido, allocationGroup, setAllocationGroup } =
    useContext(ConsumptionContext)

  const [balance, setBalance] = useState(false)
  const [chartAllocation, setChartAllocation] = useState([])

  const graphWidth = useRef()
  const graphBox = useRef()

  const layout = {
    title: 'Asignación de producción comparada<br /> con uso de energía',
    barmode: 'stack', // Set bar mode to "stack"
    //xaxis: { title: 'Categories' },
    yaxis: { title: 'coeficiente sobre total' },
  }

  useEffect(() => {
    console.log({ variable: 'Props in child useEffect', value: props })
    // Function to get the width of the element
    const getWidth = () => {
      if (graphBox.current) {
        graphWidth.current = graphBox.current.offsetWidth
      }
    }

    // Call the function to get the width after initial render
    getWidth()
  }, [])

  useEffect(() => {
    let tmp = []
    for (const g in allocationGroup) {
      console.log('Adding ' + g + ' to chartallocation')
      tmp.push({
        x: ['consumo', 'produccion'],
        y: [allocationGroup[g].consumo, allocationGroup[g].produccion],
        name: g,
        type: 'bar',
      })
    }

    setChartAllocation([...tmp])

    if (Math.abs(1 - tmp.reduce((a, b) => a + b.y[1], 0)) <= 0.001) setBalance(true)
    else setBalance(false)

    if (graphBox.current) Plotly.react(graphBox.current, tmp, layout)
  }, [allocationGroup])

  function applyBalance() {
    for (const g in allocationGroup) {
      if (g in Finca.mapaUsoGrupo) {
        distributeAllocation(g, allocationGroup[g].produccion)
      } else {
        TCB.ZonaComun.find((zc) => zc.nombre === g).coefEnergia =
          allocationGroup[g].produccion
      }
    }
    setRepartoValido(true)
  }

  function distributeAllocation(grupo, coefGrupo) {
    //Fincas que participan del grupo
    const participes = TCB.Finca.filter((f) => f.participa && f.grupo === grupo)
    const totalParticipation = participes.reduce((a, b) => a + b.participacion, 0) / 100

    for (const f of TCB.Finca) {
      if (f.participa && f.grupo === grupo) {
        f.coefEnergia = (f.participacion / 100 / totalParticipation) * coefGrupo
      }
    }
  }

  function changeAllocation(group, value) {
    setAllocationGroup((prev) => ({
      ...prev,
      [group]: {
        consumo: prev[group].consumo,
        criterio: prev[group].criterio,
        produccion: value / 100,
      },
    }))

    const chartItemIndex = chartAllocation.findIndex((e) => e.name === group)
    let newItem = chartAllocation[chartItemIndex]
    newItem.y[1] = value / 100
    setChartAllocation((prevItems) =>
      prevItems.map((item, i) => (i === chartItemIndex ? newItem : item)),
    )

    if (Math.abs(1 - chartAllocation.reduce((a, b) => a + b.y[1], 0)) <= 0.001)
      setBalance(true)
    else {
      setBalance(false)
      setRepartoValido(false)
    }

    //console.log({ variable: 'new chartallocation', value: chartAllocation })
  }

  // console.log({
  //   variable: 'allocationgraph rendering group',
  //   chartAllocation: chartAllocation,
  //   allocationGroup: allocationGroup,
  // })

  return (
    <>
      <Container>
        {allocationGroup ? (
          <Grid container rowSpacing={3}>
            <Box sx={{ mt: 4, width: '100%' }}>
              Grupos de asignación de energía producida
              {Object.keys(allocationGroup).map((group, index) => {
                return (
                  <Fragment key={index}>
                    <Grid
                      container
                      spacing={0.2}
                      alignItems="center"
                      justifyContent="space-evenly"
                    >
                      <Grid
                        item
                        xs={3}
                        sx={{ border: 0, textAlign: 'right', padding: 1 }}
                      >
                        {group}
                      </Grid>

                      <TextField
                        sx={{
                          mt: '0.1rem',
                          mb: '0.1rem',
                          fontWeight: 'bold',
                          border: 1,
                          borderRadius: 3,
                        }}
                        size="small"
                        type="number"
                        id="allocation"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="start">&nbsp;%</InputAdornment>
                          ),
                          inputProps: {
                            style: { textAlign: 'right' },
                          },
                        }}
                        value={UTIL.round2Decimales(
                          allocationGroup[group].produccion * 100,
                        )}
                        onChange={(event) => changeAllocation(group, event.target.value)}
                      />

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
                          'energia',
                          Math.round(
                            allocationGroup[group].produccion * TCB.produccion.totalAnual,
                          ),
                        )}
                      </Grid>
                    </Grid>
                  </Fragment>
                )
              })}
            </Box>
          </Grid>
        ) : (
          ' '
        )}
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('UNITS.DESCRIPTION_2'),
          }}
        />
        <Box
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
          <Box ref={graphBox} sx={{ display: 'flex', flex: 1 }}></Box>
        </Box>

        <Grid item xs={12}></Grid>

        {balance ? <Button onClick={applyBalance}>Aplicar</Button> : ' '}
      </Container>
    </>
  )
}
