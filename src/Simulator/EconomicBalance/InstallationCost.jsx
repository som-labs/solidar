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

  const { setEcoData } = useContext(EconomicContext)
  const [precioInstalacionCorregido, setPrecioInstalacionCorregido] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    setPrecioInstalacionCorregido('')
  }, [])

  const setPrecioInstalacion = () => {
    if (precioInstalacionCorregido === '') {
      // If new cost field is empty will use app calculated cost
      setPrecioInstalacionCorregido(TCB.economico.precioInstalacion)
      TCB.economico.precioInstalacionCorregido = TCB.economico.precioInstalacion
      setError(false)
    } else if (!UTIL.ValidateDecimal(i18n.language, precioInstalacionCorregido)) {
      setError(true)
    } else {
      const intPrecio = parseInt(precioInstalacionCorregido)
      if (intPrecio > 0) {
        TCB.economico.precioInstalacionCorregido = intPrecio
        TCB.economico.calculoFinanciero(100, 100)
        setPrecioInstalacionCorregido(intPrecio)
        setEcoData(TCB.economico)
        setError(false)
      } else {
        setError(true)
      }
    }
  }

  function changePrecioInstalacion(event) {
    setError(!UTIL.ValidateDecimal(i18n.language, event.target.value))
    setPrecioInstalacionCorregido(event.target.value)
  }

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
              {UTIL.formatoValor('precioInstalacion', TCB.economico.precioInstalacion)}
            </Typography>
            <Typography variant="body">
              {t('ECONOMIC_BALANCE.PROMPT_INSTALLATION_COST')}
            </Typography>
            <br />

            <TextField
              type="text"
              onBlur={setPrecioInstalacion}
              onChange={changePrecioInstalacion}
              label={t('ECONOMIC_BALANCE.LABEL_INSTALLATION_COST')}
              name="precioInstalacionCorregido"
              InputProps={{
                endAdornment: <InputAdornment position="start"> €</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              error={error}
              //REVISAR: como mantener el focus en el campo mientras que persista el error
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
