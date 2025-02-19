import { useRef, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Box, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { EconomicContext } from '../../EconomicContext'
import { BasesContext } from '../../BasesContext'
import { EnergyContext } from '../../EnergyContext'
import { SLDRInfoBox } from '../../../components/SLDRComponents'
import CallSankey from '../../EnergyBalance/SankeyFlow/CallSankey'

// import SummaryEconomicBalance from '../SummaryEconomicBalance'
import Reports from '../Reports'
import Autoproduccion from './Autoproduccion'
import EnergyBalance from './EnergyBalance'
import EconomicBalance from './EconomicBalance'

export default function SummarySOMStep() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [yearlyData, setYearlyData] = useState({})
  const contentRef = useRef(null)
  const { consumoGlobal, produccionGlobal, balanceGlobal } = useContext(EnergyContext)

  useEffect(() => {
    setYearlyData({
      consumo: consumoGlobal.totalAnual,
      produccion: produccionGlobal.totalAnual,
      deficit: balanceGlobal.deficitAnual,
      autoconsumo: balanceGlobal.autoconsumo,
      excedente: balanceGlobal.excedenteAnual,
      consumoDiurno: balanceGlobal.consumoDiurno,
    })
  }, [])

  return (
    <Container ref={contentRef}>
      <Grid container rowSpacing={6}>
        <Grid item xs={12}>
          <Autoproduccion></Autoproduccion>
        </Grid>

        <Grid item xs={12}>
          <EnergyBalance></EnergyBalance>
        </Grid>

        <Grid item xs={12}>
          <SLDRInfoBox>
            <CallSankey yearlyData={yearlyData}></CallSankey>
          </SLDRInfoBox>
        </Grid>

        <Grid item xs={12}>
          <EconomicBalance></EconomicBalance>
        </Grid>

        <Grid item xs={12}>
          <Reports></Reports>
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
  )
}
