import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Typography, Container } from '@mui/material'
//React global components
import { BasesContext } from '../BasesContext'
import { EconomicContext } from '../EconomicContext'
import { EnergyContext } from '../EnergyContext'
import { GlobalContext } from '../GlobalContext'
import { ConsumptionContext } from '../ConsumptionContext'

import { useAlert } from '../../components/AlertProvider'
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'
import Consumo from '../classes/Consumo'
import { optimizador } from '../classes/optimizador'
import calculaResultados from '../classes/calculaResultados'
import { useTheme } from '@mui/material/styles'

export default function PreparaEnergyBalance() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { SLDRAlert } = useAlert()
  const { newBases, newPrecios, newPanelActivo, newTiposConsumo, setNewTiposConsumo } =
    useContext(GlobalContext)

  const { bases, setBases, tipoPanelActivo } = useContext(BasesContext)

  const { fincas, setFincas, zonasComunes, tiposConsumo, getConsumoTotal } =
    useContext(ConsumptionContext)
  const { consumoGlobal, setConsumoGlobal, calculaResultados, produccion, balance } =
    useContext(EnergyContext)

  //   useEffect(() => {
  // console.log('BUILDING CONSUMO?', newTiposConsumo)
  // let newConsumo
  // if (newTiposConsumo) {
  //   newConsumo = new Consumo(tiposConsumo, fincas, zonasComunes)
  //   TCB.requiereOptimizador = true

  //   //setConsumo(newConsumo)

  //   console.log(
  //     Object.create(
  //       Object.getPrototypeOf(newConsumo),
  //       Object.getOwnPropertyDescriptors(newConsumo),
  //     ),
  //   )
  //   setConsumo(
  //     Object.create(
  //       Object.getPrototypeOf(newConsumo),
  //       Object.getOwnPropertyDescriptors(newConsumo),
  //     ),
  //   )

  //   if (TCB.modoActivo !== 'INDIVIDUAL') {
  //     //Calculamos el coeficiente del consumo de cada finca sobre el total
  //     for (const f of fincas) {
  //       f.coefConsumo = getConsumoTotal(f.nombreTipoConsumo) / consumo.totalAnual
  //     }
  //   }
  //   UTIL.debugLog('PreparaEnergyBalance - Nuevo consumo global creado', newConsumo)
  //   setNewTiposConsumo(false)
  //   console.log('Consumo Global creado', consumo, newConsumo)
  // }
  //     console.log('Consumo en preparaEnergyBalance', consumo)
  //     if (newBases) {
  //       UTIL.debugLog('PreparaEnergyBalance - Todas las bases listas llama optimizador')
  //       // Se ejecuta el optimizador para determinar la configuración inicial propuesta
  //       let pendiente = optimizador(bases, consumo, tipoPanelActivo.potencia)
  //       if (pendiente > 0) {
  //         UTIL.debugLog(
  //           'PreparaEnergyBalance - No hay superficie suficiente. Falta: ' + pendiente,
  //         )
  //         //PENDIENTE: ver como procesamos este aviso
  //         SLDRAlert(
  //           'AREA LIMITADA',
  //           'No es posible instalar los paneles necesarios.\nPendiente: ' +
  //             UTIL.formatoValor('energia', pendiente) +
  //             '\nContinuamos con el máximo número de paneles posible',
  //           'Warning',
  //         )
  //       }
  //       getResultados()
  //       console.log('Vuelve de calcula resultados', produccion, balance)
  //     }
  //   }, [])

  //   async function getResultados() {
  //     await calculaResultados()
  //   }
  return (
    <>
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            width: '100%',
            mt: '1rem',
            mb: '1rem',
          }}
        >
          <Typography sx={theme.titles.level_2} textAlign={'center'} color={'#4D4D4D'}>
            Prepara EnergyBalance con consumo {consumoGlobal.totalAnual}
          </Typography>
        </Box>
      </Container>
    </>
  )
}
