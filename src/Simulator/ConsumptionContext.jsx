import { useState, createContext } from 'react'
import { useTranslation } from 'react-i18next'

import TCB from './classes/TCB'

const ConsumptionContext = createContext({})

const ConsumptionContextProvider = ({ children }) => {
  const { t } = useTranslation()
  const [tipoConsumo, setTipoConsumo] = useState([])
  const [preciosValidos, setPreciosValidos] = useState(true)

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
  }

  return (
    <ConsumptionContext.Provider value={contextValue}>
      {children}
    </ConsumptionContext.Provider>
  )
}

export { ConsumptionContext, ConsumptionContextProvider }
