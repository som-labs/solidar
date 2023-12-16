import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

// REACT Solidar Components
import InputContext from '../InputContext'
import DialogNewBaseSolar from './DialogNewBaseSolar'
import { useDialog } from '../../components/DialogProvider'
import { FooterBox, InfoBox } from '../../components/SLDRComponents'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function BasesSummary() {
  const { t } = useTranslation()
  const { bases, setBases } = useContext(InputContext)
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
    // PENDIENTE: Cual debería ser el colorbackground de los boxes con informacion relevante */

    //REVISAR: porque no funciona el className
    return (
      <FooterBox>
        <Typography
          variant="h6"
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
      </FooterBox>
    )
  }

  return (
    <>
      <Typography variant="h3">{t('LOCATION.LABEL_BASES_SUMMARY')}</Typography>
      <Typography variant="body">{t('LOCATION.PROMPT_BASES_SUMMARY')}</Typography>
      <InfoBox>
        {bases && (
          <DataGrid
            getRowId={getRowId}
            rows={bases}
            columns={columns}
            hideFooter={false}
            rowHeight={30}
            autoHeight
            sx={{
              mb: '1rem',
            }}
            slots={{ footer: footerSummary }}
          />
        )}
      </InfoBox>
    </>
  )
}
