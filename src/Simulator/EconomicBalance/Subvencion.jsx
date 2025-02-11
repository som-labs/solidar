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

  const { ecoData, setEcoData } = useContext(EconomicContext)
  const { setFincas } = useContext(ConsumptionContext)

  const localEcoData = finca ? finca.economico : ecoData

  const [valor, setValor] = useState(localEcoData.valorSubvencion)
  const [porciento, setPorciento] = useState(localEcoData.porcientoSubvencion)

  console.log(localEcoData, TCB.economico)
  /*Asumimos que si hay valor y porciento de subvencion prevalece el valor. Esto implica que se recalcula el porciento en base al valor por si hubiera habido un cambio en el precio de la instalacion.*/
  useEffect(() => {
    console.log('en useEffect', valor)
    if (valor !== 0) {
      setPorciento(
        parseInt((valor / (ecoData.precioInstalacionCorregido * coefEnergia)) * 100),
      )
      if (finca) {
        finca.economico.porcientoSubvencion =
          (valor / ecoData.precioInstalacionCorregido) * coefEnergia * 100
      } else {
        TCB.economico.porcientoSubvencion =
          (valor / ecoData.precioInstalacionCorregido) * coefEnergia * 100
      }
    }
  }, [])

  const coefEnergia = finca ? finca.coefEnergia : 1

  const setNewSubvencion = (event) => {
    const { name, value } = event.target
    if (!UTIL.ValidateDecimal(i18n.language, value)) {
      setError({ status: true, field: name })
    } else {
      console.log(ecoData, finca)
      if (valor > ecoData.precioInstalacionCorregido * coefEnergia) {
        //alert(t('ECONOMIC_BALANCE.SUBVENCION_SURPLUS'))
        // setValor(ecoData.precioInstalacionCorregido)
        // setPorciento(100)

        setError({ status: true, field: name })
        event.target.focus()
      } else {
        setError({ status: false, field: '' })
        if (finca) {
          TCB.Finca.map((f) => {
            if (f.idFinca === finca.idFinca) {
              f.economico.porcientoSubvencion = porciento
              f.economico.valorSubvencion = valor
              f.economico.calculoFinanciero(coefEnergia, coefEnergia, f)
            }
          })
          setFincas([...TCB.Finca])
        } else {
          TCB.economico.porcientoSubvencion = porciento
          TCB.economico.valorSubvencion = valor
          TCB.economico.calculoFinanciero(1, 1)
          console.log('cambio subvencion', porciento, valor, TCB.economico)
          setEcoData({ ...ecoData, ...TCB.economico })
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
              (parseFloat(value) / ecoData.precioInstalacionCorregido) *
                coefEnergia *
                100,
            ),
          )
        } else {
          setPorciento(parseInt(value))
          setValor(
            parseInt((ecoData.precioInstalacionCorregido * coefEnergia * value) / 100),
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
