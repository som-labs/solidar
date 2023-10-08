import React, {useState, useEffect} from 'react'
import { useTranslation } from 'react-i18next'

import Container from '@mui/material/Container'
import AppFrame from '../components/AppFrame'

import Wizard from '../components/Wizard'
import LocationStep from './Location/Location'
import ConsumptionStep from './Consumption/Consumption'
import EnergyBalanceStep from './EnergyBalance/EnergyBalance'
import EconomicBalanceStep from './EconomicBalance/EconomicBalance'
import SummaryStep from './Summary/Summary'

import TCBContext from './TCBContext.jsx'
import TCB from './classes/TCB.js'
import * as UTIL from './Utiles'

import InicializaAplicacion from './classes/InicializaAplicacion.js'

export default function Page() {

  const { t, i18n } = useTranslation()

  //REVISAR: porque no se ejecuta InicializaAplicacion
  useEffect( () => {
    InicializaAplicacion()
    TCB.debugLog = true
  }, [])


  const [bases, setBases] = useState(TCB.BaseSolar.map( base => {
    return {
      idBaseSolar : base.idBaseSolar,
      nombreBaseSolar : base.nombreBaseSolar,
      areaMapa : base.areaMapa,
      areaReal : base.areaReal,
      lonlatBaseSolar : base.lonlatBaseSolar,
      potenciaMaxima : base.potenciaMaxima,
      inclinacionOptima : base.inclinacionOptima,
      inclinacionPaneles : base.inclinacionPaneles,
      inclinacionTejado : base.inclinacionTejado,
      angulosOptimos : base.angulosOptimos,
      inAcimut : base.inAcimut,
      requierePVGIS : base.requierePVGIS,
      paneles : 0,
      potenciaTotal: 0,
      potenciaUnitaria: 0
    }}))


  const [tipoConsumo, setTipoConsumo] = useState(TCB.TipoConsumo.map( tipoConsumo => {
    return {
        idTipoConsumo : tipoConsumo.idTipoConsumo,
        nombreTipoConsumo : tipoConsumo.nombreTipoConsumo,
        fuente : tipoConsumo.fuente,
        consumoAnualREE : tipoConsumo.consumoAnualREE,
        ficheroCSV : tipoConsumo.ficheroCSV,
        nombreFicheroCSV : tipoConsumo.nombreFicheroCSV,
        nombreTarifa : tipoConsumo.nombreTarifa,
        territorio : tipoConsumo.territorio
    }}))

  /* REVISAR: si descomento apare el mensaje dos veces */
  const validaLocation = () => { 
      if (TCB.BaseSolar.length > 0) {

        alert("validando")
        //Carga rendimientos de cada base que lo requiera asincronicamente
        //La propiedad requierePVGIS es gestionada en GestionLocalizacion y se pone a true cuando cambia algun angulo
          try {
              TCB.BaseSolar.forEach (base => {
                  if (base.requierePVGIS) {
                      if (!base.angulosOptimos) {
                          if (base.inclinacionTejado === 0 && base.inclinacionPaneles === 0 && !base.inclinacionOptima) {
                              if (!window.confirm("Base: " + base.nombreBaseSolar + " con paneles a 0º de inclinación")) return false; 
                          }
                      }
                      UTIL.debugLog("Base requiere PVGIS:", base);
                      alert('cargaremos rendimiento de', base.nombreBaseSolar)
                      base.cargaRendimiento();
                      TCB.requiereOptimizador = true;
                  }
              })
          } catch (err) {
              //alert ("Error en validacion de Localizacion: " + err);
              return ("Error en validacion de Localizacion: " + err);
          }
          return false
      } else {
          return (t('LOCATION.MSG_definirBases'))
      } 
  }

  const validaTipoConsumo = () => { 
    if (TCB.TipoConsumo.length > 0) {
      return false
     } else {
      return (t("CONSUMPTION.MSG_definirFicheroConsumo"))
     } 
  }

  return (
    <>
      <AppFrame>
        <TCBContext.Provider value={{bases, setBases, tipoConsumo, setTipoConsumo}}>
          <Container>
            <Wizard variant='tabs'>
              <LocationStep label="location" title={t("MAIN.TAB_localizacion")} validate = {validaLocation} />
              <ConsumptionStep label="consumption" title={t("MAIN.TAB_tipoConsumo")} validate = {validaTipoConsumo}/> 
              <EnergyBalanceStep label="energybalance" title={t("MAIN.TAB_resultados")} />
              <EconomicBalanceStep label="economicbalance" title={t("MAIN.TAB_economico")} />
              <SummaryStep label="summary" title={t("MAIN.TAB_reporte")} />
            </Wizard>
          </Container>
        </TCBContext.Provider>
      </AppFrame>

    </>
  )
}
