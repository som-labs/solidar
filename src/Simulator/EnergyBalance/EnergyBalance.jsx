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
import { FooterBox, InfoBox } from '../../components/SLDRComponents'
import MonthThreeParts from './MonthThreeParts'
import MonthEnergyBalance from './MonthEnergyBalance'
import EnvironmentalImpact from './EnvironmentalImpact'
import { useDialog } from '../../components/DialogProvider'
import DialogProperties from '../components/DialogProperties'

export default function EnergyBalanceStep() {
  const { t } = useTranslation()

  const [monthlyData, setMonthlyData] = useState({})
  const [yearlyData, setYearlyData] = useState({})
  const [monthlyConsumoProduccion, setMonthlyConsumoProduccion] = useState({})
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
      <FooterBox>
        <Typography variant="h5">
          {t('ENERGY_BALANCE.TOTAL_PANELS', {
            paneles: Math.round(
              bases.reduce((sum, tBase) => sum + parseInt(tBase.paneles), 0),
            ),
          })}
        </Typography>
      </FooterBox>
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
    setMonthlyConsumoProduccion({
      consumo: TCB.consumo.resumenMensual('suma'),
      produccion: TCB.produccion.resumenMensual('suma'),
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
    setMonthlyConsumoProduccion({
      consumo: TCB.consumo.resumenMensual('suma'),
      produccion: TCB.produccion.resumenMensual('suma'),
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

    console.log('PANELSTOTAL', TCB.totalPaneles)

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

          <InfoBox>
            <DataGrid
              getRowId={getRowId}
              autoHeight
              onCellEditStop={(params, event) => {
                nuevaInstalacion(params, event)
              }}
              rows={bases}
              columns={columns}
              hideFooter={false}
              slots={{ footer: footerSummary }}
            />
          </InfoBox>
        </Box>

        <InfoBox>
          <ConsumoGeneracion3D></ConsumoGeneracion3D>
        </InfoBox>
        {/* </Box> */}
        <InfoBox>
          <EnergyFlow yearlyData={yearlyData}></EnergyFlow>
        </InfoBox>
        <CollapsibleCard
          title={t('BASIC.LABEL_AVISO')}
          titleVariant="body"
          titleSX={{ color: 'blue', mb: '-1rem' }}
          descriptionVariant="body"
          descriptionSX={{ fontSize: '15px' }}
          description={t('ENERGY_BALANCE.MSG_disclaimerProduccion')}
        ></CollapsibleCard>
        <InfoBox>
          <MonthEnergyBalance
            monthlyConsumoProduccion={monthlyConsumoProduccion}
          ></MonthEnergyBalance>
        </InfoBox>
        <InfoBox>
          <MonthThreeParts monthlyData={monthlyData}></MonthThreeParts>
        </InfoBox>
        <InfoBox>
          <EnvironmentalImpact></EnvironmentalImpact>
        </InfoBox>
      </Container>
    </>
  )
}
