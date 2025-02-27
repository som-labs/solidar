import { useState, createContext } from 'react'
import { useTranslation } from 'react-i18next'

import TCB from './classes/TCB'
import Tarifa from './classes/Tarifa'

const ConsumptionContext = createContext({})

const ConsumptionContextProvider = ({ children }) => {
  const { t } = useTranslation()
  const [tiposConsumo, setTiposConsumo] = useState([])
  const [fincas, setFincas] = useState([])
  const [zonasComunes, setZonasComunes] = useState([])
  const [preciosValidos, setPreciosValidos] = useState(true)
  const [repartoValido, setRepartoValido] = useState(false)
  const [allocationGroup, setAllocationGroup] = useState()
  const [tarifas, setTarifas] = useState([])
  const [consumo, setConsumo] = useState({})

  const addConsumptionData = (clase, data) => {
    switch (clase) {
      case 'TipoConsumo':
        setTiposConsumo((prev) => [...prev, data])
        break
      case 'Tarifa':
        setTarifas((prev) => [...prev, data])
        break
      case 'ZonaComun':
        setZonasComunes((prev) => [...prev, data])
        break
      case 'Finca':
        setFincas((prev) => [...prev, data])
        break
    }
  }
  /**
   * Modifica un objecto existente en ConsumptionContext
   * @param {string} clase Un valor entre TipoConsumo, ZonaComun, Tarifa
   * @param {*} updatedData
   */
  const modifyConsumptionData = (clase, updatedData) => {
    switch (clase) {
      case 'TipoConsumo':
        setTiposConsumo(
          tiposConsumo.map((tipo) =>
            tipo.idTipoConsumo === updatedData.idTipoConsumo
              ? Object.create(
                  Object.getPrototypeOf(updatedData),
                  Object.getOwnPropertyDescriptors(updatedData),
                )
              : tipo,
          ),
        )
        break
      case 'ZonaComun':
        setZonasComunes(
          zonasComunes.map((zona) =>
            zona.id === updatedData.id
              ? Object.create(
                  Object.getPrototypeOf(updatedData),
                  Object.getOwnPropertyDescriptors(updatedData),
                )
              : zona,
          ),
        )
        break
      case 'Tarifa':
        setTarifas(
          tarifas.map((tarifa) =>
            tarifa.idTarifa === updatedData.idTarifa
              ? Object.create(
                  Object.getPrototypeOf(updatedData),
                  Object.getOwnPropertyDescriptors(updatedData),
                )
              : tarifa,
          ),
        )
        break
      case 'Finca':
        setFincas(
          fincas.map((finca) =>
            finca.idFinca === updatedData.idFinca
              ? Object.create(
                  Object.getPrototypeOf(updatedData),
                  Object.getOwnPropertyDescriptors(updatedData),
                )
              : finca,
          ),
        )
        break
    }
  }

  const deleteConsumptionData = (clase, id) => {
    switch (clase) {
      case 'TipoConsumo':
        setTiposConsumo(tiposConsumo.filter((tipo) => tipo.idTipoConsumo !== id))
        break
      case 'Tarifa':
        setTarifas(tarifas.filter((tarifa) => tarifa.idTarifa !== id))
        break
      case 'ZonaComun':
        setZonasComunes(zonasComunes.filter((zona) => zona.id !== id))
        break
      case 'Finca':
        setFincas(fincas.filter((finca) => finca.idFinca !== id))
        break
    }
  }

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
      if (tarifas.length === 0) {
        return {
          status: false,
          error: t('CONSUMPTION.ERROR_FALTA_TARIFA_COLECTIVO'),
        }
      }
    }

    if (tiposConsumo.length === 0) {
      return {
        status: false,
        error: t('CONSUMPTION.ERROR_AL_MENOS_UN_TIPOCONSUMO'),
      }
    }
    return { status: true, error: '' }
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
    /* 
    Verifica que al menos una unidad o una zona común tengan uso electrico asignado
    Que todas las zonas comunes tienen tarifa y nombreTipoConsumo
    Que todas las fincas que participan tienen tipoConsumo y tarifa asignados
    */
    let usuarios = 0
    let results = { status: true, error: '' }

    for (const _zc of zonasComunes) {
      //Verify each zonaComun has Tarifa assigned
      if (_zc.idTarifa === '') {
        results.status = false
        results.error = t('UNITS.ERROR_UNIT_SIN_TARIFA', {
          tipo: 'Zona común',
          id: _zc.nombre,
        })
      } else {
        //Verify each ZonaComun has tipoConsumo
        if (_zc.nombreTipoConsumo === '') {
          results.status = false
          results.error = t('UNITS.ERROR_UNIT_SIN_USOELECTRICO', {
            tipo: 'Zona común',
            id: _zc.nombre,
          })
        } else {
          usuarios++
        }
      }
    }

    //If there is not zonasComunes check at least one finca participa and has tipoConsumo assigned
    for (const _fnc of fincas) {
      if (_fnc.participa) {
        if (_fnc.nombreTipoConsumo !== '') {
          if (_fnc.idTarifa === '') {
            results.status = false
            results.error = t('UNITS.ERROR_UNIT_SIN_TARIFA', {
              tipo: 'Finca',
              id: _fnc.nombreFinca,
            })
          } else {
            usuarios++
          }
        } else {
          results.status = false
          results.error = t('UNITS.ERROR_UNIT_SIN_USOELECTRICO', {
            tipo: 'Finca',
            id: _fnc.nombreFinca,
          })
        }
      }
    }

    if (usuarios === 0) {
      results.status = false
      results.error = t('UNITS.ERROR_AL_MENOS_UN_USOELECTRICO')
    }
    return results
  }

  function getConsumoTotal(nombreTipoConsumo) {
    return nombreTipoConsumo !== ''
      ? tiposConsumo.find((tc) => tc.nombreTipoConsumo === nombreTipoConsumo).totalAnual
      : 0
  }

  const contextValue = {
    tiposConsumo,
    setTiposConsumo,
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
    consumo,
    setConsumo,
    addConsumptionData,
    modifyConsumptionData,
    deleteConsumptionData,
    getConsumoTotal,
  }

  return (
    <ConsumptionContext.Provider value={contextValue}>
      {children}
    </ConsumptionContext.Provider>
  )
}

export { ConsumptionContext, ConsumptionContextProvider }
