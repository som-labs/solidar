import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Grid, Box } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

//React global components
import { BasesContext } from '../../BasesContext'
import { SLDRFooterBox } from '../../../components/SLDRComponents'

// Solidar objects
//import TCB from '../classes/TCB'
import * as UTIL from '../../classes/Utiles'

export default function InstallationSummary() {
  const { t } = useTranslation()
  const { bases } = useContext(BasesContext)

  const getRowId = (row) => {
    return row.idBaseSolar
  }

  const columns = [
    {
      field: 'nombreBaseSolar',
      headerName: t('BaseSolar.PROP.nombreBaseSolar'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 5,
      description: t('BaseSolar.TOOLTIP.nombreBaseSolar'),
      sortable: false,
    },
    {
      field: 'paneles',
      editable: true,
      headerName: t('Instalacion.PROP.paneles'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 2,
      align: 'center',
      description: t('Instalacion.TOOLTIP.paneles'),
      sortable: false,
    },
    // {
    //   field: 'configuracion',
    //   editable: true,
    //   headerName: t('Instalacion.PROP.config'),
    //   headerClassName: 'super-app-theme--header',
    //   headerAlign: 'center',
    //   flex: 2,
    //   align: 'center',
    //   description: t('Instalacion.TOOLTIP.paneles'),
    //   sortable: false,
    //   renderCell: (params) => {
    //     console.log(params)
    //     return params.row.columnas + '-' + params.row.filas
    //   },
    // },
    {
      field: 'potenciaTotal',
      headerName: t('Instalacion.PROP.potenciaTotal'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 3,
      align: 'right',
      description: t('Instalacion.TOOLTIP.potenciaTotal'),
      sortable: false,
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaTotal', params.value)
      },
    },
  ]

  function footerSummary() {
    return (
      <SLDRFooterBox sx={{ flexDirection: 'row' }}>
        <div style={{ flex: '5' }} /> {/* Placeholder for ID column */}
        <div style={{ flex: '2', textAlign: 'center' }}>
          <strong>
            {bases.reduce((sum, tBase) => sum + parseInt(tBase.paneles), 0)}
          </strong>
        </div>
        <div style={{ flex: '3', textAlign: 'right' }}>
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

  return (
    <Box>
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
            rowHeight={30}
            autoHeight
            disableColumnMenu
            slots={{ footer: footerSummary }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
