import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { DataGrid } from '@mui/x-data-grid'

// REACT Solidar Components
import { BasesContext } from '../BasesContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function SummaryAutoproduccion() {
  const { t } = useTranslation()
  const theme = useTheme()

  const { bases } = useContext(BasesContext)

  let areasEscogidas = 0
  let areasDisponibles = 0
  let paneles = 0
  let produccionAnual = 0
  for (let base of bases) {
    areasDisponibles += 1
    if (base.paneles > 0) {
      areasEscogidas += 1
      paneles += base.paneles
    }
  }

  produccionAnual = TCB.produccion.totalAnual
  const columns = [
    {
      field: 'nombreBaseSolar',
      headerName: t('BaseSolar.PROP.nombreBaseSolar'),
      headerAlign: 'center',
      width: 100,
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
      field: 'paneles',
      headerName: t('Instalacion.PROP.paneles'),
      headerAlign: 'center',
      flex: 0.5,
      align: 'center',
      sortable: false,
      description: t('Instalacion.TOOLTIP.paneles'),
      renderCell: (params) => {
        return UTIL.formatoValor('paneles', params.value)
      },
    },
    {
      field: 'potenciaTotal',
      headerName: t('Instalacion.PROP.potenciaTotal'),
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      sortable: false,
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaTotal', params.value)
      },
    },
  ]

  const getRowId = (row) => {
    return row.idBaseSolar
  }

  return (
    <>
      <Container>
        <Typography sx={theme.titles.level_1}>
          {t('SUMMARY.TITLE_AUTOPRODUCCION')}
        </Typography>
        <Typography variant="body">{t('SUMMARY.DESCRIPTION_AUTOPRODUCCION')}</Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              mb: '1rem',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                width: '50%',
                //boxShadow: 2,
                //border: 2,
                // borderColor: 'primary.light',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="h4" color={'green'}>
                {areasEscogidas}
              </Typography>
              <Typography
                variant="body"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html: t('SUMMARY.LABEL_AREAS_DISPONIBLES', {
                    count: areasDisponibles,
                  }),
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                width: '50%',
                //boxShadow: 2,
                //border: 2,
                borderColor: 'green',
                justifyContent: 'center',
                alignItems: 'center',
                borderLeft: '3px dashed green',
                borderRight: '3px dashed green',
              }}
            >
              <Typography variant="h4" color={'green'}>
                {paneles}
              </Typography>
              <Typography
                variant="body"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html: t('SUMMARY.LABEL_PANELES_SUGERIDOS', {
                    count: 0,
                  }),
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                width: '50%',
                //boxShadow: 2,
                //border: 2,
                // borderColor: 'primary.light',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="h4" color={'green'}>
                {UTIL.formatoValor('energia', produccionAnual, '')}
              </Typography>
              <Typography
                variant="body"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html: t('SUMMARY.LABEL_PRODUCCION_ANUAL'),
                }}
              />
            </Box>
          </Box>
        </Box>

        <DataGrid
          getRowId={getRowId}
          rows={bases}
          columns={columns}
          hideFooter={true}
          rowHeight={30}
          autoHeight
          disableColumnMenu
          sx={{
            boxShadow: 2,
            border: 2,
            borderColor: 'primary.light',
          }}
        />
      </Container>
    </>
  )
}
