import { useRef, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Container, Box, Paper, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'
import { BasesContext } from '../BasesContext'
import { SLDRInfoBox } from '../../components/SLDRComponents'
import GraphBoxAutoconsumo from '../EnergyBalance/GraphBoxAutoconsumo'
import CallSankey from '../EnergyBalance/SankeyFlow/CallSankey'
import GraphBoxSavings from '../EconomicBalance/GraphBoxSavings'
import SummaryEconomicBalance from './SummaryEconomicBalance'
import Reports from './Reports'
import MicroMap from '../Location/MicroMap'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

const SummarySOMStep = () => {
  const { t } = useTranslation()
  const theme = useTheme()

  const contentRef = useRef(null)

  const { bases } = useContext(BasesContext)
  const { IBI, valorSubvencion, ecoData } = useContext(EconomicContext)
  const [yearlyData, setYearlyData] = useState({})

  let areasEscogidas = 0
  let paneles = 0
  const produccionAnual = TCB.produccion.totalAnual
  const areasDisponibles = bases.length
  const potencia = bases.reduce((sum, tBase) => sum + tBase.potenciaTotal, 0)

  for (let base of bases) {
    if (base.paneles > 0) {
      areasEscogidas += 1
      paneles += base.paneles
    }
  }
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
    <>
      <Paper elevation={10} style={{ padding: 16 }}>
        <Container ref={contentRef}>
          <Grid container rowSpacing={6}>
            <Grid item xs={12}>
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
                  <Typography
                    sx={theme.titles.level_1}
                    textAlign={'center'}
                    marginTop={'1rem'}
                  >
                    {t('SUMMARY.TITLE_AUTOPRODUCCION').toUpperCase()}
                  </Typography>
                  <Typography variant="body">
                    {t('SUMMARY.DESCRIPTION_AUTOPRODUCCION')}
                  </Typography>
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
            </Grid>
            <Grid item xs={12}>
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
                <Typography
                  sx={theme.titles.level_1}
                  textAlign={'center'}
                  marginTop={'2rem'}
                >
                  {t('SUMMARY.TITLE_ENERGY_BALANCE').toUpperCase()}
                </Typography>

                <Typography variant="body">
                  {t('SUMMARY.DESCRIPTION_ENERGY_BALANCE')}
                </Typography>
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
            </Grid>
            <Grid item xs={12}>
              <SLDRInfoBox
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  width: '100%',
                  gap: '10px',
                  alignContent: 'center',
                  flexDirection: 'column',
                  bgcolor: '#CCCCCC88',
                }}
              >
                <Typography
                  sx={theme.titles.level_1}
                  textAlign={'center'}
                  marginTop={'2rem'}
                >
                  {t('SUMMARY.TITLE_ECONOMIC_BALANCE').toUpperCase()}
                </Typography>
                <Typography variant="body">
                  {t('SUMMARY.DESCRIPTION_ECONOMIC_BALANCE')}
                </Typography>

                <Typography
                  variant="h5"
                  color={theme.palette.text}
                  textAlign={'center'}
                  dangerouslySetInnerHTML={{
                    __html: t('SUMMARY.LABEL_COSTE', {
                      coste: UTIL.formatoValor(
                        'dinero',
                        ecoData.precioInstalacionCorregido,
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
                      amortizacion: ecoData.periodoAmortizacion,
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
                        parseFloat(ecoData.valorSubvencionIBI) +
                          parseFloat(ecoData.valorSubvencion),
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
            </Grid>
            <Grid item xs={12}>
              <Reports ref={contentRef}></Reports>
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
                    __html: t('SUMMARY.LABEL_disclaimer1'),
                  }}
                />
                <Typography
                  variant="body"
                  dangerouslySetInnerHTML={{
                    __html: t('SUMMARY.LABEL_disclaimer2'),
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>
    </>
  )
}

export default SummarySOMStep
