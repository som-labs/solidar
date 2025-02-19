import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Grid, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
import InfoIcon from '@mui/icons-material/Info'

//React global context
import { BasesContext } from '../BasesContext'
import { GlobalContext } from '../GlobalContext'
import { EnergyContext } from '../EnergyContext'
import { ConsumptionContext } from '../ConsumptionContext'

//React global components
import { useDialog } from '../../components/DialogProvider'
import { SLDRInfoBox, SLDRCollapsibleCard } from '../../components/SLDRComponents'

//REACT Local Components
import CallSankey from './SankeyFlow/CallSankey'
import InstallationSummary from './InstallationSummary'
import ConsumoGeneracion3D from './ConsumoGeneracion3D'
import EnergyFlow from './EnergyFlow'
import MonthThreeParts from './MonthThreeParts'
import MonthFiveParts from './MonthFiveParts'
import EnvironmentalImpact from './EnvironmentalImpact'
import HourlyEnergyBalance from './HourlyEnergyBalance'
import PieChart from './PieChart'
import HelpEnergyBalance from './HelpEnergyBalance'
import ValidateServerNameGrid from './ValidateServerNameGrid'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function EnergyBalanceStep() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [openDialog, closeDialog] = useDialog()

  //Local state
  const [dataReady, setDataReady] = useState(false)
  const [monthlyData, setMonthlyData] = useState()
  const [yearlyData, setYearlyData] = useState({})
  const [mes, setMes] = useState(t('ENERGY_BALANCE.VALUE_FULL_YEAR'))

  //Context variables
  const { bases } = useContext(BasesContext)
  const {
    newBases,
    setNewBases,
    newPrecios,
    newPanelActivo,
    newTiposConsumo,
    setNewTiposConsumo,
  } = useContext(GlobalContext)
  const {
    consumoGlobal,
    setConsumoGlobal,
    calculaResultados,
    produccionGlobal,
    balanceGlobal,
  } = useContext(EnergyContext)
  const { fincas, getConsumoTotal, tiposConsumo, zonasComunes } =
    useContext(ConsumptionContext)

  useEffect(() => {
    setMonthlyData({
      consumo: consumoGlobal.resumenMensual('suma'),
      produccion: produccionGlobal.resumenMensual('suma'),
      deficit: balanceGlobal.resumenMensual('deficit'),
      autoconsumo: balanceGlobal.resumenMensual('autoconsumo'),
      excedente: balanceGlobal.resumenMensual('excedente'),
    })

    setYearlyData({
      consumo: consumoGlobal.totalAnual,
      produccion: produccionGlobal.totalAnual,
      deficit: balanceGlobal.deficitAnual,
      autoconsumo: balanceGlobal.autoconsumo,
      excedente: balanceGlobal.excedenteAnual,
      consumoDiurno: balanceGlobal.consumoDiurno,
    })

    setDataReady(true)
  }, [bases, mes])

  function help(level) {
    openDialog({
      children: <HelpEnergyBalance level={level} onClose={() => closeDialog()} />,
    })
  }

  return (
    <Container>
      <Grid container rowSpacing={4}>
        {dataReady && (
          <>
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
                onClick={() => help(1)}
                size="small"
                style={{
                  color: theme.palette.infoIcon.main,
                  fontSize: 'inherit',
                  verticalAlign: 'text-center',
                  transform: 'scale(0.8)',
                  padding: 0,
                }}
              >
                <InfoIcon />
              </IconButton>
            </Grid>

            <Grid item xs={12}>
              <SLDRInfoBox>
                <CallSankey yearlyData={yearlyData}></CallSankey>
              </SLDRInfoBox>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('ENERGY_BALANCE.NOTE_DISCLAIMER_PRODUCCION'),
                }}
              />
              <IconButton
                onClick={() => help(2)}
                size="small"
                style={{
                  color: theme.palette.infoIcon.main,
                  fontSize: 'inherit',
                  verticalAlign: 'text-center',
                  transform: 'scale(0.8)',
                  padding: 0,
                }}
              >
                <InfoIcon />
              </IconButton>
            </Grid>

            <Grid item xs={12}>
              <SLDRInfoBox sx={{ alignItems: 'center' }}>
                <Grid item xs={6}>
                  <PieChart
                    labels={[
                      t('ENERGY_BALANCE.LABEL_AUTOCONSUMO'),
                      t('ENERGY_BALANCE.LABEL_ENERGIA_RED'),
                    ]}
                    values={[balanceGlobal.autoconsumo, balanceGlobal.deficitAnual]}
                    colors={[
                      theme.palette.balance.autoconsumo,
                      theme.palette.balance.deficit,
                    ]}
                    title={t('ENERGY_BALANCE.TITLE_GRAPH_DEMAND')}
                  ></PieChart>
                </Grid>
                <Grid item xs={6}>
                  <PieChart
                    labels={[
                      t('ENERGY_BALANCE.LABEL_AUTOCONSUMO'),
                      t('ENERGY_BALANCE.LABEL_VERTIDO_RED'),
                    ]}
                    values={[balanceGlobal.autoconsumo, balanceGlobal.excedenteAnual]}
                    colors={[
                      theme.palette.balance.autoconsumo,
                      theme.palette.balance.excedente,
                    ]}
                    title={t('ENERGY_BALANCE.TITLE_GRAPH_AUTOPRODUCIDA')}
                  ></PieChart>
                </Grid>
              </SLDRInfoBox>
            </Grid>

            <Grid item xs={12}>
              <Typography sx={theme.titles.level_1} textAlign={'center'}>
                {t('ENERGY_BALANCE.TITLE_GRAPH_MONTH_FIVE_PARTS')}
              </Typography>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('ENERGY_BALANCE.DESCRIPTION_GRAPH_MONTH_FIVE_PARTS'),
                }}
              />
              <SLDRInfoBox sx={{ mt: '1rem' }}>
                {dataReady && <MonthFiveParts monthlyData={monthlyData}></MonthFiveParts>}
              </SLDRInfoBox>
            </Grid>

            <Grid item xs={12}>
              <Typography sx={theme.titles.level_1} textAlign={'center'}>
                {t('ENERGY_BALANCE.TITLE_HOURLY_ENERGY_BALANCE')}
              </Typography>

              <SLDRInfoBox>
                <HourlyEnergyBalance report={false}></HourlyEnergyBalance>
              </SLDRInfoBox>
            </Grid>

            <Grid item xs={12}>
              <SLDRCollapsibleCard
                expanded={true}
                titleSX={theme.titles.level_1}
                title={t('ENERGY_BALANCE.TITLE_ENVIRONMENTAL_IMPACT')}
              >
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
              </SLDRCollapsibleCard>
            </Grid>

            <Grid item xs={12}>
              <SLDRCollapsibleCard
                expanded={false}
                title={t('ENERGY_BALANCE.FLOW_TITLE_OTHER_WAY')}
              >
                <SLDRInfoBox>
                  <EnergyFlow yearlyData={yearlyData}></EnergyFlow>
                </SLDRInfoBox>
              </SLDRCollapsibleCard>
            </Grid>

            {TCB.estiloActivo === 'CLARA' && (
              <Grid item xs={12}>
                <SLDRCollapsibleCard
                  expanded={false}
                  titleSX={theme.titles.level_1}
                  title={t('ENERGY_BALANCE.TITLE_GRAPH_MONTH_THREE_PARTS')}
                >
                  <SLDRInfoBox>
                    {dataReady && (
                      <MonthThreeParts monthlyData={monthlyData}></MonthThreeParts>
                    )}
                  </SLDRInfoBox>
                </SLDRCollapsibleCard>
              </Grid>
            )}

            <Grid item xs={12}>
              <SLDRCollapsibleCard
                expanded={false}
                titleSX={theme.titles.level_1}
                title={t('ENERGY_BALANCE.TITLE_GRAFICO_CONSUMOGENERACION3D')}
              >
                <SLDRInfoBox>
                  <ConsumoGeneracion3D></ConsumoGeneracion3D>
                </SLDRInfoBox>
              </SLDRCollapsibleCard>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  )
}
