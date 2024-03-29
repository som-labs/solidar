import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Box,
  Typography,
  Container,
  MenuItem,
  TextField,
  Grid,
  IconButton,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'

//React global components
import { BasesContext } from '../BasesContext'
import { EconomicContext } from '../EconomicContext'
import { SLDRInfoBox, SLDRCollapsibleCard } from '../../components/SLDRComponents'

// REACT Solidar Components
import CallSankey from './SankeyFlow/CallSankey'
import InstallationSummary from './InstallationSummary'
import ConsumoGeneracion3D from './ConsumoGeneracion3D'
import EnergyFlow from './EnergyFlow'
import MonthThreeParts from './MonthThreeParts'
import MonthFiveParts from './MonthFiveParts'
import MonthEnergyBalance from './MonthEnergyBalance'
import EnvironmentalImpact from './EnvironmentalImpact'
import HourlyEnergyBalance from './HourlyEnergyBalance'
import PieCharts from './PieCharts'
import HelpEnergyBalance from './HelpEnergyBalance'

//React global components
import { useDialog } from '../../components/DialogProvider'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import calculaResultados from '../classes/calculaResultados'

export default function EnergyBalanceStep() {
  const { t } = useTranslation()
  const theme = useTheme()

  const [dataReady, setDataReady] = useState(false)
  const [monthlyData, setMonthlyData] = useState()
  const [yearlyData, setYearlyData] = useState({})
  const { bases, updateTCBBasesToState } = useContext(BasesContext)
  const { setEcoData } = useContext(EconomicContext)
  const [mes, setMes] = useState('')
  const [openDialog, closeDialog] = useDialog()
  // El proceso de PreparaEnergyBalance ejecutado como exit del wizard ha hecho cambios sobre las bases que se crearon en location por lo que se deben actualizar
  // El optimizador ha asignado la instalacion
  // El rendimiento ha podido cambiar la inclinacion y por lo tanto el area, la configuracion de paneles y la potenciaMaxima
  // Si se usaron angulos optimos tambien ha cambiado el acimut.
  useEffect(() => {
    console.log('USEEFFECT de ENERGYBALANCE sin condiciones')
    updateTCBBasesToState()

    //   setMonthlyData({
    //     consumo: TCB.consumo.resumenMensual('suma'),
    //     produccion: TCB.produccion.resumenMensual('suma'),
    //     deficit: TCB.balance.resumenMensual('deficit'),
    //     autoconsumo: TCB.balance.resumenMensual('autoconsumo'),
    //     excedente: TCB.balance.resumenMensual('excedente'),
    //   })
    //   setYearlyData({
    //     consumo: TCB.consumo.totalAnual,
    //     produccion: TCB.produccion.totalAnual,
    //     deficit: TCB.balance.deficitAnual,
    //     autoconsumo: TCB.balance.autoconsumo,
    //     excedente: TCB.balance.excedenteAnual,
    //     consumoDiurno: TCB.balance.consumoDiurno,
    //   })
    //   setDataReady(true)
  }, [])

  useEffect(() => {
    setMonthlyData({
      consumo: TCB.consumo.resumenMensual('suma'),
      produccion: TCB.produccion.resumenMensual('suma'),
      deficit: TCB.balance.resumenMensual('deficit'),
      autoconsumo: TCB.balance.resumenMensual('autoconsumo'),
      excedente: TCB.balance.resumenMensual('excedente'),
    })

    setYearlyData({
      consumo: TCB.consumo.totalAnual,
      produccion: TCB.produccion.totalAnual,
      deficit: TCB.balance.deficitAnual,
      autoconsumo: TCB.balance.autoconsumo,
      excedente: TCB.balance.excedenteAnual,
      consumoDiurno: TCB.balance.consumoDiurno,
    })

    setEcoData(TCB.economico)
    setDataReady(true)
  }, [bases, setEcoData])

  function help() {
    openDialog({
      children: <HelpEnergyBalance onClose={() => closeDialog()} />,
    })
  }

  return (
    <Container>
      <Grid container rowSpacing={4}>
        <Grid item xs={12}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ENERGY_BALANCE.DESCRIPTION'),
            }}
          />
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ENERGY_BALANCE.PROMPT'),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <SLDRInfoBox sx={{ mt: '1rem' }}>
            <InstallationSummary></InstallationSummary>
          </SLDRInfoBox>
        </Grid>

        <Grid item xs={12}>
          <Typography sx={theme.titles.level_1} textAlign={'center'}>
            {t('ENERGY_BALANCE.FLOW_TITLE')}
          </Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ENERGY_BALANCE.FLOW_DESCRIPTION'),
            }}
          />
          <IconButton
            onClick={() => help()}
            size="small"
            style={{
              fontSize: 'inherit',
              verticalAlign: 'text-center',
              transform: 'scale(0.8)',
              padding: 0,
            }}
          >
            <HelpIcon />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          <SLDRInfoBox>
            <CallSankey yearlyData={yearlyData}></CallSankey>
          </SLDRInfoBox>
        </Grid>
        <Grid item xs={12}>
          <SLDRCollapsibleCard expanded={false} title={t('OTRA FORMA DE VERLO')}>
            <SLDRInfoBox>
              <EnergyFlow yearlyData={yearlyData}></EnergyFlow>
            </SLDRInfoBox>
          </SLDRCollapsibleCard>
        </Grid>
        <Grid item xs={12}>
          <SLDRCollapsibleCard expanded={true} title={t('BASIC.LABEL_AVISO')}>
            <Typography
              variant="body"
              gutterBottom
              dangerouslySetInnerHTML={{
                __html: t('ENERGY_BALANCE.TITLE_DISCLAIMER_PRODUCCION'),
              }}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 8,
                mt: '1rem',
              }}
            >
              <Box sx={{ display: 'flex', flex: 1 }}>
                <Typography
                  variant="body"
                  dangerouslySetInnerHTML={{
                    __html: t('ENERGY_BALANCE.DESCRIPTION_DISCLAIMER_PRODUCCION_SI'),
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flex: 1 }}>
                <Typography
                  variant="body"
                  dangerouslySetInnerHTML={{
                    __html: t('ENERGY_BALANCE.DESCRIPTION_DISCLAIMER_PRODUCCION_NO'),
                  }}
                />
              </Box>
            </Box>
          </SLDRCollapsibleCard>
        </Grid>
        {dataReady && (
          <Grid item xs={12}>
            <SLDRInfoBox sx={{ alignItems: 'center' }}>
              <PieCharts yearlyData={yearlyData}></PieCharts>
            </SLDRInfoBox>
          </Grid>
        )}
        <Grid item xs={12}>
          <SLDRInfoBox sx={{ alignItems: 'center' }}>
            <Typography sx={theme.titles.level_1} textAlign={'center'}>
              {t('ENERGY_BALANCE.TITLE_HOURLY_ENERGY_BALANCE')}
            </Typography>
            <TextField
              sx={{ width: 200, height: 50, mt: '1rem', mb: '1rem', ml: '1rem' }}
              select
              value={mes}
              defaultValue={-1}
              label={t('BASIC.LABEL_MES')}
              onChange={(event) => setMes(event.target.value)}
            >
              <MenuItem key={-1} value={t('ENERGY_BALANCE.VALUE_FULL_YEAR')}>
                {t('ENERGY_BALANCE.VALUE_FULL_YEAR')}
              </MenuItem>
              {UTIL.nombreMes.map((nombreMes, index) => (
                <MenuItem key={index} value={index}>
                  {t(nombreMes)}
                </MenuItem>
              ))}
            </TextField>
            <HourlyEnergyBalance mes={mes}></HourlyEnergyBalance>
          </SLDRInfoBox>
        </Grid>
        {TCB.estiloActivo === 'CLARA' && (
          <Grid item xs={12}>
            <SLDRInfoBox>
              <Typography variant="h4" textAlign={'center'}>
                {t('ENERGY_BALANCE.TITLE_MONTH_ENERGY_BALANCE')}
              </Typography>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('ENERGY_BALANCE.DESCRIPTION_MONTH_ENERGY_BALANCE'),
                }}
              />

              {dataReady && (
                <MonthEnergyBalance monthlyData={monthlyData}></MonthEnergyBalance>
              )}
            </SLDRInfoBox>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography sx={theme.titles.level_1} textAlign={'center'}>
            {t('ENERGY_BALANCE.TITLE_GRAPH_MONTH_THREE_PARTS')}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <SLDRInfoBox>
            {dataReady && <MonthFiveParts monthlyData={monthlyData}></MonthFiveParts>}
          </SLDRInfoBox>
        </Grid>
        {TCB.estiloActivo === 'CLARA' && (
          <Grid item xs={12}>
            <SLDRInfoBox>
              {dataReady && <MonthThreeParts monthlyData={monthlyData}></MonthThreeParts>}
            </SLDRInfoBox>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography sx={theme.titles.level_1} textAlign={'center'}>
            {t('ENERGY_BALANCE.TITLE_ENVIRONMENTAL_IMPACT')}
          </Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ENERGY_BALANCE.DESCRIPTION_ENVIRONMENTAL_IMPACT'),
            }}
          />
          <Grid item xs={12}>
            <SLDRInfoBox sx={{ mt: '1rem' }}>
              <EnvironmentalImpact></EnvironmentalImpact>
            </SLDRInfoBox>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <SLDRInfoBox>
            <ConsumoGeneracion3D></ConsumoGeneracion3D>
          </SLDRInfoBox>
        </Grid>
      </Grid>
    </Container>
  )
}
