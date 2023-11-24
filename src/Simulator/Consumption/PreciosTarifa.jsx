import React, { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'

// Solidar objects
import TCB from '../classes/TCB'

export default function PreciosTarifa() {
  const { t, i18n } = useTranslation()
  const [precios, setPrecios] = useState([])
  //const [nombreTarifaActiva, setNombreTarifaActiva] = useState(TCB.nombreTarifaActiva)

  const [tipoTarifa, setTipoTarifa] = useState(TCB.tipoTarifa)

  useEffect(() => {
    setPrecios(Object.entries(TCB.tarifaActiva.precios))
  }, [])

  useEffect(() => {
    setPrecios(Object.entries(TCB.tarifaActiva.precios))
  }, [tipoTarifa])

  let nombreTarifaActiva = TCB.nombreTarifaActiva

  const cambiaTipoTarifa = (event) => {
    if (event.target.value === '3.0TD') {
      nombreTarifaActiva = '3.0TD-' + TCB.territorio
    }
    TCB.tarifaActiva = TCB.tarifas[nombreTarifaActiva]
    setTipoTarifa(event.target.value)
    setPrecios(Object.entries(TCB.tarifaActiva.precios))
  }

  const cambiaPrecio = (posicion, nuevoValor) => {
    let prevPrecios = [...precios]
    prevPrecios[posicion][1] = nuevoValor
    setPrecios(prevPrecios)
    TCB.tarifaActiva.precios[posicion] = nuevoValor
  }

  return (
    <div>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={4}>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              sx={{ width: 200, height: 50, textAlign: 'center' }}
              id="tarifa-simple-select"
              select
              label={t('TARIFA.LABEL_NOMBRE_TARIFA')}
              onChange={cambiaTipoTarifa}
              name="nombreTarifa"
              value={tipoTarifa}
            >
              <MenuItem key={1} value={'2.0TD'}>
                2.0TD
              </MenuItem>
              <MenuItem key={2} value={'3.0TD'}>
                3.0TD
              </MenuItem>
            </TextField>
          </FormControl>
        </Grid>

        {precios[0] !== undefined && (
          <Grid item xs={4}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <TextField
                sx={{ width: 200, height: 50 }}
                key={precios[0][0]}
                type="text"
                value={precios[0][1]}
                onChange={(ev) => cambiaPrecio(precios[0][0], ev.target.value)}
                label={t('TARIFA.LABEL_P' + precios[0][0])}
                name={precios[0][0]}
                InputProps={{
                  endAdornment: <InputAdornment position="start"> €</InputAdornment>,
                  inputProps: {
                    style: { textAlign: 'right' },
                  },
                }}
              />
            </FormControl>
          </Grid>
        )}
      </Grid>

      <br />
      <br />
      <Box
        component="form"
        sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}
      >
        {/* REVISAR: porque sale en la consola el error de clave unica */}
        {precios.map((precioP) => (
          <>
            {/* REVISAR: por que no funciona? Como hacer una matriz fija para 3.0TD*/}
            {precioP[0] === '4' && (
              <div>
                <p>Salto</p>
              </div>
            )}
            {precioP[1] !== 0 && precioP[0] !== '0' ? (
              <TextField
                sx={{ width: 200, height: 50 }}
                key={precioP[0]}
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
              />
            ) : (
              ''
            )}
          </>
        ))}
      </Box>
      <br />
    </div>
  )
}
