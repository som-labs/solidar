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

import { SLDRInputField } from '../../components/SLDRComponents'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'

// Solidar objects
import TCB from '../classes/TCB'

export default function ReduccionIBI() {
  const { t } = useTranslation()
  const theme = useTheme()

  const { IBI, setIBI, setEcoData } = useContext(EconomicContext)
  const [_IBI, _setIBI] = useState(IBI)

  const setNewIBI = () => {
    TCB.economico.calculoFinanciero(100, 100)
    setIBI(_IBI)
    setEcoData(TCB.economico)
  }

  const onChangeIBI = (event) => {
    const { name, value } = event.target
    _setIBI((prevIBI) => ({ ...prevIBI, [name]: value }))
    TCB[name] = value
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
          <Typography sx={theme.titles.level_1} textAlign={'center'}>
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
              onChange={onChangeIBI}
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
            />
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onChange={onChangeIBI}
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
            />
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onChange={onChangeIBI}
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
            />
          </FormControl>
        </Box>
      </Container>
    </>
  )
}
