import React from 'react'

// Solidar objects
import TCB from './classes/TCB'
import * as UTIL from './classes/Utiles'
import BaseSolar from './classes/BaseSolar'
//import InputContext from './InputContext'

const BasesContext = React.createContext()

const BasesContextProvider = ({ children }) => {
  const [map, setMap] = React.useState()
  const { bases, setBases } = React.useState([])
  //Context(InputContext)

  function endDialog(reason, formData) {
    console.log('MAP CONTEXT', reason, formData)
    if (reason === undefined) return
    if (reason === 'save' || reason === 'edit') {
      let componentId
      // Update label in source with nombreBaseSolar
      componentId = 'BaseSolar.label.' + TCB.featIdUnico.toString()
      const labelFeature = TCB.origenDatosSolidar.getFeatureById(componentId)
      UTIL.setLabel(
        labelFeature,
        formData.nombreBaseSolar,
        TCB.baseLabelColor,
        TCB.baseLabelBGColor,
      )
      let baseIndex
      if (reason === 'save') {
        // We are creating a new base
        baseIndex = TCB.BaseSolar.push(new BaseSolar(formData)) - 1
      } else {
        baseIndex = TCB.BaseSolar.findIndex((base) => {
          return base.idBaseSolar === formData.idBaseSolar
        })
        TCB.BaseSolar[baseIndex].updateBase(formData)
      }

      formData.potenciaMaxima = TCB.BaseSolar[baseIndex].potenciaMaxima
      formData.areaReal = TCB.BaseSolar[baseIndex].areaReal
      formData.panelesMaximo = TCB.BaseSolar[baseIndex].panelesMaximo

      if (reason === 'save') {
        setBases((prevBases) => [...prevBases, formData])
      } else {
        const updatedBases = bases.map((base) => {
          if (base.idBaseSolar === formData.idBaseSolar) {
            return { ...formData } // Replace name of the item
          }
          return base // Keep other items unchanged
        })
        console.log('BASES ACTUALIZADAS', updatedBases)
        setBases(updatedBases)
      }
    }
  }

  const contextValue = { map, setMap, bases, setBases, endDialog }
  return <BasesContext.Provider value={contextValue}>{children}</BasesContext.Provider>
}

export { BasesContext, BasesContextProvider }
