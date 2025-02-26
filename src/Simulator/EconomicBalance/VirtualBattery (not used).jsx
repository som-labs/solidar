import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Box,
  Typography,
  TextField,
  Container,
  FormControl,
  InputAdornment,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function VirtualBattery() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [error, setError] = useState({ status: false, field: '' })

  const { ecoData, setEcoData } = useContext(EconomicContext)

  const [cuota, setCuota] = useState(TCB.tarifaActiva.cuotaHucha)
  const [coef, setCoef] = useState(TCB.tarifaActiva.coefHucha)

  const changeFlux = (event) => {
    const { name, value } = event.target
    if (!UTIL.ValidateDecimal(i18n.language, value)) {
      setError({ status: true, field: name })
    } else {
      setError({ status: false, field: '' })
      if (name === 'cuotaHucha') {
        setCuota(value !== '' ? parseInt(value) : 0)
      } else {
        setCoef(value !== '' ? parseInt(value) : 0)
        if (parseInt(value) > 100 || coef < 0) {
          setError({ status: true, field: 'coefHucha' })
        }
      }
    }
  }

  const setFlux = (event) => {
    if (error.status) {
      setCoef(0)
      event.target.focus()
    }
    const { name, value } = event.target
    if (!UTIL.ValidateDecimal(i18n.language, value)) {
      setError({ status: true, field: name })
    } else {
      setError({ status: false, field: '' })
      TCB.tarifaActiva.cuotaHucha = cuota
      TCB.tarifaActiva.coefHucha = coef
      TCB.economico.correccionExcedentes(coef, cuota)
      TCB.economico.calculoFinanciero(100, 100)
      setEcoData({ ...ecoData, ...TCB.economico })
    }
  }

  return (
    <>
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            width: '100%',
            gap: '10px',
          }}
        >
          <Typography sx={theme.titles.level_1} textAlign={'center'} marginTop="1rem">
            {t('ECONOMIC_BALANCE.TITLE_VIRTUAL_BATTERY')}
          </Typography>
          <Typography
            variant="body"
            textAlign={'center'}
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.DESCRIPTION_VIRTUAL_BATTERY'),
            }}
          />

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onBlur={setFlux}
              onChange={changeFlux}
              label={t('ECONOMIC_BALANCE.LABEL_RECOGNITION_VIRTUAL_BATTERY')}
              name="coefHucha"
              InputProps={{
                endAdornment: <InputAdornment position="start">&nbsp;%</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              value={coef}
              error={error.status && error.field === 'coefHucha'}
              helperText={
                error.status && error.field === 'coefHucha'
                  ? 'Pon un número válido entre 0 y 100'
                  : ''
              }
            />
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onBlur={setFlux}
              onChange={changeFlux}
              label={t('ECONOMIC_BALANCE.LABEL_FEE_VIRTUAL_BATTERY')}
              name="cuotaHucha"
              InputProps={{
                endAdornment: <InputAdornment position="start">&nbsp;€</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              value={cuota}
              error={error.status && error.field === 'cuotaHucha'}
              helperText={
                error.status && error.field === 'cuotaHucha'
                  ? 'Pon un número válido mayor que cero'
                  : ''
              }
            />
          </FormControl>
        </Box>
      </Container>
    </>
  )
}
