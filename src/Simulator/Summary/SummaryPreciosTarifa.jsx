import { useState, useEffect, Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import InputAdornment from '@mui/material/InputAdornment'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function SummaryPreciosTarifa() {
  const { t } = useTranslation()

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
    // TCB.tarifaActiva = TCB.tarifas[TCB.nombreTarifaActiva]
    // console.log('CAMBIO TARIFAS SUMMARY', TCB.tarifaActiva)
  }, [])

  return (
    <Grid container spacing={1} alignItems="center" justifyContent="space-evenly">
      {TCB.tarifaActiva.precios.map((precio, index) => {
        if (index !== 0 && index < nPrecios) {
          return (
            <Fragment key={index}>
              <Grid item xs={1} sx={{ border: 0, textAlign: 'right', padding: 1 }}>
                {'P' + index}
              </Grid>
              <Grid
                item
                xs={3}
                sx={{
                  fontWeight: 'bold',
                  border: 1,
                  borderRadius: 3,
                  textAlign: 'center',
                  padding: 0.5,
                  borderColor: 'primary.light',
                }}
              >
                {precio}
              </Grid>
            </Fragment>
          )
        } else {
          return null
        }
      })}

      <Grid item xs={6}>
        {t('Tarifa.PROP.tipoTarifa')}
      </Grid>
      <Grid item xs={6} sx={{ fontWeight: 'bold' }}>
        {TCB.nombreTarifaActiva}
      </Grid>
      <Grid item xs={6}>
        {t('Tarifa.PROP.P0')}
      </Grid>
      <Grid item xs={6} sx={{ fontWeight: 'bold' }}>
        {TCB.tarifas[TCB.nombreTarifaActiva].precios[0] + ' €/kWh'}
      </Grid>
    </Grid>
  )
}
