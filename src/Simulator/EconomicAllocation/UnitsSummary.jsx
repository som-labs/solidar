import { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Grid,
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'

import { useTheme } from '@mui/material/styles'
import { DataGrid } from '@mui/x-data-grid'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { useDialog } from '../../components/DialogProvider'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import { all } from 'ol/events/condition'

export default function UnitsSummary(props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const [openDialog, closeDialog] = useDialog()
  const { preciosValidos, fincas, zonasComunes, allocationGroup } =
    useContext(ConsumptionContext)

  const { grupo, units } = props
  const [totalCost, setTotalCost] = useState()

  function costeZCenFinca(participacion, zc) {
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
  const columns = [
    {
      field: 'nombreFinca',
      headerName: t('Finca.PROP.nombreFinca'),
      headerAlign: 'center',
      flex: 1,
      description: t('Finca.TOOLTIP.nombreFinca'),
      sortable: false,
    },
    {
      field: 'superficie',
      headerName: t('Finca.PROP.superficie'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 0.5,
      description: t('Finca.TOOLTIP.superficie'),
      sortable: false,
    },
    {
      field: 'participacion',
      renderHeader: () => (
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          {t('Finca.PROP.participacion')}
          <br />
          {'(' + allocationGroup[grupo].participacionT.toFixed(2) + '% )'}
        </div>
      ),

      align: 'center',
      type: 'text',
      flex: 1,
      description: t('Finca.TOOLTIP.participacion'),
      sortable: false,
    },
    {
      field: 'nombreTipoConsumo',
      headerName: t('TipoConsumo.PROP.nombreTipoConsumo'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 1,
      description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
      sortable: false,
      valueGetter: (params) =>
        params.row.participa ? params.row.nombreTipoConsumo : 'No participa',
    },
    {
      field: 'coefEnergia',
      headerName: 'Beta', //t('TipoConsumo.PROP.nombreTipoConsumo'),
      renderHeader: () => (
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          {'Beta'}
          <br />
          {'(' + UTIL.roundDecimales(allocationGroup[grupo].produccion * 100, 2) + '%)'}
        </div>
      ),
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      valueGetter: (params) => params.row.coefEnergia.toFixed(6),
      flex: 1,
      description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
      sortable: false,
    },
    {
      field: 'coste',
      headerName: 'Gasto', //t('TipoConsumo.PROP.nombreTipoConsumo'),
      renderHeader: () => (
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          {'Gasto'}
          <br />
          {'(' +
            UTIL.formatoValor(
              'dinero',
              allocationGroup[grupo].produccion *
                TCB.economico.precioInstalacionCorregido,
            ) +
            ' )'}
        </div>
      ),
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      valueGetter: (params) => UTIL.formatoValor('dinero', params.row.coste),
      flex: 1,
      description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
      sortable: false,
    },
  ]

  for (const gZC in allocationGroup) {
    if (allocationGroup[gZC].unidades === 0) {
      columns.push({
        field: gZC,

        renderHeader: () => (
          <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
            {allocationGroup[gZC].nombre}
            <br />
            {'(' +
              UTIL.formatoValor(
                'dinero',
                (allocationGroup[gZC].produccion *
                  TCB.economico.precioInstalacionCorregido *
                  allocationGroup[grupo].participacionT) /
                  allocationGroup[gZC].participacionT,
              ) +
              ' )'}
          </div>
        ),
        headerAlign: 'center',
        align: 'center',
        type: 'number',
        valueGetter: (params) =>
          UTIL.formatoValor('dinero', costeZCenFinca(params.row.participacion, gZC)),
        //flex: 1,
        width: 120,
        description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
        sortable: false,
      })
    }
  }

  columns.push({
    field: 'total',
    renderHeader: () => (
      <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
        {'Total'}
        <br />
        {'(' + UTIL.formatoValor('dinero', totalCost) + ' )'}
      </div>
    ),
    headerAlign: 'center',
    align: 'center',
    type: 'number',
    valueGetter: (params) => {
      let v = 0

      for (const zcid in allocationGroup[grupo].zonasComunes) {
        v += costeZCenFinca(params.row.participacion, zcid)
      }
      v += params.row.coefEnergia * TCB.economico.precioInstalacionCorregido

      return UTIL.formatoValor('dinero', v)
    },
    flex: 1,
    description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
    sortable: false,
  })

  function getRowId(row) {
    return row.idFinca
  }

  useEffect(() => {
    let v = 0
    for (const zcid in allocationGroup[grupo].zonasComunes) {
      if (allocationGroup[grupo].zonasComunes[zcid]) {
        v +=
          (allocationGroup[zcid].produccion * allocationGroup[grupo].participacionT) /
          allocationGroup[zcid].participacionT
      }
    }
    v += allocationGroup[grupo].produccion
    setTotalCost(v * TCB.economico.precioInstalacionCorregido)
  }, [])

  return (
    <Dialog
      fullScreen
      open={true}
      onClose={closeDialog}
      aria-labelledby="full-screen-dialog-title"
    >
      <DialogTitle id="full-screen-dialog-title">
        {'Unidades con uso ' + grupo}
      </DialogTitle>

      <DialogContent>
        <Grid container justifyContent={'center'} rowSpacing={4}>
          {preciosValidos && (
            <Grid item xs={11} sx={{ overflowX: 'auto' }}>
              <DataGrid
                sx={theme.tables.headerWrap}
                getRowId={getRowId}
                rows={units}
                columns={columns}
                hideFooter={false}
                rowHeight={30}
                autoHeight
                disableColumnMenu
                localeText={{ noRowsLabel: t('BASIC.LABEL_NO_ROWS') }}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="primary">
          {t('BASIC.LABEL_CLOSE')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
