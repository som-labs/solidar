import React from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function SummaryEnergyBalance() {
  const { t, i18n } = useTranslation()

  let gapConsumo
  let gapProduccion
  let heightGap
  let coef

  if (TCB.consumo.cTotalAnual > TCB.produccion.pTotalAnual) {
    gapConsumo = false
    gapProduccion = true
    coef = 200 / TCB.consumo.cTotalAnual
    heightGap = (TCB.consumo.cTotalAnual - TCB.produccion.pTotalAnual) * coef
  } else {
    gapConsumo = true
    gapProduccion = false
    coef = 200 / TCB.produccion.pTotalAnual
    heightGap = (TCB.produccion.pTotalAnual - TCB.consumo.cTotalAnual) * coef
  }

  const heightAutoconsumo = parseInt(TCB.balance.autoconsumo * coef)
  const heightConsumo = parseInt(
    (TCB.consumo.cTotalAnual - TCB.balance.autoconsumo) * coef,
  )
  const heightProduccion = parseInt(
    (TCB.produccion.pTotalAnual - TCB.balance.autoconsumo) * coef,
  )

  return (
    <>
      <Container>
        <Typography variant="h3" textAlign={'center'}>
          {t('SUMMARY.TITLE_ENERGY_BALANCE')}
        </Typography>
        <Typography variant="body">{t('SUMMARY.DESCRIPTION_ENERGY_BALANCE')}</Typography>

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
          id="F"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            boxShadow: 2,
            flex: 1,
            border: 2,
            borderColor: 'primary.light',
            justifyContent: 'center',
            allignItems: 'center',
            flexDirection: 'column',
            mb: 3,
          }}
        >
          <Box
            id="F1"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              boxShadow: 2,
              flex: 1,
              border: 2,
              borderColor: 'primary.light',
              justifyContent: 'center',
              allignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <Box
              id="F1C1"
              sx={{
                flex: 1,
                display: 'flex',
                flexFlow: 'column',
              }}
            >
              {gapConsumo && (
                <>
                  <Box
                    id="F1C1G"
                    sx={{
                      height: heightGap,
                      backgroundColor: 'rgba(0,0,0,0)',
                      display: 'flex',
                    }}
                  ></Box>
                </>
              )}

              <Box
                id="F1C1C"
                sx={{
                  height: heightConsumo,
                  backgroundColor: '#FFB266',
                  display: 'flex',
                }}
              ></Box>
            </Box>
            <Box
              id="F1C2"
              sx={{
                flex: 1,
                display: 'flex',
                flexFlow: 'column',
              }}
            >
              {gapProduccion && (
                <>
                  <Box
                    id="F1C2G"
                    sx={{
                      height: heightGap,
                      backgroundColor: 'rgb(0,0,0,0)',
                      display: 'flex',
                    }}
                  ></Box>
                </>
              )}
              <Box
                id="F1C2P"
                sx={{
                  height: heightProduccion,
                  backgroundColor: '#33FF33',
                  display: 'flex',
                }}
              ></Box>
            </Box>
          </Box>

          <Box
            id="F2"
            sx={{
              display: 'flex',
              border: '3px dashed green',
              justifyContent: 'center',
              allignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <Box
              id="F2C1"
              sx={{
                height: heightAutoconsumo,
                backgroundColor: '#FFFF66',
                display: 'flex',
                verticalAlign: 'center',
                justifyContent: 'center',
                allignItems: 'center',
                flex: 1,
              }}
            >
              <Typography variant="h5" textAlign={'center'}>
                {t('ENERGY_BALANCE.LABEL_AUTOCONSUMO')}
              </Typography>
            </Box>
            <Box
              id="F2C2"
              sx={{
                height: heightAutoconsumo,
                backgroundColor: '#FFFF66',
                display: 'flex',
                flex: 1,
              }}
            >
              <Typography variant="h5" textAlign={'right'}>
                {UTIL.formatoValor('energia', TCB.balance.autoconsumo)}
              </Typography>
            </Box>
          </Box>
          <Box
            id="F3"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              allignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <Box
              id="F3C1"
              sx={{
                mr: '0.3rem',
                display: 'flex',
                allignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <Typography variant="body" textAlign={'center'}>
                {t('Consumo.LABEL_cTotalAnual')}
              </Typography>
            </Box>
            <Box
              id="F3C2"
              sx={{
                display: 'flex',
                allignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <Typography variant="body" textAlign={'center'}>
                {t('Produccion.LABEL_pTotalAnual')}
              </Typography>
            </Box>
          </Box>
          <Box
            id="F4"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              allignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <Box
              id="F4C1"
              sx={{
                display: 'flex',
                allignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <Typography variant="h5" textAlign={'center'}>
                {UTIL.formatoValor('energia', TCB.consumo.cTotalAnual)}
              </Typography>
            </Box>
            <Box
              id="F4C1"
              sx={{
                mr: '0.3rem',
                display: 'flex',
                allignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <Typography variant="h5" textAlign={'center'}>
                {UTIL.formatoValor('energia', TCB.produccion.pTotalAnual)}
              </Typography>
            </Box>
          </Box>
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
              <Typography variant="h5">{t('Consumo.LABEL_cTotalAnual')}</Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography variant="h5" textAlign={'right'}>
                {UTIL.formatoValor('energia', TCB.consumo.cTotalAnual)}
              </Typography>
            </Grid>

            <Grid item xs={7}>
              <Typography variant="h5">{t('Produccion.LABEL_pTotalAnual')}</Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography variant="h5" textAlign={'right'}>
                {UTIL.formatoValor('energia', TCB.produccion.pTotalAnual)}
              </Typography>
            </Grid>

            <Grid item xs={7}>
              <Typography variant="h5">{t('Balance.LABEL_excedenteAnual')}</Typography>
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
