import { createContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Solidar objects
import TCB from './classes/TCB'
import * as UTIL from './classes/Utiles'
import BaseSolar from './classes/BaseSolar'

const BasesContext = createContext()

const BasesContextProvider = ({ children }) => {
  const { t } = useTranslation()
  const [map, setMap] = useState()
  const [bases, setBases] = useState([])

  //TCB fields to be reflected in state
  const hdrBase = {
    idBaseSolar: undefined,
    nombreBaseSolar: undefined,
    cumbrera: undefined,
    ancho: undefined,
    inclinacion: undefined,
    inclinacionOptima: undefined,
    roofType: undefined,
    inAcimut: undefined,
    angulosOptimos: undefined,
    requierePVGIS: undefined,
    lonlatBaseSolar: undefined,
    potenciaMaxima: undefined,
    anchoReal: undefined,
    areaReal: undefined,
    panelesMaximo: undefined,
    filas: undefined,
    columnas: undefined,
  }

  // Move data object to the hdr template
  const hdrFill = (data) => {
    let newData = {}
    for (let field in hdrBase) newData[field] = data[field]
    return newData
  }

  // Add base object to the bases state
  function addTCBBaseToState(base) {
    setBases((prevBases) => [...prevBases, hdrFill(base)])
  }

  //Function to be executed at closeDialog del DialogNewBaseSolar. Is here because can be used as exit of DailogNewBaseSolar from BasesSuammry as edit and from MapComponent as new.
  function processFormData(reason, formData) {
    //Update openlayers label with nombreBaseSolar
    const labelFeatId = 'BaseSolar.label.' + formData.idBaseSolar
    const labelFeature = TCB.origenDatosSolidar.getFeatureById(labelFeatId)
    UTIL.setLabel(
      labelFeature,
      formData.nombreBaseSolar,
      TCB.baseLabelColor,
      TCB.baseLabelBGColor,
    )
    //Update TCB.BaseSolar with new data
    let baseIndex
    if (reason === 'save') {
      // We are creating a new base
      baseIndex = TCB.BaseSolar.push(new BaseSolar(formData)) - 1
      addTCBBaseToState(TCB.BaseSolar[baseIndex])
    } else {
      //We are updating existing base
      baseIndex = TCB.BaseSolar.findIndex((base) => {
        return base.idBaseSolar === formData.idBaseSolar
      })
      TCB.BaseSolar[baseIndex].updateBase(formData)
      //We are updating existing base
      const updatedBases = bases.map((base) => {
        if (base.idBaseSolar === formData.idBaseSolar) {
          return { ...formData } // Replace the item with same idBaseSolar
        }
        return base // Keep other items unchanged
      })
      setBases(updatedBases)
    }
  }

  function validaBases() {
    if (TCB.BaseSolar.length > 0) {
      //Carga rendimientos de cada base que lo requiera asincronicamente
      //La propiedad requierePVGIS es gestionada en GestionLocalizacion y se pone a true cuando cambia algun angulo

      try {
        for (let base of TCB.BaseSolar) {
          if (base.requierePVGIS) {
            UTIL.debugLog('Base requiere PVGIS:', base)
            base.cargaRendimiento()
            base.requierePVGIS = false
            TCB.requiereOptimizador = true
          }
        }
        //setBases(oldBases)
        return { status: true }
      } catch (err) {
        return { status: false, error: err }
      }
    } else {
      return { status: false, error: t('LOCATION.ERROR_DEFINE_BASE') }
    }
  }

  const contextValue = {
    map,
    setMap,
    bases,
    setBases,
    processFormData,
    validaBases,
    addTCBBaseToState,
  }
  return <BasesContext.Provider value={contextValue}>{children}</BasesContext.Provider>
}

export { BasesContext, BasesContextProvider }
