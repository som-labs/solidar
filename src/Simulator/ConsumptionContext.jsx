import { useState, createContext } from 'react'
import { useTranslation } from 'react-i18next'

import TCB from './classes/TCB'

const ConsumptionContext = createContext({})

const ConsumptionContextProvider = ({ children }) => {
  const { t } = useTranslation()
  const [tipoConsumo, setTipoConsumo] = useState([])
  const [preciosValidos, setPreciosValidos] = useState(true)

  //TCB fields to be reflected in state
  const hdrTipo = {
    idTipoConsumo: undefined,
    nombreTipoConsumo: undefined,
    fuente: undefined,
    consumoAnualREE: undefined,
    ficheroCSV: undefined,
    nombreFicheroCSV: undefined,
    cTotalAnual: undefined,
  }

  // Move data object to the hdr template
  const hdrFill = (data) => {
    let newData = {}
    for (let field in hdrTipo) newData[field] = data[field]
    return newData
  }

  // Add base object to the bases state
  function addTCBTipoToState(tipo) {
    setTipoConsumo((prevTipos) => [...prevTipos, hdrFill(tipo)])
  }

  function validaTipoConsumo() {
    if (TCB.TipoConsumo.length === 0) {
      return { status: false, error: t('CONSUMPTION.ERROR_AL_MENOS_UN_TIPOCONSUMO') }
    }

    if (!preciosValidos) {
      return {
        status: false,
        error: 'Debe definir los precios correctos de las tarifas antes de continuar',
      }
    }
    return { status: true, error: '' }
  }

  const contextValue = {
    tipoConsumo,
    setTipoConsumo,
    validaTipoConsumo,
    preciosValidos,
    setPreciosValidos,
    addTCBTipoToState,
  }

  return (
    <ConsumptionContext.Provider value={contextValue}>
      {children}
    </ConsumptionContext.Provider>
  )
}

export { ConsumptionContext, ConsumptionContextProvider }
