import { createContext, useState } from 'react'

const EconomicContext = createContext()

const EconomicContextProvider = ({ children }) => {
  const [IBI, setIBI] = useState({
    valorSubvencionIBI: 0,
    porcientoSubvencionIBI: 0,
    tiempoSubvencionIBI: 0,
  })
  const [subvencionEU, setSubvencionEU] = useState('Sin')
  const [valorSubvencionEU, setValorSubvencionEU] = useState(0)
  const [cuotaHucha, setCuotaHucha] = useState(0)
  const [coefHucha, setCoefHucha] = useState(80)
  const [ecoData, setEcoData] = useState({})

  const contextValue = {
    IBI,
    setIBI,
    subvencionEU,
    setSubvencionEU,
    valorSubvencionEU,
    setValorSubvencionEU,
    cuotaHucha,
    setCuotaHucha,
    coefHucha,
    setCoefHucha,
    ecoData,
    setEcoData,
  }

  return (
    <EconomicContext.Provider value={contextValue}>{children}</EconomicContext.Provider>
  )
}
export { EconomicContext, EconomicContextProvider }
