import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

import { SLDRInputField } from '../../components/SLDRComponents'

import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

// REACT Solidar Components
import EconomicContext from './EconomicContext'

// Solidar objects
import TCB from '../classes/TCB'

const ReduccionIBI = () => {
  const { t } = useTranslation()

  const { IBI, setIBI, ecoData, setEcoData } = useContext(EconomicContext)
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
          }}
        >
          <Typography variant="h4">{t('ECONOMIC_BALANCE.TITLE_IBI')}</Typography>
          <Typography
            variant="body"
            textAlign={'center'}
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.DESCRIPTION_IBI'),
            }}
          />

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              required
              type="text"
              onChange={onChangeIBI}
              onBlur={setNewIBI}
              label={t('Economico.PROP.valorSubvencionIBI')}
              name="valorSubvencionIBI"
              value={_IBI.valorSubvencionIBI}
              InputProps={{
                endAdornment: <InputAdornment position="start"> €</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
            />
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              required
              type="text"
              onChange={onChangeIBI}
              onBlur={setNewIBI}
              label={t('Economico.PROP.porcientoSubvencionIBI')}
              name="porcientoSubvencionIBI"
              value={_IBI.porcientoSubvencionIBI}
              InputProps={{
                endAdornment: <InputAdornment position="start"> %</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
            />
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              required
              type="text"
              onChange={onChangeIBI}
              onBlur={setNewIBI}
              label={t('Economico.PROP.tiempoSubvencionIBI')}
              name="tiempoSubvencionIBI"
              value={_IBI.tiempoSubvencionIBI}
              InputProps={{
                endAdornment: <InputAdornment position="start"></InputAdornment>,
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

export default ReduccionIBI
