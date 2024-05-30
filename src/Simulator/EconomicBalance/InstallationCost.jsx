import { useContext, useState } from 'react'
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
import HelpEconomicBalance from './HelpEconomicBalance'
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function InstallationCost() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [openDialog, closeDialog] = useDialog()

  const { ecoData, setEcoData } = useContext(EconomicContext)

  const [precioCorregido, setPrecioCorregido] = useState(
    ecoData.precioInstalacionCorregido,
  )
  const [error, setError] = useState(false)

  const setPrecioInstalacion = (event) => {
    event.preventDefault()

    if (precioCorregido === '') {
      // If new cost field is empty will use app calculated cost
      setPrecioCorregido(TCB.economico.precioInstalacion)
      TCB.economico.precioInstalacionCorregido = TCB.economico.precioInstalacion
      setError(false)
    } else if (!UTIL.ValidateDecimal(i18n.language, precioCorregido)) {
      setError(true)
    } else {
      if (precioCorregido > 0) {
        TCB.economico.precioInstalacionCorregido = parseInt(precioCorregido)
        TCB.economico.calculoFinanciero(100, 100)
        if (TCB.economico.periodoAmortizacion > 20) {
          alert(t('ECONOMIC_BALANCE.WARNING_AMORTIZATION_TIME'))
        }
        setEcoData({ ...ecoData, ...TCB.economico })
        setError(false)
        if (TCB.porcientoSubvencion !== 0) {
          alert('Es posible que tenga que verificar el valor de la subvención recibida')
        }
      }
    }
  }

  function changePrecioInstalacion(event) {
    if (event.target.value === '') {
      setPrecioCorregido(TCB.economico.precioInstalacion)
      setError(false)
      return
    }
    if (!UTIL.ValidateDecimal(i18n.language, event.target.value)) setError(true)
    else {
      setError(false)
      setPrecioCorregido(parseInt(event.target.value))
    }
  }

  function help(level) {
    openDialog({
      children: <HelpEconomicBalance level={level} onClose={() => closeDialog()} />,
    })
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
          <Typography
            sx={theme.titles.level_1}
            textAlign={'center'}
            marginTop="1rem"
            color={theme.palette.primary.main}
          >
            {t('ECONOMIC_BALANCE.TITLE_INSTALLATION_COST')}
          </Typography>
          <Box flexDirection={'row'}>
            <Typography variant={'body'} textAlign={'left'} marginTop="1rem">
              {t('ECONOMIC_BALANCE.DESCRIPTION_INSTALLATION_COST')}
            </Typography>
            <IconButton
              onClick={() => help(1)}
              size="small"
              style={{
                color: theme.palette.infoIcon.main,
                fontSize: 'inherit',
                verticalAlign: 'text-center',
                transform: 'scale(0.8)',
                padding: 0,
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
            {UTIL.formatoValor('precioInstalacion', TCB.economico.precioInstalacion) +
              ' ' +
              t('ECONOMIC_BALANCE.IVA_INCLUDED')}
          </Typography>
          <Typography variant="body">
            {t('ECONOMIC_BALANCE.PROMPT_INSTALLATION_COST')}
          </Typography>
          <br />
          <FormControl sx={{ m: 1, minWidth: 120 }}>
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
                precioCorregido !== TCB.economico.precioInstalacion ? precioCorregido : ''
              }
            />
          </FormControl>
        </Box>
      </Container>
    </>
  )
}
