import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ReactMarkdown from 'react-markdown'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import EconomicContext from './EconomicContext'
import TCB from '../classes/TCB'

const ReduccionIBI = () => {
  const { t, i18n } = useTranslation()
  const { IBI, setIBI } = useContext(EconomicContext)

  const onChangeIBI = (event) => {
    const { name, value } = event.target
    setIBI((prevIBI) => ({ ...prevIBI, [name]: value }))
    TCB[name] = value
    if (
      TCB.valorSubvencionIBI !== 0 &&
      TCB.porcientoSubvencionIBI !== 0 &&
      TCB.tiempoSubvencionIBI !== 0
    ) {
      TCB.economico.calculoFinanciero(100, 100)
      //muestraBalanceFinanciero()
    }
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
          <Typography variant="h4">{t('ECONOMIC_BALANCE.IBI_TITLE')}</Typography>
          <ReactMarkdown children={t('ECONOMIC_BALANCE.IBI_DESCRIPTION')} />

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              required
              type="text"
              onChange={onChangeIBI}
              label={t('ECONOMIC_BALANCE.IBI_VALOR')}
              name="valorSubvencionIBI"
              value={IBI.valorSubvencionIBI}
            />
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              required
              type="text"
              onChange={onChangeIBI}
              label={t('ECONOMIC_BALANCE.IBI_PORCIENTO')}
              name="porcientoSubvencionIBI"
              value={IBI.porcientoSubvencionIBI}
            />
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              required
              type="text"
              onChange={onChangeIBI}
              label={t('ECONOMIC_BALANCE.IBI_DURACION')}
              name="tiempoSubvencionIBI"
              value={IBI.tiempoSubvencionIBI}
            />
          </FormControl>
        </Box>
      </Container>
    </>
  )
}

export default ReduccionIBI
