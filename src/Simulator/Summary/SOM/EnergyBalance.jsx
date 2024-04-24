import { useRef, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { EconomicContext } from '../../EconomicContext'
import { BasesContext } from '../../BasesContext'
import { SLDRInfoBox } from '../../../components/SLDRComponents'
import GraphBoxAutoconsumo from '../../EnergyBalance/GraphBoxAutoconsumo'
// import CallSankey from '../../EnergyBalance/SankeyFlow/CallSankey'

// Solidar objects
import TCB from '../../classes/TCB'
import * as UTIL from '../../classes/Utiles'

export default function EnergyBalance() {
  const { t } = useTranslation()
  const theme = useTheme()

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
    </SLDRInfoBox>
  )
}
