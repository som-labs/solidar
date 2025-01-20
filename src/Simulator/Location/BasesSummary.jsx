import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Tooltip, Grid } from '@mui/material'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { BasesContext } from '../BasesContext'
import DialogBaseSolar from './DialogBaseSolar'
import { useDialog } from '../../components/DialogProvider'
import { SLDRFooterBox } from '../../components/SLDRComponents'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function BasesSummary() {
  const { t } = useTranslation()
  const theme = useTheme()

  const [openDialog, closeDialog] = useDialog()
  const { bases, setBases, processFormData } = useContext(BasesContext)

  const getRowId = (row) => {
    return row.idBaseSolar
  }

  const columns = [
    {
      field: 'nombreBaseSolar',
      headerName: t('BaseSolar.PROP.nombreBaseSolar'),
      //headerAlign: 'center',
      width: 250,
      sortable: false,
      description: t('BaseSolar.TOOLTIP.nombreBaseSolar'),
    },
    {
      field: 'areaReal',
      headerName: t('BaseSolar.PROP.areaReal'),
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      sortable: false,
      description: t('BaseSolar.TOOLTIP.areaReal'),
      renderCell: (params) => {
        return UTIL.formatoValor('areaReal', params.value)
      },
    },
    {
      field: 'inclinacion',
      headerName: t('BaseSolar.PROP.inclinacion'),
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      sortable: false,
      description: t('BaseSolar.TOOLTIP.inclinacion'),
      renderCell: (params) => {
        if (params.row.roofType === 'Optimos') return 'Optima'
        if (params.row.roofType === 'Horizontal' && params.row.inclinacionOptima)
          return 'Optima'
        return UTIL.formatoValor('inclinacionPaneles', params.value)
      },
    },
    {
      field: 'inAcimut',
      headerName: t('BaseSolar.PROP.inAcimut'),
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      sortable: false,
      description: t('BaseSolar.TOOLTIP.inAcimut'),
      renderCell: (params) => {
        if (params.row.roofType === 'Optimos') return 'Optimo'
        else return UTIL.formatoValor('inAcimut', params.value)
      },
    },
    {
      field: 'panelesMaximo',
      headerName: t('BaseSolar.PROP.panelesMaximo'),
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      sortable: false,
      description: t('BaseSolar.TOOLTIP.panelesMaximo'),
    },
    {
      field: 'potenciaMaxima',
      headerName: t('BaseSolar.PROP.potenciaMaxima'),
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      sortable: false,
      description: t('BaseSolar.TOOLTIP.potenciaMaxima'),
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaMaxima', params.value)
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('BASIC.LABEL_ACCIONES'),
      sortable: false,
      getActions: (params) => [
        <GridActionsCellItem
          key={1}
          icon={
            <Tooltip title={t('LOCATION.TOOLTIP_BORRA_BASE')}>
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => deleteBaseSolar(params.id)}
        />,
        <GridActionsCellItem
          key={2}
          icon={
            <Tooltip title={t('LOCATION.TOOLTIP_EDITA_BASE')}>
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => editBaseSolar(params.id)}
        />,
      ],
    },
  ]

  function deleteBaseSolar(rowId) {
    let prevBases = [...bases]
    const nIndex = prevBases.findIndex((bs) => {
      return bs.idBaseSolar === rowId
    })

    TCB.requiereOptimizador = true
    UTIL.deleteBaseGeometries(rowId)

    prevBases.splice(nIndex, 1)
    TCB.BaseSolar.splice(nIndex, 1)
    setBases(prevBases)
  }

  function editBaseSolar(rowId) {
    const _base = bases.find((bs) => {
      return bs.idBaseSolar === rowId
    })
    openDialog({
      children: (
        <DialogBaseSolar
          data={_base}
          previous={bases}
          onClose={(reason, formData) => endDialog(reason, formData)}
        />
      ),
    })
  }

  function endDialog(reason, formData) {
    if (reason === 'save') processFormData('edit', formData)
    closeDialog()
  }

  function footerSummary() {
    return (
      <SLDRFooterBox>
        <Grid container alignItems="center" justifyContent="center" spacing={2}>
          <Grid item sx={{ mt: '2rem' }}>
            <Typography
              sx={theme.titles.level_2}
              textAlign={'center'}
              dangerouslySetInnerHTML={{
                __html: t('LOCATION.MSG_AREA_TOTAL', {
                  areaTotal: UTIL.formatoValor(
                    'areaReal',
                    Math.round(bases.reduce((sum, tBase) => sum + tBase.areaReal, 0)),
                  ),
                  potenciaMaxima: UTIL.formatoValor(
                    'potenciaMaxima',
                    bases.reduce((sum, tBase) => sum + tBase.potenciaMaxima, 0),
                  ),
                }),
              }}
            />
          </Grid>
        </Grid>
      </SLDRFooterBox>
    )
  }
  return (
    <Grid container justifyContent={'center'} sx={{ mt: '1rem' }}>
      <Grid item xs={11}>
        {bases && (
          <DataGrid
            sx={theme.tables.headerWrap}
            getRowId={getRowId}
            rows={bases}
            columns={columns}
            hideFooter={false}
            rowHeight={30}
            autoHeight
            disableColumnMenu
            localeText={{ noRowsLabel: t('BASIC.LABEL_NO_ROWS') }}
            slots={{ footer: footerSummary }}
          />
        )}
      </Grid>
    </Grid>
  )
}
