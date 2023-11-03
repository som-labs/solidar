import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import * as UTIL from '../classes/Utiles'
import TCBContext from '../TCBContext'
import TCB from '../classes/TCB'
import { Box } from '@mui/material'

const BasesSummary = () => {
  const { t, i18n } = useTranslation()
  const { bases, setBases, tipoConsumo, setTipoConsumo } = useContext(TCBContext)

  //REVISAR: cual es la clase que se aplica a los headers de las tablas?

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
      ],
    },
  ]

  function deleteBaseSolar(rowId) {
    console.log(rowId)

    let prevBases = [...bases]
    const nIndex = prevBases.findIndex((bs) => {
      return bs.idBaseSolar === rowId
    })

    TCB.requiereOptimizador = true

    // Delete OpenLayers geometries
    for (const geoProp in TCB.Especificaciones.BaseSolar.geometrias) {
      const componentId = 'BaseSolar.' + geoProp + '.' + rowId
      const component = TCB.origenDatosSolidar.getFeatureById(componentId)
      TCB.origenDatosSolidar.removeFeature(component)
    }

    prevBases.splice(nIndex, 1)
    TCB.BaseSolar.splice(nIndex, 1)
    setBases(prevBases)
  }

  function getRowId(row) {
    return row.idBaseSolar
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
      <Typography variant="h6">
        {t('LOCATION.MSG_AREA_TOTAL', {
          areaTotal: UTIL.formatoValor(
            'superficie',
            Math.round(bases.reduce((sum, tBase) => sum + tBase.areaMapa, 0)),
          ),
        })}
      </Typography>
    </>
  )
}

export default BasesSummary
