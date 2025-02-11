import { useContext, useState } from 'react'
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

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'
import { ConsumptionContext } from '../ConsumptionContext'
import { useAlert } from '../../components/AlertProvider.jsx'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function ReduccionIBI({ finca }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [error, setError] = useState({ status: false, field: '' })
  const { ecoData, setEcoData } = useContext(EconomicContext)
  const { setFincas } = useContext(ConsumptionContext)
  const { SLDRAlert } = useAlert()

  const localEcoData = finca ? finca.economico : ecoData

  const [_IBI, _setIBI] = useState({
    tiempoSubvencionIBI: localEcoData.tiempoSubvencionIBI,
    valorSubvencionIBI: localEcoData.valorSubvencionIBI,
    porcientoSubvencionIBI: localEcoData.porcientoSubvencionIBI,
  })

  const setNewIBI = (event) => {
    const { name, value } = event.target
    const coste = finca
      ? ecoData.precioInstalacionCorregido * finca.coefEnergia
      : ecoData.precioInstalacionCorregido

    if (isNaN(value)) {
      setError({ status: true, field: name })
    } else {
      setError({ status: false, field: '' })
      const totalIBI =
        (_IBI.valorSubvencionIBI *
          _IBI.tiempoSubvencionIBI *
          _IBI.porcientoSubvencionIBI) /
        100
      if (totalIBI > coste) {
        const limitIBI = parseInt(
          coste / ((_IBI.valorSubvencionIBI * _IBI.porcientoSubvencionIBI) / 100),
        )
        SLDRAlert(
          'SUBVENCION IBI',
          t('ECONOMIC_BALANCE.ERROR_IBI_SURPLUS', { años: limitIBI }),
          'Warning',
        )
        _setIBI((prevIBI) => ({ ...prevIBI, ['tiempoSubvencionIBI']: limitIBI }))
      }
      if (finca) {
        setFincas((prev) =>
          prev.map((f, ndx) => {
            if (f.idFinca === finca.idFinca) {
              TCB.Finca[ndx].economico.tiempoSubvencionIBI = _IBI.tiempoSubvencionIBI
              TCB.Finca[ndx].economico.valorSubvencionIBI = _IBI.valorSubvencionIBI
              TCB.Finca[ndx].economico.porcientoSubvencionIBI =
                _IBI.porcientoSubvencionIBI
              console.log(TCB.Finca[ndx])
              TCB.Finca[ndx].economico.calculoFinanciero(
                finca.coefEnergia,
                finca.coefEnergia,
                finca,
              )
              return TCB.Finca[ndx]
            } else {
              return f
            }
          }),
        )
        //console.dir(finca)
        //finca.economico.calculoFinanciero(finca.coefEnergia, finca.coefEnergia)
      } else {
        TCB.economico.tiempoSubvencionIBI = _IBI.tiempoSubvencionIBI
        TCB.economico.valorSubvencionIBI = _IBI.valorSubvencionIBI
        TCB.economico.porcientoSubvencionIBI = _IBI.porcientoSubvencionIBI
        TCB.economico.calculoFinanciero(100, 100)
        setEcoData({ ...ecoData, ...TCB.economico })
      }
    }
  }

  const changeIBI = (event) => {
    const { name, value } = event.target
    if (!UTIL.ValidateDecimal(i18n.language, value)) {
      setError({ status: true, field: name })
    } else {
      setError({ status: false, field: '' })
      _setIBI((prevIBI) => ({ ...prevIBI, [name]: value !== '' ? parseInt(value) : 0 }))
      TCB[name] = value !== '' ? parseInt(value) : 0
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
            {t('ECONOMIC_BALANCE.TITLE_IBI')}
          </Typography>
          <Typography
            variant="body"
            textAlign={'center'}
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.DESCRIPTION_IBI'),
            }}
          />

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onChange={changeIBI}
              onBlur={setNewIBI}
              label={t('Economico.PROP.valorSubvencionIBI')}
              name="valorSubvencionIBI"
              value={_IBI.valorSubvencionIBI}
              InputProps={{
                endAdornment: <InputAdornment position="start">&nbsp;€</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              error={error.status && error.field === 'valorSubvencionIBI'}
              helperText={
                error.status && error.field === 'valorSubvencionIBI'
                  ? t('BASIC.LABEL_NUMBER')
                  : ''
              }
            />
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onChange={changeIBI}
              onBlur={setNewIBI}
              label={t('Economico.PROP.porcientoSubvencionIBI')}
              name="porcientoSubvencionIBI"
              value={_IBI.porcientoSubvencionIBI}
              InputProps={{
                endAdornment: <InputAdornment position="start">&nbsp;%</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              error={error.status && error.field === 'porcientoSubvencionIBI'}
              helperText={
                error.status && error.field === 'porcientoSubvencionIBI'
                  ? t('BASIC.LABEL_NUMBER')
                  : ''
              }
            />
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onChange={changeIBI}
              onBlur={setNewIBI}
              label={t('Economico.PROP.tiempoSubvencionIBI')}
              name="tiempoSubvencionIBI"
              value={_IBI.tiempoSubvencionIBI}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    &nbsp;{t('BASIC.LABEL_AÑOS')}
                  </InputAdornment>
                ),
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              error={error.status && error.field === 'tiempoSubvencionIBI'}
              helperText={
                error.status && error.field === 'tiempoSubvencionIBI'
                  ? t('BASIC.LABEL_NUMBER')
                  : ''
              }
            />
          </FormControl>
        </Box>
      </Container>
    </>
  )
}
