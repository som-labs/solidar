import { useRef, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Box, Paper, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { EconomicContext } from '../../EconomicContext'
import { BasesContext } from '../../BasesContext'
import { SLDRInfoBox } from '../../../components/SLDRComponents'
import GraphBoxAutoconsumo from '../../EnergyBalance/GraphBoxAutoconsumo'
// import CallSankey from '../../EnergyBalance/SankeyFlow/CallSankey'
import GraphBoxSavings from '../../EconomicBalance/GraphBoxSavings'
// import SummaryEconomicBalance from '../SummaryEconomicBalance'
import Reports from '../Reports'
import MicroMap from '../../Location/MicroMap'
import Autoproduccion from './Autoproduccion'
import EnergyBalance from './EnergyBalance'
import EconomicBalance from './EconomicBalance'

// Solidar objects
import TCB from '../../classes/TCB'
import * as UTIL from '../../classes/Utiles'

export default function SummarySOMStep() {
  const { t } = useTranslation()
  const theme = useTheme()

  const contentRef = useRef(null)

  return (
    <>
      <Container ref={contentRef}>
        <Grid container rowSpacing={6}>
          <Grid item xs={12}>
            <Autoproduccion></Autoproduccion>
          </Grid>

          <Grid item xs={12}>
            <EnergyBalance></EnergyBalance>
          </Grid>

          <Grid item xs={12}>
            <EconomicBalance></EconomicBalance>
          </Grid>

          <Grid item xs={12}>
            <Reports ref={contentRef}></Reports>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: 4,
              }}
            >
              <Typography sx={theme.titles.level_1} textAlign={'center'}>
                {t('BASIC.LABEL_AVISO')}
              </Typography>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('SUMMARY.LABEL_DISCLAIMER_1'),
                }}
              />
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('SUMMARY.LABEL_DISCLAIMER_2'),
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
