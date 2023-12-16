import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Container from '@mui/material/Container'
import clsx from 'clsx'

// REACT Solidar Components
import EconomicContext from './EconomicContext'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import { FooterBox } from '../../components/SLDRComponents'

export default function FinanceSummary() {
  const { t, i18n } = useTranslation()

  const { ecoData } = useContext(EconomicContext)

  if (ecoData.cashFlow === undefined) return

  function getRowId(row) {
    return row.ano
  }

  function footerSummary() {
    return (
      <FooterBox
      // component="form"
      // sx={{
      //   display: 'flex',
      //   flexDirection: 'column',
      //   flexWrap: 'wrap',
      //   width: '100%',
      //   mt: '0.3rem',
      //   mb: '0.3rem',
      //   flex: 1,
      //   border: 2,
      //   textAlign: 'center',
      //   borderColor: 'primary.light',
      //   backgroundColor: 'rgba(220, 249, 233, 1)',
      // }}
      // justifyContent="center"
      >
        <Typography variant="h5">
          {t('ECONOMIC_BALANCE.LABEL_VAN_PROYECTO', {
            VAN: UTIL.formatoValor('dinero', ecoData.VANProyecto),
          })}
        </Typography>
        <Typography variant="h5">
          {t('ECONOMIC_BALANCE.LABEL_TIR_PROYECTO', {
            TIR: UTIL.formatoValor('porciento', ecoData.TIRProyecto),
          })}
        </Typography>
      </FooterBox>
    )
  }
  const columns = [
    {
      field: 'ano',
      headerName: t('ECONOMIC_BALANCE.LABEL_ANO'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_ANO'),
    },
    {
      field: 'previo',
      headerName: t('ECONOMIC_BALANCE.LABEL_PREVIO'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_PREVIO'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'inversion',
      headerName: t('ECONOMIC_BALANCE.LABEL_INVERSION'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_INVERSION'),

      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'ahorro',
      headerName: t('ECONOMIC_BALANCE.LABEL_AHORRO'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_AHORRO'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'subvencion',
      headerName: t('ECONOMIC_BALANCE.LABEL_SUBVENCION'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_SUBVENCION'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'IBI',
      headerName: t('ECONOMIC_BALANCE.LABEL_IBI'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_IBI'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'pendiente',
      headerName: t('ECONOMIC_BALANCE.LABEL_PENDIENTE'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_PENDIENTE'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
  ]
  return (
    <>
      <Container>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            width: '100%',
            '& .super-app.positive': {
              backgroundColor: 'rgba(157, 255, 118, 0.49)',
              color: '#1a3e72',
              fontWeight: '400',
            },
            '& .super-app.negative': {
              backgroundColor: '#ffff99',
              color: '#1a3e72',
              fontWeight: '400',
            },
          }}
        >
          <Typography variant="h4" textAlign={'center'}>
            {t('ECONOMIC_BALANCE.TITLE_FINANCE_SUMMARY')}
          </Typography>
          <br />
          <DataGrid
            rowHeight={30}
            autoHeight
            getRowId={getRowId}
            rows={ecoData.cashFlow}
            columns={columns}
            hideFooter={false}
            getRowClassName={(params) =>
              clsx('super-app', {
                negative: params.row.pendiente < 0,
                positive: params.row.pendiente > 0,
              })
            }
            slots={{ footer: footerSummary }}
          />
        </Box>
      </Container>
    </>
  )
}
