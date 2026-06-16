import { useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Box,
  IconButton,
  Typography,
  Container,
  FormControl,
  TextField,
  InputAdornment,
} from '@mui/material'

import InfoIcon from '@mui/icons-material/Info'

import { useTheme } from '@mui/material/styles'

//React global components
import { useDialog } from '../../components/DialogProvider'

import { EconomicContext } from '../EconomicContext'
import { ConsumptionContext } from '../ConsumptionContext'
import { AlertContext } from '../components/Alert'

import HelpEconomicBalance from './HelpEconomicBalance'
import {
  withNormalized,
  ValidateDecimal,
  formatoValor,
  decimalSeparator,
} from '../classes/Utiles'
import TCB from '../classes/TCB'
import { SLDRInputField } from '../../components/SLDRComponents'

export default function BateryCost() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [openDialog, closeDialog] = useDialog()
  const { SLDRAlert } = useContext(AlertContext)
  const { ecoData, setEcoData } = useContext(EconomicContext)
  const { bateria, setBateria } = useContext(ConsumptionContext)

  // // Estimación orientativa
  // const precioEstimadoBateria = () => {
  //   const costePorKwh = 700 // €/kWh, valor medio
  //   const costeInstalacion = 500 // fijo
  //   return bateria.capacidad * costePorKwh + costeInstalacion
  // }

  const [precioBateria, setPrecioBateria] = useState(
    bateria.precio, // valor inicial correcto
  )
  const [error, setError] = useState(false)

  const applyPrecioBateria = () => {
    if (!ValidateDecimal(i18n.language, precioBateria)) {
      setError(true)
    } else {
      if (precioBateria > 0) {
        TCB.bateria.precio = parseInt(precioBateria)
        setBateria((prev) => ({ ...prev, precio: precioBateria }))
        TCB.economico.precioBateria = parseInt(precioBateria)
        TCB.economico.calculoFinanciero(100, 100)
        if (TCB.economico.periodoAmortizacion > 20) {
          SLDRAlert('AVISO', t('ECONOMIC_BALANCE.WARNING_AMORTIZATION_TIME', 'Aviso'))
        }
        if (TCB.porcientoSubvencion !== 0) {
          SLDRAlert('AVISO', t('ECONOMIC_BALANCE.WARNING_CAMBIO_PRECIOS', 'Aviso'))
        }
        setEcoData({ ...ecoData, ...TCB.economico })
        setError(false)
      }
    }
  }

  function changePrecioBateria(value) {
    if (value === '') {
      setPrecioBateria(bateria.precio)
      setError(false)
      return
    }
    if (isNaN(Number(value))) setError(true)
    else {
      setError(false)
      setPrecioBateria(value)
    }
  }

  function help(level) {
    openDialog({
      children: <HelpEconomicBalance level={level} onClose={() => closeDialog()} />,
    })
  }

  const precioEstimado =
    TCB.parametros.bateriaPrecioUnitario * bateria.capacidad +
    TCB.parametros.bateriaPrecioInstalacion

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
          <Typography
            sx={theme.titles.level_1}
            textAlign={'center'}
            marginTop="1rem"
            color={theme.palette.primary.main}
          >
            {t('ECONOMIC_BALANCE.TITLE_BATERY_COST')}
          </Typography>

          <Box flexDirection={'row'}>
            <Typography variant={'body'} textAlign={'left'} marginTop="1rem">
              {t('ECONOMIC_BALANCE.DESCRIPTION_BATERY_COST', {
                capacidad: formatoValor('energia', bateria.capacidad),
              })}
            </Typography>
            <IconButton
              onClick={() => help(4)}
              size="small"
              style={{
                color: theme.palette.infoIcon.main,
                fontSize: 'inherit',
                verticalAlign: 'text-center',
                transform: 'scale(0.8)',
                padding: 2,
              }}
            >
              <InfoIcon />
            </IconButton>
          </Box>
          <Typography
            variant="h4"
            color={theme.palette.primary.main}
            textAlign={'center'}
          >
            {formatoValor('precioInstalacion', precioEstimado) +
              ' ' +
              t('ECONOMIC_BALANCE.IVA_INCLUDED')}
          </Typography>
          <Typography variant="body">
            {t('ECONOMIC_BALANCE.PROMPT_INSTALLATION_COST')}
          </Typography>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <SLDRInputField
              object={'Bateria'}
              unit=" €"
              id="precio"
              onBlur={applyPrecioBateria}
              onChange={withNormalized(changePrecioBateria)}
              name="precio"
              label={t('ECONOMIC_BALANCE.LABEL_BATERY_COST')}
              error={error}
              helperText={error ? 'Pon un número válido mayor que cero' : ''}
              value={String(precioBateria ?? '').replace('.', decimalSeparator)}
            />
          </FormControl>
        </Box>
      </Container>
    </>
  )
}
