import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

// REACT Solidar Components
import EconomicContext from '../EconomicBalance/EconomicContext'
import GraphBoxSavings from '../EconomicBalance/GraphBoxSavings'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function SummaryEconomicBalance() {
  const { t, i18n } = useTranslation()
  const { IBI, valorSubvencionEU, precioInstalacionCorregido, periodoAmortizacion } =
    useContext(EconomicContext)

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
                {UTIL.formatoValor('dinero', precioInstalacionCorregido)}
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
                {periodoAmortizacion}
              </Typography>
              <Typography variant="body" textAlign={'center'}>
                {t('SUMMARY.LABEL_AMORTIZACION')}
              </Typography>
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
                  parseFloat(IBI.valorSubvencionIBI) + parseFloat(valorSubvencionEU),
                )}
              </Typography>
              <Typography
                variant="body"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html: t('SUMMARY.LABEL_SUBVENCIONES'),
                }}
              />
            </Box>
          </Box>
          <br />
          <br />
          {/* <Box
            sx={{
              mr: '0.3rem',
              display: 'flex',
              flexWrap: 'wrap',
              boxShadow: 2,
              flex: 1,
              border: 2,
              borderColor: 'primary.light',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              id="B1"
              sx={{
                flex: 1,
                display: 'flex',
                flexFlow: 'column',
              }}
            >
              <Box
                id="B11"
                sx={{
                  height: 200,
                  backgroundColor: '#FFB266',
                  mr: '0.3rem',
                  display: 'flex',
                }}
              ></Box>
              <Box
                id="B12"
                sx={{
                  mr: '0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body" textAlign={'center'}>
                  {t('Economico.LABEL_gastoSinPlacasAnual')}
                </Typography>
              </Box>
              <Box
                id="B13"
                sx={{
                  mr: '0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h5" textAlign={'center'}>
                  {UTIL.formatoValor('dinero', TCB.economico.gastoSinPlacasAnual)}
                </Typography>
              </Box>
            </Box>
            <Box
              id="B2"
              sx={{
                flex: 1,
              }}
            >
              <Box
                id="B21"
                sx={{
                  height: parseInt(
                    (200 / TCB.economico.gastoSinPlacasAnual) * TCB.economico.ahorroAnual,
                  ),
                  mr: '0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0)',
                  flexFlow: 'column',
                  border: '2px dashed grey',
                }}
              >
                <Typography variant="body" textAlign={'center'}>
                  {'ahorro anual'}
                </Typography>
                <Typography variant="h5" textAlign={'center'}>
                  {UTIL.formatoValor('dinero', TCB.economico.ahorroAnual)}
                </Typography>
                <Typography variant="body" textAlign={'center'}>
                  {UTIL.formatoValor(
                    'porciento',
                    (TCB.economico.ahorroAnual / TCB.economico.gastoSinPlacasAnual) * 100,
                  )}
                </Typography>
              </Box>
              <Box
                id="B22"
                sx={{
                  height: parseInt(
                    (200 / TCB.economico.gastoSinPlacasAnual) *
                      TCB.economico.gastoConPlacasAnual,
                  ),
                  mr: '0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FFB266',
                }}
              ></Box>
              <Box
                id="B23"
                sx={{
                  mr: '0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body" textAlign={'center'}>
                  {t('Economico.LABEL_gastoConPlacasAnual')}
                </Typography>
              </Box>
              <Box
                id="B24"
                sx={{
                  mr: '0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h5" textAlign={'center'}>
                  {UTIL.formatoValor('dinero', TCB.economico.gastoConPlacasAnual)}
                </Typography>
              </Box>
            </Box>
            <Box
              id="B3"
              sx={{
                flex: 1,
              }}
            >
              <Box
                id="B31"
                sx={{
                  height: parseInt(
                    (200 / TCB.economico.gastoSinPlacasAnual) *
                      (TCB.economico.gastoSinPlacasAnual -
                        UTIL.suma(TCB.economico.perdidaMes)),
                  ),
                  mr: '0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0)',
                }}
              ></Box>
              <Box
                id="B32"
                sx={{
                  height: parseInt(
                    (200 / TCB.economico.gastoSinPlacasAnual) *
                      UTIL.suma(TCB.economico.perdidaMes),
                  ),
                  mr: '0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'grey',
                }}
              ></Box>
              <Box
                id="B33"
                sx={{
                  mr: '0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body" textAlign={'center'}>
                  {t('Economico.LABEL_noCompensadoAnual')}
                </Typography>
              </Box>
              <Box
                id="B34"
                sx={{
                  mr: '0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h5" textAlign={'right'}>
                  {UTIL.formatoValor('dinero', UTIL.suma(TCB.economico.perdidaMes))}
                </Typography>
              </Box>
            </Box>
          </Box> */}
          <GraphBoxSavings></GraphBoxSavings>
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
                <Typography variant="h5">
                  {t('Economico.LABEL_gastoConPlacasAnual')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" textAlign={'right'}>
                  {UTIL.formatoValor('dinero', TCB.economico.gastoConPlacasAnual)}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h5">{t('Economico.LABEL_ahorroAnual')}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" textAlign={'right'}>
                  {UTIL.formatoValor('dinero', TCB.economico.ahorroAnual)}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h5">
                  {t('Economico.LABEL_noCompensadoAnual')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" textAlign={'right'}>
                  {UTIL.formatoValor('dinero', UTIL.suma(TCB.economico.perdidaMes))}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h5">
                  {t('Economico.LABEL_valorSubvencionEU')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" textAlign={'right'}>
                  {UTIL.formatoValor('dinero', TCB.economico.valorSubvencionEU)}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h5">
                  {t('Economico.LABEL_valorSubvencionIBI')}
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
