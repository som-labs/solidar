import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Box, Typography, IconButton, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { DataGrid } from '@mui/x-data-grid'
import InfoIcon from '@mui/icons-material/Info'
import clsx from 'clsx'

//React global components
import { useDialog } from '../../components/DialogProvider'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'
import HelpEconomicBalance from './HelpEconomicBalance'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import { SLDRFooterBox } from '../../components/SLDRComponents'

export default function FinanceSummary() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [openDialog, closeDialog] = useDialog()

  const { ecoData } = useContext(EconomicContext)
  if (ecoData.cashFlow === undefined) return

  function getRowId(row) {
    return row.ano
  }

  function help(level) {
    openDialog({
      children: <HelpEconomicBalance level={level} onClose={() => closeDialog()} />,
    })
  }

  function footerSummary() {
    return (
      <SLDRFooterBox>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            mt: '1rem',
          }}
        >
          <Typography sx={theme.titles.level_2}>
            {t('ECONOMIC_BALANCE.LABEL_FOOTER_VAN', {
              VANProyecto: UTIL.formatoValor('dinero', ecoData.VANProyecto),
            })}
          </Typography>
          <IconButton
            onClick={() => help(2)}
            size="small"
            style={{
              color: theme.palette.infoIcon.main,
              fontSize: 'inherit',
              verticalAlign: 'text-center',
              transform: 'scale(0.8)',
              padding: 2,
            }}
          >
            <InfoIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={theme.titles.level_2}>
            {t('ECONOMIC_BALANCE.LABEL_FOOTER_TIR', {
              TIRProyecto: UTIL.formatoValor('porciento', ecoData.TIRProyecto),
            })}
          </Typography>

          <IconButton
            onClick={() => help(3)}
            size="small"
            style={{
              color: theme.palette.infoIcon.main,
              fontSize: 'inherit',
              verticalAlign: 'text-center',
              transform: 'scale(0.8)',
              padding: 2,
            }}
          >
            <InfoIcon />
          </IconButton>
        </Box>
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
      flex: 0.7,
      description: t('ECONOMIC_BALANCE.TOOLTIP_ANO'),
    },
    {
      field: 'previo',
      headerName: t('ECONOMIC_BALANCE.LABEL_PREVIO'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'right',
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
      headerAlign: 'right',
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
      headerAlign: 'right',
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
      headerAlign: 'right',
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
      headerAlign: 'right',
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
      headerAlign: 'right',
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
      <Typography
        sx={{ mt: '-1rem' }}
        variant="body"
        dangerouslySetInnerHTML={{
          __html: t('ECONOMIC_BALANCE.DESCRIPTION_FINANCE_SUMMARY'),
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'wrap',
          width: '100%',
          '& .super-app.positive': {
            backgroundColor: 'rgba(157, 255, 118, 0.49)',
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
    </>
  )
}
