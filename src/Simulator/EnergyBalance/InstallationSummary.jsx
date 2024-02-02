import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Grid, Box, Tooltip } from '@mui/material'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import InfoIcon from '@mui/icons-material/Info'
import clsx from 'clsx'

//React global components

import { BasesContext } from '../BasesContext'
import { SLDRFooterBox } from '../../components/SLDRComponents'
import { AlertContext } from '../components/Alert'
import { useDialog } from '../../components/DialogProvider'
import DialogProperties from '../components/DialogProperties'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function InstallationSummary() {
  const { t } = useTranslation()
  const { SLDRAlert } = useContext(AlertContext)

  const [openDialog, closeDialog] = useDialog()
  const { bases, setBases } = useContext(BasesContext)

  const getRowId = (row) => {
    return row.idBaseSolar
  }

  const columns = [
    {
      field: 'nombreBaseSolar',
      headerName: t('BaseSolar.PROP.nombreBaseSolar'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 250,
      description: t('BaseSolar.TOOLTIP.nombreBaseSolar'),
      sortable: false,
    },
    {
      field: 'paneles',
      editable: true,
      headerName: t('Instalacion.PROP.paneles'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 0.5,
      align: 'center',
      description: t('Instalacion.TOOLTIP.paneles'),
      renderCell: (params) => {
        return UTIL.formatoValor('paneles', params.value)
      },
      cellClassName: (params) => {
        return clsx('super-app', {
          negative: params.value > params.row.panelesMaximo,
          positive: params.value <= params.row.panelesMaximo,
        })
      },
    },
    {
      field: 'panelesMaximo',
      headerName: t('BaseSolar.PROP.panelesMaximo'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      description: t('BaseSolar.TOOLTIP.panelesMaximo'),
      sortable: false,
    },
    {
      field: 'potenciaMaxima',
      headerName: t('BaseSolar.PROP.potenciaMaxima'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      description: t('BaseSolar.TOOLTIP.potenciaMaxima'),
      sortable: false,
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaMaxima', params.value)
      },
    },
    {
      field: 'potenciaUnitaria',
      //editable: true, //por ahora no dejamos cambiar la potencia unitaria del panel despues de haber hecho el cálculo del balance de energía.
      headerName: t('Instalacion.PROP.potenciaUnitaria'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      description: t('Instalacion.TOOLTIP.potenciaUnitaria'),
      sortable: false,
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaUnitaria', params.value)
      },
    },
    {
      field: 'potenciaTotal',
      headerName: t('Instalacion.PROP.potenciaTotal'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      description: t('Instalacion.TOOLTIP.potenciaTotal'),
      sortable: false,
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaTotal', params.value)
      },
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      getActions: (params) => [
        <GridActionsCellItem
          key={1}
          icon={
            <Tooltip title={t('RESULTS.TOOLTIP_botonInfoBase')}>
              <InfoIcon />
            </Tooltip>
          }
          label="Info"
          onClick={() => showProperties(params.id)}
        />,
      ],
    },
  ]

  function showProperties(id) {
    const baseActiva = TCB.BaseSolar.find((base) => {
      return base.idBaseSolar === id
    })
    openDialog({
      children: (
        <DialogProperties data={baseActiva} descripcion={'DDD'} onClose={closeDialog} />
      ),
    })
  }

  function footerSummary() {
    return (
      <SLDRFooterBox sx={{ flexDirection: 'row' }}>
        <div style={{ flex: '0 0 250px' }} /> {/* Placeholder for ID column */}
        <div style={{ flex: '0.5', textAlign: 'center' }}>
          <strong>
            {bases.reduce((sum, tBase) => sum + parseInt(tBase.paneles), 0)}
          </strong>
        </div>
        <div style={{ flex: '1', textAlign: 'center' }}>
          <strong>
            {bases.reduce((sum, tBase) => sum + parseInt(tBase.panelesMaximo), 0)}
          </strong>
        </div>
        <div style={{ flex: '1', textAlign: 'right' }}>
          <strong>
            {UTIL.formatoValor(
              'potenciaMaxima',
              bases.reduce((sum, tBase) => sum + tBase.potenciaMaxima, 0),
            )}
          </strong>
        </div>
        <div style={{ flex: '1' }} /> {/* Placeholder for ID column */}
        <div style={{ flex: '1', textAlign: 'right' }}>
          <strong>
            {UTIL.formatoValor(
              'potenciaTotal',
              bases.reduce((sum, tBase) => sum + tBase.potenciaTotal, 0),
            )}
          </strong>
        </div>
        <div style={{ flex: '0.7', textAlign: 'center' }}></div>
      </SLDRFooterBox>
    )
  }
  /**
   * Funcion para gestionar el evento generado por cambio de paneles o potenciaUnitaria en la tabla de bases
   * @param {params} DataGrid parmas object {field, row} que ha cambiado de valor
   * @param {string} propiedad Puede ser paneles o potenica unitaria
   */

  function nuevaInstalacion(params, event) {
    let tmpPaneles
    if (params.field === 'paneles') {
      tmpPaneles = parseInt(event.target.value)
      if (tmpPaneles > params.row.panelesMaximo) {
        SLDRAlert(
          'VALIDACION',
          'Esta asignando mas paneles que los ' +
            params.row.panelesMaximo +
            ' que estimamos se pueden instalar en el area definida',
          'error',
        )
      }
    }
    let tmpPotenciaUnitaria =
      params.field === 'potenciaUnitaria'
        ? parseFloat(event.target.value)
        : params.row.potenciaUnitaria

    //Update this BaseSolar panels and potenciaUnitaria in context
    let newBases = bases.map((b) => {
      if (b.idBaseSolar === params.id) {
        b.paneles = tmpPaneles
      }
      return b
    })
    setBases(newBases)
    //Update this BaseSolar panels and potenciaUnitaria in TCB
    let baseActiva = TCB.BaseSolar.find((base) => {
      return base.idBaseSolar === params.id
    })
    baseActiva.instalacion.potenciaUnitaria = tmpPotenciaUnitaria
    baseActiva.instalacion.paneles = tmpPaneles

    //Update total number of panels in TCB
    TCB.totalPaneles = bases.reduce((a, b) => {
      return a + b.paneles
    }, 0)

    //Update bases in BasesContext
    const updateBases = bases.map((row) => {
      if (row.idBaseSolar === params.id) {
        return {
          ...row,
          [params.field]: event.target.value,
          ['potenciaTotal']: tmpPaneles * tmpPotenciaUnitaria,
        }
      } else {
        return row
      }
    })
    setBases(updateBases)
  }
  return (
    <Box
      sx={{
        '& .super-app.negative': {
          backgroundColor: '#ff0000',
          color: '#1a3e72',
          fontWeight: '400',
        },
        '& .super-app.positive': {
          backgroundColor: 'rgba(157, 255, 118, 0.49)',
          color: '#1a3e72',
          fontWeight: '400',
        },
      }}
    >
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="body">{t('Tabla bases asignadas')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <DataGrid
            getRowId={getRowId}
            rows={bases}
            columns={columns}
            hideFooter={false}
            autoHeight
            disableColumnMenu
            onCellEditStop={(params, event) => {
              nuevaInstalacion(params, event)
            }}
            slots={{ footer: footerSummary }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
