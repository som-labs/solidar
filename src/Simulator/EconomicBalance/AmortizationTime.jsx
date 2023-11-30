import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
// REACT Solidar Components
import EconomicContext from './EconomicContext'

export default function AmortizationTime() {
  const { t, i18n } = useTranslation()

  const { ecoData } = useContext(EconomicContext)

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
            {t('ECONOMIC_BALANCE.TITLE_AMORTIZATION_TIME')}
          </Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.DESCRIPTION_AMORTIZATION_TIME'),
            }}
          />
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Typography variant="h4" color={'green'} textAlign={'center'}>
              {ecoData.periodoAmortizacion}
            </Typography>
            <Typography variant="body">
              {t('ECONOMIC_BALANCE.PROMPT_AMORTIZATION_TIME')}
            </Typography>
            <br />
          </FormControl>
        </Box>
      </Container>
    </>
  )
}
