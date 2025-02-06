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
  const [tarifas, setTarifas] = useState([])

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
    //Verify right Tarifas
    if (TCB.modoActivo === 'INDIVIDUAL') {
      if (!preciosValidos) {
        return {
          status: false,
          error: t('CONSUMPTION.ERROR_FALTA_TARIFA_INDIVIDUAL'),
        }
      }
    } else {
      if (tarifas.length > 0) {
        TCB.Tarifa = []
        tarifas.forEach((tarifa) => {
          TCB.Tarifa.push(tarifa)
        })
      } else {
        return {
          status: false,
          error: t('CONSUMPTION.ERROR_FALTA_TARIFA_COLECTIVO'),
        }
      }
    }

    //Verify right TipoConsumo
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

    TCB.ZonaComun = []
    zonasComunes.forEach((zona) => {
      TCB.ZonaComun.push(zona)
    })
  }

  function validaUnits() {
    //Verifica que al menos una unidad o una zona común tengan uso electrico asignado y que todas las zonas comunes tienen tarifa y nombreTipoConsumo
    console.log('EN validaUnits')
    let results = { status: true, error: '' }

    console.log(zonasComunes, allocationGroup)
    console.log('UPDATING ZONAS')
    for (const _zc of zonasComunes) {
      //Verify each zonaComun have Tarifa assigned
      if (_zc.idTarifa === '') {
        results.status = false
        results.error = t('UNITS.ERROR_ZONA_COMUN_SIN_TARIFA', { zona: _zc.nombre })
      } else {
        //Verify has tipoConsumo
        if (_zc.nombreTipoConsumo === '') {
          results.status = false
          results.error = t('UNITS.ERROR_ZONA_COMUN_SIN_USOELECTRICO', {
            zona: _zc.nombre,
          })
        } else {
          updateTCBUnitsFromState()
          return results
        }
      }
    }
    //If there is not zonasComunes check at least one finca participa and has tipoConsumo assigned
    for (const _fnc of fincas) {
      if (_fnc.nombreTipoConsumo !== '' && _fnc.participa) {
        updateTCBUnitsFromState()
        return results
      }
    }

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
    tarifas,
    setTarifas,
  }

  return (
    <ConsumptionContext.Provider value={contextValue}>
      {children}
    </ConsumptionContext.Provider>
  )
}

export { ConsumptionContext, ConsumptionContextProvider }
