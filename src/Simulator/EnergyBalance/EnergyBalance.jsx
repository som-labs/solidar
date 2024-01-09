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

import { BasesContext } from '../BasesContext'
import { EconomicContext } from '../EconomicContext'
import calculaResultados from '../classes/calculaResultados'
import ConsumoGeneracion3D from './ConsumoGeneracion3D'
import EnergyFlow from './EnergyFlow'
import { SLDRFooterBox, SLDRInfoBox } from '../../components/SLDRComponents'
import { AlertContext } from '../components/Alert'
import MonthThreeParts from './MonthThreeParts'
import MonthEnergyBalance from './MonthEnergyBalance'
import EnvironmentalImpact from './EnvironmentalImpact'
import { useDialog } from '../../components/DialogProvider'
import DialogProperties from '../components/DialogProperties'
import { Tooltip } from '@mui/material'

export default function EnergyBalanceStep() {
  const { t } = useTranslation()
  const { SLDRAlert } = useContext(AlertContext)

  const [monthlyData, setMonthlyData] = useState({})
  const [yearlyData, setYearlyData] = useState({})
  const [monthlyConsumoProduccion, setMonthlyConsumoProduccion] = useState({})
  const [openDialog, closeDialog] = useDialog()

  const { bases, setBases } = useContext(BasesContext)
  const { setEcoData } = useContext(EconomicContext)

  const getRowId = (row) => {
    return row.idBaseSolar
  }

  const columns = [
    {
      field: 'nombreBaseSolar',
      headerName: t('BaseSolar.PROP.nombreBaseSolar'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      width: 250,
      description: t('BaseSolar.TOOLTIP.nombreBaseSolar'),
      sortable: false,
    },
    {
      field: 'paneles',
      editable: true,
      headerName: t('Instalacion.PROP.paneles'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 0.5,
      align: 'center',
      description: t('Instalacion.TOOLTIP.paneles'),
      renderCell: (params) => {
        return UTIL.formatoValor('paneles', params.value)
      },
      cellClassName: (params) => {
        return clsx('super-app', {
          negative: params.value > params.row.panelesMaximo,
          positive: params.value <= params.row.panelesMaximo,
        })
      },
    },
    {
      field: 'panelesMaximo',
      headerName: t('BaseSolar.PROP.panelesMaximo'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      description: t('BaseSolar.TOOLTIP.panelesMaximo'),
      sortable: false,
    },
    {
      field: 'potenciaMaxima',
      headerName: t('BaseSolar.PROP.potenciaMaxima'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      description: t('BaseSolar.TOOLTIP.potenciaMaxima'),
      sortable: false,
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaMaxima', params.value)
      },
    },
    {
      field: 'potenciaUnitaria',
      editable: true,
      headerName: t('Instalacion.PROP.potenciaUnitaria'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      description: t('Instalacion.TOOLTIP.potenciaUnitaria'),
      sortable: false,
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaUnitaria', params.value)
      },
    },
    {
      field: 'potenciaTotal',
      headerName: t('Instalacion.PROP.potenciaTotal'),
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      description: t('Instalacion.TOOLTIP.potenciaTotal'),
      sortable: false,
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaTotal', params.value)
      },
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      getActions: (params) => [
        <GridActionsCellItem
          key={1}
          icon={
            <Tooltip title={t('RESULTS.TOOLTIP_botonInfoBase')}>
              <InfoIcon />
            </Tooltip>
          }
          label="Info"
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: '8px',
          borderTop: '1px solid rgba(224, 224, 224, 1)',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div style={{ flex: '0 0 250px' }} /> {/* Placeholder for ID column */}
        <div style={{ flex: '0.5', textAlign: 'center' }}>
          <strong>
            {bases.reduce((sum, tBase) => sum + parseInt(tBase.paneles), 0)}
          </strong>
        </div>
        <div style={{ flex: '1', textAlign: 'center' }}>
          <strong>
            {bases.reduce((sum, tBase) => sum + parseInt(tBase.panelesMaximo), 0)}
          </strong>
        </div>
        <div style={{ flex: '1', textAlign: 'right' }}>
          <strong>
            {UTIL.formatoValor(
              'potenciaMaxima',
              bases.reduce((sum, tBase) => sum + parseInt(tBase.potenciaMaxima), 0),
            )}
          </strong>
        </div>
        <div style={{ flex: '1' }} /> {/* Placeholder for ID column */}
        <div style={{ flex: '1', textAlign: 'right' }}>
          <strong>
            {UTIL.formatoValor(
              'potenciaTotal',
              bases.reduce((sum, tBase) => sum + parseInt(tBase.potenciaTotal), 0),
            )}
          </strong>
        </div>
        <div style={{ flex: '0.6', textAlign: 'center' }}></div>
      </div>
    )

    //return (
    // <SLDRFooterBox>
    //   <Typography variant="h5">
    //     {t('ENERGY_BALANCE.TOTAL_PANELS', {
    //       paneles: Math.round(
    //         bases.reduce((sum, tBase) => sum + parseInt(tBase.paneles), 0),
    //       ),
    //     })}
    //   </Typography>
    // </SLDRFooterBox>
    //)
  }

  // El proceso de PreparaEnergyBalance ejecutado como exit del wizard ha hecho cambios sobre las bases que se crearon en location por lo que se deben actualizar
  // El optimizador ha asignado la instalacion
  // El rendimiento ha podido cambiar la inclinacion y por lo tanto el area, la configuracion de paneles y la potenciaMaxima
  // Si se usaron angulos optimos tambien ha cambiado el acimut.
  useEffect(() => {
    let oldBases = [...bases]
    for (let base of TCB.BaseSolar) {
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
    }
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
    setMonthlyConsumoProduccion({
      consumo: TCB.consumo.resumenMensual('suma'),
      produccion: TCB.produccion.resumenMensual('suma'),
    })
  }, [])

  useEffect(() => {
    //REVISAR: porque se ejecuta 3 veces
    console.log('USEEFFECT de ENERGYBALANCE')
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
    setMonthlyConsumoProduccion({
      consumo: TCB.consumo.resumenMensual('suma'),
      produccion: TCB.produccion.resumenMensual('suma'),
    })

    setEcoData(TCB.economico)
  }, [bases, setEcoData])

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
        SLDRAlert(
          'VALIDACION',
          'Esta asignando mas paneles que los ' +
            params.row.panelesMaximo +
            ' que estimamos se pueden instalar en el area definida',
          'error',
        )
      }
    }
    let tmpPotenciaUnitaria =
      params.field === 'potenciaUnitaria'
        ? parseFloat(event.target.value)
        : params.row.potenciaUnitaria

    //Update this BaseSolar panels and potenciaUnitaria in context
    let newBases = bases.map((b) => {
      if (b.idBaseSolar === params.id) {
        b.paneles = tmpPaneles
      }
      return b
    })
    setBases(newBases)
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

    //Update bases in BasesContext
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

    setBases(updateBases)
  }

  return (
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
        }}
      >
        <Typography variant="h3">{t('ENERGY_BALANCE.TITLE')}</Typography>

        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('ENERGY_BALANCE.DESCRIPTION'),
          }}
        />
        <br />
        <Typography variant="body">{t('Tabla bases asignadas')}</Typography>

        <SLDRInfoBox>
          <DataGrid
            getRowId={getRowId}
            rows={bases}
            columns={columns}
            hideFooter={false}
            autoHeight
            disableColumnMenu
            onCellEditStop={(params, event) => {
              nuevaInstalacion(params, event)
            }}
            slots={{ footer: footerSummary }}
          />
        </SLDRInfoBox>
      </Box>
      <SLDRInfoBox>
        <ConsumoGeneracion3D></ConsumoGeneracion3D>
      </SLDRInfoBox>
      <SLDRInfoBox>
        <EnergyFlow yearlyData={yearlyData}></EnergyFlow>
      </SLDRInfoBox>
      <CollapsibleCard
        title={t('BASIC.LABEL_AVISO')}
        titleVariant="body"
        titleSX={{ color: 'blue', mb: '-1rem' }}
        descriptionVariant="body"
        descriptionSX={{ fontSize: '15px' }}
        description={t('ENERGY_BALANCE.MSG_disclaimerProduccion')}
      ></CollapsibleCard>
      <SLDRInfoBox>
        <MonthEnergyBalance
          monthlyConsumoProduccion={monthlyConsumoProduccion}
        ></MonthEnergyBalance>
      </SLDRInfoBox>
      <SLDRInfoBox>
        <MonthThreeParts monthlyData={monthlyData}></MonthThreeParts>
      </SLDRInfoBox>
      <SLDRInfoBox>
        <EnvironmentalImpact></EnvironmentalImpact>
      </SLDRInfoBox>{' '}
    </Container>
  )
}
