import { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  IconButton,
  Typography,
  Tooltip,
  Grid,
  MenuItem,
  Dialog,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'

import { SLDRInputField } from '../../components/SLDRComponents'
import { useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import EditIcon from '@mui/icons-material/Edit'
import { DataGrid, GridToolbarContainer, GridActionsCellItem } from '@mui/x-data-grid'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { useDialog } from '../../components/DialogProvider'
import DialogConsumption from '../Consumption/DialogConsumption'
import { SLDRFooterBox, SLDRInfoBox, SLDRTooltip } from '../../components/SLDRComponents'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import { formatoValor } from '../classes/Utiles'
import TipoConsumo from '../classes/TipoConsumo'

export default function UnitsSummary(props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const [openDialog, closeDialog] = useDialog()
  const { allocationGroup, setAllocationGroup, preciosValidos } =
    useContext(ConsumptionContext)

  const { grupo, units, setUnits } = props

  const [activo, setActivo] = useState() //Corresponde al objeto TipoConsumo en State que se esta manipulando
  const [totalCost, setTotalCost] = useState()

  const columns = [
    {
      field: 'nombreFinca',
      headerName: t('Finca.PROP.nombreFinca'),
      headerAlign: 'center',
      flex: 1,
      description: t('Finca.TOOLTIP.nombreFinca'),
      sortable: false,
    },
    // {
    //   field: 'refcat',
    //   headerName: t('Finca.PROP.refcat'),
    //   headerAlign: 'center',
    //   align: 'center',
    //   type: 'text',
    //   flex: 1,
    //   description: t('Finca.TOOLTIP.refcat'),
    //   sortable: false,
    // },
    // {
    //   field: 'planta',
    //   headerName: t('Finca.PROP.planta'),
    //   headerAlign: 'center',
    //   align: 'center',
    //   type: 'text',
    //   flex: 0.5,
    //   description: t('Finca.TOOLTIP.planta'),
    //   sortable: false,
    // },
    // {
    //   field: 'puerta',
    //   headerName: t('Finca.PROP.puerta'),
    //   headerAlign: 'center',
    //   align: 'center',
    //   type: 'text',
    //   flex: 0.5,
    //   description: t('Finca.TOOLTIP.puerta'),
    //   sortable: false,
    // },
    // {
    //   field: 'uso',
    //   headerName: t('Finca.PROP.uso'),
    //   headerAlign: 'center',
    //   align: 'center',
    //   type: 'text',
    //   flex: 1,
    //   description: t('Finca.TOOLTIP.uso'),
    //   sortable: false,
    // },
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
          {'(' +
            UTIL.roundDecimales(
              TCB.Finca.filter((e) => e.grupo === grupo).reduce(
                (a, b) => a + b.participacion,
                0,
              ),
              2,
            ) +
            '% )'}
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
        params.row.nombreTipoConsumo ? params.row.nombreTipoConsumo : 'Indefinido',
    },
    {
      field: 'coefEnergia',
      headerName: 'Beta', //t('TipoConsumo.PROP.nombreTipoConsumo'),
      renderHeader: () => (
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          {'Beta'}
          <br />
          {'(' +
            UTIL.roundDecimales(
              TCB.Finca.filter((e) => e.grupo === grupo).reduce(
                (a, b) => a + b.coefEnergia,
                0,
              ) * 100,
              2,
            ) +
            '%)'}
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
              units.reduce((t, u) => t + u.coefEnergia, 0) *
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

  for (const zc of TCB.ZonaComun) {
    columns.push({
      field: zc.nombre,
      headerName: zc.nombre, //t('TipoConsumo.PROP.nombreTipoConsumo'),
      renderHeader: () => (
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          {zc.nombre}
          <br />
          {'(' +
            UTIL.formatoValor(
              'dinero',
              TCB.Finca.filter((e) => e.grupo === grupo).reduce(
                (a, b) =>
                  a + b.extraCost[zc.nombre] * TCB.economico.precioInstalacionCorregido,
                0,
              ),
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
          params.row.extraCost[zc.nombre] * TCB.economico.precioInstalacionCorregido,
        ),
      flex: 1,
      description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
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
      const v =
        params.row.coefEnergia +
        Object.values(params.row.extraCost).reduce((a, b) => a + b, 0)
      return UTIL.formatoValor('dinero', v * TCB.economico.precioInstalacionCorregido)
    },
    flex: 1,
    description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
    sortable: false,
  })

  function getRowId(row) {
    return row.idFinca
  }

  useEffect(() => {
    const vPropio = units.reduce((t, u) => t + u.coefEnergia, 0)
    const vExtra = units.reduce(
      (t, u) => t + Object.values(u.extraCost).reduce((st, e) => st + e, 0),
      0,
    )
    setTotalCost((vPropio + vExtra) * TCB.economico.precioInstalacionCorregido)
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
            <Grid item xs={11}>
              <DataGrid
                sx={{
                  '.header-wrap': {
                    whiteSpace: 'pre-wrap', // Enables line breaks
                    lineHeight: 'normal', // Prevents extra spacing
                    textAlign: 'center', // Optional: center-align text
                  },
                }}
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
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
