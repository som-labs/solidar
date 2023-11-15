import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'

// Solidar objects
import TCB from '../classes/TCB'

export default function PreciosTarifa() {
  const { t, i18n } = useTranslation()

  const [precios, setPrecios] = useState(Object.entries(TCB.tarifaActiva.precios))
  //const [nombreTarifaActiva, setNombreTarifaActiva] = useState(TCB.nombreTarifaActiva)
  const [tipoTarifa, setTipoTarifa] = useState(TCB.tipoTarifa)

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
    const index = posicion[1]
    prevPrecios[index][1] = nuevoValor
    setPrecios(prevPrecios)
    TCB.tarifaActiva.precios[index] = nuevoValor
  }
  return (
    <div>
      <Typography
        variant="body"
        dangerouslySetInnerHTML={{
          __html: t('TARIFA.DESCRIPTION'),
        }}
      />
      <br />
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
            {/* {(precioP[0] === 'P1' || precioP[0] === 'P4') && <br />} */}

            {precioP[1] !== 0 ? (
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
