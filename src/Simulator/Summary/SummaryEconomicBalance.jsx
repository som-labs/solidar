import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'
import GraphBoxSavings from '../EconomicBalance/GraphBoxSavings'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function SummaryEconomicBalance() {
  const { t } = useTranslation()
  const { IBI, valorSubvencion, ecoData } = useContext(EconomicContext)

  return (
    <>
      <Container>
        <Typography variant="h3" textAlign={'center'}>
          {t('SUMMARY.TITLE_ECONOMIC_BALANCE')}
        </Typography>
        <Typography variant="body">
          {t('SUMMARY.DESCRIPTION_ECONOMIC_BALANCE')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              mb: '1rem',
              flexWrap: 'wrap',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                width: '50%',
                //boxShadow: 2,
                //border: 2,
                // borderColor: 'primary.light',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="h4" color={'green'}>
                {UTIL.formatoValor('dinero', ecoData.precioInstalacionCorregido)}
              </Typography>
              <Typography
                variant="body"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html: t('SUMMARY.LABEL_COSTE_INSTALACION'),
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                width: '50%',
                //boxShadow: 2,
                //border: 2,
                borderColor: 'green',
                justifyContent: 'center',
                alignItems: 'center',
                borderLeft: '3px dashed green',
                borderRight: '3px dashed green',
              }}
            >
              <Typography variant="h4" color={'green'}>
                {ecoData.periodoAmortizacion}
              </Typography>
              <Typography
                variant="body"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html: t('SUMMARY.LABEL_AMORTIZACION', {
                    amortizacion: '',
                  }),
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                width: '50%',
                //boxShadow: 2,
                //border: 2,
                // borderColor: 'primary.light',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="h4" color={'green'}>
                {UTIL.formatoValor(
                  'dinero',
                  parseFloat(IBI.valorSubvencionIBI) + parseFloat(valorSubvencion),
                )}
              </Typography>
              <Typography
                variant="body"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html: t('SUMMARY.LABEL_SUBVENCIONES', { subvenciones: '' }),
                }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexFlow: 'column',
              flexWrap: 'wrap',
              width: '100%',
              mb: '1rem',
            }}
          >
            <Typography variant="body" textAlign={'center'}>
              {t('Economico.LABEL_GASTO_AHORRO')}
            </Typography>
            <GraphBoxSavings></GraphBoxSavings>
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
              <Grid item xs={8}>
                <Typography variant="h6">
                  {t('Economico.PROP.gastoConPlacasAnual')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" textAlign={'right'}>
                  {UTIL.formatoValor('dinero', TCB.economico.gastoConPlacasAnual)}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h5">{t('Economico.PROP.ahorroAnual')}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" textAlign={'right'}>
                  {UTIL.formatoValor('dinero', TCB.economico.ahorroAnual)}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h5">
                  {t('Economico.PROP.noCompensadoAnual')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" textAlign={'right'}>
                  {UTIL.formatoValor('dinero', UTIL.suma(TCB.economico.perdidaMes))}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h5">
                  {t('Economico.PROP.valorSubvencion')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" textAlign={'right'}>
                  {UTIL.formatoValor('dinero', TCB.economico.valorSubvencion)}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h5">
                  {t('Economico.PROP.valorSubvencionIBI')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" textAlign={'right'}>
                  {UTIL.formatoValor('dinero', TCB.economico.valorSubvencionIBI)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  )
}
