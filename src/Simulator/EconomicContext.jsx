import { createContext, useState } from 'react'

const EconomicContext = createContext()

const EconomicContextProvider = ({ children }) => {
  const [IBI, setIBI] = useState({
    valorSubvencionIBI: 0,
    porcientoSubvencionIBI: 0,
    tiempoSubvencionIBI: 0,
  })
  const [porcientoSubvencion, setPorcientoSubvencion] = useState('Sin')
  const [valorSubvencion, setValorSubvencion] = useState(0)
  const [cuotaHucha, setCuotaHucha] = useState(0)
  const [coefHucha, setCoefHucha] = useState(80)
  const [ecoData, setEcoData] = useState({})

  const contextValue = {
    IBI,
    setIBI,
    valorSubvencion,
    setValorSubvencion,
    porcientoSubvencion,
    setPorcientoSubvencion,
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
