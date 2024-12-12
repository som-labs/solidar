import { useState, createContext } from 'react'
import { useTranslation } from 'react-i18next'

import TCB from './classes/TCB'

const ConsumptionContext = createContext({})

const ConsumptionContextProvider = ({ children }) => {
  const { t } = useTranslation()
  const [tipoConsumo, setTipoConsumo] = useState([])
  const [fincas, setFincas] = useState([])
  const [zonasComunes, setZonasComunes] = useState([])
  const [fincasCargadas, setFincasCargadas] = useState(false)
  const [preciosValidos, setPreciosValidos] = useState(true)

  //TCB fields to be reflected in state
  const hdrTipo = {
    idTipoConsumo: undefined,
    nombreTipoConsumo: '',
    fuente: undefined,
    consumoAnualREE: undefined,
    ficheroCSV: undefined,
    nombreFicheroCSV: undefined,
    totalAnual: undefined,
  }

  // Move data object to the hdr template
  const hdrFill = (data) => {
    let newData = {}
    for (let field in hdrTipo) newData[field] = data[field]
    return newData
  }

  /**
   * Add or replace JS object tipo into the TipoConsumo array of ConsumptionContext
   * @param {Object} tipo
   */
  function addTCBTipoToState(tipo) {
    const prevTipos = [...tipoConsumo]
    const idxTC = prevTipos.findIndex((tc) => {
      return tc.idTipoConsumo === tipo.idTipoConsumo
    })
    if (idxTC === -1) {
      setTipoConsumo((prevTipos) => [...prevTipos, hdrFill(tipo)])
    } else {
      prevTipos.splice(idxTC, 1, hdrFill(tipo))
      setTipoConsumo(prevTipos)
    }
  }

  function validaTipoConsumo() {
    if (!preciosValidos) {
      return {
        status: false,
        error: 'Debe definir los precios correctos de las tarifas antes de continuar',
      }
    }

    if (TCB.TipoConsumo.length === 0) {
      return { status: false, error: t('CONSUMPTION.ERROR_AL_MENOS_UN_TIPOCONSUMO') }
    } else {
      return { status: true, error: '' }
    }
  }

  const contextValue = {
    tipoConsumo,
    setTipoConsumo,
    validaTipoConsumo,
    preciosValidos,
    setPreciosValidos,
    addTCBTipoToState,
    fincas,
    setFincas,
    fincasCargadas,
    zonasComunes,
    setZonasComunes,
  }

  return (
    <ConsumptionContext.Provider value={contextValue}>
      {children}
    </ConsumptionContext.Provider>
  )
}

export { ConsumptionContext, ConsumptionContextProvider }
