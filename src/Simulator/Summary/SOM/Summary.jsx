import { useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Box, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { SLDRInfoBox } from '../../../components/SLDRComponents'
import CallSankey from '../../EnergyBalance/SankeyFlow/CallSankey'

// import SummaryEconomicBalance from '../SummaryEconomicBalance'
import Reports from '../Reports'
import Autoproduccion from './Autoproduccion'
import EnergyBalance from './EnergyBalance'
import EconomicBalance from './EconomicBalance'

import TCB from '../../classes/TCB'

export default function SummarySOMStep() {
  const { t } = useTranslation()
  const theme = useTheme()
  const contentRef = useRef(null)

  const yearlyData = useMemo(()=>({
      consumo: TCB.consumo.totalAnual,
      produccion: TCB.produccion.totalAnual,
      deficit: TCB.balance.deficitAnual,
      autoconsumo: TCB.balance.autoconsumo,
      excedente: TCB.balance.excedenteAnual,
      consumoDiurno: TCB.balance.consumoDiurno,
      perdidas: TCB.balance.perdidaAnual,
      descargas: TCB.balance.descargaAnual,
      cargas: TCB.balance.cargasAnuales,
      descarga_diurna: TCB.balance.descarga_diurna,
      descarga_nocturna: TCB.balance.descarga_nocturna,
      deficit_diurno: TCB.balance.deficit_diurno,
      deficit_nocturno: TCB.balance.deficit_nocturno,
    
  }), [])

  return (
    <Container ref={contentRef}>
      <Grid container rowSpacing={4}>
        <Grid item xs={12}>
          <Autoproduccion></Autoproduccion>
        </Grid>

        <Grid item xs={12}>
          <EnergyBalance></EnergyBalance>
        </Grid>

        <Grid item xs={12}>
          <SLDRInfoBox>
            {yearlyData.consumo !== undefined && (
              <CallSankey yearlyData={yearlyData}></CallSankey>
            )}
          </SLDRInfoBox>
        </Grid>

        <Grid item xs={12}>
          <EconomicBalance></EconomicBalance>
        </Grid>

        <Grid item xs={12}>
          <Reports></Reports>
        </Grid>

        {/* BOX Titulo Proximos pasos */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,

            }}>
            <Typography variant="h6" sx={{...theme.titles.level_1, textAlign: 'center', textTransform: 'uppercase' }}>
              <strong>{t('REPORT.PROPERESPASES_TITLE')}</strong>
            </Typography>
            <Box>
              <Typography 
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('REPORT.ADVISE'),
                }}/>
            </Box>
          </Box>
        </Grid>

        {/* Que ofrecemos a traves de SOM ENERGIA */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}>
              <Typography variant="h6" sx={{...theme.titles.level_1, textAlign: 'center', textTransform: 'uppercase' }}>
                <strong>{t('REPORT.PROPERESPASES_DESCRIPTION')}</strong>
              </Typography>
          
              <Box sx={{ display: 'flex'}}>
                <Typography
                  dangerouslySetInnerHTML={{
                    __html: t('REPORT.PROPERESPASES_TEXT'),
                  }}
                />
              </Box>
            </Box>
          
        </Grid>

        {/* AVISO DISCLAIMER*/}
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
  
            }}
          >
              <Typography variant="h6" sx={{...theme.titles.level_1, textAlign: 'center', textTransform: 'uppercase' }}>
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
