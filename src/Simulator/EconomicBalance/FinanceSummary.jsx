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

export default function FinanceSummary(props) {
  const { t, i18n } = useTranslation()

  const { cashFlow } = props

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
    },
    {
      field: 'inversion',
      headerName: t('ECONOMIC_BALANCE.LABEL_INVERSION'),
      editable: true,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_INVERSION'),
    },
    {
      field: 'ahorro',
      headerName: t('ECONOMIC_BALANCE.LABEL_AHORRO'),
      editable: true,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_AHORRO'),
    },
    {
      field: 'subvencion',
      headerName: t('ECONOMIC_BALANCE.LABEL_SUBVENCION'),
      editable: true,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_SUBVENCION'),
    },
    {
      field: 'IBI',
      headerName: t('ECONOMIC_BALANCE.LABEL_IBI'),
      editable: true,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_IBI'),
    },
    {
      field: 'pendiente',
      headerName: t('ECONOMIC_BALANCE.LABEL_PENDIENTE'),
      editable: true,
      flex: 1,
      description: t('ECONOMIC_BALANCE.TOOLTIP_PENDIENTE'),
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
            sx={{
              boxShadow: 2,
              border: 2,
              borderColor: 'primary.light',
              '& .MuiDataGrid-cell:hover': {
                color: 'primary.main',
              },
            }}
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
