import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

// REACT Solidar Components
import GraphBoxAutoconsumo from '../EnergyBalance/GraphBoxAutoconsumo'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function SummaryEnergyBalance() {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Container>
        <Typography variant="h3" textAlign={'center'}>
          {t('SUMMARY.TITLE_ENERGY_BALANCE')}
        </Typography>
        <Typography variant="body">{t('SUMMARY.DESCRIPTION_ENERGY_BALANCE')}</Typography>

        <GraphBoxAutoconsumo></GraphBoxAutoconsumo>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Typography variant="h4" color={'green'} textAlign={'center'}>
            {UTIL.formatoValor(
              'porciento',
              (TCB.balance.autoconsumo / TCB.produccion.pTotalAnual) * 100,
            )}
          </Typography>
          <Typography
            variant="body"
            textAlign={'center'}
            dangerouslySetInnerHTML={{
              __html: t('SUMMARY.LABEL_AUTOCONSUMO'),
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={7}>
              <Typography variant="h5">
                {t('ENERGY_BALANCE.LABEL_AUTOCONSUMO')}
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography variant="h5" textAlign={'right'}>
                {UTIL.formatoValor('energia', TCB.balance.autoconsumo)}
              </Typography>
            </Grid>

            <Grid item xs={7}>
              <Typography variant="h5">{t('Consumo.PROP.cTotalAnual')}</Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography variant="h5" textAlign={'right'}>
                {UTIL.formatoValor('energia', TCB.consumo.cTotalAnual)}
              </Typography>
            </Grid>

            <Grid item xs={7}>
              <Typography variant="h5">{t('Produccion.PROP.pTotalAnual')}</Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography variant="h5" textAlign={'right'}>
                {UTIL.formatoValor('energia', TCB.produccion.pTotalAnual)}
              </Typography>
            </Grid>

            <Grid item xs={7}>
              <Typography variant="h5">{t('Balance.PROP.excedenteAnual')}</Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography variant="h5" textAlign={'right'}>
                {UTIL.formatoValor('energia', TCB.balance.excedenteAnual)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  )
}
