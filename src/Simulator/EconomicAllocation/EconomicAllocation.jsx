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
import InstallationCost from '../EconomicBalance/InstallationCost.jsx'

export default function EconomicAllocationStep() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { ecoData, setEcoData, costeZCenFinca } = useContext(EconomicContext)
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

  function generaFicheroResumen() {
    const rowList = []
    for (const f of TCB.Finca) {
      console.log(f)
      let costeTotal = 0
      let ahorroTotal = 0

      const e = {
        nombre: f.nombreFinca,
        grupo: f.grupo,
        participacion: f.participacion,
        beta: UTIL.roundDecimales(f.coefEnergia, 6),
        coste: UTIL.roundDecimales(
          TCB.economico.precioInstalacionCorregido * f.coefEnergia,
          2,
        ),
        ahorro: f?.economico ? UTIL.roundDecimales(f.economico.ahorroAnual, 2) : 0,
      }
      costeTotal = e.coste
      ahorroTotal = e.ahorro

      for (const zc of TCB.ZonaComun) {
        const cZC = UTIL.roundDecimales(
          costeZCenFinca(f, zc).global * TCB.economico.precioInstalacionCorregido,
          2,
        )
        e['Coste ' + zc.nombre] = cZC
        const aZC = UTIL.roundDecimales(
          costeZCenFinca(f, zc).local * zc.economico.ahorroAnual,
          2,
        )
        e['Ahorro ' + zc.nombre] = aZC
        costeTotal += cZC
        ahorroTotal += aZC
      }
      e['Coste total'] = UTIL.roundDecimales(costeTotal, 2)
      e['Ahorro total'] = UTIL.roundDecimales(ahorroTotal, 2)

      rowList.push(e)
    }

    UTIL.dumpData(TCB.parametros.CAU + '_reparto.txt', rowList)
  }

  return (
    <Container>
      {ready ? (
        <>
          <InstallationCost></InstallationCost>
          <Grid container rowSpacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('ECONOMIC_ALLOCATION.DESCRIPTION'),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography
                  sx={theme.titles.level_1}
                  textAlign={'center'}
                  marginTop="1rem"
                  color={theme.palette.primary.main}
                >
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
