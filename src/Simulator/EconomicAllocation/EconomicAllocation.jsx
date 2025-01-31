import { useContext, Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Grid, Typography, Container, Box, Button } from '@mui/material'
//React global components
import { SLDRInfoBox, SLDRCollapsibleCard } from '../../components/SLDRComponents'
import { DataGrid } from '@mui/x-data-grid'

import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import UnitTypeBox from './UnitTypeBox'
import { useAlert } from '../../components/AlertProvider.jsx'
import HelpConsumption from '../Consumption/HelpConsumption'
// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { EconomicContext } from '../EconomicContext'
//Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

//React global components
import { useDialog } from '../../components/DialogProvider'

export default function EconomicAllocationStep() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { ecoData, setEcoData } = useContext(EconomicContext)
  const { fincas, setFincas, zonasComunes, allocationGroup, setAllocationGroup } =
    useContext(ConsumptionContext)

  const [ready, setReady] = useState(false)
  const [matrix, setMatrix] = useState({})

  const [openDialog, closeDialog] = useDialog()
  const { SLDRAlert } = useAlert()
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

  for (const _zc of zonasComunes) {
    if (_zc.coefEnergia > 0) {
      columns.push({
        field: _zc.id,
        headerName: _zc.nombre,
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
    let tmatrix = {}
    for (const _g in allocationGroup) {
      if (allocationGroup[_g].unidades > 0) {
        if (!tmatrix[_g]) tmatrix[_g] = { id: _g, ...allocationGroup[_g].zonasComunes }
      }
    }
    setMatrix(tmatrix)
    setReady(true)
  }, [])

  function changeDistributionGroup(newGroupRow, oldGroupRow) {
    setMatrix((prev) => ({ ...prev, [newGroupRow.id]: newGroupRow }))
    setAllocationGroup((prev) => {
      const tAlloc = prev
      for (const f in tAlloc[newGroupRow.id].zonasComunes) {
        tAlloc[newGroupRow.id].zonasComunes[f] = newGroupRow[f]
      }

      for (const gZC in tAlloc) {
        if (tAlloc[gZC].unidades === 0) {
          tAlloc[gZC].participacionT = 0
          for (const gDGC in tAlloc) {
            if (tAlloc[gDGC].unidades > 0) {
              if (tAlloc[gDGC].zonasComunes[gZC]) {
                tAlloc[gZC].participacionT += tAlloc[gDGC].participacionT
              }
            }
          }
        }
      }
      return tAlloc
    })

    return newGroupRow
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

  function costeZCenFinca(grupo, participacion, zc) {
    if (allocationGroup[grupo].zonasComunes[zc]) {
      return (
        ((allocationGroup[zc].produccion * participacion) /
          allocationGroup[zc].participacionT) *
        TCB.economico.precioInstalacionCorregido
      )
    } else {
      return 0
    }
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
        total: f.coste,
      }
      for (const zc of TCB.ZonaComun) {
        const c = UTIL.roundDecimales(costeZCenFinca(f.grupo, f.participacion, zc.id), 2)
        e[zc.nombre] = c
        e.total += c
      }
      rowList.push(e)
    }

    UTIL.dumpData(TCB.parametros.CAU + '_reparto.txt', rowList)
  }

  return (
    <Container>
      {ready ? (
        <>
          <Grid container rowSpacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('ECONOMIC_ALLOCATION.DESCRIPTION'),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography variant="h4">
                  {'Coste total a distribuir ' +
                    UTIL.formatoValor('dinero', ecoData.precioInstalacionCorregido)}
                </Typography>
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
                  rows={Object.values(matrix)}
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
          {matrix ? (
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
                  {Object.keys(allocationGroup).map((key) => (
                    <Fragment key={key}>
                      <SLDRCollapsibleCard
                        expanded={false}
                        title={allocationGroup[key].nombre}
                        sx={{ width: '45%' }}
                      >
                        <SLDRInfoBox>
                          <UnitTypeBox grupo={key}></UnitTypeBox>
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
          <Button onClick={() => UTIL.dumpData('EconomicAllocation.csv', TCB.Finca)}>
            {t('ECONOMIC_ALLOCATION.LABEL_EXPORT_CSV')}
          </Button>
          <Button onClick={generaFicheroResumen}>
            {t('ECONOMIC_ALLOCATION.LABEL_FICHERO_REPARTO')}
          </Button>{' '}
        </>
      ) : (
        ''
      )}
    </Container>
  )
}
