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
  Typography,
} from '@mui/material'
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid'

import { SLDRInputField } from '../../components/SLDRComponents'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { GlobalContext } from '../GlobalContext'
import { useDialog } from '../../components/DialogProvider'
import { useAlert } from '../../components/AlertProvider.jsx'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import TipoConsumo from '../classes/TipoConsumo.js'

export default function UnitsSummary(props) {
  const { t } = useTranslation()
  const { SLDRAlert } = useAlert()
  const theme = useTheme()

  const [openDialog, closeDialog] = useDialog()
  const {
    tiposConsumo,
    preciosValidos,
    tarifas,
    fincas,
    setFincas,
    allocationGroup,
    setAllocationGroup,
    addConsumptionData,
    modifyConsumptionData,
    deleteConsumptionData,
  } = useContext(ConsumptionContext)
  const { setNewTiposConsumo } = useContext(GlobalContext)

  const { grupo } = props
  const [selectionModel, setSelectionModel] = useState([])
  const [tipoConsumoAsignado, setTipoConsumoAsignado] = useState('')
  const [tipoTarifaAsignada, setTipoTarifaAsignada] = useState('')

  const tiposActivos = [{ label: 'Indefinido', value: '' }].concat(
    tiposConsumo.map((tc) => ({
      label: tc.nombreTipoConsumo,
      value: tc.nombreTipoConsumo,
    })),
  )
  const tarifasActivas = [{ label: 'Indefinido', value: '' }].concat(
    tarifas.map((t) => ({
      label: t.nombreTarifa,
      value: t.idTarifa,
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
      field: 'idTarifa',
      headerName: t('Tarifa.PROP.nombreTarifa'),
      headerAlign: 'center',
      align: 'center',
      type: 'singleSelect',
      valueOptions: tarifasActivas,
      editable: true,
      flex: 1,
      description: t('TipoConsumo.TOOLTIP.nombreTarifa'),
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
  ]

  function getRowId(row) {
    return row.idFinca
  }

  //Asigna el tipo de consumo a todas las unidades del grupo
  function handleTipoConsumo(value) {
    const newTipoConsumo = value
    setTipoConsumoAsignado(newTipoConsumo)

    //Update tipo de consumo in fincas state para todas las fincas del grupo participen o no
    setFincas((prev) =>
      prev.map((f) => {
        if (f.grupo === grupo) {
          f.nombreTipoConsumo = newTipoConsumo
          f.participa = newTipoConsumo === '' ? false : true
        }
        return f
      }),
    )

    setNewTiposConsumo(true)
    TCB.requiereReparto = true
  }

  //Asigna el tipo de consumo a todas las unidades del grupo
  function handleTipoTarifa(value) {
    const newTipoTarifa = value
    setTipoTarifaAsignada(newTipoTarifa)

    //Update tarifa in fincas state para todas las fincas del grupo participen o no
    setFincas((prev) =>
      prev.map((f) => {
        if (f.grupo === grupo) {
          f.idTarifa = newTipoTarifa
          f.participa = newTipoTarifa === '' ? false : true
        }
        return f
      }),
    )
    setNewTiposConsumo(true)
  }

  function newConsumptionAll() {
    return (
      <GridToolbarContainer sx={{ justifyContent: 'center', mr: 3, mt: 1 }}>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('UNITS.SUMMARY_DESCRIPTION'),
          }}
        />

        <FormControlLabel
          labelPlacement="start"
          padding={3}
          control={
            <Select
              sx={{ flex: 1, ml: '1rem', width: 400, textAlign: 'center' }}
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
        <FormControlLabel
          labelPlacement="start"
          padding={3}
          control={
            <Select
              sx={{ flex: 1, ml: '4rem', width: 400, textAlign: 'center' }}
              size={'small'}
              value={tipoTarifaAsignada}
              name="fuente"
              object="Tarifa"
              onChange={(event) => handleTipoTarifa(event.target.value)}
            >
              {tarifasActivas.map((e, index) => (
                <MenuItem key={index} value={e.value}>
                  {e.label}
                </MenuItem>
              ))}
            </Select>
          }
          label={t('UNITS.LABEL_NOMBRE_TARIFA')}
        />
      </GridToolbarContainer>
    )
  }

  /**
   * Verifica que toda finca que participa tiene tipoConsumo asignado
   * Si no se da la condicion no se puede cerrar el dialogo
   * Si si actualiza el consumo del grupo en allocationGroup
   */
  function checkSummary() {
    const fincasInFailure = []
    for (let _fnc of fincas.filter((f) => f.grupo === grupo)) {
      if (_fnc.participa && _fnc.nombreTipoConsumo === '') {
        fincasInFailure.push(_fnc.idFinca)
      }
    }

    for (let _fnc of fincas.filter((f) => f.grupo === grupo)) {
      if (_fnc.participa && _fnc.idTarifa === '') {
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
    } else {
      let totalGrupo = 0
      let totalParticipes = 0
      let totalParticipacion = 0
      for (let fg of fincas) {
        if (fg.grupo === grupo && fg.participa) {
          totalGrupo +=
            fg.nombreTipoConsumo !== ''
              ? tiposConsumo.find((tc) => tc.nombreTipoConsumo === fg.nombreTipoConsumo)
                  .totalAnual
              : 0
          totalParticipes++
          totalParticipacion += fg.participacion
        }
      }

      setAllocationGroup((prev) => ({
        ...prev,
        [grupo]: {
          ...prev[grupo],
          consumo: totalGrupo,
          participes: totalParticipes,
          participacionP: totalParticipacion,
        },
      }))
      closeDialog()
    }
  }

  /**
   * Cambia el tipo de consumo y la condicion de participación
   * @param {xDataGridRow} newUnitRow
   * @returns {xDataGridRow}
   */
  function changeUnit(newUnitRow, originalRow) {
    if (
      newUnitRow.nombreTipoConsumo !== originalRow.nombreTipoConsumo ||
      newUnitRow.idTarifa !== originalRow.idTarifa
    ) {
      modifyConsumptionData('Finca', newUnitRow)
      setNewTiposConsumo(true)
    }
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
          <Grid item xs={11}>
            <DataGrid
              sx={theme.tables.headerWrap}
              getRowId={getRowId}
              rows={fincas.filter((f) => f.grupo === grupo)}
              columns={columns}
              hideFooter={false}
              rowHeight={30}
              autoHeight
              disableColumnMenu
              localeText={{ noRowsLabel: t('BASIC.LABEL_NO_ROWS') }}
              slots={{ toolbar: newConsumptionAll }}
              processRowUpdate={(updatedRow, originalRow) =>
                changeUnit(updatedRow, originalRow)
              }
              onProcessRowUpdateError={handleProcessRowUpdateError}
              editMode="cell"
              selectionModel={selectionModel}
              onSelectionModelChange={(newSelection) => {
                setSelectionModel(newSelection)
              }}
              getRowClassName={(params) => (params.isSelected ? 'red' : '')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={checkSummary} color="primary">
          {t('BASIC.LABEL_CLOSE')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
