import { useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { EconomicContext } from '../../EconomicContext'
import { BasesContext } from '../../BasesContext'
import { EnergyContext } from '../../EnergyContext'
import { SLDRInfoBox } from '../../../components/SLDRComponents'
import GraphBoxAutoconsumo from './GraphBoxAutoconsumo'

// Solidar objects
import * as UTIL from '../../classes/Utiles'

export default function EnergyBalance() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { produccionGlobal, balanceGlobal, consumoGlobal } = useContext(EnergyContext)
  const [yearlyData, setYearlyData] = useState({})

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
        {t('SUMMARY.TITLE_ENERGY_BALANCE').toUpperCase()}
      </Typography>

      <Typography variant="body">{t('SUMMARY.DESCRIPTION_ENERGY_BALANCE')}</Typography>
      <Box sx={{ width: '60%' }}>
        <GraphBoxAutoconsumo></GraphBoxAutoconsumo>
      </Box>
      {/* <SLDRInfoBox>
                    <Grid item xs={12}>
                    <CallSankey yearlyData={yearlyData}></CallSankey> 
                    </Grid>
                  </SLDRInfoBox>*/}

      <Typography variant="h4" color={theme.palette.text} textAlign={'center'}>
        {UTIL.formatoValor(
          'porciento',
          (balanceGlobal.autoconsumo / produccionGlobal.totalAnual) * 100,
        )}
      </Typography>
      <Typography
        variant="body"
        textAlign={'center'}
        dangerouslySetInnerHTML={{
          __html: t('SUMMARY.LABEL_AUTOCONSUMO'),
        }}
      />
    </SLDRInfoBox>
  )
}
