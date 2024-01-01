import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'

// REACT Solidar Components
import EconomicContext from './EconomicContext'

// Solidar objects
import TCB from '../classes/TCB'

export default function VirtualBattery() {
  const { t } = useTranslation()

  const { cuotaHucha, setCuotaHucha, coefHucha, setCoefHucha, setEcoData } =
    useContext(EconomicContext)

  const [cuota, setCuota] = useState(cuotaHucha)
  const [coef, setCoef] = useState(coefHucha)

  const changeCuotaHucha = () => {
    TCB.cuotaHucha = parseFloat(cuota)
    setCuotaHucha(cuota)
    TCB.economico.correccionExcedentes(coef, cuota)
    TCB.economico.calculoFinanciero(100, 100)
    setEcoData(TCB.economico)
  }

  const changeCoefHucha = () => {
    TCB.coefHucha = parseFloat(coef)
    setCoefHucha(coef)
    TCB.economico.correccionExcedentes(coef, cuota)
    TCB.economico.calculoFinanciero(100, 100)
    setEcoData(TCB.economico)
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
            {t('ECONOMIC_BALANCE.TITLE_VIRTUAL_BATTERY')}
          </Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.DESCRIPTION_VIRTUAL_BATTERY'),
            }}
          />
          <Typography variant="body">
            {t('ECONOMIC_BALANCE.DESCRIPTION_RECOGNITION_VIRTUAL_BATTERY')}
          </Typography>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onBlur={changeCoefHucha}
              onChange={(event) => {
                setCoef(event.target.value)
              }}
              label={t('ECONOMIC_BALANCE.LABEL_RECOGNITION_VIRTUAL_BATTERY')}
              name="coefHucha"
              InputProps={{
                endAdornment: <InputAdornment position="start"> %</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              value={coef}
            />
          </FormControl>
          <Typography variant="body">
            {t('ECONOMIC_BALANCE.DESCRIPTION_FEE_VIRTUAL_BATTERY')}
          </Typography>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onBlur={changeCuotaHucha}
              onChange={(event) => {
                setCuota(event.target.value)
              }}
              label={t('ECONOMIC_BALANCE.LABEL_FEE_VIRTUAL_BATTERY')}
              name="cuotaHucha"
              InputProps={{
                endAdornment: <InputAdornment position="start"> €</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              value={cuota}
            />
          </FormControl>
        </Box>
      </Container>
    </>
  )
}
