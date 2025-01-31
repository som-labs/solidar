import { useState, createContext } from 'react'
import { useTranslation } from 'react-i18next'

import TCB from './classes/TCB'

const ConsumptionContext = createContext({})

const ConsumptionContextProvider = ({ children }) => {
  const { t } = useTranslation()
  const [tipoConsumo, setTipoConsumo] = useState([])
  const [fincas, setFincas] = useState([])
  const [zonasComunes, setZonasComunes] = useState([])
  const [preciosValidos, setPreciosValidos] = useState(true)
  const [repartoValido, setRepartoValido] = useState(false)
  const [allocationGroup, setAllocationGroup] = useState()

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

  function validaTipoConsumo() {
    if (!preciosValidos) {
      return {
        status: false,
        error: 'Debe definir los precios correctos de las tarifas antes de continuar',
      }
    }

    if (tipoConsumo.length > 0) {
      TCB.TipoConsumo = []
      tipoConsumo.forEach((tipo) => {
        TCB.TipoConsumo.push(tipo)
      })
      return { status: true, error: '' }
    } else {
      return { status: false, error: t('CONSUMPTION.ERROR_AL_MENOS_UN_TIPOCONSUMO') }
    }
  }

  function updateTCBUnitsFromState() {
    TCB.Finca = []
    fincas.forEach((finca) => {
      TCB.Finca.push(finca)
    })

    if (zonasComunes.length > 0) {
      TCB.ZonaComun = []
      zonasComunes.forEach((zona) => {
        TCB.ZonaComun.push(zona)
      })
    }
  }

  function validaUnits() {
    //Verifica que al menos una unidad o una zona común tengan uso electrico asignado
    let results = { status: true, error: '' }
    for (const _fnc of fincas) {
      if (_fnc.nombreTipoConsumo !== '' && _fnc.participa) {
        updateTCBUnitsFromState()
        return results
      }
    }

    for (const _zc of zonasComunes) {
      if (_zc.nombreTipoConsumo !== '') {
        updateTCBUnitsFromState()
        console.log('VUELVE', results)
        return results
      }
    }

    console.log('Error de validacion Zonas Comunes')
    results.status = false
    results.error = t('UNITS.ERROR_AL_MENOS_UN_USOELECTRICO')
    return results
  }

  const contextValue = {
    tipoConsumo,
    setTipoConsumo,
    validaTipoConsumo,
    preciosValidos,
    setPreciosValidos,
    fincas,
    setFincas,
    zonasComunes,
    setZonasComunes,
    validaUnits,
    repartoValido,
    setRepartoValido,
    allocationGroup,
    setAllocationGroup,
    updateTCBUnitsFromState,
  }

  return (
    <ConsumptionContext.Provider value={contextValue}>
      {children}
    </ConsumptionContext.Provider>
  )
}

export { ConsumptionContext, ConsumptionContextProvider }
