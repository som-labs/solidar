import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'

export default function AmortizationTime() {
  const { t } = useTranslation()
  const theme = useTheme()

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
          <Typography sx={theme.titles.level_1} textAlign={'center'} marginTop="1rem">
            {t('ECONOMIC_BALANCE.TITLE_AMORTIZATION_TIME')}
          </Typography>
          {/* <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.DESCRIPTION_AMORTIZATION_TIME'),
            }}
          /> */}
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Typography variant="h4" color={'#4D4D4D'} textAlign={'center'}>
              {ecoData.periodoAmortizacion + ' ' + t('BASIC.LABEL_AÑOS')}
            </Typography>
            <Typography variant="body" textAlign={'center'}>
              {t('ECONOMIC_BALANCE.PROMPT_AMORTIZATION_TIME')}
            </Typography>
            <br />
          </FormControl>
        </Box>
      </Container>
    </>
  )
}
