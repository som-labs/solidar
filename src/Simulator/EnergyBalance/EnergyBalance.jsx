import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import InfoIcon from '@mui/icons-material/Info'
import clsx from 'clsx'

//React global components
import CollapsibleCard from '../components/CollapsibleCard'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

// REACT Solidar Components
import InputContext from '../InputContext'
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

  const { bases, setBases } = useContext(InputContext)
  const { setEcoData } = useContext(EconomicContext)

  // const [gridRows, setGridRows] = useState(rows)

  const getRowId = (row) => {
    return row.idBaseSolar
  }

  const columns = [
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
      cellClassName: (params) => {
        return clsx('super-app', {
          negative: params.value > params.row.panelesMaximo,
          positive: params.value <= params.row.panelesMaximo,
        })
      },

      //REVISAR: validacion de paneles
      // preProcessEditCellProps: (params) => {
      //   console.log(params)
      //   const { props, row } = params
      //   const hasError = props.value > row.panelesMaximo
      //   console.log(hasError)
      //   if (hasError) {
      //     alert(t('resultados_MSG_excesoPotencia'))
      //     return {
      //       ...params,
      //       //value: row.panelesMaximo,
      //       error: hasError,
      //       //unstable_updateValueOnRender: false,
      //     }
      //   }
      //   console.log(params)
      //   return params
      // },
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
    console.log(bases)
    console.log('PARAMS:', params)
    let tmpPaneles
    if (params.field === 'paneles') {
      tmpPaneles = parseInt(event.target.value)
      console.log('CONDICION: ', tmpPaneles > params.row.panelesMaximo)
      console.log('CONDICION VALUES: ', tmpPaneles, params.row.panelesMaximo)
      if (tmpPaneles > params.row.panelesMaximo) {
        alert(
          'Esta asignando mas paneles que los ' +
            params.row.panelesMaximo +
            ' que estimamos se pueden instalar en el area definida',
        )
      }
    }
    let tmpPotenciaUnitaria =
      params.field === 'potenciaUnitaria'
        ? parseFloat(event.target.value)
        : params.row.potenciaUnitaria

    //Update this BaseSolar panels and potenciaUnitaria in TCB
    let baseActiva = TCB.BaseSolar.find((base) => {
      return base.idBaseSolar === params.id
    })
    baseActiva.instalacion.potenciaUnitaria = tmpPotenciaUnitaria
    baseActiva.instalacion.paneles = tmpPaneles

    //Update total number of panels in TCB
    TCB.totalPaneles = bases.reduce((a, b) => {
      return a + b.paneles
    }, 0)

    //Update bases in InputContext
    const updateBases = bases.map((row) => {
      if (row.idBaseSolar === params.id) {
        return {
          ...row,
          [params.field]: event.target.value,
          ['potenciaTotal']: tmpPaneles * tmpPotenciaUnitaria,
        }
      } else {
        return row
      }
    })
    console.log(updateBases)
    setBases(updateBases)
  }

  return (
    <>
      <Container>
        <Box
          sx={{
            '& .super-app.negative': {
              backgroundColor: '#ff0000',
              color: '#1a3e72',
              fontWeight: '400',
            },
            '& .super-app.positive': {
              backgroundColor: 'rgba(157, 255, 118, 0.49)',
              color: '#1a3e72',
              fontWeight: '400',
            },
            mb: '1rem',
          }}
        >
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
              borderColor: 'primary.light',
            }}
            slots={{ footer: footerSummary }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1,
            border: 2,
            borderColor: 'primary.light',
            mb: '1rem',
            borderRadius: 4,
          }}
        >
          <ConsumoGeneracion3D></ConsumoGeneracion3D>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1,
            border: 2,
            borderColor: 'primary.light',
            borderRadius: 4,
          }}
        >
          <EnergyFlow yearlyData={yearlyData}></EnergyFlow>
        </Box>
        <CollapsibleCard
          title={t('BASIC.LABEL_AVISO')}
          titleVariant="body"
          titleSX={{ color: 'blue', mb: '-1rem' }}
          descriptionVariant="body"
          descriptionSX={{ fontSize: '15px' }}
          description={t('ENERGY_BALANCE.MSG_disclaimerProduccion')}
        ></CollapsibleCard>
        {/* <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1,
            border: 2,
            borderColor: 'primary.light',
            mt: '1rem',
            mb: '1rem',
            borderRadius: 4,
          }}
        >
          <YearEnergyBalance></YearEnergyBalance>
        </Box> */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1,
            border: 2,
            borderColor: 'primary.light',
            mt: '1rem',
            mb: '1rem',
            borderRadius: 4,
          }}
        >
          <MonthEnergyBalance monthlyData={monthlyData}></MonthEnergyBalance>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1,
            border: 2,
            borderColor: 'primary.light',
            mt: '1rem',
            mb: '1rem',
            borderRadius: 4,
          }}
        >
          <EnvironmentalImpact></EnvironmentalImpact>
        </Box>
      </Container>
    </>
  )
}
