import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Container from '@mui/material/Container'
import AppFrame from '../components/AppFrame'
import Alert from '@mui/material/Alert'
import Wizard from '../components/Wizard'
import LocationStep from './Location/Location'
import ConsumptionStep from './Consumption/Consumption'
import EnergyBalanceStep from './EnergyBalance/EnergyBalance'
import EconomicBalanceStep from './EconomicBalance/EconomicBalance'
import SummaryStep from './Summary/Summary'
import DialogProvider from '../components/DialogProvider'
import TCBContext from './TCBContext'
import MapContext from './MapContext'
import EconomicContext from './EconomicBalance/EconomicContext'
import TCB from './classes/TCB'
import * as UTIL from './classes/Utiles'

import InicializaAplicacion from './classes/InicializaAplicacion'
import Consumo from './classes/Consumo'
import Instalacion from './classes/Instalacion'

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
        areaMapa: base.areaMapa,
        areaReal: base.areaReal,
        lonlatBaseSolar: base.lonlatBaseSolar,
        potenciaMaxima: base.potenciaMaxima,
        inclinacionOptima: base.inclinacionOptima,
        inclinacionPaneles: base.inclinacionPaneles,
        angulosOptimos: base.angulosOptimos,
        inAcimut: base.inAcimut,
        requierePVGIS: base.requierePVGIS,
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
  const [fee, setFee] = useState(0)
  const [recognition, setRecognition] = useState(0)
  const [amortizationTime, setAmortizationTime] = useState()

  const validaLocation = () => {
    if (TCB.BaseSolar.length > 0) {
      //Carga rendimientos de cada base que lo requiera asincronicamente
      //La propiedad requierePVGIS es gestionada en GestionLocalizacion y se pone a true cuando cambia algun angulo
      try {
        let oldBases = [...bases]
        TCB.BaseSolar.forEach((base) => {
          if (base.requierePVGIS) {
            if (!base.angulosOptimos) {
              if (base.inclinacionPaneles === 0 && !base.inclinacionOptima) {
                if (
                  !window.confirm(
                    'Base: ' + base.nombreBaseSolar + ' con paneles a 0º de inclinación',
                  )
                )
                  return false
              }
            }
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

  // Function to show an alert
  const showAlert = (message, type) => {
    setAlert({ message, type })
  }

  // Function to hide the alert
  const hideAlert = () => {
    setAlert({ message: '', type: '' })
  }

  const validaTipoConsumo = () => {
    // Si no ha habido ningún cambio seguimos adelante
    console.log('Estamos en validaTipoConsumo')

    if (TCB.TipoConsumo.length === 0) {
      showAlert(t('CONSUMPTION.ERROR_AL_MENOS_UN_TIPOCONSUMO'), 'error')
      return false
    }

    let status = true
    // Se verifica que cada TipoConsumo definido se le ha cargado el CSV correspondiente
    //let consumoTotal = 0;
    //for (let tipoConsumo of TCB.TipoConsumo) consumoTotal +=  tipoConsumo.cTotalAnual;

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
    return status
  }

  return (
    <>
      <AppFrame>
        <TCBContext.Provider value={{ bases, setBases, tipoConsumo, setTipoConsumo }}>
          <DialogProvider>
            <Container>
              <EconomicContext.Provider
                value={{
                  IBI,
                  setIBI,
                  subvencionEU,
                  setSubvencionEU,
                  precioInstalacionCorregido,
                  setPrecioInstalacionCorregido,
                  recognition,
                  setRecognition,
                  fee,
                  setFee,
                  amortizationTime,
                  setAmortizationTime,
                }}
              >
                <MapContext.Provider value={{ map, setMap }}>
                  <Wizard variant="tabs">
                    <LocationStep
                      label="location"
                      title={t('MAIN.TAB_localizacion')}
                      next={validaLocation}
                    />
                    <ConsumptionStep
                      label="consumption"
                      title={t('MAIN.TAB_tipoConsumo')}
                      next={validaTipoConsumo}
                    />
                    <EnergyBalanceStep
                      label="energybalance"
                      title={t('MAIN.TAB_resultados')}
                    />

                    <EconomicBalanceStep
                      label="economicbalance"
                      title={t('MAIN.TAB_economico')}
                    />

                    <SummaryStep label="summary" title={t('MAIN.TAB_reporte')} />
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
        </TCBContext.Provider>
      </AppFrame>
    </>
  )
}
