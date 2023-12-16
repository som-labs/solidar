import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Container from '@mui/material/Container'

import Alert from '@mui/material/Alert'
import BasicAlert from './components/BasicAlert'
import AppFrame from '../components/AppFrame'
import Wizard from '../components/Wizard'

import LocationStep from './Location/Location'
import ConsumptionStep from './Consumption/Consumption'
import EnergyBalanceStep from './EnergyBalance/EnergyBalance'
import EconomicBalanceStep from './EconomicBalance/EconomicBalance'
import SummaryStep from './Summary/Summary'

import InputContext from './InputContext'
import MapContext from './MapContext'
import EconomicContext from './EconomicBalance/EconomicContext'

import PreparaEnergyBalance from './EnergyBalance/PreparaEnergyBalance'

import TCB from './classes/TCB'
import * as UTIL from './classes/Utiles'

import InicializaAplicacion from './classes/InicializaAplicacion'
import Consumo from './classes/Consumo'
import { useDialog } from '../components/DialogProvider'

InicializaAplicacion()

export default function Page() {
  const { t, i18n } = useTranslation()
  const [openDialog, closeDialog] = useDialog()
  const [bases, setBases] = useState([])

  useEffect(() => {}, [])

  const [map, setMap] = useState()

  const [tipoConsumo, setTipoConsumo] = useState(
    TCB.TipoConsumo.map((tipoConsumo) => {
      return {
        idTipoConsumo: tipoConsumo.idTipoConsumo,
        nombreTipoConsumo: tipoConsumo.nombreTipoConsumo,
        fuente: tipoConsumo.fuente,
        consumoAnualREE: tipoConsumo.consumoAnualREE,
        ficheroCSV: tipoConsumo.ficheroCSV,
        nombreFicheroCSV: tipoConsumo.nombreFicheroCSV,
        nombreTarifa: tipoConsumo.nombreTarifa,
        territorio: tipoConsumo.territorio,
      }
    }),
  )

  const [IBI, setIBI] = useState({
    valorSubvencionIBI: 0,
    porcientoSubvencionIBI: 0,
    tiempoSubvencionIBI: 0,
  })

  const [precioInstalacionCorregido, setPrecioInstalacionCorregido] = useState()
  const [subvencionEU, setSubvencionEU] = useState('Sin')
  const [valorSubvencionEU, setValorSubvencionEU] = useState(0)
  const [cuotaHucha, setCuotaHucha] = useState(0)
  const [coefHucha, setCoefHucha] = useState(0)
  const [ecoData, setEcoData] = useState({})

  const validaLocation = () => {
    if (TCB.BaseSolar.length > 0) {
      //Carga rendimientos de cada base que lo requiera asincronicamente
      //La propiedad requierePVGIS es gestionada en GestionLocalizacion y se pone a true cuando cambia algun angulo
      try {
        let oldBases = [...bases]
        TCB.BaseSolar.forEach((base) => {
          if (base.requierePVGIS) {
            UTIL.debugLog('Base requiere PVGIS:', base)
            base.cargaRendimiento()
            TCB.requiereOptimizador = true
          }
        })
        setBases(oldBases)
        return true
      } catch (err) {
        //     //alert ("Error en validacion de Localizacion: " + err);
        //     return ("Error en validacion de Localizacion: " + err);
      }
      return false
    } else {
      showAlert('VALIDACION', t('LOCATION.ERROR_DEFINE_BASE'), 'error')
      return false
    }
  }

  //REVISAR: como meter el codigo del alert en un componente reutilizable porque no funciona el BasicAlert
  const showAlert = (title, message, type) => {
    openDialog({
      children: (
        <BasicAlert
          title={title}
          contents={message}
          type={type}
          onClose={() => closeDialog()}
        ></BasicAlert>
      ),
    })
  }

  async function validaTipoConsumo() {
    if (TCB.TipoConsumo.length === 0) {
      showAlert('VALIDACION', t('CONSUMPTION.ERROR_AL_MENOS_UN_TIPOCONSUMO'), 'error')
      return false
    }

    let status = true
    for (const tipoConsumo of TCB.TipoConsumo) {
      if (tipoConsumo.fuente === 'REE') {
        if (!(tipoConsumo.consumoAnualREE > 0)) {
          showAlert(
            tipoConsumo.nombreTipoConsumo +
              '\n' +
              t('consumo_MSG_definirPotenciaBaseREE', 'error'),
          )
          status = false
          break
        }
      } else if (tipoConsumo.fuente === 'CSV' || tipoConsumo.fuente === 'DATADIS') {
        if (tipoConsumo.ficheroCSV === null) {
          showAlert(
            tipoConsumo.nombreTipoConsumo +
              '\n' +
              TCB.i18next.t('CONSUMPTION.ERROR_FALTA_FICHERO_CONSUMO'),
            'error',
          )
          status = false
          break
        }
      }
    }
    //Crearemos el consumo global como suma de todos los tipos de consumo definidos
    if (status) {
      TCB.consumo = new Consumo()
      TCB.cambioTipoConsumo = true
    }

    console.log(TCB.consumo)
    //Se crearan los objetos produccion, balance y economico
    status = await PreparaEnergyBalance()
    setEcoData(TCB.economico)
  }

  return (
    <>
      <AppFrame>
        <InputContext.Provider
          value={{
            bases,
            setBases,
            tipoConsumo,
            setTipoConsumo,
          }}
        >
          <Container>
            <EconomicContext.Provider
              value={{
                IBI,
                setIBI,
                subvencionEU,
                setSubvencionEU,
                valorSubvencionEU,
                setValorSubvencionEU,
                precioInstalacionCorregido,
                setPrecioInstalacionCorregido,
                cuotaHucha,
                setCuotaHucha,
                coefHucha,
                setCoefHucha,
                ecoData,
                setEcoData,
              }}
            >
              <MapContext.Provider value={{ map, setMap }}>
                <Wizard variant="tabs">
                  <LocationStep
                    label="location"
                    title={t('LOCATION.TITLE')}
                    next={validaLocation}
                  />
                  <ConsumptionStep
                    label="consumption"
                    title={t('CONSUMPTION.TITLE')}
                    next={validaTipoConsumo}
                  />
                  <EnergyBalanceStep
                    label="energybalance"
                    title={t('ENERGY_BALANCE.TITLE')}
                  />
                  <EconomicBalanceStep
                    label="economicbalance"
                    title={t('ECONOMIC_BALANCE.TITLE')}
                  />
                  <SummaryStep label="summary" title={t('SUMMARY.TITLE')} />
                </Wizard>
              </MapContext.Provider>
            </EconomicContext.Provider>
          </Container>
        </InputContext.Provider>
      </AppFrame>
    </>
  )
}
