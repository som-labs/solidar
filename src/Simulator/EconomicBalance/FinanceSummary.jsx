import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Box, Typography, Container } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { DataGrid } from '@mui/x-data-grid'
import clsx from 'clsx'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import { SLDRFooterBox } from '../../components/SLDRComponents'

export default function FinanceSummary() {
  const { t } = useTranslation()
  const theme = useTheme()

  const { ecoData } = useContext(EconomicContext)

  if (ecoData.cashFlow === undefined) return

  function getRowId(row) {
    return row.ano
  }

  function footerSummary() {
    return (
      <SLDRFooterBox>
        <Typography sx={theme.titles.level_2}>
          {t('ECONOMIC_BALANCE.LABEL_FOOTER_VAN', {
            VANProyecto: UTIL.formatoValor('dinero', ecoData.VANProyecto),
          })}
        </Typography>
        <Typography sx={theme.titles.level_2}>
          {t('ECONOMIC_BALANCE.LABEL_FOOTER_TIR', {
            TIRProyecto: UTIL.formatoValor('porciento', ecoData.TIRProyecto),
          })}
        </Typography>
      </SLDRFooterBox>
    )
  }
  const columns = [
    {
      field: 'ano',
      headerName: t('ECONOMIC_BALANCE.LABEL_ANO'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_ANO'),
    },
    {
      field: 'previo',
      headerName: t('ECONOMIC_BALANCE.LABEL_PREVIO'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      align: 'right',
      sortable: false,
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
      sortable: false,
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
      sortable: false,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_AHORRO'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'subvencion',
      headerName: t('ECONOMIC_BALANCE.LABEL_SUBVENCION'),
      headerAlign: 'center',
      align: 'right',
      sortable: false,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_SUBVENCION'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'IBI',
      headerName: t('ECONOMIC_BALANCE.LABEL_IBI'),
      align: 'right',
      sortable: false,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_IBI'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'pendiente',
      headerName: t('ECONOMIC_BALANCE.LABEL_PENDIENTE'),
      align: 'right',
      sortable: false,
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
              backgroundColor: theme.palette.primary.main, //'rgba(157, 255, 118, 0.49)',
              color: '#1a3e72',
              fontWeight: '700',
            },
            '& .super-app.negative': {
              backgroundColor: '#ffff99',
              color: '#1a3e72',
              fontWeight: '400',
            },
          }}
        >
          <Typography sx={theme.titles.level_1} textAlign={'center'}>
            {t('ECONOMIC_BALANCE.TITLE_FINANCE_SUMMARY')}
          </Typography>
          <br />
          <DataGrid
            sx={theme.tables.headerWrap}
            getRowId={getRowId}
            rows={ecoData.cashFlow}
            columns={columns}
            hideFooter={false}
            rowHeight={30}
            autoHeight
            disableColumnMenu
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
