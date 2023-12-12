import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputAdornment from '@mui/material/InputAdornment'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function PreciosTarifa() {
  const { t, i18n } = useTranslation()
  const [precios, setPrecios] = useState([])
  //const [nombreTarifaActiva, setNombreTarifaActiva] = useState(TCB.nombreTarifaActiva)
  const [nPrecios, setNPrecios] = useState()
  const [tipoTarifa, setTipoTarifa] = useState(TCB.tipoTarifa)

  useEffect(() => {
    setTipoTarifa(TCB.tipoTarifa)
    setNPrecios(4)
    if (TCB.tipoTarifa === '3.0TD') {
      setNPrecios(7)
    } else {
      setNPrecios(4)
    }
    TCB.tarifaActiva = TCB.tarifas[TCB.nombreTarifaActiva]
    setPrecios(Object.entries(TCB.tarifaActiva.precios))
  }, [])

  // useEffect(() => {
  //   console.log(tipoTarifa, precios)
  // }, [tipoTarifa])

  const cambiaTipoTarifa = (event) => {
    setTipoTarifa(event.target.value)
    TCB.tipoTarifa = event.target.value

    setNPrecios(4)
    if (TCB.tipoTarifa === '3.0TD') {
      TCB.nombreTarifaActiva = '3.0TD-' + TCB.territorio
      setNPrecios(7)
    } else {
      TCB.nombreTarifaActiva = TCB.tipoTarifa
      setNPrecios(4)
    }
    console.log(TCB.nombreTarifaActiva)

    TCB.tarifaActiva = TCB.tarifas[TCB.nombreTarifaActiva]
    console.log(TCB.tarifaActiva, TCB.tipoTarifa, TCB.nombreTarifaActiva)
    setPrecios(Object.entries(TCB.tarifaActiva.precios))
  }

  const getDecimalSeparator = () => {
    const number = 1.1
    return number.toLocaleString().substring(1, 2)
  }
  //REVISAR: No esta aceptando el separador
  const validateDecimal = (inputValue) => {
    const decimalSeparator = getDecimalSeparator()
    console.log('separador ' + decimalSeparator)

    //const decimalRegex = new RegExp(`^(\\d*\\${decimalSeparator}?\\d*$`)
    const decimalRegex = new RegExp(`^(\\d*)\\.?\\d*$`)
    console.log(decimalRegex.test(inputValue))
    return decimalRegex.test(inputValue)
  }

  const cambiaPrecio = (posicion, nuevoValor) => {
    console.log(nuevoValor)
    if (validateDecimal(nuevoValor)) {
      let prevPrecios = [...precios]
      prevPrecios[posicion][1] = nuevoValor //parseFloat(nuevoValor)
      setPrecios(prevPrecios)
      TCB.tarifaActiva.precios[posicion] = parseFloat(nuevoValor)
    }
  }
  if (precios.length !== 0) {
    return (
      <>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <TextField
            sx={{ width: 200, height: 50, textAlign: 'center', mb: '1rem' }}
            id="tarifa-simple-select"
            select
            label={t('TARIFA.LABEL_NOMBRE_TARIFA')}
            onChange={cambiaTipoTarifa}
            name="nombreTarifa"
            value={tipoTarifa}
          >
            <MenuItem key={'A1'} value={'2.0TD'}>
              2.0TD
            </MenuItem>
            <MenuItem key={'A2'} value={'3.0TD'}>
              3.0TD
            </MenuItem>
          </TextField>
        </FormControl>

        <Grid container spacing={1} alignItems="center" justifyContent="space-evenly">
          {precios.map((precioP) => (
            <React.Fragment key={precioP[0]}>
              {precioP[0] < nPrecios && (
                <Grid item xs>
                  <TextField
                    sx={{ width: '100%', display: 'flex', flex: 1 }}
                    type="text"
                    value={precioP[1]}
                    onChange={(ev) => cambiaPrecio(precioP[0], ev.target.value)}
                    label={t('TARIFA.LABEL_P' + precioP[0])}
                    name={precioP[0]}
                    InputProps={{
                      endAdornment: <InputAdornment position="start"> €</InputAdornment>,
                      inputProps: {
                        style: { textAlign: 'right' },
                      },
                    }}
                  ></TextField>
                </Grid>
              )}
            </React.Fragment>
          ))}
        </Grid>
      </>
    )
  }
}
