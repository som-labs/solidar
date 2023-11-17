import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import InfoIcon from '@mui/icons-material/Info'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

// REACT Solidar Components
import TCBContext from '../TCBContext'
import { optimizador } from '../classes/optimizador'
import calculaResultados from '../classes/calculaResultados'
import ConsumoGeneracion3D from './ConsumoGeneracion3D'
import EnergyFlow from './EnergyFlow'
import YearEnergyBalance from './YearEnergyBalance'
import MonthEnergyBalance from './MonthEnergyBalance'
import EnvironmentalImpact from './EnvironmentalImpact'
import { useDialog } from '../../components/DialogProvider'
import DialogProperties from '../components/DialogProperties'

export default function EnergyBalanceStep() {
  const { t, i18n } = useTranslation()
  const [resumen, setResumen] = useState([])
  const [openDialog, closeDialog] = useDialog()
  const { bases, setBases, tipoConsumo, setTipoConsumo } = useContext(TCBContext)

  function getRowId(row) {
    return row.idBaseSolar
  }

  const columns = [
    // { field: 'idBaseSolar', headerName: 'ID', width: 50 },
    {
      field: 'nombreBaseSolar',
      headerName: 'Nombre',
      headerAlign: 'center',
      width: 250,
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
      field: 'potenciaUnitaria',
      headerName: 'Potencia Unitaria',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaUnitaria', params.value)
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
    {
      field: 'actions',
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          key={1}
          icon={<InfoIcon />}
          label="Delete"
          onClick={() => showProperties(params.id)}
        />,
      ],
    },
  ]

  function showProperties(id) {
    const baseActiva = TCB.BaseSolar.find((base) => {
      return base.idBaseSolar === id
    })
    openDialog({
      children: (
        <DialogProperties data={baseActiva} descripcion={'DDD'} onClose={closeDialog} />
      ),
    })
  }

  //El proceso de PreparaEnergyBalance ha hecho cambios sobre las bases que se crearon en location por lo que se deben actualizar
  // El optimizador ha asignado la instalacion
  // El rendimiento ha podido cambiar la inclinacion y por lo tanto el area, la configuracion de paneles y la potenciaMaxima
  // Si se usaron angulos optimos tambien ha cambiado el acimut.
  useEffect(() => {
    let oldBases = [...bases]
    TCB.BaseSolar.forEach((base) => {
      const nIndex = oldBases.findIndex((t) => {
        return t.idBaseSolar === base.idBaseSolar
      })
      oldBases[nIndex].paneles = base.instalacion.paneles
      oldBases[nIndex].potenciaUnitaria = base.instalacion.potenciaUnitaria
      oldBases[nIndex].potenciaTotal = base.instalacion.potenciaTotal
      oldBases[nIndex].potenciaMaxima = base.potenciaMaxima
      oldBases[nIndex].areaReal = base.areaReal
      oldBases[nIndex].inclinacion = base.inclinacion
      oldBases[nIndex].inAcimut = base.inAcimut
      oldBases[nIndex].panelesMaximo = base.panelesMaximo
    })
    setBases(oldBases)
    setResumen(TCB.produccion.resumenMensual('suma'))
  }, [])

  useEffect(() => {
    // Se realiza el cálculo de todas las variables de energia del sistema
    calculaResultados()
    setResumen(TCB.produccion.resumenMensual('suma'))
  }, [bases])

  return (
    <>
      <Container>
        <Typography variant="h3">{t('ENERGY_BALANCE.TITLE')}</Typography>

        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('ENERGY_BALANCE.DESCRIPTION'),
          }}
        />
        <div>
          <Typography variant="body">{t('tabla bases asignadas')}</Typography>
          <DataGrid
            getRowId={getRowId}
            rows={bases}
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
        </div>
        <div>
          <Typography variant="h5">
            {t('ENERGY_BALANCE.TOTAL_PANELS', {
              paneles: Math.round(bases.reduce((sum, tBase) => sum + tBase.paneles, 0)),
            })}
          </Typography>
        </div>

        <Box>
          <ConsumoGeneracion3D></ConsumoGeneracion3D>
        </Box>
        <EnergyFlow></EnergyFlow>
        <YearEnergyBalance></YearEnergyBalance>
        <MonthEnergyBalance resumen={resumen}></MonthEnergyBalance>
        <EnvironmentalImpact></EnvironmentalImpact>
      </Container>
    </>
  )
}
