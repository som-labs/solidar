import { useContext, Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plotly from 'plotly.js-dist'

// MUI objects
import {
  Grid,
  Typography,
  Container,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material'

import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { useAlert } from '../../components/AlertProvider.jsx'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { EnergyContext } from '../EnergyContext.jsx'

//Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

//React global components

export default function AllocationGraph() {
  const { t, i18n } = useTranslation()
  const { SLDRAlert } = useAlert()

  const [error, setError] = useState({ status: false, field: '' })
  const {
    repartoValido,
    setRepartoValido,
    allocationGroup,
    setAllocationGroup,
    zonasComunes,
    setZonasComunes,
    fincas,
    setFincas,
  } = useContext(ConsumptionContext)

  const { consumoGlobal, produccionGlobal } = useContext(EnergyContext)

  const [chartAllocation, setChartAllocation] = useState([])

  const graphWidth = useRef()
  const graphBox = useRef()

  const layout = {
    title: t('ENERGY_ALLOCATION.TITLE_BAR_CHART'),
    barmode: 'stack', // Set bar mode to "stack"
    yaxis: { title: t('ENERGY_ALLOCATION.GRAPH_Y_AXIS') },
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
    console.log(allocationGroup)
    let tmp = []
    for (const g in allocationGroup) {
      if (allocationGroup[g].produccion > 0) {
        tmp.push({
          x: [
            t('ENERGY_ALLOCATION.GRAPH_CONSUMPTION'),
            t('ENERGY_ALLOCATION.GRAPH_PRODUCCION'),
          ],
          y: [
            allocationGroup[g].consumo / consumoGlobal.totalAnual,
            allocationGroup[g].produccion,
          ],
          name: allocationGroup[g].nombre,
          id: g,
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
        zonasComunes.map((zc) => {
          if (zc.id === grupo) {
            zc.coefEnergia = allocationGroup[grupo].produccion
            return zc
          }
        })
      }
    }
    setRepartoValido(true)
  }

  function distributeAllocation(grupo, coefGrupo) {
    //Fincas que participan del grupo
    //const participes = TCB.Finca.filter((f) => f.participa && f.grupo === grupo)
    const totalParticipation =
      fincas
        .filter((f) => f.participa && f.grupo === grupo)
        .reduce((a, b) => a + b.participacion, 0) / 100

    fincas.map((f) => {
      if (f.grupo === grupo && f.participa) {
        f.coefEnergia = UTIL.roundDecimales(
          (f.participacion / 100 / totalParticipation) * coefGrupo,
          6,
        )
        console.log('AAAAAAAAAAAAA', f.coefEnergia)
        return f
      }
    })
  }

  function changeAllocation(group, value) {
    if (!UTIL.ValidateDecimal(i18n.language, value)) {
      setError({ status: true, field: group })
      return
    } else {
      setError({ status: false, field: group })
    }

    if (Number(value) < 0 || Number(value) > 100) {
      setError({ status: true, field: group })
      return
    } else {
      setError({ status: false, field: group })
    }

    if (Number(value) === 0) {
      SLDRAlert('ASIGNACIÓN NULA', t('ENERGY_ALLOCATION.NULL_ALLOCATION'), 'Warning')
      return
    }

    setAllocationGroup((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        consumo: prev[group].consumo,
        criterio: prev[group].criterio,
        produccion: value / 100,
      },
    }))

    const chartItemIndex = chartAllocation.findIndex((e) => e.id === group)
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
          justifyContent: 'center',
          alignItems: 'center',
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
        {!state ? (
          <Typography>
            {((1 - chartAllocation.reduce((a, b) => a + b.y[1], 0)) * 100).toFixed(2)}
          </Typography>
        ) : (
          ''
        )}
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
                            {allocationGroup[group].nombre}
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
                            error={error.status && error.field === group}
                            helperText={
                              error.status && error.field === group
                                ? t('BASIC.LABEL_NUMBER')
                                : ''
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
                                  produccionGlobal.totalAnual,
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
