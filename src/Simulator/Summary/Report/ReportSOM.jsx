import { useRef, useState, useEffect } from 'react'
import styles from './pdfStyle'
import { useTheme } from '@mui/material/styles'

import { Grid, Container, Button, Box, Typography, Paper } from '@mui/material'
import { useReactToPrint } from 'react-to-print'
import Print from '@mui/icons-material/Print'
import logo from './images/logo_som_energia.png'
import bombeta from './images/bombeta.png'
import dona from './images/dona.png'
import placa from './images/placa.png'
import casa from './images/casa.png'
import euro from './images/euro.png'

import { useTranslation } from 'react-i18next'

import SummaryPreciosTarifa from '../SummaryPreciosTarifa'
import SummaryConsumptionTarifa from '../SummaryConsumptionTarifa'
import HourlyEnergyBalance from '../../EnergyBalance/HourlyEnergyBalance'
import MonthSavingStack from '../../EconomicBalance/MonthSavingsStack'
import PieCharts from '../../EnergyBalance/PieCharts'
import PieChart from './PieChart'
import InstallationSummary from './InstallationSummary'

import * as UTIL from '../../classes/Utiles'
import TCB from '../../classes/TCB'
import MicroMap from '../../Location/MicroMap'

export default function ReportSOM({ onClose }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()

  const componentRef = useRef()

  const [yearlyData, setYearlyData] = useState({})

  const customPageStyle = `
    @media print {
      @page {
        size: auto;
        margin: 0;
      }

      body {
        margin: 0;
      }

      header,
      footer {
        display: none !important;
      }
    }
  `

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    //pageStyle: customPageStyle,
  })

  const Header = () => {
    return (
      <Box
        sx={{
          padding: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <img src={logo} width="150" />
        <Typography
          variant="h4"
          sx={{ textAlign: 'right', textTransform: 'uppercase', margin: 0, padding: 3 }}
        >
          {t('REPORT.TITLE_PRIMER')}
          <br />
          <strong style={{ color: theme.palette.primary.main }}>
            {t('REPORT.TITLE_STRONG')}
          </strong>{' '}
          {t('REPORT.TITLE_SEGON')}
        </Typography>
      </Box>
    )
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
      <Container sx={{ backgroundColor: 'grey' }}>
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
            <Box>
              <Typography>{t('REPORT.ATENCIO')}</Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box
                id="F1"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flex: 2,
                  gap: 2,
                  minHeight: 200,
                }}
              >
                <Box
                  id="F1C1"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    gap: 2,
                  }}
                >
                  <Box
                    id="F1C1Title"
                    sx={{ backgroundColor: theme.informe.dataBox.title.backgroundColor }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        textAlign: 'center',
                        padding: 1,
                        color: theme.informe.dataBox.title.text,
                      }}
                    >
                      <strong>{t('REPORT.DADES_TITLE')}</strong>
                    </Typography>
                  </Box>
                  <Box id="F1C1Content">
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
                </Box>

                <Box id="F1C2" sx={{ flex: 1, display: 'flex' }}>
                  <InstallationSummary></InstallationSummary>
                </Box>

                <Box id="F1C3" sx={{ display: 'flex', flex: 1 }}>
                  <MicroMap></MicroMap>
                </Box>
              </Box>

              <Box
                id="F2"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                }}
              >
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
                      backgroundColor: theme.informe.sectionBox.title.backgroundColor,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        textAlign: 'center',
                        padding: 1,
                        color: theme.informe.sectionBox.title.text,
                      }}
                    >
                      <strong>{t('REPORT.US_TITLE')}</strong>
                    </Typography>
                  </Box>

                  <Box id="F2C1Content" sx={{ display: 'flex' }}>
                    <SummaryConsumptionTarifa></SummaryConsumptionTarifa>
                  </Box>
                </Box>

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
                      backgroundColor: theme.informe.sectionBox.title.backgroundColor,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        textAlign: 'center',
                        padding: 1,
                        color: theme.informe.sectionBox.title.text,
                      }}
                    >
                      <strong>{t('REPORT.FEE_TITLE')}</strong>
                    </Typography>
                  </Box>
                  <Box id="F2C2Content">
                    <SummaryPreciosTarifa></SummaryPreciosTarifa>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                mt: 2,
                mb: 2,
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
                  sx={{ backgroundColor: theme.informe.sectionBox.title.backgroundColor }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      textAlign: 'center',
                      padding: 1,
                      color: theme.informe.sectionBox.title.text,
                    }}
                  >
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
            <Box sx={{ backgroundColor: theme.informe.sectionBox.title.backgroundColor }}>
              <Typography
                variant="h6"
                sx={{
                  textAlign: 'center',
                  padding: 1,
                  color: theme.informe.sectionBox.title.text,
                }}
              >
                <strong>{t('REPORT.ESTUDI_TITLE')}</strong>
              </Typography>
            </Box>
            <Box>
              <Grid
                container
                spacing={0}
                sx={{ alignItems: 'center', justifyContent: 'center' }}
              >
                <Grid item xs={6}>
                  <Grid container>
                    <Grid
                      xs={5}
                      item
                      sx={{
                        backgroundColor: theme.informe.energyTable.title.backgroundColor,
                        color: theme.palette.text,
                        padding: 1,
                        border: '1px solid #ccc',
                      }}
                    >
                      {t('ENERGY_BALANCE.LABEL_AUTOCONSUMO')}
                    </Grid>
                    <Grid
                      xs={3}
                      item
                      sx={{
                        padding: 1,
                        border: '1px solid #ccc',
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {UTIL.formatoValor('energia', TCB.balance.autoconsumo)}
                    </Grid>
                    <Grid
                      xs={3}
                      item
                      sx={{
                        padding: 1,
                        border: '1px solid #ccc',
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {UTIL.formatoValor(
                        'dinero',
                        UTIL.suma(TCB.economico.ahorradoAutoconsumoMes),
                      )}
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid
                      item
                      xs={5}
                      sx={{
                        backgroundColor: theme.informe.energyTable.title.backgroundColor,
                        color: theme.palette.text,
                        padding: 1,
                        border: '1px solid #ccc',
                      }}
                    >
                      {t('REPORT.ESTUDI_EXCEDENT')}
                    </Grid>
                    <Grid
                      xs={3}
                      item
                      sx={{
                        padding: 1,
                        border: '1px solid #ccc',
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {UTIL.formatoValor('energia', TCB.balance.excedenteAnual)}
                    </Grid>
                    <Grid
                      xs={3}
                      item
                      sx={{
                        padding: 1,
                        border: '1px solid #ccc',
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {UTIL.formatoValor(
                        'dinero',
                        -UTIL.suma(TCB.economico.compensadoMensual),
                      )}
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid
                      xs={5}
                      item
                      sx={{
                        backgroundColor: theme.informe.energyTable.title.backgroundColor,
                        color: theme.palette.text,
                        padding: 1,
                        border: '1px solid #ccc',
                      }}
                    >
                      <strong>{t('REPORT.ESTUDI_ESTALVI')}</strong>
                    </Grid>
                    <Grid
                      xs={6}
                      item
                      sx={{
                        padding: 1,
                        border: '1px solid #ccc',
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {UTIL.formatoValor('dinero', TCB.economico.ahorroAnual)}
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid
                      xs={5}
                      item
                      sx={{
                        backgroundColor: theme.informe.energyTable.title.backgroundColor,
                        color: theme.palette.text,
                        padding: 1,
                        border: '1px solid #ccc',
                      }}
                    >
                      {t('REPORT.ESTUDI_XARXA')}
                    </Grid>
                    <Grid
                      xs={3}
                      item
                      sx={{
                        padding: 1,
                        border: '1px solid #ccc',
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {UTIL.formatoValor('energia', TCB.balance.deficitAnual)}
                    </Grid>
                    <Grid
                      xs={3}
                      item
                      sx={{
                        padding: 1,
                        border: '1px solid #ccc',
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {UTIL.formatoValor(
                        'dinero',
                        UTIL.suma(TCB.economico.consumoConPlacasMensualCorregido),
                      )}
                    </Grid>
                  </Grid>

                  <Grid container>
                    <Grid
                      xs={5}
                      item
                      sx={{
                        backgroundColor: theme.informe.energyTable.title.backgroundColor,
                        color: theme.palette.text,
                        padding: 1,
                        border: '1px solid #ccc',
                      }}
                    >
                      <strong>{t('REPORT.ESTUDI_RETORN')}</strong>
                    </Grid>
                    <Grid
                      xs={6}
                      item
                      sx={{
                        padding: 1,
                        border: '1px solid #ccc',
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {TCB.economico.periodoAmortizacion + ' ' + t('BASIC.LABEL_AÑOS')}
                    </Grid>
                  </Grid>
                </Grid>
                {/* <Grid item xs={8} justifyContent={'right'}>
              <PieCharts yearlyData={yearlyData}></PieCharts>
            </Grid> */}

                <Grid item xs={3}>
                  <PieChart
                    percentage={
                      (TCB.balance.autoconsumo / TCB.produccion.totalAnual) * 100
                    }
                    color="#b9db42"
                    label={t('REPORT.PIE_AUTOCONSUM_TITLE')}
                    description={t('REPORT.PIE_AUTOCONSUM_DESCRIPTION')}
                  />
                </Grid>
                <Grid item xs={3}>
                  <PieChart
                    percentage={
                      (TCB.balance.consumoDiurno / TCB.consumo.totalAnual) * 100
                    }
                    color="#b9db42"
                    label={t('REPORT.PIE_CONSUMO_HORAS_SOL_TITLE')}
                    description={t('REPORT.PIE_CONSUMO_HORAS_SOL_DESCRIPTION')}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
          <div className="page-break"></div>
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
            <Box>
              <Typography variant="h5" sx={{ textDecoration: 'underline' }}>
                {t('REPORT.PERFIL_TITLE')}
              </Typography>
              <HourlyEnergyBalance report={true}></HourlyEnergyBalance>
            </Box>
            <Box sx={{ mb: 1 }}>
              <MonthSavingStack></MonthSavingStack>
            </Box>

            {/* BOX: Como se han generado los datos de este informe */}
            <Box sx={{ backgroundColor: theme.informe.dataBox.title.backgroundColor }}>
              <Typography
                variant="h6"
                sx={{
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
                      padding: 1,
                      fontSize: 18,
                      fontWeight: 'normal',
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
                      padding: 1,
                      fontSize: 18,
                      fontWeight: 'normal',
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
                      padding: 1,
                      fontSize: 18,
                      fontWeight: 'normal',
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
          <div className="page-break"></div>
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
            {/* BOX Titulo Proximos pasos */}
            <Box sx={{ backgroundColor: theme.informe.sectionBox.title.backgroundColor }}>
              <Typography
                variant="h6"
                sx={{
                  textAlign: 'center',
                  padding: 1,
                  color: theme.informe.sectionBox.title.text,
                  mt: '1rem',
                }}
              >
                <strong>{t('REPORT.PROPERESPASES_TITLE')}</strong>
              </Typography>
            </Box>

            <Box sx={{ mt: '1rem', mb: '1rem' }}>
              <Typography variant="body">{t('REPORT.ADVISE')}</Typography>
            </Box>
            <Box>
              <h3 style={styles.primerpas}>
                <img style={styles.primerpasImage} src={dona} />
                {t('REPORT.PROPERESPASES_DESCRIPTION')}{' '}
              </h3>

              <Typography
                style={styles.properespasesAmbImage}
                dangerouslySetInnerHTML={{
                  __html: t('REPORT.PROPERESPASES_TEXT'),
                }}
              />
            </Box>
            <Box sx={theme.informe.titleBox}>
              <Typography variant="h5">
                <strong>{t('REPORT.AUTOGENERACIO_TITLE')}</strong>
              </Typography>
            </Box>
            <div style={styles.container}>
              <div>
                <h3 style={styles.autogeneracioTitle}>
                  {t('REPORT.AUTOGENERACIO_TEXT')}{' '}
                  <strong style={styles.autogeneracioBold}>
                    {t('REPORT.AUTOGENERACIO_TEXT_STRONG')}{' '}
                  </strong>
                  {t('REPORT.AUTOGENERACIO_TEXT_FINAL')}{' '}
                </h3>
              </div>
              <div style={styles.listContainer}>
                <ul style={styles.list}>
                  <li style={styles.listitem}>
                    <a
                      href="https://ca.support.somenergia.coop/article/778-que-es-l-autoproduccio"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('REPORT.AUTOGENERACIO_LINK_PRIMER')}{' '}
                    </a>
                  </li>
                  <li style={styles.listitem}>
                    <a
                      href="https://ca.support.somenergia.coop/article/783-com-funciona-la-compensacio-simplificada-dexcedents"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('REPORT.AUTOGENERACIO_LINK_SEGON')}
                    </a>
                  </li>
                  <li style={styles.listitem}>
                    <a
                      href="https://ca.support.somenergia.coop/article/929-autoproduccio-que-passa-si-marxa-la-llum"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('REPORT.AUTOGENERACIO_LINK_TERCER')}{' '}
                    </a>
                  </li>
                  <li style={styles.listitem}>
                    <a
                      href="https://ca.support.somenergia.coop/category/777-autoproduccio"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('REPORT.AUTOGENERACIO_LINK_CUART')}{' '}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div style={styles.peu}>
              <p style={styles.peuText}>{t('REPORT.PEU')} </p>
              <img src={logo} width="120" />
            </div>
          </Box>
        </div>

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
