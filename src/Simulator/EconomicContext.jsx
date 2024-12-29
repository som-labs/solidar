import { createContext, useState } from 'react'

const EconomicContext = createContext()

const EconomicContextProvider = ({ children }) => {
  const [ecoData, setEcoData] = useState({})
  const [units, setUnits] = useState([])

  const contextValue = {
    ecoData,
    setEcoData,
    units,
    setUnits,
  }

  return (
    <EconomicContext.Provider value={contextValue}>{children}</EconomicContext.Provider>
  )
}
export { EconomicContext, EconomicContextProvider }
