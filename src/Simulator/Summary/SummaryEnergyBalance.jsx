import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Box, Grid } from '@mui/material'

// REACT Solidar Components
import GraphBoxAutoconsumo from '../EnergyBalance/GraphBoxAutoconsumo'
import CallSankey from '../EnergyBalance/SankeyFlow/CallSankey'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function SummaryEnergyBalance() {
  const { t } = useTranslation()
  const [yearlyData, setYearlyData] = useState({})

  useEffect(() => {
    setYearlyData({
      consumo: TCB.consumo.totalAnual,
      produccion: TCB.produccion.totalAnual,
      deficit: TCB.balance.deficitAnual,
      autoconsumo: TCB.balance.autoconsumo,
      excedente: TCB.balance.excedenteAnual,
      consumoDiurno: TCB.balance.consumoDiurno,
    })
  }, [])

  return (
    <>
      <Container>
        <Typography variant="h3" textAlign={'center'}>
          {t('SUMMARY.TITLE_ENERGY_BALANCE')}
        </Typography>
        <Typography variant="body">{t('SUMMARY.DESCRIPTION_ENERGY_BALANCE')}</Typography>

        <CallSankey yearlyData={yearlyData}></CallSankey>

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
          <Typography variant="h4" color={'#4D4D4D'} textAlign={'center'}>
            {UTIL.formatoValor(
              'porciento',
              (TCB.balance.autoconsumo / TCB.produccion.totalAnual) * 100,
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
              <Typography variant="h5">{t('Consumo.PROP.totalAnual')}</Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography variant="h5" textAlign={'right'}>
                {UTIL.formatoValor('energia', TCB.consumo.totalAnual)}
              </Typography>
            </Grid>

            <Grid item xs={7}>
              <Typography variant="h5">{t('Produccion.PROP.totalAnual')}</Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography variant="h5" textAlign={'right'}>
                {UTIL.formatoValor('energia', TCB.produccion.totalAnual)}
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
