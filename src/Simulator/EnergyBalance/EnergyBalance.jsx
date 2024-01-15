import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container } from '@mui/material'

//React global components
import { BasesContext } from '../BasesContext'
import { EconomicContext } from '../EconomicContext'
import CollapsibleCard from '../components/CollapsibleCard'
import { SLDRInfoBox } from '../../components/SLDRComponents'

// REACT Solidar Components
import InstallationSummary from './InstallationSummary'
import ConsumoGeneracion3D from './ConsumoGeneracion3D'
import EnergyFlow from './EnergyFlow'
import MonthThreeParts from './MonthThreeParts'
import MonthEnergyBalance from './MonthEnergyBalance'
import EnvironmentalImpact from './EnvironmentalImpact'

// Solidar objects
import TCB from '../classes/TCB'
import calculaResultados from '../classes/calculaResultados'

export default function EnergyBalanceStep() {
  const { t } = useTranslation()

  const [monthlyData, setMonthlyData] = useState({})
  const [yearlyData, setYearlyData] = useState({})
  const [monthlyConsumoProduccion, setMonthlyConsumoProduccion] = useState({})
  const { bases, setBases } = useContext(BasesContext)
  const { setEcoData } = useContext(EconomicContext)

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

    // Cuando cambian las bases se realiza el cálculo de todas las variables del sistema
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
      {/* </Box> */}
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
      </SLDRInfoBox>
    </Container>
  )
}
