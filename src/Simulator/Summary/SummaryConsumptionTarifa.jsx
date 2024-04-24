import { useState, useEffect, Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import Grid from '@mui/material/Grid'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function SummaryConsumptionTarifa() {
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
      {TCB.consumo.periodo.map((consumo, index) => {
        if (index < nPrecios) {
          return (
            <Fragment key={index}>
              <Grid item xs={1} sx={{ border: 0, textAlign: 'right', padding: 1 }}>
                {'P' + (index + 1)}
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
                {UTIL.formatoValor('energia', consumo)}
              </Grid>
            </Fragment>
          )
        } else {
          return null
        }
      })}

      <Grid item xs={6}>
        {t('REPORT.US_HORAS_SOL')}
      </Grid>
      <Grid item xs={6} sx={{ fontWeight: 'bold' }}>
        {UTIL.formatoValor('energia', TCB.balance.consumoDiurno)}
      </Grid>
    </Grid>
  )
}
