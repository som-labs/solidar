import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'

// REACT Solidar Components
import InputContext from '../InputContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import { Container } from '@mui/material'

export default function SummaryAutoproduccion() {
  const { t, i18n } = useTranslation()
  const { bases, setBases } = useContext(InputContext)

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
  produccionAnual = TCB.produccion.pTotalAnual

  const columns = [
    // { field: 'idBaseSolar', headerName: 'ID', width: 50 },
    {
      field: 'nombreBaseSolar',
      headerName: 'Nombre',
      headerAlign: 'center',
      width: 100,
    },
    {
      field: 'areaReal',
      headerName: t('BaseSolar.LABEL_areaReal'),
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      description: t('BaseSolar.TOOLTIP_areaReal'),
      renderCell: (params) => {
        return UTIL.formatoValor('areaReal', params.value)
      },
    },
    {
      field: 'paneles',
      headerName: 'Paneles',
      headerAlign: 'center',
      flex: 0.5,
      align: 'center',
      renderCell: (params) => {
        return UTIL.formatoValor('paneles', params.value)
      },
    },
    {
      field: 'potenciaTotal',
      headerName: 'Potencia Total de la base',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
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
        <Typography variant="h3" textAlign={'center'}>
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
                  __html: t('SUMMARY.LABEL_AREAS_ESCOGIDAS', {
                    areasDisponibles: areasDisponibles,
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
              <Typography variant="body" textAlign={'center'}>
                {t('SUMMARY.LABEL_PANELES_SUGERIDOS')}
              </Typography>
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
                {produccionAnual.toFixed(2)}
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
          autoHeight
          rowHeight={30}
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
