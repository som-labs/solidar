import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { MuiFileInput } from 'mui-file-input'

import TipoConsumo from '../classes/TipoConsumo'
import Tarifa from '../classes/Tarifa'
import TCB from '../classes/TCB'
import TCBContext from '../TCBContext'
import * as UTIL from '../classes/Utiles'

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
    prevPrecios[posicion][1] = nuevoValor
    setPrecios(prevPrecios)
    TCB.tarifaActiva.precios[posicion] = nuevoValor
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
          sx={{ width: 200, height: 50 }}
          id="tarifa-simple-select"
          select
          label={t('TARIFA.LABEL_NOMBRE_TARIFA')}
          onChange={cambiaTipoTarifa}
          name="nombreTarifa"
          value={tipoTarifa}
        >
          <MenuItem value={'2.0TD'}>2.0TD</MenuItem>
          <MenuItem value={'3.0TD'}>3.0TD</MenuItem>
        </TextField>
      </FormControl>
      <br />
      <br />

      <Box
        component="form"
        sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}
      >
        {/* REVISAR: porque sale en la consola el error de clave unica */}
        {precios.map((precioP, index) => (
          <>
            {/* REVISAR: por que no funciona? */}
            {(index === 1 || index === 4) && <br />}

            {precioP[1] !== 0 ? (
              <Box>
                <TextField
                  sx={{ width: 200, height: 50 }}
                  key={index}
                  type="text"
                  value={precioP[1]}
                  onChange={(ev) => cambiaPrecio(index, ev.target.value)}
                  label={t('TARIFA.LABEL_P' + precioP[0])}
                  name={precioP[0]}
                  InputProps={{
                    endAdornment: <InputAdornment position="start"> €</InputAdornment>,
                    inputProps: {
                      style: { textAlign: 'right' },
                    },
                  }}
                />
              </Box>
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
