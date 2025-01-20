import { createContext, useState } from 'react'

const GlobalContext = createContext()

const GlobalContextProvider = ({ children }) => {
  const [inLineHelp, setInLineHelp] = useState({})

  const contextValue = {
    inLineHelp,
    setInLineHelp,
  }

  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>
}
export { GlobalContext, GlobalContextProvider }
