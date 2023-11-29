import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Box } from '@mui/material'

// REACT Solidar Components
import TCBContext from '../TCBContext'
import DialogNewBaseSolar from './DialogNewBaseSolar'
import { useDialog } from '../../components/DialogProvider'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function BasesSummary() {
  const { t, i18n } = useTranslation()
  const { bases, setBases } = useContext(TCBContext)
  const [openDialog, closeDialog] = useDialog()

  const getRowId = (row) => {
    return row.idBaseSolar
  }

  const columns = [
    {
      field: 'nombreBaseSolar',
      headerName: t('BaseSolar.LABEL_nombreBaseSolar'),
      headerClassName: 'dataGrid-headers',
      // renderHeader: () => <strong>{t('LOCATION.LABEL_BASE_NAME')}</strong>,
      headerAlign: 'center',
      width: 250,
      description: t('BaseSolar.TOOLTIP_nombreBaseSolar'),
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
      field: 'inclinacion',
      headerName: t('BaseSolar.LABEL_inclinacion'),
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      description: t('BaseSolar.TOOLTIP_inclinacion'),
      renderCell: (params) => {
        if (params.row.roofType === 'Optimos') return 'Optima'
        if (params.row.roofType === 'Horizontal' && params.row.inclinacionOptima)
          return 'Optima'
        return UTIL.formatoValor('inclinacionPaneles', params.value)
      },
    },
    {
      field: 'inAcimut',
      headerName: t('BaseSolar.LABEL_inAcimut'),
      flex: 1,
      align: 'center',
      description: t('BaseSolar.TOOLTIP_inAcimut'),
      renderCell: (params) => {
        if (params.row.roofType === 'Optimos') return 'Optimo'
        else return UTIL.formatoValor('inAcimut', params.value)
      },
    },
    {
      field: 'panelesMaximo',
      headerName: t('BaseSolar.LABEL_panelesMaximo'),
      flex: 1,
      align: 'center',
      description: t('BaseSolar.TOOLTIP_panelesMaximo'),
    },
    {
      field: 'potenciaMaxima',
      headerName: t('BaseSolar.LABEL_potenciaMaxima'),
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      description: t('BaseSolar.TOOLTIP_potenciaMaxima'),
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

  function footerSummary() {
    // REVISAR: Cual debería ser el colorbackground de los boxes con informacion relevante */

    return (
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
          backgroundColor: 'rgba(220, 249, 233, 1)',
        }}
        justifyContent="center"
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
          }}
          textAlign={'center'}
          dangerouslySetInnerHTML={{
            __html: t('LOCATION.MSG_AREA_TOTAL', {
              areaTotal: UTIL.formatoValor(
                'areaReal',
                Math.round(bases.reduce((sum, tBase) => sum + tBase.areaReal, 0)),
              ),
              potenciaMaxima: UTIL.formatoValor(
                'potenciaMaxima',
                Math.trunc(bases.reduce((sum, tBase) => sum + tBase.potenciaMaxima, 0)),
              ),
            }),
          }}
        />
      </Box>
    )
  }

  return (
    <>
      <Typography variant="h3">{t('LOCATION.LABEL_BASES_SUMMARY')}</Typography>
      <Typography variant="body">{t('LOCATION.PROMPT_BASES_SUMMARY')}</Typography>
      <Box>
        <DataGrid
          getRowId={getRowId}
          rows={bases}
          columns={columns}
          hideFooter={false}
          autoHeight
          sx={{
            boxShadow: 2,
            border: 2,
            borderColor: 'primary.light',
          }}
          slots={{ footer: footerSummary }}
        />
      </Box>
    </>
  )
}
