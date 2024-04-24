import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Grid, Box } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useTheme } from '@mui/material/styles'

//React global components
import { BasesContext } from '../../BasesContext'
import { SLDRFooterBox } from '../../../components/SLDRComponents'

// Solidar objects
//import TCB from '../classes/TCB'
import * as UTIL from '../../classes/Utiles'

export default function InstallationSummary() {
  const { t } = useTranslation()
  const { bases } = useContext(BasesContext)
  const theme = useTheme()

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
    // {
    //   field: 'paneles',
    //   editable: true,
    //   headerName: t('Instalacion.PROP.paneles'),
    //   flex: 1,
    //   align: 'center',
    //   description: t('Instalacion.TOOLTIP.paneles'),
    //   sortable: false,
    // },
    // {
    //   field: 'potenciaTotal',
    //   headerName: t('Instalacion.PROP.potenciaTotal'),
    //   flex: 1,
    //   align: 'right',
    //   description: t('Instalacion.TOOLTIP.potenciaTotal'),
    //   sortable: false,
    //   renderCell: (params) => {
    //     return UTIL.formatoValor('potenciaTotal', params.value)
    //   },
    // },
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
      // <SLDRFooterBox sx={{ flexDirection: 'row' }}>

      //   <div style={{ flex: '6' }} /> {/* Placeholder for ID column */}
      //   <div style={{ flex: '2', textAlign: 'center' }}>
      //     <strong>
      //       {bases.reduce((sum, tBase) => sum + parseInt(tBase.paneles), 0)}
      //     </strong>
      //   </div>
      //   <div style={{ flex: '3', textAlign: 'right' }}>
      //     <strong>
      //       {UTIL.formatoValor(
      //         'potenciaTotal',
      //         bases.reduce((sum, tBase) => sum + tBase.potenciaTotal, 0),
      //       )}
      //     </strong>
      //   </div>
      //   <div style={{ flex: '0.6', textAlign: 'center' }}></div>
      // </SLDRFooterBox>
    )
  }
  /**
   * Funcion para gestionar el evento generado por cambio de paneles o potenciaUnitaria en la tabla de bases
   * @param {params} DataGrid parmas object {field, row} que ha cambiado de valor
   * @param {string} propiedad Puede ser paneles o potenica unitaria
   */

  return (
    <Box
      id="C1F1C2"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <Box
        id="C1F1C2F1"
        sx={{ backgroundColor: theme.informe.dataBox.title.backgroundColor }}
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            padding: 1,
            color: theme.informe.dataBox.title.text,
          }}
        >
          <strong>{t('ENERGY_BALANCE.SUMMARY_TITLE')}</strong>
        </Typography>
      </Box>
      <Box id="C1F1C2F2">
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
