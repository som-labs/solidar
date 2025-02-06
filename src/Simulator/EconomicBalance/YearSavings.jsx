import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import GraphBoxSavings from './GraphBoxSavings'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'

// Solidar objects
import * as UTIL from '../classes/Utiles'

export default function YearSaving({ finca }) {
  const { t } = useTranslation()
  const theme = useTheme()

  const { ecoData } = useContext(EconomicContext)
  const localEcoData = finca ? finca.economico : ecoData

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
            {t('ECONOMIC_BALANCE.TITLE_YEAR_SAVINGS')}
          </Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.DESCRIPTION_YEAR_SAVINGS', {
                porcientoAhorro: UTIL.formatoValor(
                  'porciento',
                  (localEcoData.ahorroAnual / localEcoData.gastoSinPlacasAnual) * 100,
                ),
              }),
            }}
          />
          <GraphBoxSavings finca={finca}></GraphBoxSavings>
        </Box>
      </Container>
    </>
  )
}
