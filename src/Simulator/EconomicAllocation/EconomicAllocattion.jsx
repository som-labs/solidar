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
//React global components
import { SLDRInfoBox, SLDRCollapsibleCard } from '../../components/SLDRComponents'
import { DataGrid, GridToolbarContainer, GridActionsCellItem } from '@mui/x-data-grid'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
import AddBoxIcon from '@mui/icons-material/AddBox'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import UnitTypeBox from './UnitTypeBox'
import { AlertContext } from '../components/Alert'
import HelpConsumption from '../Consumption/HelpConsumption'
// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { EconomicContext } from '../EconomicContext'
//Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import Finca from '../classes/Finca'

//React global components
import { useDialog } from '../../components/DialogProvider'

export default function EconomicAllocationStep() {
  const { t } = useTranslation()
  const theme = useTheme()

  const { inLineHelp } = useContext(AlertContext)

  const {
    fincas,
    setFincas,
    zonasComunes,
    setZonasComunes,
    repartoValido,
    setRepartoValido,
    allocationGroup,
    setAllocationGroup,
  } = useContext(ConsumptionContext)

  const { units, setUnits } = useContext(EconomicContext)

  const [openDialog, closeDialog] = useDialog()
  const allocationBox = useRef()
  const boxWidth = useRef()

  const opcionesReparto = ['PARTICIPACION', 'CONSUMO', 'PARITARIO', 'NO']

  let columns = []
  columns.push({
    field: 'id',
    headerName: 'Grupo',
    headerAlign: 'center',
    flex: 1,
    sortable: false,
    type: 'text',
  })

  for (const zc of zonasComunes) {
    if (zc.coefEnergia > 0) {
      columns.push({
        field: zc.nombre,
        headerName: zc.nombre,
        headerAlign: 'center',
        align: 'center',
        type: 'singleSelect',
        valueOptions: opcionesReparto,
        editable: true,
        flex: 1,
        description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
        sortable: false,
      })
    }
  }

  useEffect(() => {
    // Function to get the width of the element
    const getWidth = () => {
      if (allocationBox.current) {
        boxWidth.current = allocationBox.current.offsetWidth / 3
        console.log(allocationBox.current.offsetWidth)
        console.log(boxWidth.current)
      }
    }

    // Call the function to get the width after initial render
    getWidth()

    //Distribuye el coste correspondiente al grupo en funcion del beta asignado a cada finca
    for (const f of TCB.Finca) {
      f.coste = TCB.economico.precioInstalacionCorregido * f.coefEnergia
    }

    // Matriz de aasignacion de coste de ZC a grupo. A priori todos los grupos pagan todas la ZC
    if (units.length === 0) {
      console.log('Building units')
      for (const grupo in allocationGroup) {
        if (allocationGroup[grupo].unidades > 0) {
          let tRow = {}
          tRow.id = grupo
          for (const zc in zonasComunes) {
            tRow[zonasComunes[zc].nombre] = 'PARTICIPACION' //Por defecto distribuimos por coef participacion DGC
          }
          setUnits((prevData) => [...prevData, tRow])
        }
      }
    }
  }, [])

  function distribuyeCosteZonaComun(zonaComun, grupo, criterio, coef) {
    // console.log(
    //   'Distribuye: ' +
    //     coef +
    //     ' de ' +
    //     zonaComun +
    //     ' entre ' +
    //     grupo +
    //     ' con criterio ' +
    //     criterio,
    // )
    if (coef === 0) return //Nada que distribuir

    let totP
    switch (criterio) {
      case 'PARTICIPACION':
        // Cual es la participacion total de las Fincas que participan del gasto de esta zona comun
        totP = TCB.Finca.filter((f) => f.extraCost[zonaComun] > 0).reduce(
          (a, b) => a + b.participacion,
          0,
        )
        for (const f of TCB.Finca) {
          if (f.grupo === grupo && f.participa) {
            // console.log(
            //   f.nombreFinca,
            //   coef,
            //   f.participacion,
            //   allocationGroup[grupo].participacion,
            //   (coef * f.participacion) / allocationGroup[grupo].participacion,
            // )
            f.extraCost[zonaComun] = (coef * f.participacion) / totP
          }
        }
        break
      case 'CONSUMO':
        for (const f of TCB.Finca) {
          if (f.grupo === grupo && f.participa) {
            f.extraCost[zonaComun] =
              (coef * f.coefConsumo) / allocationGroup[grupo].consumo
          }
        }
        break
      case 'PARITARIO':
        for (const f of TCB.Finca) {
          if (f.grupo === grupo && f.participa) {
            f.extraCost[zonaComun] = coef / allocationGroup[grupo].unidades
          }
        }
        break

      case 'NO':
        for (const f of TCB.Finca) {
          if (f.grupo === grupo && f.participa) {
            f.extraCost[zonaComun] = 0
          }
        }
        break
    }
    setFincas(TCB.Finca)
  }

  function distribuyeZonasComunes(unidades) {
    //console.log(unidades)
    for (const zc of TCB.ZonaComun) {
      for (const u of unidades) {
        if (u[zc.nombre] === 'NO') {
          for (const f of TCB.Finca) {
            if (f.grupo === u.id) f.extraCost[zc.nombre] = 0
          }
        }
        // console.log(
        //   'Vamos a distribuyeCosteZonaComun',
        //   zc.nombre,
        //   u.id,
        //   u[zc.nombre],
        //   zc.coefEnergia,
        // )
        distribuyeCosteZonaComun(zc.nombre, u.id, u[zc.nombre], zc.coefEnergia)
      }
    }
  }

  function changeDistributionGroup(newGroupRow, oldGroupRow) {
    console.log('Cambiando:', oldGroupRow)
    console.log('a: ', newGroupRow)

    const updatedZonaComun = Object.keys(newGroupRow).filter(
      (key) => newGroupRow[key] !== oldGroupRow[key],
    )
    console.log('Updated zona comun:', updatedZonaComun)
    console.log('nuevo criterio ' + newGroupRow[updatedZonaComun])
    console.log(units)

    const newDistributionGroup = units.map((u) => {
      if (u.id === newGroupRow.id) {
        u[updatedZonaComun] = newGroupRow[updatedZonaComun]
      }
      return u
    })

    console.log('NewdistributionGroup', newDistributionGroup)
    setUnits(newDistributionGroup)

    distribuyeZonasComunes(units)
    //distributeAllocation(grupo, allocationGroup[grupo].produccion, evt.value)
  }

  function handleProcessRowUpdateError(params) {
    console.log('Error:', params)
  }

  function help(level) {
    if (level === 1)
      openDialog({
        children: <HelpConsumption onClose={() => closeDialog()} />,
      })
  }

  function generaFicheroResumen() {
    const rowList = []
    for (const f of TCB.Finca) {
      const e = {
        nombre: f.nombreFinca,
        grupo: f.grupo,
        coste: f.coste,
        participacion: f.participacion,
        beta: f.coefEnergia,
      }
      for (const zc of TCB.ZonaComun) {
        e[zc.nombre] = f.extraCost[zc.nombre] * TCB.economico.precioInstalacionCorregido
      }
      rowList.push(e)
    }

    UTIL.dumpData(TCB.parametros.CAU + '_reparto.txt', rowList)
  }

  //   console.log(units)
  //   console.log(columns)
  if (units.length > 0) distribuyeZonasComunes(units)
  return (
    <Container>
      <>
        <Grid container rowSpacing={3}>
          <Grid item xs={12}>
            <Typography
              variant="body"
              dangerouslySetInnerHTML={{
                __html: t('ECONOMIC_ALLOCATION.DESCRIPTION'),
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
              {UTIL.formatoValor('dinero', TCB.economico.precioInstalacionCorregido)}
            </Typography>
          </Grid>
        </Grid>

        <Box
          ref={allocationBox}
          justifyContent="space-between" // Equal spacing between boxes
          alignItems="center" // Vertically align items (optional)
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: 1,
            mt: 4,
          }}
        >
          <Box>
            <Typography variant="h5" textAlign={'center'}>
              Criterio para distribucion de costes de las zonas comunes
            </Typography>
          </Box>
          {units ? (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                border: 1,
                mt: 4,
              }}
            >
              <DataGrid
                sx={theme.tables.headerWrap}
                rows={units}
                columns={columns}
                hideFooter={true}
                autosizeOptions={{
                  columns: columns.map((c) => c.name),
                  includeOutliers: true,
                  includeHeaders: true,
                }}
                rowHeight={30}
                autoHeight
                disableColumnMenu
                localeText={{ noRowsLabel: t('BASIC.LABEL_NO_ROWS') }}
                processRowUpdate={(updatedRow, originalRow) =>
                  changeDistributionGroup(updatedRow, originalRow)
                }
                onProcessRowUpdateError={handleProcessRowUpdateError}
                editMode="cell"
                //slots={{ toolbar: changeCriterio }} //, footer: footerSummary }}
              />
            </Box>
          ) : (
            'loading...'
          )}
        </Box>

        {units ? (
          <>
            <Grid item xs={12}>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('ECONOMIC_ALLOCATIONS.DESCRIPTION_2'),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {Object.entries(allocationGroup).map((key, value) => (
                  <Fragment key={key}>
                    {/* <Box sx={{ display: 'flex', flex: 1, width: '400px' }}>
                      <UnitTypeBox grupo={key[0]}></UnitTypeBox>
                    </Box> */}
                    <SLDRCollapsibleCard expanded={false} title={key[0]}>
                      <SLDRInfoBox>
                        <UnitTypeBox grupo={key[0]}></UnitTypeBox>
                      </SLDRInfoBox>
                    </SLDRCollapsibleCard>
                  </Fragment>
                ))}
              </Box>
            </Grid>
          </>
        ) : (
          ' '
        )}
      </>

      <Button onClick={() => UTIL.dumpData('EconomicAllocation.csv', TCB.Finca)}>
        Exportar
      </Button>
      <Button onClick={generaFicheroResumen}>Fichero reparto</Button>
      <Button>Importar</Button>
    </Container>
  )
}
