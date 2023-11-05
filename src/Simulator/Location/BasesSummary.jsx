import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Box } from '@mui/material'

// Componentes Solidar
import DialogNewBaseSolar from './DialogNewBaseSolar'
import { useDialog } from '../../components/DialogProvider'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCBContext from '../TCBContext'
import TCB from '../classes/TCB'

const BasesSummary = () => {
  const { t, i18n } = useTranslation()
  const { bases, setBases } = useContext(TCBContext)
  const [openDialog, closeDialog] = useDialog()

  const getRowId = (row) => {
    return row.idBaseSolar
  }

  //PENDIENTE: la forma de definir el acimut y la inclinacion
  const columns = [
    {
      field: 'nombreBaseSolar',
      headerName: t('LOCATION.LABEL_BASE_NAME'),
      headerClassName: 'dataGrid-headers',
      // renderHeader: () => <strong>{t('LOCATION.LABEL_BASE_NAME')}</strong>,
      headerAlign: 'center',
      width: 250,
      description: t('LOCATION.TOOLTIP_BASE_NAME'),
    },
    {
      field: 'areaReal',
      headerName: t('LOCATION.LABEL_AREA_REAL'),
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      description: t('LOCATION.TOOLTIP_AREA_REAL'),
      renderCell: (params) => {
        return UTIL.formatoValor('areaReal', params.value)
      },
    },
    {
      field: 'inclinacionPaneles',
      headerName: 'Inclinación',
      headerAlign: 'center',
      flex: 1,
      align: 'center',
    },
    { field: 'inAcimut', headerName: 'Acimut', flex: 1, align: 'center' },
    {
      field: 'potenciaMaxima',
      headerName: 'Pot. Maxima',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaMaxima', params.value)
      },
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          key={1}
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => deleteBaseSolar(params.id)}
        />,
        <GridActionsCellItem
          key={2}
          icon={<EditIcon />}
          label="Delete"
          onClick={() => editBaseSolar(params.id)}
        />,
      ],
    },
  ]

  function deleteBaseSolar(rowId) {
    let prevBases = [...bases]
    const nIndex = prevBases.findIndex((bs) => {
      return bs.idBaseSolar === rowId
    })

    TCB.requiereOptimizador = true
    UTIL.deleteBaseGeometries(rowId)

    prevBases.splice(nIndex, 1)
    TCB.BaseSolar.splice(nIndex, 1)
    setBases(prevBases)
  }

  function editBaseSolar(rowId) {
    const _base = bases.find((bs) => {
      return bs.idBaseSolar === rowId
    })
    openDialog({
      children: <DialogNewBaseSolar data={_base} editing={true} onClose={closeDialog} />,
    })
  }

  return (
    <>
      <Typography variant="h3">{t('LOCATION.LABEL_SUMMARY')}</Typography>
      <Typography variant="body">{t('LOCATION.PROMPT_SUMMARY')}</Typography>
      <Box>
        <DataGrid
          getRowId={getRowId}
          rows={bases}
          columns={columns}
          hideFooter={true}
          autoHeight
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
      {/* REVISAR: Alineacion center del resumen. Va bien si no se usa HTML.
      REVISAR: Cual debería ser el colorbackground de los boxes con informacion relevante */}
      <Box
        sx={{
          mt: '0.3rem',
          display: 'flex',
          flexWrap: 'wrap',
          boxShadow: 2,
          flex: 1,
          border: 2,
          textAlign: 'center',
          borderColor: 'primary.light',
          '& .MuiDataGrid-cell:hover': {
            color: 'primary.main',
          },
          backgroundColor: 'rgba(220, 249, 233, 1)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
          }}
          textAlign={'center'}
          dangerouslySetInnerHTML={{
            __html: t(
              t('LOCATION.MSG_AREA_TOTAL', {
                areaTotal: UTIL.formatoValor(
                  'superficie',
                  Math.round(bases.reduce((sum, tBase) => sum + tBase.areaMapa, 0)),
                ),
                potenciaMaxima: UTIL.formatoValor(
                  'potenciaMaxima',
                  Math.round(bases.reduce((sum, tBase) => sum + tBase.potenciaMaxima, 0)),
                ),
              }),
            ),
          }}
        />
      </Box>
    </>
  )
}

export default BasesSummary
