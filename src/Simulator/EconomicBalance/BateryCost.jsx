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

export default function BateryCost() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [openDialog, closeDialog] = useDialog()
  const { ecoData, setEcoData } = useContext(EconomicContext)

  const [precioBateria, setPrecioBateria] = useState(ecoData.precioBateria)
  const [error, setError] = useState(false)

  const applyPrecioBateria = (event) => {
    event.preventDefault()

    console.log('Cambiando precio', event, precioBateria)
    if (!UTIL.ValidateDecimal(i18n.language, precioBateria)) {
      setError(true)
    } else {
      if (precioBateria > 0) {
        TCB.economico.precioBateria = parseInt(precioBateria)
        console.log('llamando', TCB.economico)
        TCB.economico.calculoFinanciero(100, 100)
        if (TCB.economico.periodoAmortizacion > 20) {
          alert(t('ECONOMIC_BALANCE.WARNING_AMORTIZATION_TIME'))
        }
        setEcoData({ ...ecoData, ...TCB.economico })
        setError(false)
      }
    }
  }

  function changePrecioBateria(event) {
    if (event.target.value === '') {
      setPrecioBateria(TCB.economico.precioBateria)
      setError(false)
      return
    }
    if (!UTIL.ValidateDecimal(i18n.language, event.target.value)) setError(true)
    else {
      setError(false)
      setPrecioBateria(parseInt(event.target.value))
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
            {t('ECONOMIC_BALANCE.TITLE_BATERY_COST')}
          </Typography>

          <Box flexDirection={'row'}>
            <Typography variant={'body'} textAlign={'left'} marginTop="1rem">
              {t('ECONOMIC_BALANCE.DESCRIPTION_BATERY_COST')}
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
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onBlur={applyPrecioBateria}
              onChange={changePrecioBateria}
              label={t('ECONOMIC_BALANCE.LABEL_BATERY_COST')}
              name="precioBateria"
              InputProps={{
                endAdornment: <InputAdornment position="start">&nbsp;€</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              error={error}
              helperText={error ? 'Pon un número válido mayor que cero' : ''}
              value={precioBateria}
            />
          </FormControl>
        </Box>
      </Container>
    </>
  )
}
