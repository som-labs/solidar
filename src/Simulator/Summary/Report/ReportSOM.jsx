import { useRef, useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

// MUI objects
import { Grid, Container, Button, Box, Typography } from '@mui/material'
import { useReactToPrint } from 'react-to-print'
import Print from '@mui/icons-material/Print'

// Local images
import logo from './images/logo_som_energia.png'
import bombeta from './images/bombeta.png'
import dona from './images/dona.png'
import placa from './images/placa.png'
import casa from './images/casa.jpg'
import euro from './images/euro.png'

//React global components
import { BasesContext } from '../../BasesContext'
import SummaryPreciosTarifa from '../SummaryPreciosTarifa'
import SummaryConsumptionTarifa from '../SummaryConsumptionTarifa'
import HourlyEnergyBalance from '../../EnergyBalance/HourlyEnergyBalance'
import MonthSaving from '../../EconomicBalance/MonthSavings'
import PieChart from '../../EnergyBalance/PieChart'
import InstallationSummary from './InstallationSummary'
import MicroMap from '../../Location/MicroMap'

// Solidar objects
import * as UTIL from '../../classes/Utiles'
import TCB from '../../classes/TCB'

export default function ReportSOM({ onClose }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()

  const componentRef = useRef()
  const { bases } = useContext(BasesContext)

  //const [yearlyData, setYearlyData] = useState({})

  const usedBases = bases.filter((b) => b.paneles > 0)
  const shortFormat = usedBases.length < 5 ? true : false

  function getLink(number) {
    let link
    switch (number) {
      case 1:
        switch (i18n.language.substring(0, 2)) {
          case 'ca':
            link =
              'https://ca.support.somenergia.coop/article/778-que-es-l-autoproduccio?utm_source=linkidiomes&utm_medium=cda&utm_campaign=catal%C3%A0'
            break
          case 'gl':
            link =
              'https://gl.support.somenergia.coop/article/836-que-e-a-autoproducion?utm_source=linkidiomes&utm_medium=cda&utm_campaign=galego'
            break
          case 'eu':
            link =
              'https://eu.support.somenergia.coop/article/838-zer-da-autoprodukzioa?utm_source=linkidiomes&utm_medium=cda&utm_campaign=euskara'
            break
          default:
            link =
              'https://es.support.somenergia.coop/article/780-que-es-la-autoproduccion?utm_source=linkidiomes&utm_medium=cda&utm_campaign=castellano'
            break
        }
        break
      case 2:
        switch (i18n.language.substring(0, 2)) {
          case 'ca':
            link =
              'https://ca.support.somenergia.coop/article/783-com-funciona-la-compensacio-simplificada-dexcedents?utm_source=linkidiomes&utm_medium=cda&utm_campaign=catal%C3%A0'
            break
          case 'gl':
            link =
              'https://gl.support.somenergia.coop/article/981-a-compensacion-simplificada-de-excedentes-en-autoproducion?utm_source=linkidiomes&utm_medium=cda&utm_campaign=galego'
            break
          case 'eu':
            link =
              'https://eu.support.somenergia.coop/article/980-autoprodukzioko-soberakinen-konpentsazio-sinplifikatua?utm_source=linkidiomes&utm_medium=cda&utm_campaign=euskara'
            break
          default:
            link =
              'https://es.support.somenergia.coop/article/784-como-funciona-la-compensacion-simplificada-de-excedentes?utm_source=linkidiomes&utm_medium=cda&utm_campaign=castellano'
            break
        }
        break
      case 3:
        switch (i18n.language.substring(0, 2)) {
          case 'ca':
            link =
              'https://ca.support.somenergia.coop/article/929-autoproduccio-que-passa-si-marxa-la-llum?utm_source=linkidiomes&utm_medium=cda&utm_campaign=catal%C3%A0'
            break
          case 'gl':
            link =
              'https://gl.support.somenergia.coop/article/931-autoproducion-que-pasa-se-marcha-a-luz?utm_source=linkidiomes&utm_medium=cda&utm_campaign=galego'
            break
          case 'eu':
            link =
              'https://eu.support.somenergia.coop/article/932-autoprodukzioa-zer-gertatuko-da-argirik-gabe-gelditzen-bagara?utm_source=linkidiomes&utm_medium=cda&utm_campaign=euskara'
            break
          default:
            link =
              'https://es.support.somenergia.coop/article/930-autoproduccion-que-pasa-si-se-va-la-luz?utm_source=linkidiomes&utm_medium=cda&utm_campaign=castellano'
            break
        }
        break
      case 4:
        switch (i18n.language.substring(0, 2)) {
          case 'ca':
            link = 'https://ca.support.somenergia.coop/category/777-autoproduccio'
            break
          case 'gl':
            link = 'https://gl.support.somenergia.coop/category/835-autoproducion'
            break
          case 'eu':
            link = 'https://eu.support.somenergia.coop/category/837-autoprodukzioa'
            break
          default:
            link = 'https://es.support.somenergia.coop/category/779-autoproduccion'
            break
        }
        break
    }

    return link
  }

  // const customPageStyle = `
  //   @media print {
  //     @page {
  //       size: auto;
  //       margin: 0;
  //     }

  //     body {
  //       margin: 0;
  //     }

  //     header,
  //     footer {
  //       display: none !important;
  //     }
  //   }
  // `

  // const AUTO = UTIL.suma(TCB.economico.ahorradoAutoconsumoMes)
  // const COMPENSA = -UTIL.suma(TCB.economico.compensadoMensual)
  // const HUCHA = UTIL.suma(TCB.economico.extraccionHucha)
  // const GASTOCP = UTIL.suma(TCB.economico.consumoConPlacasMensualCorregido)
  // const GASTOSP = UTIL.suma(TCB.economico.consumoOriginalMensual)
  // console.log('SALDO', TCB.economico.huchaSaldo)
  // console.log('AUTO', AUTO, TCB.economico.ahorradoAutoconsumoMes)
  // console.log('COMPENSA', COMPENSA, TCB.economico.compensadoMensual)
  // console.log('HUCHA', HUCHA, TCB.economico.extraccionHucha)
  // console.log('AHORRO', AUTO + COMPENSA + HUCHA)
  // console.log('GASTO CPLACAS', GASTOCP, TCB.economico.consumoConPlacasMensualCorregido)
  // console.log('GASTO SPLACAS', GASTOSP, TCB.economico.consumoOriginalMensual)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    //pageStyle: customPageStyle,
  })

  const Header = () => {
    return (
      <Box
        sx={{
          padding: 2,
          display: 'flex',
          gap: 5,
        }}
      >
        <Box padding={1}>
          <img src={logo} width="200" />
        </Box>
        <Box sx={{ display: 'flex', flex: 1, justifyContent: 'right' }}>
          <Typography
            sx={{
              textAlign: 'right',
              textTransform: 'uppercase',
              margin: 0,
              padding: 3,
              fontSize: 35,
              fontWeight: 'bold',
            }}
          >
            {t('REPORT.TITLE_PRIMER')}
            <br />
            <strong style={{ color: theme.palette.primary.main }}>
              {t('REPORT.TITLE_STRONG')}
            </strong>{' '}
            {t('REPORT.TITLE_SEGON')}
          </Typography>
        </Box>
      </Box>
    )
  }

  // useEffect(() => {
  //   setYearlyData({
  //     consumo: TCB.consumo.totalAnual,
  //     produccion: TCB.produccion.totalAnual,
  //     deficit: TCB.balance.deficitAnual,
  //     autoconsumo: TCB.balance.autoconsumo,
  //     excedente: TCB.balance.excedenteAnual,
  //     consumoDiurno: TCB.balance.consumoDiurno,
  //   })
  // }, [])

  const MainData = () => {
    return (
      <>
        <Box
          id="Title"
          sx={{
            backgroundColor: 'databox.main',
            color: 'databox.contrastText',
            textAlign: 'center',
            padding: 1,
          }}
        >
          <Typography variant="h6">
            <strong>{t('REPORT.DADES_TITLE')}</strong>
          </Typography>
        </Box>
        <Box id="Content">
          <Typography
            sx={{
              textAlign: 'left',
              padding: 1,
              color: theme.palette.text,
            }}
          >
            {t('REPORT.DADES_DIRECCIO')}: <strong>{TCB.direccion}</strong>
          </Typography>
        </Box>
      </>
    )
  }

  return (
    <div>
      <style>
        {`
          @media print {
            .page-break {
              page-break-before: always;
            }
          }
        `}
      </style>
      <Container>
        <div ref={componentRef}>
          <Box
            sx={{
              backgroundColor: 'white',
              border: 2,
              borderRadius: 3,
              padding: 2,
              mb: '1rem',
            }}
          >
            <Header></Header>
            {/* Texto de atencion */}
            <Box sx={{ mb: 3 }}>
              <Typography>{t('REPORT.ATENCIO')}</Typography>
            </Box>
            {shortFormat ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {/* Datos principales */}
                <Box id="F1Short" sx={{ display: 'flex', flexDirection: 'column' }}>
                  <MainData />
                </Box>

                <Box id="F2Short" sx={{ display: 'flex', flexDirection: 'row' }}>
                  {/* Datos de cubierta */}
                  <Box id="F2C1Short" sx={{ flex: 1, display: 'flex', minHeight: 250 }}>
                    <InstallationSummary
                      shortFormat={shortFormat}
                      usedBases={usedBases}
                    ></InstallationSummary>
                  </Box>
                  {/* Mapa */}
                  <Box id="F2C2Short" sx={{ display: 'flex', flex: 1 }}>
                    <MicroMap></MicroMap>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Box id="F1Long" sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Box
                    id="F1C1Long"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: 250,
                      flex: 1,
                      gap: 2,
                    }}
                  >
                    <MainData></MainData>
                  </Box>

                  <Box id="F1C2Long" sx={{ display: 'flex', flex: 1, border: 1 }}>
                    <MicroMap></MicroMap>
                  </Box>
                </Box>
                <Box id="F2Long" sx={{ flex: 1, display: 'flex' }}>
                  <InstallationSummary
                    shortFormat={shortFormat}
                    usedBases={usedBases}
                  ></InstallationSummary>
                </Box>
              </Box>
            )}
            <Box
              id="F2"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
              }}
            >
              {/* Uso de la energia */}
              <Box
                id="F2C1"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  gap: 2,
                  padding: 1,
                }}
              >
                <Box
                  id="F2C1Title"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    textAlign: 'center',
                    padding: 1,
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">
                    <strong>{t('REPORT.US_TITLE')}</strong>
                  </Typography>
                </Box>

                <Box id="F2C1Content" sx={{ display: 'flex' }}>
                  <SummaryConsumptionTarifa></SummaryConsumptionTarifa>
                </Box>
              </Box>
              {/* Precios aplicados */}
              <Box
                id="F2C2"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  gap: 2,
                  padding: 1,
                }}
              >
                <Box
                  id="F2C2Title"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    textAlign: 'center',
                    padding: 1,
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">
                    <strong>{t('REPORT.FEE_TITLE')}</strong>
                  </Typography>
                </Box>
                <Box id="F2C2Content">
                  <SummaryPreciosTarifa></SummaryPreciosTarifa>
                </Box>
              </Box>
            </Box>

            {/* Caracteristicas de la instalacion propuesta */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',

                mb: 1,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flex: 1,
                  padding: 2,
                  ml: '3rem',
                  mr: '3rem',
                }}
              >
                <img src={casa} width="auto" height="200px" />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 6,
                  padding: 2,
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    textAlign: 'center',
                    padding: 1,
                  }}
                >
                  <Typography variant="h6">
                    <strong>{t('REPORT.INSTALACIO_TITLE')}</strong>
                  </Typography>
                </Box>
                <Box sx={{ ml: '2rem', padding: 1 }}>
                  <Typography>
                    {t('REPORT.INSTALACIO_NOMBRE')}: <strong>{TCB.totalPaneles}</strong>
                  </Typography>
                  <Typography>
                    {t('REPORT.INSTALACIO_POTENCIA_UNITARIA')}:{' '}
                    <strong>
                      {UTIL.formatoValor('potenciaWp', TCB.tipoPanelActivo.potencia)}
                    </strong>
                  </Typography>
                  <Typography>
                    {t('REPORT.INSTALACIO_POTENCIA')}:{' '}
                    <strong>
                      {UTIL.formatoValor(
                        'potenciaTotal',
                        TCB.totalPaneles * (TCB.tipoPanelActivo.potencia / 1000),
                      )}
                    </strong>
                  </Typography>
                  <Typography>
                    {t('REPORT.INSTALACIO_ANUAL')}:{' '}
                    <strong>
                      {UTIL.formatoValor('energia', TCB.produccion.totalAnual)}
                    </strong>
                  </Typography>
                  <Typography>
                    {t('REPORT.INSTALACIO_COST')}:{' '}
                    <strong>
                      {UTIL.formatoValor(
                        'dinero',
                        TCB.economico.precioInstalacionCorregido,
                      )}
                    </strong>
                  </Typography>
                </Box>
              </Box>
            </Box>

            {!shortFormat && (
              <div className="page-break">
                <hr></hr>
                <Header></Header>
              </div>
            )}

            {/* Estudio energetico - economico */}
            <Box
              sx={{
                textTransform: 'uppercase',
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                textAlign: 'center',
                padding: 1,
              }}
            >
              <Typography variant="h6">
                <strong>{t('REPORT.ESTUDI_TITLE')}</strong>
              </Typography>
            </Box>

            <Box
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
                alignContent: 'center',
                display: 'flex',
              }}
            >
              <Box sx={{ display: 'flex', flex: 1.5 }}>
                <Grid
                  container
                  spacing={0}
                  sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}
                >
                  <Grid item xs={10}>
                    <Grid container>
                      <Grid
                        xs={6}
                        item
                        sx={{
                          backgroundColor:
                            theme.informe.energyTable.title.backgroundColor,
                          color: theme.palette.text,
                          padding: 0.5,
                          border: '1px solid #ccc',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h4>{t('ENERGY_BALANCE.LABEL_AUTOCONSUMO')}</h4>
                      </Grid>
                      <Grid
                        xs={3}
                        item
                        sx={{
                          border: '1px solid #ccc',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h5>{UTIL.formatoValor('energia', TCB.balance.autoconsumo)}</h5>
                      </Grid>
                      <Grid
                        xs={3}
                        item
                        sx={{
                          border: '1px solid #ccc',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h5>
                          {UTIL.formatoValor(
                            'dinero',
                            UTIL.suma(TCB.economico.ahorradoAutoconsumoMes),
                          )}
                        </h5>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid
                        item
                        xs={6}
                        sx={{
                          backgroundColor:
                            theme.informe.energyTable.title.backgroundColor,
                          color: theme.palette.text,
                          padding: 0.5,
                          border: '1px solid #ccc',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h4>{t('REPORT.ESTUDI_EXCEDENT')} </h4>
                      </Grid>
                      <Grid
                        xs={3}
                        item
                        sx={{
                          padding: 1,
                          border: '1px solid #ccc',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h5>
                          {UTIL.formatoValor('energia', TCB.balance.excedenteAnual)}{' '}
                        </h5>
                      </Grid>
                      <Grid
                        xs={3}
                        item
                        sx={{
                          padding: 1,
                          border: '1px solid #ccc',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h5>
                          {UTIL.formatoValor(
                            'dinero',
                            -UTIL.suma(TCB.economico.compensadoMensual),
                          )}
                        </h5>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid
                        xs={6}
                        item
                        sx={{
                          backgroundColor:
                            theme.informe.energyTable.title.backgroundColor,
                          color: theme.palette.text,
                          padding: 0.5,
                          border: '1px solid #ccc',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h4>
                          <strong>{t('REPORT.ESTUDI_ESTALVI')}</strong>
                        </h4>
                      </Grid>
                      <Grid
                        xs={6}
                        item
                        sx={{
                          padding: 1,
                          border: '1px solid #ccc',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h5>{UTIL.formatoValor('dinero', TCB.economico.ahorroAnual)}</h5>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid
                        xs={6}
                        item
                        sx={{
                          backgroundColor:
                            theme.informe.energyTable.title.backgroundColor,
                          color: theme.palette.text,
                          padding: 0.5,
                          border: '1px solid #ccc',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h4>
                          <strong>{t('REPORT.SOLS_DISPONIBLES')}</strong>
                        </h4>
                      </Grid>
                      <Grid
                        xs={6}
                        item
                        sx={{
                          padding: 1,
                          border: '1px solid #ccc',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h5>
                          {UTIL.formatoValor('dinero', TCB.economico.huchaSaldo[11])}
                        </h5>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid
                        xs={6}
                        item
                        sx={{
                          backgroundColor:
                            theme.informe.energyTable.title.backgroundColor,
                          color: theme.palette.text,
                          padding: 0.5,
                          border: '1px solid #ccc',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h4>{t('REPORT.ESTUDI_XARXA')} </h4>
                      </Grid>
                      <Grid
                        xs={3}
                        item
                        sx={{
                          padding: 1,
                          border: '1px solid #ccc',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h5>{UTIL.formatoValor('energia', TCB.balance.deficitAnual)}</h5>
                      </Grid>
                      <Grid
                        xs={3}
                        item
                        sx={{
                          padding: 1,
                          border: '1px solid #ccc',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h5>
                          {UTIL.formatoValor(
                            'dinero',
                            UTIL.suma(TCB.economico.consumoConPlacasMensualCorregido),
                          )}
                        </h5>
                      </Grid>
                    </Grid>

                    <Grid container>
                      <Grid
                        xs={6}
                        item
                        sx={{
                          backgroundColor:
                            theme.informe.energyTable.title.backgroundColor,
                          color: theme.palette.text,
                          padding: 0.5,
                          border: '1px solid #ccc',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h4>
                          <strong>{t('REPORT.ESTUDI_RETORN')}</strong>
                        </h4>
                      </Grid>
                      <Grid
                        xs={6}
                        item
                        sx={{
                          padding: 1,
                          border: '1px solid #ccc',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          height: 30,
                          alignContent: 'center',
                        }}
                      >
                        <h5>
                          {TCB.economico.periodoAmortizacion +
                            ' ' +
                            t('BASIC.LABEL_AÑOS')}
                        </h5>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'column',

                  justifyContent: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                }}
              >
                <Typography variant={'h6'} sx={{ textAlign: 'center', mt: '1rem' }}>
                  {t('REPORT.PIE_CONSUMO_HORAS_SOL_TITLE')}
                </Typography>
                <PieChart
                  labels={['Consumo horas con sol', 'Resto consumo']}
                  values={[
                    TCB.balance.consumoDiurno,
                    TCB.consumo.totalAnual - TCB.balance.consumoDiurno,
                  ]}
                  colors={[
                    theme.palette.balance.consumoDiurno,
                    theme.palette.balance.consumo,
                  ]}
                ></PieChart>
              </Box>

              <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                <Typography variant={'h6'} sx={{ textAlign: 'center', mt: '1rem' }}>
                  {t('ENERGY_BALANCE.TITLE_GRAPH_DEMAND')}
                </Typography>
                <PieChart
                  labels={[
                    t('ENERGY_BALANCE.LABEL_AUTOCONSUMO'),
                    t('ENERGY_BALANCE.LABEL_EXCEDENTE_ANUAL'),
                  ]}
                  values={[TCB.balance.autoconsumo, TCB.balance.excedenteAnual]}
                  colors={[
                    theme.palette.balance.autoconsumo,
                    theme.palette.balance.excedente,
                  ]}
                ></PieChart>
              </Box>
            </Box>

            {shortFormat && (
              <div className="page-break">
                <hr></hr>
                <Header></Header>
              </div>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {/* BOX: Perfil de uso de energia */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                  mb: 2,
                }}
              >
                <Typography variant="h5" sx={{ textDecoration: 'underline' }}>
                  {t('REPORT.PERFIL_TITLE')}
                </Typography>
                <HourlyEnergyBalance report={true}></HourlyEnergyBalance>
              </Box>
              {/* BOX: Ahorro mensual  */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 500,
                  mb: 1,
                }}
              >
                <Typography variant="h5" sx={{ textDecoration: 'underline' }}>
                  {t('ECONOMIC_BALANCE.TITLE_MONTH_SAVINGS')}
                </Typography>
                <MonthSaving></MonthSaving>
              </Box>

              {!shortFormat && (
                <div className="page-break">
                  <hr></hr>
                  <Header></Header>
                </div>
              )}

              {/* BOX: Como se han generado los datos de este informe */}
              <Box sx={{ backgroundColor: theme.informe.dataBox.title.backgroundColor }}>
                <Typography
                  variant="h6"
                  sx={{
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    padding: 1,
                    mb: '0.5rem',
                    mt: '1rem',
                    color: theme.informe.dataBox.title.text,
                  }}
                >
                  <strong>{t('REPORT.INFORME_TITLE')}</strong>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                  {/* BOX: Titulo Datos de generacion */}
                  <Box sx={{ display: 'flex', flex: 1, backgroundColor: '#b3b0b0' }}>
                    <img
                      src={placa}
                      style={{
                        position: 'relative',
                        right: 0,
                        height: 40,
                        width: 40,
                      }}
                    />
                    <Typography
                      sx={{
                        textTransform: 'uppercase',
                        padding: 1,
                        fontSize: 18,
                        fontWeight: 'bold',
                        margin: 0,
                      }}
                    >
                      {t('REPORT.GENERACIO_TITLE')}
                    </Typography>
                  </Box>
                  {/* BOX: Titulo Datos de uso de energia */}
                  <Box sx={{ display: 'flex', flex: 1, backgroundColor: '#b3b0b0' }}>
                    <img
                      src={bombeta}
                      style={{
                        position: 'relative',
                        right: 0,
                        height: 40,
                        width: 40,
                      }}
                    />
                    <Typography
                      sx={{
                        textTransform: 'uppercase',
                        padding: 1,
                        fontSize: 18,
                        fontWeight: 'bold',
                        margin: 0,
                      }}
                    >
                      {t('REPORT.TITLE')}{' '}
                    </Typography>
                  </Box>
                  {/* BOX: Titulo Datos economicos */}
                  <Box sx={{ display: 'flex', flex: 1, backgroundColor: '#b3b0b0' }}>
                    <img
                      src={euro}
                      style={{
                        position: 'relative',
                        right: 0,
                        height: 40,
                        width: 40,
                      }}
                    />
                    <Typography
                      sx={{
                        textTransform: 'uppercase',
                        padding: 1,
                        fontSize: 18,
                        fontWeight: 'bold',
                        margin: 0,
                      }}
                    >
                      {t('REPORT.ECONOMIQUES_TITLE')}{' '}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                  {/* BOX: Descripcion Datos de generacion */}
                  <Box
                    sx={{
                      display: 'flex',
                      flex: 1,
                      backgroundColor: '#d9d9d9',
                      padding: 1,
                      flexDirection: 'column',
                    }}
                  >
                    <Typography>{t('REPORT.GENERACIO_DESCRIPTION')}</Typography>
                    <Typography>{t('REPORT.GENERACIO_TEXT')}</Typography>
                  </Box>
                  {/* BOX: Descripcion Datos de uso de energia */}
                  <Box
                    sx={{
                      display: 'flex',
                      flex: 1,
                      backgroundColor: '#d9d9d9',
                      padding: 1,
                      flexDirection: 'column',
                    }}
                  >
                    <Typography>{t('REPORT.DESCRIPTION')}</Typography>
                    <Typography>{t('REPORT.TEXT')}</Typography>
                  </Box>
                  {/* BOX: Descripcion Datos economicos */}
                  <Box
                    sx={{
                      display: 'flex',
                      flex: 1,
                      backgroundColor: '#d9d9d9',
                      padding: 1,
                    }}
                  >
                    {t('REPORT.ECONOMIQUES_DESCRIPTION')}
                  </Box>
                </Box>
              </Box>
            </Box>

            {shortFormat && (
              <div className="page-break">
                <hr></hr>
                <Header></Header>
              </div>
            )}

            {/* BOX Titulo Proximos pasos */}
            <Box
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                textAlign: 'center',
                padding: 1,
              }}
            >
              <Typography variant="h6" sx={{ textTransform: 'uppercase' }}>
                <strong>{t('REPORT.PROPERESPASES_TITLE')}</strong>
              </Typography>
            </Box>

            <Box sx={{ padding: 2 }}>
              <Typography variant="body">{t('REPORT.ADVISE')}</Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                textAlign: 'center',
                justifyContent: 'center',
                padding: 1,
                display: 'flex',
              }}
            >
              <Typography variant="h6" sx={{ textTransform: 'uppercase' }}>
                <strong>{t('REPORT.PROPERESPASES_DESCRIPTION')}</strong>
              </Typography>
            </Box>
            {/* Que ofrecemos a traves de SOM ENERGIA */}
            <Box sx={{ display: 'flex' }}>
              <Box sx={{ display: 'flex', flex: 11, padding: 2 }}>
                <Typography
                  dangerouslySetInnerHTML={{
                    __html: t('REPORT.PROPERESPASES_TEXT'),
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flex: 2, height: 150 }}>
                <img
                  style={{ position: 'relative', right: 0, top: -50, height: 190 }}
                  src={dona}
                />
              </Box>
            </Box>

            {/*Informacion general sobre autogeneracion */}
            <Box
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                textAlign: 'center',
                padding: 1,
              }}
            >
              <Typography variant="h6" sx={{ textTransform: 'uppercase' }}>
                <strong>{t('REPORT.AUTOGENERACIO_TITLE')}</strong>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Box
                sx={{
                  display: 'flex',
                  flex: 1,
                  alignItems: 'center',
                  padding: 2,
                  backgroundColor: '#b0b0b0',
                }}
              >
                <Typography>
                  {t('REPORT.AUTOGENERACIO_TEXT')}{' '}
                  <strong
                    style={{
                      color: '#b9db42',
                    }}
                  >
                    {t('REPORT.AUTOGENERACIO_TEXT_STRONG')}{' '}
                  </strong>
                  {t('REPORT.AUTOGENERACIO_TEXT_FINAL')}{' '}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flex: 1 }}>
                <ul>
                  <li>
                    <a href={getLink(1)} target="_blank" rel="noreferrer">
                      {t('REPORT.AUTOGENERACIO_LINK_PRIMER')}
                    </a>
                  </li>
                  <li>
                    <a href={getLink(2)} target="_blank" rel="noreferrer">
                      {t('REPORT.AUTOGENERACIO_LINK_SEGON')}
                    </a>
                  </li>
                  <li>
                    <a href={getLink(3)} target="_blank" rel="noreferrer">
                      {t('REPORT.AUTOGENERACIO_LINK_TERCER')}
                    </a>
                  </li>
                  <li>
                    <a href={getLink(3)} target="_blank" rel="noreferrer">
                      {t('REPORT.AUTOGENERACIO_LINK_CUART')}{' '}
                    </a>
                  </li>
                </ul>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 11,
                  gap: 1,
                  padding: 2,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <Typography>{t('REPORT.PEU')}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 2,
                }}
              >
                <img src={logo} width="120" />
              </Box>
            </Box>
          </Box>
        </div>

        {/* Botones */}
        <Button
          variant="contained"
          sx={{ mr: '2rem' }}
          startIcon={<Print />}
          size="large"
          onClick={handlePrint}
        >
          {t('SUMMARY.LABEL_PRINT')}
        </Button>
        <Button variant="contained" size="large" onClick={onClose}>
          {t('REPORT.RETURN')}
        </Button>
      </Container>
    </div>
  )
}
