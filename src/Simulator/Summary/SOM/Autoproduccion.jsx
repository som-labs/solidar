import { useRef, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Box, Paper, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { EconomicContext } from '../../EconomicContext'
import { EnergyContext } from '../../EnergyContext'
import { BasesContext } from '../../BasesContext'
import { SLDRInfoBox } from '../../../components/SLDRComponents'

// import CallSankey from '../../EnergyBalance/SankeyFlow/CallSankey'
import GraphBoxSavings from '../../EconomicBalance/GraphBoxSavings'
// import SummaryEconomicBalance from '../SummaryEconomicBalance'
import Reports from '../Reports'
import MicroMap from '../../Location/MicroMap'

// Solidar objects
import * as UTIL from '../../classes/Utiles'

export default function Autoproduccion() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { bases } = useContext(BasesContext)
  const { produccionGlobal } = useContext(EnergyContext)

  let areasEscogidas = 0
  let paneles = 0
  const produccionAnual = produccionGlobal.totalAnual
  const areasDisponibles = bases.length
  const potencia = bases.reduce((sum, tBase) => sum + tBase.instalacion.potenciaTotal, 0)

  for (let base of bases) {
    if (base.instalacion.paneles > 0) {
      areasEscogidas += 1
      paneles += base.instalacion.paneles
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        mt: '2rem',
        borderTop: '3px solid #96b633',
      }}
    >
      <SLDRInfoBox
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flex: '2',
          gap: '10px',
          alignContent: 'center',
          flexDirection: 'column',
          mt: '2rem',
        }}
      >
        <Typography sx={theme.titles.level_1} textAlign={'center'} marginTop={'1rem'}>
          {t('SUMMARY.TITLE_AUTOPRODUCCION').toUpperCase()}
        </Typography>
        <Typography variant="body">{t('SUMMARY.DESCRIPTION_AUTOPRODUCCION')}</Typography>
        <Typography
          variant="h5"
          color={theme.palette.text}
          textAlign={'center'}
          dangerouslySetInnerHTML={{
            __html:
              t('SUMMARY.LABEL_AREAS_ESCOGIDAS', {
                count: areasEscogidas,
              }) +
              t('SUMMARY.LABEL_AREAS_DISPONIBLES', {
                count: areasDisponibles,
              }),
          }}
        />
        <Typography
          variant="h5"
          color={theme.palette.text}
          textAlign={'center'}
          dangerouslySetInnerHTML={{
            __html: t('SUMMARY.LABEL_PANELES_SUGERIDOS', { count: paneles }),
          }}
        />
        <Typography
          variant="h5"
          color={theme.palette.text}
          textAlign={'center'}
          dangerouslySetInnerHTML={{
            __html: t('SUMMARY.LABEL_PRODUCCION', {
              produccion: UTIL.formatoValor('energia', produccionAnual),
            }),
          }}
        />
        <Typography
          variant="h5"
          color={theme.palette.text}
          textAlign={'center'}
          dangerouslySetInnerHTML={{
            __html: t('SUMMARY.LABEL_POTENCIA', {
              potencia: UTIL.formatoValor('potenciaTotal', potencia),
            }),
          }}
        />
      </SLDRInfoBox>

      <SLDRInfoBox sx={{ border: '0', display: 'flex', flex: '1' }}>
        <MicroMap></MicroMap>
      </SLDRInfoBox>
    </Box>
  )
}
