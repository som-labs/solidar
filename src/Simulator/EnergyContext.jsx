import { createContext, useState, useContext } from 'react'
import { BasesContext } from './BasesContext'
import { ConsumptionContext } from './ConsumptionContext'
import Produccion from './classes/Produccion'
import Balance from './classes/Balance'

// Solidar global modules
import TCB from '../Simulator/classes/TCB'

const EnergyContext = createContext()

const EnergyContextProvider = ({ children }) => {
  const [balance, setBalance] = useState({})
  const [produccion, setProduccion] = useState({})

  const { bases, setBases } = useContext(BasesContext)
  /**
   * Esta funcion realiza los calculos del balance de energia para la configuracion de bases y consumos existentes.
   * Construye la produccion de cada base
   * Construye la produccion global
   * Construye el balance Energia
   * Construye el balance Economico
   */
  async function calculaResultados() {
    // Se genera un objeto produccion para cada una de las bases
    for (let base of bases) {
      base.produccion = new Produccion(base)
    }

    // Se genera un unico objeto produccion que totaliza la produccion de todas las bases
    setProduccion(new Produccion())

    // Construccion objeto Balance global
    setBalance(new Balance(produccion, TCB.consumo, 1))

    return
  }

  const contextValue = {
    balance,
    calculaResultados,
  }

  return <EnergyContext.Provider value={contextValue}>{children}</EnergyContext.Provider>
}
export { EnergyContext, EnergyContextProvider }
