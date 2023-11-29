import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import Container from '@mui/material/Container'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'
import EconomicContext from './EconomicContext'

export default function FinanceSummary() {
  const { t, i18n } = useTranslation()

  const { cashFlow } = useContext(EconomicContext)
  if (cashFlow === undefined) return

  function getRowId(row) {
    return row.ano
  }

  const columns = [
    {
      field: 'ano',
      headerName: t('ECONOMIC_BALANCE.LABEL_ANO'),
      editable: true,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_ANO'),
    },
    {
      field: 'previo',
      headerName: t('ECONOMIC_BALANCE.LABEL_PREVIO'),
      editable: true,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_PREVIO'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'inversion',
      headerName: t('ECONOMIC_BALANCE.LABEL_INVERSION'),
      editable: true,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_INVERSION'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'ahorro',
      headerName: t('ECONOMIC_BALANCE.LABEL_AHORRO'),
      editable: true,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_AHORRO'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'subvencion',
      headerName: t('ECONOMIC_BALANCE.LABEL_SUBVENCION'),
      editable: true,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_SUBVENCION'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'IBI',
      headerName: t('ECONOMIC_BALANCE.LABEL_IBI'),
      editable: true,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_IBI'),
      renderCell: (params) => {
        return UTIL.formatoValor('dinero', params.value)
      },
    },
    {
      field: 'pendiente',
      headerName: t('ECONOMIC_BALANCE.LABEL_PENDIENTE'),
      editable: true,
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
          }}
        >
          <Typography variant="h4">
            {t('ECONOMIC_BALANCE.TITLE_FINANCE_SUMMARY')}
          </Typography>
          <br />
          <DataGrid
            autoHeight
            getRowId={getRowId}
            rows={cashFlow}
            columns={columns}
            hideFooter={true}
            getRowStyle={(params) => ({
              backgroundColor: params.row.pendiente < 0 ? 'red' : 'inherit',
            })}
          />
        </Box>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Typography variant="h5">
            {t('ECONOMIC_BALANCE.LABEL_VAN_PROYECTO', {
              VAN: UTIL.formatoValor('dinero', TCB.economico.VANProyecto),
            })}
          </Typography>
          <Typography variant="h5">
            {t('ECONOMIC_BALANCE.LABEL_TIR_PROYECTO', {
              TIR: UTIL.formatoValor('porciento', TCB.economico.TIRProyecto),
            })}
          </Typography>
        </Box>
      </Container>
    </>
  )
}
