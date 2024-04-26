import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Box } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

//React global components
import { BasesContext } from '../../BasesContext'

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
  ]

  function footerSummary() {
    return (
      <>
        <Typography
          variant="body"
          textAlign={'center'}
          dangerouslySetInnerHTML={{
            __html: t('REPORT.FOOTER_BASES_INSTALADAS', {
              paneles: bases.reduce((sum, tBase) => sum + parseInt(tBase.paneles), 0),
              potencia: UTIL.formatoValor(
                'potenciaTotal',
                bases.reduce((sum, tBase) => sum + tBase.potenciaTotal, 0),
              ),
            }),
          }}
        />
      </>
    )
  }

  return (
    <Box
      id="F1C2"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <Box
        id="F1C2F1"
        sx={{
          backgroundColor: 'databox.main',
          color: 'databox.contrastText',
          textAlign: 'center',
          padding: 1,
        }}
      >
        <Typography variant="h6">
          <strong>{t('ENERGY_BALANCE.SUMMARY_TITLE')}</strong>
        </Typography>
      </Box>
      <Box id="F1C2F2">
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
      </Box>
    </Box>
  )
}
