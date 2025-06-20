import { useState, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Grid,
  MenuItem,
  Dialog,
  InputLabel,
  FormControlLabel,
  Select,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  FormControl,
} from '@mui/material'
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid'

// REACT Solidar Global Components
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

    tarifas,
    fincas,
    setFincas,

    setAllocationGroup,

    modifyConsumptionData,
  } = useContext(ConsumptionContext)
  const { setNewTiposConsumo } = useContext(GlobalContext)

  const { grupo } = props
  const [selectionModel, setSelectionModel] = useState([])
  const [tipoConsumoAsignado, setTipoConsumoAsignado] = useState(0)
  const [tipoTarifaAsignada, setTipoTarifaAsignada] = useState(0)

  const tiposActivos = [
    { label: 'seleccione tipo de uso', value: 0 },
    { label: 'Indefinido', value: '' },
  ].concat(
    tiposConsumo.map((tc) => ({
      label: tc.nombreTipoConsumo,
      value: tc.nombreTipoConsumo,
    })),
  )

  const tarifasActivas = [
    { label: 'seleccione tarifa', value: 0 },
    { label: 'Indefinido', value: '' },
  ].concat(
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
    setTipoConsumoAsignado(0)
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
    setTipoTarifaAsignada(0)
    setNewTiposConsumo(true)
  }

  function newConsumptionAll() {
    return (
      <GridToolbarContainer sx={{ justifyContent: 'center', mr: 3, mt: 1 }}>
        <Grid container alignItems="center">
          <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              variant="body"
              dangerouslySetInnerHTML={{
                __html: t('UNITS.SUMMARY_DESCRIPTION'),
              }}
            />
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <InputLabel htmlFor="tipoConsumo">{t('UNITS.LABEL_TIPO_USO')}</InputLabel>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Select
                sx={{ flex: 1, ml: '4rem', textAlign: 'center' }}
                object="TipoConsumo"
                name="tipoConsumo"
                size="small"
                onChange={(event) => handleTipoConsumo(event.target.value)}
                //onClick={(event) => handleTipoConsumo(event.target.value)}
                value={tipoConsumoAsignado}
              >
                {tiposActivos.map((e, index) => (
                  <MenuItem key={index} value={e.value} disabled={e.value === 0}>
                    {e.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <InputLabel htmlFor="tarifa">{t('UNITS.LABEL_NOMBRE_TARIFA')}</InputLabel>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Select
                sx={{ flex: 1, ml: '4rem', textAlign: 'center' }}
                size="small"
                value={tipoTarifaAsignada}
                name="tarifa"
                object="Tarifa"
                onChange={(event) => handleTipoTarifa(event.target.value)}
                //onClick={(event) => handleTipoTarifa(event.target.value)}
              >
                {tarifasActivas.map((e, index) => (
                  <MenuItem key={index} value={e.value} disabled={e.value === 0}>
                    {e.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
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
      newUnitRow.idTarifa !== originalRow.idTarifa ||
      newUnitRow.participa !== originalRow.participa
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
      <DialogTitle
        id="full-screen-dialog-title"
        sx={{ fontSize: '20px', fontWeight: 'bold' }}
      >
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
