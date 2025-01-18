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
    title: t('ENERGY_ALLOCATION.TITLE_BAR_CHART'),
    barmode: 'stack', // Set bar mode to "stack"
    //xaxis: { title: 'Categories' },
    yaxis: { title: 'coeficiente sobre total' },
    width: graphWidth.current,
  }

  useEffect(() => {
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
      if (allocationGroup[g].produccion > 0) {
        tmp.push({
          x: ['consumo', 'produccion'],
          y: [allocationGroup[g].consumo, allocationGroup[g].produccion],
          name: g,
          type: 'bar',
        })
      }
    }

    setChartAllocation([...tmp])

    if (Math.abs(1 - tmp.reduce((a, b) => a + b.y[1], 0)) <= 0.001) applyBalance()
    else setRepartoValido(false)

    if (graphBox.current) Plotly.react(graphBox.current, tmp, layout)
  }, [allocationGroup])

  function applyBalance() {
    for (const grupo in allocationGroup) {
      if (allocationGroup[grupo].unidades > 0) {
        distributeAllocation(grupo, allocationGroup[grupo].produccion)
      } else {
        TCB.ZonaComun.find((zc) => zc.nombre === grupo).coefEnergia =
          allocationGroup[grupo].produccion
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
        ...prev[group],
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
      applyBalance()
    else {
      setRepartoValido(false)
    }
  }

  // console.log({
  //   variable: 'allocationgraph rendering group',
  //   chartAllocation: chartAllocation,
  //   allocationGroup: allocationGroup,
  // })

  function Semaphore({ state }) {
    const colors = {
      red: '#f44336',
      yellow: '#ffeb3b',
      green: '#4caf50',
    }
    let up
    let bottom

    if (state) {
      up = '#9e9e9e'
      bottom = colors.green
    } else {
      up = colors.red
      bottom = '#9e9e9e'
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          border: 1,
          padding: 2,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: up || '#9e9e9e', // Default to gray for invalid states
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
          }}
        ></Box>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: bottom || '#9e9e9e', // Default to gray for invalid states
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
          }}
        ></Box>
      </Box>
    )
  }

  return (
    <>
      <Container>
        {allocationGroup ? (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ textAlign: 'center' }} variant="h5">
                {t('ENERGY_ALLOCATION.ALLOCATION_GROUPS')}
              </Typography>
              <Typography
                sx={{ textAlign: 'center' }}
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('ENERGY_ALLOCATION.DESCRIPTION_1'),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  mt: 1,
                  mb: 2,
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                {Object.keys(allocationGroup)
                  .filter((g) => allocationGroup[g].produccion > 0)
                  .map((group, index) => {
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
                            onChange={(event) =>
                              changeAllocation(group, event.target.value)
                            }
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
                                allocationGroup[group].produccion *
                                  TCB.produccion.totalAnual,
                              ),
                            )}
                          </Grid>
                        </Grid>
                      </Fragment>
                    )
                  })}
              </Box>
              <Box>
                <Semaphore state={repartoValido}></Semaphore>
              </Box>
            </Box>
          </>
        ) : (
          ' '
        )}

        {/* <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('UNITS.DESCRIPTION_2'),
          }}
        /> */}
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
          <Box
            ref={graphBox}
            sx={{ display: 'flex', flex: 1, width: graphWidth.current }}
          ></Box>
        </Box>
      </Container>
    </>
  )
}
