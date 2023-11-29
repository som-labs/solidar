import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import GraphBoxSavings from './GraphBoxSavings'

import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function YearSaving() {
  const { t, i18n } = useTranslation()

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
          <Typography variant="h4">{t('ECONOMIC_BALANCE.TITLE_YEAR_SAVINGS')}</Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.DESCRIPTION_YEAR_SAVINGS', {
                porcientoAhorro: UTIL.formatoValor(
                  'porciento',
                  (TCB.economico.ahorroAnual / TCB.economico.gastoSinPlacasAnual) * 100,
                ),
              }),
            }}
          />

          <Typography variant="h5">
            {t('ECONOMIC_BALANCE.GRAPH_TITLE_YEAR_SAVINGS')}
          </Typography>
          <GraphBoxSavings></GraphBoxSavings>
          <br />
        </Box>
      </Container>
    </>
  )
}
