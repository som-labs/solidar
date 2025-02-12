import { createContext, useState } from 'react'

const GlobalContext = createContext()

const GlobalContextProvider = ({ children }) => {
  const [inLineHelp, setInLineHelp] = useState({})
  const [newPanelActivo, setNewPanelActivo] = useState(true)
  const [newBases, setNewBases] = useState(true)
  const [newPrecios, setNewPrecios] = useState(true)
  const [tipoPanelActivo, setTipoPanelActivo] = useState({
    nombre: '430 Wp',
    tecnologia: 'crystSi',
    potencia: 430,
    ancho: 1.134,
    largo: 1.762,
  })

  const contextValue = {
    inLineHelp,
    setInLineHelp,
    newPanelActivo,
    setNewPanelActivo,
    newBases,
    setNewBases,
    newPrecios,
    setNewPrecios,
  }

  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>
}
export { GlobalContext, GlobalContextProvider }
