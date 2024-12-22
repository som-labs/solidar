import { useState, useContext, useRef } from 'react'
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
  Select,
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
  const {
    tipoConsumo,
    setTipoConsumo,
    preciosValidos,
    addTCBTipoToState,
    fincas,
    setFincas,
  } = useContext(ConsumptionContext)

  const { grupo, units, setTotalConsumption, totalConsumption } = props

  const [activo, setActivo] = useState() //Corresponde al objeto TipoConsumo en State que se esta manipulando
  const [tipoConsumoAsignado, setTipoConsumoAsignado] = useState('')

  const editing = useRef()

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

  function handleTipoConsumo(event) {
    setTipoConsumoAsignado(event.target.value)
    const newFincas = fincas.map((f) => {
      if (f.grupo === grupo) {
        f.nombreTipoConsumo = event.target.value
      }
      return f
    })
    setFincas(newFincas)
    summaryzeConsumption()
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
              onChange={(event) => handleTipoConsumo(event)}
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

  function summaryzeConsumption() {
    let total = 0
    units.forEach((e) => {
      if (e.nombreTipoConsumo !== '' && e.participa) {
        const tc = tipoConsumo.find((t) => {
          return t.nombreTipoConsumo === e.nombreTipoConsumo
        })
        total += tc.totalAnual
        setTotalConsumption(total)
      }
    })
    return total
  }

  // function footerSummary() {
  //   return (
  //     <SLDRFooterBox>
  //       <Grid
  //         container
  //         alignItems="center"
  //         justifyContent="center"
  //         spacing={2}
  //         sx={{ mt: '2rem' }}
  //       >
  //         <Grid item>
  //           <Typography
  //             sx={theme.titles.level_2}
  //             textAlign={'center'}
  //             dangerouslySetInnerHTML={{
  //               __html: t('CONSUMPTION.TOTAL_DEMMAND', {
  //                 consumoTotal: formatoValor('energia', totalConsumption),
  //               }),
  //             }}
  //           />
  //         </Grid>
  //       </Grid>
  //     </SLDRFooterBox>
  //   )
  // }

  function changeUnit(newUnitRow) {
    console.log('Cambiando:', newUnitRow)

    const newFincas = fincas.map((f) => {
      if (f.idFinca === newUnitRow.idFinca) {
        f.nombreTipoConsumo = newUnitRow.nombreTipoConsumo
        f.participa = newUnitRow.participa
        f.nombreFinca = newUnitRow.nombreFinca
      }
      return f
    })
    setFincas(newFincas)
    summaryzeConsumption()
    TCB.cambioTipoConsumo = true
    TCB.requiereOptimizador = true
    return newUnitRow
    // console.log('Row ID:', params.id) // ID of the edited row
    // console.log('Column:', params.field) // Column name
    // console.log('New Value:', params.value) // The new value
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
