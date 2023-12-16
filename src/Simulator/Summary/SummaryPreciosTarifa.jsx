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
  const { t, i18n } = useTranslation()

  const [precios, setPrecios] = useState([])
  const [nPrecios, setNPrecios] = useState()

  useEffect(() => {
    if (TCB.tipoTarifa === '2.0TD') setNPrecios(4)
    else setNPrecios(7)
    setPrecios(Object.entries(TCB.tarifaActiva.precios).slice(1, nPrecios))
  }, [])

  return (
    <>
      <Grid
        container
        spacing={1}
        sx={{ mb: '1rem' }}
        alignItems="center"
        justifyContent="space-evenly"
      >
        <Grid item xs={6} sx={{ borderRadius: '5px' }}>
          {t('TARIFA.LABEL_NOMBRE_TARIFA')}
        </Grid>
        <Grid item xs={6}>
          {TCB.nombreTarifaActiva}
        </Grid>
        <Grid item xs={6}>
          {t('TARIFA.LABEL_P0')}
        </Grid>
        <Grid item xs={6}>
          {TCB.tarifas[TCB.nombreTarifaActiva].precios[0] + ' €/kWh'}
        </Grid>
      </Grid>

      <Grid
        container
        spacing={1}
        alignItems="center"
        justifyContent="space-evenly"
        sx={{ mb: '1rem' }}
      >
        {precios.map((precioP) => (
          <Fragment key={precioP[0]}>
            <Grid item xs={1} sx={{ border: 0, textAlign: 'right', padding: 1 }}>
              {'P' + precioP[0]}
            </Grid>
            <Grid
              item
              xs={3}
              sx={{
                border: 1,
                textAlign: 'right',
                padding: 0.5,
                borderColor: 'primary.light',
              }}
            >
              {precioP[1] + ' €/kWh'}
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </>
  )
}
