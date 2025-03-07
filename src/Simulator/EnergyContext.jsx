import { createContext, useState, useContext } from 'react'
import { BasesContext } from './BasesContext'
import { ConsumptionContext } from './ConsumptionContext'
import Produccion from './classes/Produccion'
import Balance from './classes/Balance'

// Solidar global modules
import TCB from '../Simulator/classes/TCB'

const EnergyContext = createContext()

const EnergyContextProvider = ({ children }) => {
  const [balanceGlobal, setBalanceGlobal] = useState()
  const [produccionGlobal, setProduccionGlobal] = useState()
  const [consumoGlobal, setConsumoGlobal] = useState()
  const [totalPaneles, setTotalPaneles] = useState(0)

  const { bases, setBases } = useContext(BasesContext)
  const { tiposConsumo } = useContext(ConsumptionContext)

  /**
   * Esta funcion realiza los calculos del balance de energia para la configuracion de bases y consumos existentes.
   * Construye la produccion de cada base
   * Construye la produccion global
   * Construye el balance Energia
   * Construye el balance Economico
   */
  async function calculaResultados(newConsumo) {
    /* Se genera un objeto produccion para cada una de las bases */
    for (let base of bases) {
      base.produccion = new Produccion(base)
      console.log(
        '4b CalculaResultados para paneles:',
        base.instalacion.paneles,
        ' produccion anual:',
        base.produccion.totalAnual,
      )
    }

    /* Se genera un unico objeto produccion que totaliza la produccion de todas las bases */
    const newProduccion = new Produccion(bases)
    console.log(
      '4c Nueva produccion global en calculaResultados',
      newProduccion.totalAnual,
    )
    setProduccionGlobal(newProduccion)

    /* Construccion objeto Balance global */
    const newBalance = new Balance(newProduccion, newConsumo, 1)

    console.log(
      '4d calculaResultados newBalance dia 0 hora 13',
      newBalance.diaHora[0][13],
    )

    setBalanceGlobal(newBalance)

    return
  }

  const contextValue = {
    balanceGlobal,
    setBalanceGlobal,
    consumoGlobal,
    setConsumoGlobal,
    produccionGlobal,
    setProduccionGlobal,
    calculaResultados,
    totalPaneles,
    setTotalPaneles,
  }

  return <EnergyContext.Provider value={contextValue}>{children}</EnergyContext.Provider>
}
export { EnergyContext, EnergyContextProvider }
