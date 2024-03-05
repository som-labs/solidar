import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, MenuItem, TextField, Box } from '@mui/material'

//React global components
import { BasesContext } from '../BasesContext'
import { EconomicContext } from '../EconomicContext'
import CollapsibleCard from '../components/CollapsibleCard'
import { SLDRInfoBox } from '../../components/SLDRComponents'

// REACT Solidar Components
import PieChart from '../Summary/Report/PieChart'
import CallSankey from './SankeyFlow/CallSankey'
import InstallationSummary from './InstallationSummary'
import ConsumoGeneracion3D from './ConsumoGeneracion3D'
import EnergyFlow from './EnergyFlow'
import MonthThreeParts from './MonthThreeParts'
import MonthEnergyBalance from './MonthEnergyBalance'
import EnvironmentalImpact from './EnvironmentalImpact'
import HourlyEnergyBalance from './HourlyEnergyBalance'
import PieCharts from './PieCharts'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import calculaResultados from '../classes/calculaResultados'

export default function EnergyBalanceStep() {
  const { t } = useTranslation()
  const [dataReady, setDataReady] = useState(false)
  const [monthlyData, setMonthlyData] = useState()
  const [yearlyData, setYearlyData] = useState({})
  const [monthlyConsumoProduccion, setMonthlyConsumoProduccion] = useState({})
  const { bases, setBases, updateTCBBasesToState } = useContext(BasesContext)
  const { setEcoData } = useContext(EconomicContext)
  const [mes, setMes] = useState('')
  // El proceso de PreparaEnergyBalance ejecutado como exit del wizard ha hecho cambios sobre las bases que se crearon en location por lo que se deben actualizar
  // El optimizador ha asignado la instalacion
  // El rendimiento ha podido cambiar la inclinacion y por lo tanto el area, la configuracion de paneles y la potenciaMaxima
  // Si se usaron angulos optimos tambien ha cambiado el acimut.
  useEffect(() => {
    console.log('USEEFFECT de ENERGYBALANCE sin condiciones')
    updateTCBBasesToState()

    setMonthlyData({
      deficit: TCB.balance.resumenMensual('deficit'),
      autoconsumo: TCB.balance.resumenMensual('autoconsumo'),
      excedente: TCB.balance.resumenMensual('excedente'),
    })
    setYearlyData({
      consumo: TCB.consumo.totalAnual,
      produccion: TCB.produccion.totalAnual,
      deficit: TCB.balance.deficitAnual,
      autoconsumo: TCB.balance.autoconsumo,
      excedente: TCB.balance.excedenteAnual,
      consumoDiurno: TCB.balance.consumoDiurno,
    })
    setMonthlyConsumoProduccion({
      consumo: TCB.consumo.resumenMensual('suma'),
      produccion: TCB.produccion.resumenMensual('suma'),
    })
    setDataReady(true)
  }, [])

  useEffect(() => {
    //REVISAR: porque se ejecuta 3 veces
    console.log('USEEFFECT de ENERGYBALANCE por cambio de CTXbases')

    // Cuando cambian las bases se realiza el cálculo de todas las variables del sistema
    calculaResultados()

    setMonthlyData({
      deficit: TCB.balance.resumenMensual('deficit'),
      autoconsumo: TCB.balance.resumenMensual('autoconsumo'),
      excedente: TCB.balance.resumenMensual('excedente'),
    })

    setYearlyData({
      consumo: TCB.consumo.totalAnual,
      produccion: TCB.produccion.totalAnual,
      deficit: TCB.balance.deficitAnual,
      autoconsumo: TCB.balance.autoconsumo,
      excedente: TCB.balance.excedenteAnual,
      consumoDiurno: TCB.balance.consumoDiurno,
    })
    setMonthlyConsumoProduccion({
      consumo: TCB.consumo.resumenMensual('suma'),
      produccion: TCB.produccion.resumenMensual('suma'),
    })

    setEcoData(TCB.economico)
    setDataReady(true)
  }, [bases, setEcoData])

  //REVISAR: porque se muestra la tabla reducida primero y luego crece

  return (
    <Container>
      <Typography
        variant="body"
        dangerouslySetInnerHTML={{
          __html: t('ENERGY_BALANCE.DESCRIPTION'),
        }}
      />
      <br />
      <SLDRInfoBox>
        <InstallationSummary></InstallationSummary>
      </SLDRInfoBox>
      {/* 


      <SLDRInfoBox>
        <EnergyFlow yearlyData={yearlyData}></EnergyFlow>
      </SLDRInfoBox> */}

      <Box
        sx={{
          display: 'flex',
          mb: 3,
          flexDirection: 'column',
        }}
      >
        <Typography variant="h4" textAlign={'center'}>
          {t('ENERGY_BALANCE.FLOW_TITLE')}
        </Typography>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('ENERGY_BALANCE.FLOW_DESCRIPTION'),
          }}
        />
      </Box>
      <SLDRInfoBox>
        <CallSankey yearlyData={yearlyData}></CallSankey>
      </SLDRInfoBox>

      <CollapsibleCard
        title={t('BASIC.LABEL_AVISO')}
        titleVariant="body"
        titleSX={{ color: 'blue', mb: '-1rem' }}
        descriptionVariant="body"
        descriptionSX={{ fontSize: '15px' }}
        description={t('ENERGY_BALANCE.MSG_disclaimerProduccion')}
      ></CollapsibleCard>

      {dataReady && (
        <SLDRInfoBox sx={{ alignItems: 'center' }}>
          <PieCharts yearlyData={yearlyData}></PieCharts>
        </SLDRInfoBox>
      )}

      <SLDRInfoBox sx={{ alignItems: 'center' }}>
        <Typography variant="h6">
          {t('ENERGY_BALANCE.TITLE_HOURLY_ENERGY_BALANCE')}
        </Typography>
        <TextField
          sx={{ width: 200, height: 50, mt: '1rem', mb: '1rem', ml: '1rem' }}
          select
          value={mes}
          defaultValue={-1}
          label={t('BASIC.LABEL_MES')}
          onChange={(event) => setMes(event.target.value)}
        >
          <MenuItem key={-1} value={t('ENERGY_BALANCE.VALUE_FULL_YEAR')}>
            {t('ENERGY_BALANCE.VALUE_FULL_YEAR')}
          </MenuItem>
          {UTIL.nombreMes.map((nombreMes, index) => (
            <MenuItem key={index} value={index}>
              {t(nombreMes)}
            </MenuItem>
          ))}
        </TextField>
        <HourlyEnergyBalance mes={mes}></HourlyEnergyBalance>
      </SLDRInfoBox>

      <Typography variant="h4" textAlign={'center'}>
        {t('ENERGY_BALANCE.TITLE_MONTH_ENERGY_BALANCE')}
      </Typography>
      <Typography
        variant="body"
        dangerouslySetInnerHTML={{
          __html: t('ENERGY_BALANCE.DESCRIPTION_MONTH_ENERGY_BALANCE'),
        }}
      />
      <SLDRInfoBox>
        {dataReady && (
          <MonthEnergyBalance
            monthlyConsumoProduccion={monthlyConsumoProduccion}
          ></MonthEnergyBalance>
        )}
      </SLDRInfoBox>

      <SLDRInfoBox>
        {dataReady && <MonthThreeParts monthlyData={monthlyData}></MonthThreeParts>}
      </SLDRInfoBox>

      <Typography variant="h4" textAlign={'center'}>
        {t('ENERGY_BALANCE.TITLE_ENVIRONMENTAL_IMPACT')}
      </Typography>
      <Typography
        variant="body"
        dangerouslySetInnerHTML={{
          __html: t('ENERGY_BALANCE.DESCRIPTION_ENVIRONMENTAL_IMPACT'),
        }}
      />
      <SLDRInfoBox sx={{ mt: '1rem' }}>
        <EnvironmentalImpact></EnvironmentalImpact>
      </SLDRInfoBox>

      <SLDRInfoBox>
        <ConsumoGeneracion3D></ConsumoGeneracion3D>
      </SLDRInfoBox>
    </Container>
  )
}
