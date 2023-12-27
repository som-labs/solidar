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

  //Function to be executed at closeDialog del DialogNewBaseSolar
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
    } else {
      //We are updating existing base
      baseIndex = TCB.BaseSolar.findIndex((base) => {
        return base.idBaseSolar === formData.idBaseSolar
      })
      TCB.BaseSolar[baseIndex].updateBase(formData)
    }

    //BaseSolar object has several methods that can update other properties maintained in state. All derived from possible inclinacion field
    formData.potenciaMaxima = TCB.BaseSolar[baseIndex].potenciaMaxima
    formData.areaReal = TCB.BaseSolar[baseIndex].areaReal
    formData.panelesMaximo = TCB.BaseSolar[baseIndex].panelesMaximo

    if (reason === 'save') {
      // We are creating a new base
      setBases((prevBases) => [...prevBases, formData])
    } else {
      //We are updating existing base
      const updatedBases = bases.map((base) => {
        if (base.idBaseSolar === formData.idBaseSolar) {
          return { ...formData } // Replace name of the item
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
        let oldBases = [...bases]
        for (let i = 0; i < TCB.BaseSolar.length; i++) {
          if (TCB.BaseSolar[i].requierePVGIS) {
            UTIL.debugLog('Base requiere PVGIS:', oldBases[i])
            TCB.BaseSolar[i].cargaRendimiento()
            oldBases[i].requierePVGIS = false
            TCB.requiereOptimizador = true
          }
        }
        setBases(oldBases)
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
  }
  return <BasesContext.Provider value={contextValue}>{children}</BasesContext.Provider>
}

export { BasesContext, BasesContextProvider }
