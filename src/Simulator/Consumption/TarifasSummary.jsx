import { useState, useContext, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Button, IconButton, Typography, Tooltip, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import EditIcon from '@mui/icons-material/Edit'
import { DataGrid, GridToolbarContainer, GridActionsCellItem } from '@mui/x-data-grid'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { GlobalContext } from '../GlobalContext'
import MapaMesHora from './MapaMesHora'
import MapaDiaHora from './MapaDiaHora'
import { useDialog } from '../../components/DialogProvider'
import { useAlert } from '../../components/AlertProvider'
import DialogConsumption from './DialogConsumption'
import DialogTarifa from './DialogTarifa'
import { SLDRFooterBox, SLDRInfoBox, SLDRTooltip } from '../../components/SLDRComponents'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import { formatoValor } from '../classes/Utiles'
import TipoConsumo from '../classes/TipoConsumo'
import Tarifa from '../classes/Tarifa'

export default function TarifasSummary() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { SLDRAlert } = useAlert()
  const [openDialog, closeDialog] = useDialog()
  const [initialTarifa, setInitialTarifa] = useState()
  const {
    setPreciosValidos,
    fincas,
    tarifas,
    setTarifas,
    addConsumptionData,
    modifyConsumptionData,
    deleteConsumptionData,
  } = useContext(ConsumptionContext)

  useEffect(() => {
    console.log('Insert')
    if (TCB.modoActivo === 'INDIVIDUAL' && tarifas.length === 0) {
      setTarifas([new Tarifa('Tarifa Som Energia', '2.0TD')])
    }
  }, [])
  const { setNewPrecios } = useContext(GlobalContext)

  const editing = useRef()

  const columns = [
    {
      field: 'nombreTarifa',
      headerName: t('Tarifa.PROP.nombreTarifa'),
      headerAlign: 'center',
      editable: false,
      flex: 1,
      description: t('Tarifa.TOOLTIP.nombreTarifa'),
      sortable: false,
    },
    {
      field: 'coefHucha',
      headerName: t('Tarifa.PROP.coefHucha'),
      headerAlign: 'center',
      align: 'center',
      type: 'select',
      description: t('Tarifa.TOOLTIP.coefHucha'),
      sortable: false,
    },
    {
      field: 'cuotaHucha',
      headerName: t('Tarifa.PROP.cuotaHucha'),
      headerAlign: 'center',
      align: 'right',
      type: 'text',
      flex: 1,
      description: t('Tarifa.TOOLTIP.cuotaHucha'),
      sortable: false,
    },
    {
      field: 'compensa',
      headerName: t('Tarifa.PROP.P0'),
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      flex: 1,
      minWidth: 100,
      description: t('Tarifa.TOOLTIP.P0'),
      valueGetter: (params) => params.row.precios[0],
      sortable: false,
    },
  ]

  for (let i = 1; i <= 6; i++) {
    columns.push({
      field: 'P' + i,
      headerName: 'P' + i,
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      flex: 1,
      description: t('Tarifa.TOOLTIP.P' + i),
      valueGetter: (params) => {
        return params.row.precios?.[i] ? params.row.precios[i] : 'X'
      },
      sortable: false,
    })
  }

  if (TCB.modoActivo !== 'INDIVIDUAL') {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: t('BASIC.LABEL_ACCIONES'),
      sortable: false,
      getActions: (params) => [
        <GridActionsCellItem
          key={1}
          icon={
            <Tooltip title={t('TARIFA.TOOLTIP_botonBorraTarifa')}>
              <DeleteIcon />
            </Tooltip>
          }
          label="Borra"
          onClick={(e) => deleteTarifa(e, params.row)}
        />,
        <GridActionsCellItem
          key={2}
          icon={
            <Tooltip title={t('TARIFA.TOOLTIP_botonEditaTarifa')}>
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => editTarifa(params.row)}
        />,
      ],
    })
  } else {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: t('CONSUMPTION.LABEL_CAMBIO_TARIFA'),
      sortable: false,
      getActions: (params) => [
        <GridActionsCellItem
          key={2}
          icon={
            <Tooltip title={t('TARIFA.TOOLTIP_botonEditaTarifa')}>
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => editTarifa(params.row)}
        />,
      ],
    })
  }

  function getRowId(row) {
    return row.idTarifa
  }

  function editTarifa(row) {
    editing.current = true
    openDialog({
      children: (
        <DialogTarifa
          tarifa={row}
          previous={tarifas}
          maxWidth={'lg'}
          fullWidth={true}
          onClose={(reason, formData) => processFormData(reason, formData)}
        ></DialogTarifa>
      ),
    })
  }

  function createTarifa() {
    editing.current = false
    const _t = new Tarifa('Tarifa Som Energia', '2.0TD')
    setInitialTarifa(_t)
    openDialog({
      children: (
        <DialogTarifa
          tarifa={_t}
          maxWidth={'lg'}
          fullWidth={true}
          previous={tarifas} //Needed to check duplicate name
          onClose={(reason, formData) => processFormData(reason, formData)}
        ></DialogTarifa>
      ),
    })
  }

  async function processFormData(reason, formData) {
    if (reason === undefined) return
    //Update or create a Tarifa with formData
    if (reason === 'save') {
      //Can reach this by saving new tarifa or editing existing one
      if (editing.current) {
        modifyConsumptionData('Tarifa', formData)
      } else {
        addConsumptionData('Tarifa', formData)
      }
    }
    if (tarifas.length > 0) setPreciosValidos(true)
    setNewPrecios(true)
    closeDialog()
  }

  function deleteTarifa(ev, tid) {
    //Si estamos en colectivo no se pueden borrar tarifas utilizados en alguna finca
    if (TCB.modoActivo !== 'INDIVIDUAL') {
      if (fincas.find((f) => f.idTarifa === tid.idTarifa)) {
        SLDRAlert('VALIDACIÓN', t('CONSUMPTION.ERROR_TARIFA_FINCAS'), 'Warning')
        return
      }
    }
    deleteConsumptionData('Tarifa', tid.idTarifa)
    setNewPrecios(true)
  }

  function newTarifa() {
    return (
      <GridToolbarContainer>
        <SLDRTooltip
          title={<Typography>{t('CONSUMPTION.TOOLTIP_BUTTON_NUEVA_TARIFA')}</Typography>}
          placement="top"
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createTarifa}
            size="medium"
            style={{ margin: 'auto' }}
          >
            {t('CONSUMPTION.LABEL_BUTTON_NUEVA_TARIFA')}
          </Button>
        </SLDRTooltip>
      </GridToolbarContainer>
    )
  }

  console.log(tarifas)
  return (
    <Grid container justifyContent={'center'} rowSpacing={4}>
      <Grid item xs={11}>
        <DataGrid
          sx={theme.tables.headerWrap}
          getRowId={getRowId}
          rows={tarifas}
          columns={columns}
          hideFooter={true}
          rowHeight={30}
          autoHeight
          disableColumnMenu
          localeText={{ noRowsLabel: t('BASIC.LABEL_NO_ROWS') }}
          slots={{ toolbar: TCB.modoActivo !== 'INDIVIDUAL' ? newTarifa : '' }}
        />
      </Grid>
    </Grid>
  )
}
