import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'

// REACT Solidar Components
import EconomicContext from './EconomicContext'

// Solidar objects
import TCB from '../classes/TCB'

const ReduccionIBI = () => {
  const { t, i18n } = useTranslation()
  const { IBI, setIBI, setCashFlow, setPeriodoAmortizacion } = useContext(EconomicContext)

  const onChangeIBI = (event) => {
    const { name, value } = event.target
    console.log(name, value)
    setIBI((prevIBI) => ({ ...prevIBI, [name]: value }))
    TCB[name] = value
    if (
      TCB.valorSubvencionIBI * TCB.porcientoSubvencionIBI * TCB.tiempoSubvencionIBI !==
      0
    ) {
      TCB.economico.calculoFinanciero(100, 100)
      setCashFlow(TCB.economico.cashFlow)
      setPeriodoAmortizacion(TCB.economico.periodoAmortizacion)
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
              label={t('Economico.LABEL_valorSubvencionIBI')}
              name="valorSubvencionIBI"
              value={IBI.valorSubvencionIBI}
            />
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              required
              type="text"
              onChange={onChangeIBI}
              label={t('Economico.LABEL_porcientoSubvencionIBI')}
              name="porcientoSubvencionIBI"
              value={IBI.porcientoSubvencionIBI}
            />
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              required
              type="text"
              onChange={onChangeIBI}
              label={t('Economico.LABEL_tiempoSubvencionIBI')}
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
