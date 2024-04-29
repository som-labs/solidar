import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Box,
  Typography,
  FormControl,
  TextField,
  InputAdornment,
  Container,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'
// REACT Solidar Components
import { SLDRTooltip } from '../../components/SLDRComponents'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function Subvencion() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [error, setError] = useState({ status: false, field: '' })

  const { ecoData, setEcoData } = useContext(EconomicContext)
  const [valor, setValor] = useState(TCB.valorSubvencion)
  const [porciento, setPorciento] = useState(TCB.porcientoSubvencion)

  const setNewSubvencion = (event) => {
    const { name, value } = event.target
    if (!UTIL.ValidateDecimal(i18n.language, value)) {
      setError({ status: true, field: name })
    } else {
      if (valor > ecoData.precioInstalacionCorregido) {
        //alert(t('ECONOMIC_BALANCE.SUBVENCION_SURPLUS'))
        // setValor(ecoData.precioInstalacionCorregido)
        // setPorciento(100)

        setError({ status: true, field: name })
        event.target.focus()
      } else {
        setError({ status: false, field: '' })
        TCB.porcientoSubvencion = porciento
        TCB.valorSubvencion = valor
        TCB.economico.calculoFinanciero(100, 100)
        setEcoData({ ...ecoData, ...TCB.economico })
      }
    }
  }

  const onChangeSubvencion = (event) => {
    const { name, value } = event.target
    if (!UTIL.ValidateDecimal(i18n.language, value)) {
      setError({ status: true, field: name })
    } else {
      setError({ status: false, field: '' })
      if (value === '') {
        setValor(0)
        setPorciento(0)
      } else {
        if (name === 'valorSubvencion') {
          setValor(parseInt(value))
          setPorciento(parseInt((value / ecoData.precioInstalacionCorregido) * 100))
        } else {
          setPorciento(parseInt(value))
          setValor(parseInt((ecoData.precioInstalacionCorregido * value) / 100))
        }
      }
    }
  }

  return (
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
        <Typography sx={theme.titles.level_1} textAlign={'center'} marginTop="1rem">
          {t('ECONOMIC_BALANCE.SUBVENCION_TITLE')}
        </Typography>
        <Typography
          variant="body"
          textAlign={'center'}
          dangerouslySetInnerHTML={{
            __html: t('ECONOMIC_BALANCE.SUBVENCION_DESCRIPTION'),
          }}
        />

        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <TextField
            type="text"
            onChange={onChangeSubvencion}
            onBlur={setNewSubvencion}
            label={t('Economico.PROP.valorSubvencion')}
            name="valorSubvencion"
            value={valor}
            InputProps={{
              endAdornment: <InputAdornment position="start">&nbsp;€</InputAdornment>,
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
            error={error.status && error.field === 'valorSubvencion'}
            helperText={
              error.status && error.field === 'valorSubvencion'
                ? t('ECONOMIC_BALANCE.SUBVENCION_SURPLUS')
                : ''
            }
          />
        </FormControl>

        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <TextField
            type="text"
            onChange={onChangeSubvencion}
            onBlur={setNewSubvencion}
            label={t('Economico.PROP.porcientoSubvencion')}
            name="porcientoSubvencion"
            value={porciento}
            InputProps={{
              endAdornment: <InputAdornment position="start">&nbsp;%</InputAdornment>,
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
            error={error.status && error.field === 'porcientoSubvencion'}
            helperText={
              error.status && error.field === 'porcientoSubvencion'
                ? t('ECONOMIC_BALANCE.SUBVENCION_SURPLUS')
                : ''
            }
          />
        </FormControl>
      </Box>
    </Container>
  )
}
