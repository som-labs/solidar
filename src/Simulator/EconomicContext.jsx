import { createContext, useState, useContext } from 'react'
import TCB from '../Simulator/classes/TCB'
import { ConsumptionContext } from './ConsumptionContext'
const EconomicContext = createContext()

const EconomicContextProvider = ({ children }) => {
  const [ecoData, setEcoData] = useState({})
  const [units, setUnits] = useState([])
  const { allocationGroup } = useContext(ConsumptionContext)

  /**
   *
   * @param {Finca} finca Any finca object
   * @param {ZonaComun} zc Any zonaComun object
   * @returns {Object} {global: Double -> coeficiente de la finca en la zona comun tenniendo en cuenta coefEnergia
   *                    local: Double -> coeficiente de participacion de la finca en la participacion global de la zonaComun
   */

  function costeZCenFinca(finca, zc) {
    let localSet = { global: 0, local: 0 }
    if (finca?.grupo) {
      //If no grupo it means it's a zonaComun
      if (allocationGroup[finca.grupo].zonasComunes[zc.id]) {
        localSet = {
          global:
            (allocationGroup[zc.id].produccion * finca.participacion) /
            allocationGroup[zc.id].participacionT,
          local: finca.participacion / allocationGroup[zc.id].participacionT,
        }
      } else {
        localSet = { global: 0, local: 0 }
      }
    }
    return localSet
  }

  TCB.costeZCenFinca = costeZCenFinca

  const contextValue = {
    ecoData,
    setEcoData,
    units,
    setUnits,
    costeZCenFinca,
  }

  return (
    <EconomicContext.Provider value={contextValue}>{children}</EconomicContext.Provider>
  )
}
export { EconomicContext, EconomicContextProvider }
