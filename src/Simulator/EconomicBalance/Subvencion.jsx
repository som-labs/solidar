import { useContext, useState, useEffect } from 'react'
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
import { ConsumptionContext } from '../ConsumptionContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function Subvencion({ finca }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [error, setError] = useState({ status: false, field: '' })

  const { economicoGlobal, setEconomicoGlobal, forceUpdate, costeZCenFinca } =
    useContext(EconomicContext)
  const { fincas, setFincas, zonasComunes } = useContext(ConsumptionContext)

  const localEcoData = finca ? finca.economico : economicoGlobal

  const [valor, setValor] = useState(localEcoData.valorSubvencion)
  const [porciento, setPorciento] = useState(localEcoData.porcientoSubvencion)

  /*Asumimos que si hay valor y porciento de subvencion prevalece el valor. Esto implica que se recalcula el porciento en base al valor por si hubiera habido un cambio en el precio de la instalacion.*/
  useEffect(() => {
    if (valor !== 0) {
      setPorciento(
        parseInt(
          (valor / (economicoGlobal.precioInstalacionCorregido * coefEnergia)) * 100,
        ),
      )
      if (finca) {
        finca.economico.porcientoSubvencion =
          (valor / economicoGlobal.precioInstalacionCorregido) * coefEnergia * 100
      } else {
        economicoGlobal.porcientoSubvencion =
          (valor / economicoGlobal.precioInstalacionCorregido) * coefEnergia * 100
      }
    }
  }, [])

  const coefEnergia = finca ? finca.coefEnergia : 1

  const setNewSubvencion = (event) => {
    const { name, value } = event.target
    if (!UTIL.ValidateDecimal(i18n.language, value)) {
      setError({ status: true, field: name })
    } else {
      if (valor > economicoGlobal.precioInstalacionCorregido * coefEnergia) {
        //alert(t('ECONOMIC_BALANCE.SUBVENCION_SURPLUS'))
        // setValor(ecoData.precioInstalacionCorregido)
        // setPorciento(100)

        setError({ status: true, field: name })
        event.target.focus()
      } else {
        setError({ status: false, field: '' })
        if (finca) {
          fincas.map((f) => {
            if (f.idFinca === finca.idFinca) {
              f.economico.porcientoSubvencion = porciento
              f.economico.valorSubvencion = valor

              f.economico.calculoFinanciero(
                coefEnergia,
                coefEnergia,
                economicoGlobal,
                f,
                zonasComunes,
                costeZCenFinca,
              )
            }
          })
        } else {
          economicoGlobal.porcientoSubvencion = porciento
          economicoGlobal.valorSubvencion = valor
          economicoGlobal.calculoFinanciero(1, 1, economicoGlobal)
          console.log('cambio subvencion', porciento, valor, economicoGlobal)
          forceUpdate((prev) => prev + 1)
        }
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
          setPorciento(
            parseInt(
              (parseFloat(value) / localEcoData.precioInstalacionCorregido) *
                coefEnergia *
                100,
            ),
          )
        } else {
          setPorciento(parseInt(value))
          setValor(
            parseInt(
              (localEcoData.precioInstalacionCorregido * coefEnergia * value) / 100,
            ),
          )
        }
      }
    }
  }

  return (
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
