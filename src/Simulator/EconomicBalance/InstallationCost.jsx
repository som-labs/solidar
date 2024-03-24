import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Box,
  Typography,
  Container,
  FormControl,
  TextField,
  InputAdornment,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { EconomicContext } from '../EconomicContext'

import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function InstallationCost() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()

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
            gap: '10px',
          }}
        >
          <Typography
            sx={theme.titles.level_1}
            textAlign={'center'}
            marginTop="1rem"
            color={theme.palette.primary.main}
          >
            {t('ECONOMIC_BALANCE.TITLE_INSTALLATION_COST')}
          </Typography>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Typography
              variant="h4"
              color={theme.palette.primary.main}
              textAlign={'center'}
            >
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
                endAdornment: <InputAdornment position="start">&nbsp;€</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              error={error}
              helperText={error ? 'Pon un número válido mayor que cero' : ''}
              value={
                precioInstalacionCorregido !== TCB.produccion.precioInstalacion
                  ? precioInstalacionCorregido
                  : ''
              }
            />
          </FormControl>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.DESCRIPTION_INSTALLATION_COST'),
            }}
          />
        </Box>
      </Container>
    </>
  )
}
