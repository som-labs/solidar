import { useState, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Grid,
  MenuItem,
  Dialog,
  FormControlLabel,
  Select,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid'

import { SLDRInputField } from '../../components/SLDRComponents'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { useDialog } from '../../components/DialogProvider'
import { useAlert } from '../../components/AlertProvider.jsx'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function UnitsSummary(props) {
  const { t } = useTranslation()
  const { SLDRAlert } = useAlert()
  const theme = useTheme()

  const [openDialog, closeDialog] = useDialog()
  const {
    tipoConsumo,
    setTipoConsumo,
    preciosValidos,
    addTCBTipoToState,
    fincas,
    setFincas,
  } = useContext(ConsumptionContext)

  const { grupo, units } = props
  const [selectionModel, setSelectionModel] = useState([])
  const [tipoConsumoAsignado, setTipoConsumoAsignado] = useState('')

  let tiposActivos = [{ label: 'Indefinido', value: '' }].concat(
    tipoConsumo.map((tc) => ({
      label: tc.nombreTipoConsumo,
      value: tc.nombreTipoConsumo,
    })),
  )

  const columns = [
    {
      field: 'nombreFinca',
      headerName: t('Finca.PROP.nombreFinca'),
      headerAlign: 'center',
      flex: 0.6,
      description: t('Finca.TOOLTIP.nombreFinca'),
      sortable: false,
      editable: true,
    },
    {
      field: 'refcat',
      headerName: t('Finca.PROP.refcat'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 0.9,
      description: t('Finca.TOOLTIP.refcat'),
      sortable: false,
    },
    {
      field: 'planta',
      headerName: t('Finca.PROP.planta'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 0.5,
      description: t('Finca.TOOLTIP.planta'),
      sortable: false,
    },
    {
      field: 'puerta',
      headerName: t('Finca.PROP.puerta'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 0.5,
      description: t('Finca.TOOLTIP.puerta'),
      sortable: false,
    },
    {
      field: 'uso',
      headerName: t('Finca.PROP.uso'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 1,
      description: t('Finca.TOOLTIP.uso'),
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
      headerName: t('Finca.PROP.participacion'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 0.5,
      description: t('Finca.TOOLTIP.participacion'),
      sortable: false,
    },
    {
      field: 'nombreTipoConsumo',
      headerName: t('TipoConsumo.PROP.nombreTipoConsumo'),
      headerAlign: 'center',
      align: 'center',
      type: 'singleSelect',
      valueOptions: tiposActivos,
      editable: true,
      flex: 1,
      description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
      sortable: false,
      renderCell: (params) => {
        if (params.value === '' && params.row.participa) {
          return <span style={{ color: 'red' }}>{'Indefinido'}</span>
        }
      },
    },

    {
      field: 'participa',
      headerName: t('Finca.PROP.participa'),
      description: t('Finca.TOOLTIP.participa'),
      type: 'boolean',
      editable: true,
      flex: 0.5,
      sortable: false,
    },

    // {
    //   field: 'actions',
    //   type: 'actions',
    //   headerName: t('BASIC.LABEL_ACCIONES'),
    //   sortable: false,
    //   getActions: (params) => [
    //     <GridActionsCellItem
    //       key={1}
    //       icon={
    //         <Tooltip title={t('CONSUMPTION.TOOLTIP_botonBorraTipoConsumo')}>
    //           <DeleteIcon />
    //         </Tooltip>
    //       }
    //       label="ShowGraphs"
    //       onClick={(e) => deleteTipoConsumo(e, params.row)}
    //     />,
    //     <GridActionsCellItem
    //       key={2}
    //       icon={
    //         <Tooltip title={t('CONSUMPTION.TOOLTIP_botonEditaTipoConsumo')}>
    //           <EditIcon />
    //         </Tooltip>
    //       }
    //       label="Edit"
    //       onClick={() => editTipoConsumo(params.row)}
    //     />,
    //   ],
    // },
  ]

  function getRowId(row) {
    return row.idFinca
  }

  function handleTipoConsumo(value) {
    console.log('VALUE REC:', value)
    const newValue = value //=== '' ? 'Indefinido' : value
    console.log('NEWVALUE:', newValue)
    setTipoConsumoAsignado(newValue)

    const newFincas = fincas.map((f) => {
      if (f.grupo === grupo) {
        f.nombreTipoConsumo = newValue
        f.participa = newValue === '' ? false : true
      }
      return f
    })
    console.log('setting fincas in UnitsSummary all')
    setFincas(newFincas)
    TCB.cambioTipoConsumo = true
    TCB.requiereOptimizador = true
  }

  function newConsumptionAll() {
    return (
      <GridToolbarContainer>
        <FormControlLabel
          labelPlacement="start"
          padding={3}
          control={
            <Select
              sx={{ flex: 1, ml: '1rem', width: 390, textAlign: 'center' }}
              size={'small'}
              value={tipoConsumoAsignado}
              name="fuente"
              object="TipoConsumo"
              onChange={(event) => handleTipoConsumo(event.target.value)}
            >
              {tiposActivos.map((e, index) => (
                <MenuItem key={index} value={e.value}>
                  {e.label}
                </MenuItem>
              ))}
            </Select>
          }
          label={t('UNITS.LABEL_TIPO_USO')}
        />
      </GridToolbarContainer>
    )
  }

  function checkSummary() {
    const fincasInFailure = []
    for (let _fnc of units) {
      if (_fnc.participa && _fnc.nombreTipoConsumo === '') {
        fincasInFailure.push(_fnc.idFinca)
      }
    }
    if (fincasInFailure.length > 0) {
      SLDRAlert(
        'VALIDACION',
        t('Existen ' + fincasInFailure.length + ' fincas con error'),
        'Error',
      )
      setSelectionModel(fincasInFailure)
    } else closeDialog()
  }

  function changeUnit(newUnitRow) {
    const newFincas = fincas.map((f) => {
      if (f.idFinca === newUnitRow.idFinca) {
        f.nombreTipoConsumo = newUnitRow.nombreTipoConsumo
        f.participa = newUnitRow.participa
        f.nombreFinca = newUnitRow.nombreFinca
      }
      return f
    })
    console.log('setting fincas in UnitsSummary 1')
    setFincas(newFincas)
    //summaryzeConsumption()
    TCB.cambioTipoConsumo = true
    TCB.requiereOptimizador = true
    TCB.requiereReparto = true
    return newUnitRow
  }

  function handleProcessRowUpdateError(params) {
    console.log('Error:', params)
  }

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
                sx={theme.tables.headerWrap}
                getRowId={getRowId}
                rows={units}
                columns={columns}
                hideFooter={false}
                rowHeight={30}
                autoHeight
                disableColumnMenu
                localeText={{ noRowsLabel: t('BASIC.LABEL_NO_ROWS') }}
                // slots={{ toolbar: newConsumptionAll, footer: footerSummary }}
                slots={{ toolbar: newConsumptionAll }}
                processRowUpdate={(updatedRow, originalRow) => changeUnit(updatedRow)}
                onProcessRowUpdateError={handleProcessRowUpdateError}
                editMode="cell"
                selectionModel={selectionModel}
                onSelectionModelChange={(newSelection) => {
                  setSelectionModel(newSelection)
                }}
                getRowClassName={(params) => (params.isSelected ? 'red' : '')}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={checkSummary} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
