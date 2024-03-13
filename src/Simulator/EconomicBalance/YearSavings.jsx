import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import GraphBoxSavings from './GraphBoxSavings'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'

// Solidar objects
import * as UTIL from '../classes/Utiles'

export default function YearSaving() {
  const { t } = useTranslation()
  const { ecoData } = useContext(EconomicContext)

  return (
    <>
      <Container>
        <Typography variant="h4" textAlign={'center'}>
          {t('ECONOMIC_BALANCE.TITLE_YEAR_SAVINGS')}
        </Typography>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('ECONOMIC_BALANCE.DESCRIPTION_YEAR_SAVINGS', {
              porcientoAhorro: UTIL.formatoValor(
                'porciento',
                (ecoData.ahorroAnual / ecoData.gastoSinPlacasAnual) * 100,
              ),
            }),
          }}
        />
        <GraphBoxSavings></GraphBoxSavings>
      </Container>
    </>
  )
}
