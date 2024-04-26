import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Grid, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
import InfoIcon from '@mui/icons-material/Info'

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
import PieChart from './PieChart'
import HelpEnergyBalance from './HelpEnergyBalance'
import ValidateServerNameGrid from './ValidateServerNameGrid'

//React global components
import { useDialog } from '../../components/DialogProvider'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function EnergyBalanceStep() {
  const { t } = useTranslation()
  const theme = useTheme()

  const [dataReady, setDataReady] = useState(false)
  const [monthlyData, setMonthlyData] = useState()
  const [yearlyData, setYearlyData] = useState({})
  const { bases, updateTCBBasesToState } = useContext(BasesContext)
  const { setEcoData } = useContext(EconomicContext)
  const [mes, setMes] = useState(t('ENERGY_BALANCE.VALUE_FULL_YEAR'))
  const [openDialog, closeDialog] = useDialog()

  // El proceso de PreparaEnergyBalance ejecutado como exit del wizard ha hecho cambios sobre las bases que se crearon en location por lo que se deben actualizar
  // El optimizador ha asignado la instalacion
  // El rendimiento ha podido cambiar la inclinacion y por lo tanto el area, la configuracion de paneles y la potenciaMaxima
  // Si se usaron angulos optimos tambien ha cambiado el acimut.
  useEffect(() => {
    updateTCBBasesToState()
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
  }, [bases, setEcoData, mes])

  function help(level) {
    openDialog({
      children: <HelpEnergyBalance level={level} onClose={() => closeDialog()} />,
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
          {/* <SLDRInfoBox sx={{ mt: '1rem' }}> */}
          {/* <ValidateServerNameGrid></ValidateServerNameGrid> */}
          <InstallationSummary></InstallationSummary>
          {/* </SLDRInfoBox> */}
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

        {dataReady && (
          <Grid item xs={12}>
            <SLDRInfoBox sx={{ alignItems: 'center' }}>
              <Grid item xs={6}>
                <Typography variant={'h6'} sx={{ textAlign: 'center', mt: '1rem' }}>
                  {t('ENERGY_BALANCE.TITLE_GRAPH_DEMAND')}
                </Typography>
                <PieChart
                  labels={[
                    t('ENERGY_BALANCE.LABEL_AUTOCONSUMO'),
                    t('ENERGY_BALANCE.LABEL_ENERGIA_RED'),
                  ]}
                  values={[TCB.balance.autoconsumo, TCB.balance.deficitAnual]}
                  colors={[
                    theme.palette.balance.autoconsumo,
                    theme.palette.balance.deficit,
                  ]}
                ></PieChart>
              </Grid>
              <Grid item xs={6}>
                <Typography variant={'h6'} sx={{ textAlign: 'center', mt: '1rem' }}>
                  {t('ENERGY_BALANCE.TITLE_GRAPH_AUTOPRODUCIDA')}
                </Typography>
                <PieChart
                  labels={[
                    t('ENERGY_BALANCE.LABEL_AUTOCONSUMO'),
                    t('ENERGY_BALANCE.LABEL_VERTIDO_RED'),
                  ]}
                  values={[TCB.balance.autoconsumo, TCB.balance.excedenteAnual]}
                  colors={[
                    theme.palette.balance.autoconsumo,
                    theme.palette.balance.excedente,
                  ]}
                ></PieChart>
              </Grid>
              {/* <PieCharts yearlyData={yearlyData}></PieCharts> */}
            </SLDRInfoBox>
          </Grid>
        )}

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
            <SLDRInfoBox>
              {dataReady && <MonthThreeParts monthlyData={monthlyData}></MonthThreeParts>}
            </SLDRInfoBox>
          </Grid>
        )}

        <Grid item xs={12}>
          <SLDRCollapsibleCard
            expanded={false}
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
            titleSX={theme.titles.level_1}
            title={t('ENERGY_BALANCE.TITLE_GRAFICO_CONSUMOGENERACION3D')}
          >
            <SLDRInfoBox>
              <ConsumoGeneracion3D></ConsumoGeneracion3D>
            </SLDRInfoBox>
          </SLDRCollapsibleCard>
        </Grid>
      </Grid>
    </Container>
  )
}
