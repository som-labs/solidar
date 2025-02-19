import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { EconomicContext } from '../../EconomicContext'

import { SLDRInfoBox } from '../../../components/SLDRComponents'
import GraphBoxSavings from '../../EconomicBalance/GraphBoxSavings'
// import CallSankey from '../../EnergyBalance/SankeyFlow/CallSankey'

// Solidar objects
import * as UTIL from '../../classes/Utiles'

export default function EconomicBalance() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { economicoGlobal } = useContext(EconomicContext)

  return (
    <SLDRInfoBox
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        gap: '10px',
        alignContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Typography sx={theme.titles.level_1} textAlign={'center'} marginTop={'2rem'}>
        {t('SUMMARY.TITLE_ECONOMIC_BALANCE').toUpperCase()}
      </Typography>
      <Typography variant="body">{t('SUMMARY.DESCRIPTION_ECONOMIC_BALANCE')}</Typography>

      <Typography
        variant="h5"
        color={theme.palette.text}
        textAlign={'center'}
        dangerouslySetInnerHTML={{
          __html: t('SUMMARY.LABEL_COSTE', {
            coste: UTIL.formatoValor(
              'dinero',
              economicoGlobal.precioInstalacionCorregido,
            ),
          }),
        }}
      />
      <Typography
        variant="h5"
        color={theme.palette.text}
        textAlign={'center'}
        dangerouslySetInnerHTML={{
          __html: t('SUMMARY.LABEL_AMORTIZACION', {
            amortizacion: economicoGlobal.periodoAmortizacion,
          }),
        }}
      />

      <Typography
        variant="h5"
        color={theme.palette.text}
        textAlign={'center'}
        dangerouslySetInnerHTML={{
          __html: t('SUMMARY.LABEL_SUBVENCIONES', {
            subvenciones: UTIL.formatoValor(
              'dinero',
              parseFloat(
                ((economicoGlobal.valorSubvencionIBI *
                  economicoGlobal.porcientoSubvencionIBI) /
                  100) *
                  economicoGlobal.tiempoSubvencionIBI,
              ) + parseFloat(economicoGlobal.valorSubvencion),
            ),
          }),
        }}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexFlow: 'column',
          flexWrap: 'wrap',
          width: '60%',
          mb: '1rem',
        }}
      >
        <Typography variant="body" textAlign={'center'}>
          {t('Economico.LABEL_GASTO_AHORRO')}
        </Typography>
        <GraphBoxSavings></GraphBoxSavings>
      </Box>
    </SLDRInfoBox>
  )
}
