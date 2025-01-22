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
import { useAlert } from '../../components/AlertProvider.jsx'
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

  const [totalCost, setTotalCost] = useState()

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

  const [groupZC, setGroupZC] = useState([])
  const [ready, setReady] = useState(false)
  const [tCost, setTCost] = useState(0)

  const [openDialog, closeDialog] = useDialog()
  const allocationBox = useRef()

  //La tabla de asignación de costes tiene una columna por cada zona comun y una fila por cada grupo
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
        type: 'boolean',
        editable: true,
        flex: 1,
        description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
        sortable: false,
      })
    }
  }

  useEffect(() => {
    //Distribuye el coste correspondiente al grupo en funcion del beta asignado a cada finca
    if (TCB.GroupsZC.length === 0) {
      //Asignacion del coste propio de cada unidad por el beta que le corresponde
      for (const f of TCB.Finca) {
        f.coste = UTIL.roundDecimales(
          TCB.economico.precioInstalacionCorregido * f.coefEnergia,
          2,
        )
      }

      // Matriz de aasignacion de coste de ZC a grupo. A priori todos los grupos pagan todas la ZC
      console.log('Building units ')

      for (const grupo in allocationGroup) {
        if (allocationGroup[grupo].unidades > 0) {
          let tRow = {}
          tRow.id = grupo
          for (const zc in zonasComunes) {
            tRow[zonasComunes[zc].nombre] = true
          }
          TCB.GroupsZC.push(tRow)
        }
      }
    }

    const vPropio = TCB.Finca.reduce((t, u) => t + u.coefEnergia, 0)
    const vExtra = TCB.Finca.reduce(
      (t, u) => t + Object.values(u.extraCost).reduce((st, e) => st + e, 0),
      0,
    )
    setTCost((vPropio + vExtra) * TCB.economico.precioInstalacionCorregido)
    distribuyeZonasComunes()
    setGroupZC(TCB.GroupsZC)
    setReady(true)
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

    let totP = 0
    switch (criterio) {
      case 'PARTICIPACION':
        // Cual es la participacion total de las Fincas que participan del gasto de esta zona comun
        for (const gZC of TCB.GroupsZC) {
          if (gZC[zonaComun]) {
            totP += allocationGroup[gZC.id].participacionT
          }
        }

        for (const f of TCB.Finca) {
          if (f.grupo === grupo) {
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

  function distribuyeZonasComunes() {
    for (const zc of TCB.ZonaComun) {
      for (const u of TCB.GroupsZC) {
        if (!u[zc.nombre]) {
          for (const f of TCB.Finca) {
            if (f.grupo === u.id) f.extraCost[zc.nombre] = 0
          }
        } else {
          distribuyeCosteZonaComun(
            zc.nombre,
            u.id,
            'PARTICIPACION', //allocationGroup[u.id].criterio, Independientemente de como se distribuya la energía dentro del grupo, las zonas comunes siempre se distribuyen por coeficiente de participacion
            zc.coefEnergia,
          )
        }
      }
    }
  }

  function changeDistributionGroup(newGroupRow, oldGroupRow) {
    const updatedZonaComun = Object.keys(newGroupRow).filter(
      (key) => newGroupRow[key] !== oldGroupRow[key],
    )

    TCB.GroupsZC.find((gZC) => gZC.id === newGroupRow.id)[updatedZonaComun] =
      newGroupRow[updatedZonaComun]

    distribuyeZonasComunes()
    setGroupZC(TCB.GroupsZC.map((a) => a))
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
        beta: UTIL.roundDecimales(f.coefEnergia, 6),
      }
      for (const zc of TCB.ZonaComun) {
        e[zc.nombre] = UTIL.roundDecimales(
          f.extraCost[zc.nombre] * TCB.economico.precioInstalacionCorregido,
          2,
        )
      }
      rowList.push(e)
    }

    UTIL.dumpData(TCB.parametros.CAU + '_reparto.txt', rowList)
  }

  //const getRowId = (row) => row.id
  //   console.log(units)
  //   console.log(columns)

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

            {/* <IconButton
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
            </IconButton> */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="h4">
                {'Coste total a distribuir ' +
                  UTIL.formatoValor('dinero', TCB.economico.precioInstalacionCorregido)}
              </Typography>
              {tCost ? (
                tCost.toFixed(0) !==
                TCB.economico.precioInstalacionCorregido.toFixed(0) ? (
                  <Typography variant="h4">
                    {'. Hay ' +
                      UTIL.formatoValor(
                        'dinero',
                        TCB.economico.precioInstalacionCorregido - tCost,
                      ) +
                      ' pendientes de asignar'}
                  </Typography>
                ) : (
                  ''
                )
              ) : (
                ''
              )}
            </Box>
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
            mt: 2,
          }}
        >
          <Box>
            <Typography variant="h5" textAlign={'center'}>
              {t('ECONOMIC_ALLOCATION.ALLOCATION_CRITERIA')}
            </Typography>
            <Typography variant="body" textAlign={'center'}>
              {t('ECONOMIC_ALLOCATION.SELECT_GROUPS')}
            </Typography>
          </Box>
          {ready ? (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                border: 1,
                mt: 1,
              }}
            >
              <DataGrid
                sx={theme.tables.headerWrap}
                //id={getRowId}
                rows={groupZC}
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

        {groupZC ? (
          <>
            {/* <Grid item xs={12}>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('ECONOMIC_ALLOCATIONS.DESCRIPTION_2'),
                }}
              />
            </Grid> */}

            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}
              >
                {Object.entries(allocationGroup).map((key, value) => (
                  <Fragment key={key}>
                    <SLDRCollapsibleCard
                      expanded={false}
                      title={key[0]}
                      sx={{ width: '45%' }}
                    >
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
        {t('ECONOMIC_ALLOCATION.LABEL_EXPORT_CSV')}
      </Button>
      <Button onClick={generaFicheroResumen}>
        {t('ECONOMIC_ALLOCATION.LABEL_FICHERO_REPARTO')}
      </Button>
    </Container>
  )
}
