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
import EconomicContext from '../EconomicBalance/EconomicContext'
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

  const [monthlyData, setMonthlyData] = useState({})
  const [yearlyData, setYearlyData] = useState({})
  const [openDialog, closeDialog] = useDialog()

  const { bases, setBases } = useContext(TCBContext)
  const { setEcoData } = useContext(EconomicContext)

  // const [gridRows, setGridRows] = useState(rows)

  const getRowId = (row) => {
    return row.idBaseSolar
  }

  const columns = [
    // { field: 'idBaseSolar', headerName: 'ID', width: 50 },
    {
      field: 'nombreBaseSolar',
      headerName: t('BaseSolar.LABEL_nombreBaseSolar'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 250,
    },
    {
      field: 'paneles',
      editable: true,
      headerName: 'Paneles',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 0.5,
      align: 'center',
      renderCell: (params) => {
        return UTIL.formatoValor('paneles', params.value)
      },
      //REVISAR: validacion de paneles
      preProcessEditCellProps: (params) => {
        console.log(params)
        const { props, row } = params
        console.log(props, row)
        const hasError = props.value > row.panelesMaximo
        console.log(hasError)
        if (hasError) {
          alert(t('resultados_MSG_excesoPotencia'))
          console.log({
            ...params.props,
            value: row.panelesMaximo,
            error: hasError,
          })
          return { ...params.props, value: row.panelesMaximo, error: hasError }
        }
        console.log(params)
        return params
      },
    },
    {
      field: 'panelesMaximo',
      headerName: t('BaseSolar.LABEL_panelesMaximo'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      description: t('BaseSolar.TOOLTIP_panelesMaximo'),
    },
    {
      field: 'potenciaMaxima',
      headerName: 'Pot. Maxima',
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaMaxima', params.value)
      },
    },
    {
      field: 'potenciaUnitaria',
      editable: true,
      headerName: 'Potencia Unitaria',
      headerClassName: 'super-app-theme--header',
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
      headerClassName: 'super-app-theme--header',
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

  function footerSummary() {
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
        <Typography variant="h5">
          {t('ENERGY_BALANCE.TOTAL_PANELS', {
            paneles: Math.round(
              bases.reduce((sum, tBase) => sum + parseInt(tBase.paneles), 0),
            ),
          })}
        </Typography>
      </Box>
    )
  }

  // El proceso de PreparaEnergyBalance ejecutado como exit del wizard ha hecho cambios sobre las bases que se crearon en location por lo que se deben actualizar
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
    setMonthlyData({
      deficit: TCB.balance.resumenMensual('deficit'),
      autoconsumo: TCB.balance.resumenMensual('autoconsumo'),
      excedente: TCB.balance.resumenMensual('excedente'),
    })
    setYearlyData({
      consumo: TCB.consumo.cTotalAnual,
      produccion: TCB.produccion.pTotalAnual,
      deficit: TCB.balance.deficitAnual,
      autoconsumo: TCB.balance.autoconsumo,
      excedente: TCB.balance.excedenteAnual,
    })
  }, [])

  useEffect(() => {
    // Cuando cambian las base se realiza el cálculo de todas las variables del sistema
    console.log('a calcula resultados')
    calculaResultados()
    setMonthlyData({
      deficit: TCB.balance.resumenMensual('deficit'),
      autoconsumo: TCB.balance.resumenMensual('autoconsumo'),
      excedente: TCB.balance.resumenMensual('excedente'),
    })
    setYearlyData({
      consumo: TCB.consumo.cTotalAnual,
      produccion: TCB.produccion.pTotalAnual,
      deficit: TCB.balance.deficitAnual,
      autoconsumo: TCB.balance.autoconsumo,
      excedente: TCB.balance.excedenteAnual,
    })
    setEcoData(TCB.economico)
  }, [bases])

  /**
   * Funcion para gestionar el evento generado por cambio de paneles o potenciaUnitaria en la tabla de bases
   * @param {params} DataGrid parmas object {field, row} que ha cambiado de valor
   * @param {string} propiedad Puede ser paneles o potenica unitaria
   */

  function nuevaInstalacion(params, event) {
    let tmpPaneles
    if (params.field === 'paneles') {
      tmpPaneles = parseInt(event.target.value)
      if (tmpPaneles > params.row.panelesMaximo) {
        alert('error')
        return
        // tmpPaneles = params.row.panelesMaximo
        // params.row.paneles = params.row.panelesMaximo
        // console.log(bases)
      }
    }
    let tmpPotenciaUnitaria =
      params.field === 'potenciaUnitaria'
        ? parseFloat(event.target.value)
        : params.row.potenciaUnitaria

    let baseActiva = TCB.BaseSolar.find((base) => {
      return base.idBaseSolar === params.id
    })
    baseActiva.instalacion.potenciaUnitaria = tmpPotenciaUnitaria
    baseActiva.instalacion.paneles = tmpPaneles

    TCB.totalPaneles = TCB.BaseSolar.reduce((a, b) => {
      return a + b.instalacion.paneles
    }, 0)

    const updateBases = bases.map((row) => {
      if (row.idBaseSolar === params.id) {
        return {
          ...row,
          [params.field]: event.target.value,
          ['potenciaTotal']: tmpPaneles * tmpPotenciaUnitaria,
        }
      }
      return row
    })
    setBases(updateBases)
  }

  return (
    <>
      <Container>
        <Box>
          <Typography variant="h3">{t('ENERGY_BALANCE.TITLE')}</Typography>

          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ENERGY_BALANCE.DESCRIPTION'),
            }}
          />

          <Typography variant="body">{t('tabla bases asignadas')}</Typography>
          <DataGrid
            getRowId={getRowId}
            autoHeight
            onCellEditStop={(params, event) => {
              nuevaInstalacion(params, event)
            }}
            rows={bases}
            columns={columns}
            hideFooter={false}
            sx={{
              boxShadow: 2,
              border: 2,
              borderColor: 'primary.light',
            }}
            slots={{ footer: footerSummary }}
          />
        </Box>

        <ConsumoGeneracion3D></ConsumoGeneracion3D>
        <EnergyFlow yearlyData={yearlyData}></EnergyFlow>
        <YearEnergyBalance></YearEnergyBalance>
        <MonthEnergyBalance monthlyData={monthlyData}></MonthEnergyBalance>
        <EnvironmentalImpact></EnvironmentalImpact>
      </Container>
    </>
  )
}
