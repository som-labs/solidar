import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Box,
  Grid,
  Typography,
  Container,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { EconomicContext } from '../EconomicContext'
import { ConsumptionContext } from '../ConsumptionContext'
//React global components
import { SLDRInfoBox, SLDRCollapsibleCard } from '../../components/SLDRComponents'

// REACT Solidar Components
import ReduccionIBI from '../EconomicBalance/ReduccionIBI'
import Subvencion from '../EconomicBalance/Subvencion'
import AmortizationTime from '../EconomicBalance/AmortizationTime'
import YearSaving from '../EconomicBalance/YearSavings'
import MonthSaving from '../EconomicBalance/MonthSavings'
import FinanceSummary from '../EconomicBalance/FinanceSummary'

import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function UnitEconomicBalanceStep({ finca, onClose }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { zonasComunes } = useContext(ConsumptionContext)
  const { costeZCenFinca } = useContext(EconomicContext)

  return (
    <Container>
      <DialogTitle>
        {t('Balance económico de la finca ' + finca.nombreFinca + ' (' + finca.uso + ')')}
      </DialogTitle>
      <DialogContent>
        <Grid container rowSpacing={4}>
          <Grid item xs={12}>
            <Typography
              variant="body"
              textAlign={'center'}
              dangerouslySetInnerHTML={{
                __html: t('ECONOMIC_BALANCE.DESCRIPTION'),
              }}
            ></Typography>
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                width: '100%',
                gap: '15px',
              }}
            >
              <SLDRInfoBox sx={{ borderRight: '1px solid grey' }}>
                <ReduccionIBI></ReduccionIBI>
              </SLDRInfoBox>
              <SLDRInfoBox sx={{ borderRight: '1px solid grey' }}>
                <Subvencion></Subvencion>
              </SLDRInfoBox>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                gap: '15px',
              }}
            >
              <SLDRInfoBox sx={{ borderTop: '3px solid #96b633' }}>
                <Typography
                  variant="h4"
                  color={theme.palette.primary.main}
                  textAlign={'center'}
                >
                  Gasto propio <br />
                  {UTIL.formatoValor(
                    'precioInstalacion',
                    TCB.economico.precioInstalacionCorregido * finca.coefEnergia,
                  ) +
                    ' ' +
                    t('ECONOMIC_BALANCE.IVA_INCLUDED')}
                </Typography>
                <Typography
                  variant="h4"
                  color={theme.palette.primary.main}
                  textAlign={'center'}
                >
                  <br />
                  Gasto de zonas comunes
                  <br />
                  {UTIL.formatoValor(
                    'precioInstalacion',
                    zonasComunes.reduce(
                      (t, zc) => t + costeZCenFinca(finca, zc).global,
                      0,
                    ) * TCB.economico.precioInstalacionCorregido,
                  )}
                  <br />
                  Ahorro de zonas comunes
                  <br />
                  {UTIL.formatoValor(
                    'precioInstalacion',
                    zonasComunes.reduce(
                      (t, zc) =>
                        t + costeZCenFinca(finca, zc).local * zc.economico.ahorroAnual,
                      0,
                    ),
                  )}{' '}
                  anual
                </Typography>
              </SLDRInfoBox>

              <SLDRInfoBox sx={{ borderTop: '3px solid #96b633' }}>
                <YearSaving finca={finca}></YearSaving>
              </SLDRInfoBox>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <SLDRInfoBox sx={{ bgcolor: '#96b633AA' }}>
              <AmortizationTime finca={finca}></AmortizationTime>
            </SLDRInfoBox>
          </Grid>

          <Grid item xs={12}>
            <Typography sx={theme.titles.level_1} textAlign={'center'}>
              {t('ECONOMIC_BALANCE.TITLE_MONTH_SAVINGS')}
            </Typography>
            <MonthSaving finca={finca}></MonthSaving>
          </Grid>

          <Grid item xs={12}>
            <SLDRCollapsibleCard
              expanded={false}
              title={t('ECONOMIC_BALANCE.TITLE_FINANCE_SUMMARY')}
            >
              <SLDRInfoBox>
                <FinanceSummary finca={finca}></FinanceSummary>
              </SLDRInfoBox>
            </SLDRCollapsibleCard>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ mt: '1rem' }}>
        <Button
          variant="contained"
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 20, // Distance from bottom
            right: 20, // Distance from right
            zIndex: 1000, // Ensures it stays on top
            borderRadius: 3, // Makes it round
            width: 120,
            height: 56,
            minWidth: 'auto',
            boxShadow: 3, // Adds some shadow
          }}
          onClick={() => onClose()}
        >
          {t('BASIC.LABEL_CLOSE')}
        </Button>
      </DialogActions>
    </Container>
  )
}
