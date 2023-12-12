import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Container from '@mui/material/Container'

import Alert from '@mui/material/Alert'
import BasicAlert from '../Simulator/components/BasicAlert'
import AppFrame from '../components/AppFrame'
import Wizard from '../components/Wizard'
import DialogProvider from '../components/DialogProvider'

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

InicializaAplicacion()

export default function Page() {
  const { t, i18n } = useTranslation()

  useEffect(() => {}, [])

  const [map, setMap] = useState()

  const [bases, setBases] = useState(
    TCB.BaseSolar.map((base) => {
      return {
        idBaseSolar: base.idBaseSolar,
        nombreBaseSolar: base.nombreBaseSolar,
        //areaMapa: base.areaMapa,
        areaReal: base.areaReal,
        lonlatBaseSolar: base.lonlatBaseSolar,
        potenciaMaxima: base.potenciaMaxima,
        panelesMaximo: base.panelesMaximo,
        roofType: base.roofType,
        inclinacionOptima: base.inclinacionOptima,
        inclinacion: base.inclinacion,
        angulosOptimos: base.angulosOptimos,
        inAcimut: base.inAcimut,
        //requierePVGIS: base.requierePVGIS,
        paneles: 0,
        potenciaTotal: 0,
        potenciaUnitaria: 0,
      }
    }),
  )
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
      showAlert(t('LOCATION.ERROR_DEFINE_BASE'), 'error')
      return false
    }
  }

  //REVISAR: como meter el codigo del alert en un componente reutilizable
  const [alert, setAlert] = useState({ message: '', type: '' })
  //REVISAR: porque no funcion el BasicAlert
  // Function to show an alert
  const showAlert = (message, type) => {
    // BasicAlert({ title: 'Titulo', contents: 'Contenido a mostrar', type: '' })
    setAlert({ message, type })
  }

  // Function to hide the alert
  const hideAlert = () => {
    setAlert({ message: '', type: '' })
  }

  async function validaTipoConsumo() {
    if (TCB.TipoConsumo.length === 0) {
      showAlert(t('CONSUMPTION.ERROR_AL_MENOS_UN_TIPOCONSUMO'), 'error')
      return false
    }

    let status = true
    for (const tipoConsumo of TCB.TipoConsumo) {
      if (tipoConsumo.fuente === 'REE') {
        if (!(tipoConsumo.consumoAnualREE > 0)) {
          showAlert(
            tipoConsumo.nombreTipoConsumo +
              '\n' +
              TCB.i18next.t('consumo_MSG_definirPotenciaBaseREE', 'error'),
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
          <DialogProvider>
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
              <div>
                {alert.message && (
                  <Alert
                    severity={alert.type}
                    onClose={hideAlert}
                    className={'centered-alert'}
                  >
                    {alert.message}
                  </Alert>
                )}
              </div>
            </Container>
          </DialogProvider>
        </InputContext.Provider>
      </AppFrame>
    </>
  )
}
