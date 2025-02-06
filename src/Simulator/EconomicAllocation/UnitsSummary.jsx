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
  Tooltip,
} from '@mui/material'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import { useTheme } from '@mui/material/styles'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { EconomicContext } from '../EconomicContext'
import { useDialog } from '../../components/DialogProvider'
import UnitEconomiBalance from './UnitEconomicBalance'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function UnitsSummary(props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const [openDialog, closeDialog] = useDialog()
  const { preciosValidos, fincas, zonasComunes, allocationGroup } =
    useContext(ConsumptionContext)
  const { setEcoData, costeZCenFinca } = useContext(EconomicContext)

  const { grupo, units } = props
  const [totalCost, setTotalCost] = useState()

  console.log(units)

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
      valueGetter: (params) =>
        UTIL.formatoValor(
          'dinero',
          params.row.coefEnergia * TCB.economico.precioInstalacionCorregido,
        ),
      flex: 1,
      description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
      sortable: false,
    },

    {
      field: 'ahorro',
      headerName: 'Ahorro', //t('TipoConsumo.PROP.nombreTipoConsumo'),
      renderHeader: () => (
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          {'Ahorro'}
          {/* <br />
          {'(' +
            UTIL.formatoValor(
              'dinero',
              units
                .filter((_f) => _f.participa)
                .reduce((_fe, t) => t + _fe.economico.ahorroAnual, 0),
            ) +
            ' )'} */}
        </div>
      ),
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      valueGetter: (params) =>
        params.row.coefEnergia > 0
          ? UTIL.formatoValor('dinero', params.row.economico.ahorroAnual)
          : 0,
      flex: 1,
      description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
      sortable: false,
    },
  ]

  for (const gZC of zonasComunes) {
    columns.push({
      field: gZC.nombre,
      renderHeader: () => (
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          {gZC.nombre}
          <br />
          {'(' +
            UTIL.formatoValor(
              'dinero',
              (allocationGroup[gZC.id].produccion *
                TCB.economico.precioInstalacionCorregido *
                allocationGroup[grupo].participacionT) /
                allocationGroup[gZC.id].participacionT,
            ) +
            ' )'}
        </div>
      ),
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      valueGetter: (params) =>
        UTIL.formatoValor(
          'dinero',
          costeZCenFinca(params.row, gZC).global *
            TCB.economico.precioInstalacionCorregido,
        ),
      //flex: 1,
      width: 120,
      description: t('coste de zona comun asignado a la unidad'),
      sortable: false,
    })
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
      for (const zc of zonasComunes) {
        v += costeZCenFinca(params.row, zc).global
      }
      v += params.row.coefEnergia
      return UTIL.formatoValor('dinero', v * TCB.economico.precioInstalacionCorregido)
    },
    flex: 1,
    description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
    sortable: false,
  })
  columns.push({
    field: 'actions',
    type: 'actions',
    headerName: t('BASIC.LABEL_ACCIONES'),
    sortable: false,
    getActions: (params) => [
      <GridActionsCellItem
        key={1}
        icon={
          <Tooltip title={t('Showbalance')}>
            <AnalyticsIcon />
          </Tooltip>
        }
        label="ShowBalance"
        onClick={() => showEconomicBalance(params.id)}
      />,
    ],
  })

  function showEconomicBalance(idFinca) {
    const fincaActiva = fincas.find((_f) => _f.idFinca === idFinca)
    openDialog({
      children: (
        <UnitEconomiBalance
          maxWidth={'lg'}
          fullWidth={true}
          finca={fincaActiva}
          onClose={closeDialog}
        ></UnitEconomiBalance>
      ),
    })
  }

  function getRowId(row) {
    return row.idFinca
  }

  useEffect(() => {
    let v = 0
    //Coste de la produccion de las zonas comunes que debe hacerse cargo este grupo
    for (const zcid in allocationGroup[grupo].zonasComunes) {
      if (allocationGroup[grupo].zonasComunes[zcid]) {
        v +=
          (allocationGroup[zcid].produccion * allocationGroup[grupo].participacionT) /
          allocationGroup[zcid].participacionT
      }
    }
    //Coste de la produccion propia
    v += allocationGroup[grupo].produccion
    setTotalCost(v * TCB.economico.precioInstalacionCorregido)
  }, [])

  // console.log(units.filter((_f) => _f.participa))
  // console.log(
  //   units
  //     .filter((_f) => _f.participa)
  //     .reduce((_fe, t) => t + _fe.economico.ahorroAnual, 0),
  // )
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
