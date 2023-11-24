import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'

import EconomicContext from './EconomicContext'

import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

const InstallationCost = () => {
  const { t, i18n } = useTranslation()

  const {
    precioInstalacionCorregido,
    setPrecioInstalacionCorregido,
    setCashFlow,
    setPeriodoAmortizacion,
  } = useContext(EconomicContext)
  const [error, setError] = useState(false)

  //REVISAR: esta funcion deberia tener en cuenta el idioma para verificar si un string es numero o no. Pero no funciona.
  function isNumber(str) {
    // REVISAR: Try to parse the string using the user's locale
    try {
      const numberFormat = new Intl.NumberFormat(TCB.i18next.language, {
        style: 'decimal',
      })
      console.log(isNaN(numberFormat.formatToParts(str)))
      if (numberFormat.formatToParts(str).value === 'NaN') return false
      return true
    } catch (error) {
      return false
    }
  }

  const changePrecioInstalacion = () => {
    if (precioInstalacionCorregido === '') {
      // If new cost field is empty will use app calculated cost
      setPrecioInstalacionCorregido(TCB.produccion.precioInstalacion)
      TCB.produccion.precioInstalacionCorregido = TCB.produccion.precioInstalacion
      setError(false)
    } else if (isNaN(parseInt(precioInstalacionCorregido))) {
      //if (!isNumber(precioInstalacionCorregido)) { //REVISAR: ver la funcion mas arriba
      setError(true)
    } else {
      const intPrecio = parseInt(precioInstalacionCorregido)
      if (intPrecio > 0) {
        TCB.produccion.precioInstalacionCorregido = intPrecio

        TCB.economico.calculoFinanciero(100, 100)
        setPrecioInstalacionCorregido(intPrecio)
        setCashFlow(TCB.economico.cashFlow)
        setPeriodoAmortizacion(TCB.economico.periodoAmortizacion)
        setError(false)
      } else {
        setError(true)
      }
    }
  }

  useEffect(() => {
    setPrecioInstalacionCorregido(TCB.produccion.precioInstalacionCorregido)
  }, [])

  return (
    <>
      <Container>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Typography variant="h4">
            {t('ECONOMIC_BALANCE.TITLE_INSTALLATION_COST')}
          </Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.DESCRIPTION_INSTALLATION_COST'),
            }}
          />
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Typography variant="h4" color={'green'} textAlign={'center'}>
              {UTIL.formatoValor('precioInstalacion', TCB.produccion.precioInstalacion)}
            </Typography>
            <Typography variant="body">
              {t('ECONOMIC_BALANCE.PROMPT_INSTALLATION_COST')}
            </Typography>
            <br />
            <TextField
              type="text"
              onBlur={changePrecioInstalacion}
              onChange={(event) => {
                setPrecioInstalacionCorregido(event.target.value)
              }}
              label={t('ECONOMIC_BALANCE.LABEL_INSTALLATION_COST')}
              name="precioInstalacionCorregido"
              InputProps={{
                endAdornment: <InputAdornment position="start"> €</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              error={error} //REVISAR: como mantener el focus en el campo miesntras que persista el error
              helperText={error ? 'Pon un número válido mayor que cero' : ''}
              value={
                precioInstalacionCorregido !== TCB.produccion.precioInstalacion
                  ? precioInstalacionCorregido
                  : ''
              }
            />
          </FormControl>
        </Box>
      </Container>
    </>
  )
}

export default InstallationCost
