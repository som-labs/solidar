import { forwardRef, useRef, useEffect } from 'react'
import styles from './pdfStyle'

import GraphicPerfil from './GraphicPerfil'
import ReportConsumGraph from './ReportConsumGraph'
import { Grid } from '@mui/material'

import logo from './images/logo_som_energia.png'
import bombeta from './images/bombeta.png'
import dona from './images/dona.png'
import placa from './images/placa.png'
import casa from './images/casa.png'
import euro from './images/euro.png'

import { useTranslation } from 'react-i18next'

// OpenLayers objects
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { OSM, Vector as VectorSource, XYZ } from 'ol/source'
import { Style, Fill, Stroke } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'

import { transform, fromLonLat } from 'ol/proj'

import SummaryPreciosTarifa from '../SummaryPreciosTarifa'
import HourlyEnergyBalance from '../../EnergyBalance/HourlyEnergyBalance'
import MonthSaving from '../../EconomicBalance/MonthSavings'
import PieChart from './PieChart'
import InstallationSummary from './InstallationSummary'
import SummaryAutoproduccion from '../SummaryAutoproduccion'

import * as UTIL from '../../classes/Utiles'
import TCB from '../../classes/TCB'

// eslint-disable-next-line react/display-name
export const PDF = forwardRef(({ data }, ref) => {
  const { t } = useTranslation()
  const mapElement = useRef()
  const mapRef = useRef()

  useEffect(() => {
    // If there is not previous Map in MapContext create one
    if (!mapRef.current) {
      const SAT = new TileLayer({
        source: new XYZ({
          url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam9zZWx1aXMtc29saWRhciIsImEiOiJjbHJ1amIybXAwZ3IyMmt0ZWplc3dkczI5In0.ZtRIGwqCgRQI5djHEFmOVA',
          tileSize: 512,
          crossOrigin: 'Anonymous',
        }),
      })
      SAT.set('name', 'SAT')
      SAT.setVisible(true)

      // Vector is the layers where new features (bases o puntosConsumo) are shown from vectorSource
      const basesLayer = new VectorLayer({
        source: TCB.origenDatosSolidar,
        style: new Style({
          stroke: new Stroke({
            fillcolor: [0, 250, 0, 0.5],
            color: [0, 250, 0, 1],
            width: 4,
          }),
          fill: new Fill({
            color: 'rgba(0, 255, 0, 0.3)',
          }),
        }),
      })

      //OpenLayers map creation
      mapRef.current = new Map({
        target: mapElement.current,
        layers: [SAT, basesLayer],
        view: new View({
          maxZoom: 20,
          zoom: 18,
        }),
        controls: [],
        interactions: [],
      })
    } else {
      mapRef.current.setTarget(mapElement.current)
    }

    const mapView = mapRef.current.getView()
    mapView.fit(TCB.origenDatosSolidar.getExtent())
    const center = mapView.getCenter()
    if (mapView.getZoom() > 20) {
      mapView.setCenter(center)
      mapView.setZoom(20)
    }
  }, [])

  return (
    <div style={styles.page} ref={ref}>
      <div style={styles.header}>
        <h1 style={styles.h1}>
          {t('REPORT.TITLE_PRIMER')}
          <br />
          <strong style={styles.strong}>{t('REPORT.TITLE_STRONG')}</strong>{' '}
          {t('REPORT.TITLE_SEGON')}
        </h1>
        <img src={logo} width="120" />
      </div>
      <div style={styles.warning}>
        <p style={styles.warningText}>{t('REPORT.ATENCIO')}</p>
      </div>

      <div style={styles.dades}>
        <div>
          <h2 style={styles.title}>{t('REPORT.DADES_TITLE')}</h2>
          <ul style={styles.list}>
            <li style={styles.listitem}>
              {t('REPORT.DADES_NOM')}: <strong>{'data.contract.owner_name'}</strong>
            </li>
            <li style={styles.listitem}>
              {t('REPORT.DADES_DIRECCIO')}: <strong>{TCB.direccion}</strong>
            </li>
            <li style={styles.listitem}>
              {t('REPORT.DADES_CONTRACTE')}: <strong>{'data.contract.name'}</strong>
            </li>
          </ul>
        </div>
      </div>
      <div style={styles.dades}>
        {/* <h2 style={styles.title}> {t('REPORT.COBERTA_TITLE')}</h2>
        <ul style={styles.list}>
          <li style={styles.listitem}>
            {t('REPORT.COBERTA_ORIENTACIO')}:{' '}
            <strong>{UTIL.formatoValor('angulo', TCB.BaseSolar[0].inAcimut)}</strong>
          </li>
          <li style={styles.listitem}>
            {t('REPORT.COBERTA_INCLINACIO')}:{' '}
            <strong>{UTIL.formatoValor('angulo', TCB.BaseSolar[0].inclinacion)}</strong>
          </li>
          <li style={styles.listitem}>
            {t('REPORT.COBERTA_SUPERFICIE')}:{' '}
            <strong>{UTIL.formatoValor('superficie', TCB.BaseSolar[0].areaReal)}</strong>
          </li>
        </ul> */}
        <InstallationSummary></InstallationSummary>
      </div>

      <div style={styles.us}>
        <h2 style={styles.title}> {t('REPORT.US_TITLE')}</h2>
        <ul style={styles.list}>
          {/*
          <li style={styles.listitem}>
 
            {t('REPORT.US_POTENCIA')}:{' '}
            <div style={styles.listpowers}>
              {data.contract.powers.map((value, index) => (
                <span key={index}>
                  {'P' + (index + 1)}: <strong>{formatNumber(value)}kW</strong>
                </span>
              ))} 
            </div>
          </li>*/}
          {/* <li style={styles.listitem}>
            {t('REPORT.US_TARIFA')}: <strong>{TCB.nombreTarifaActiva}</strong>
          </li> */}
          <li style={styles.listitem}>
            {t('REPORT.US_ANUAL') + '  '}
            <div style={styles.listpowers}>
              {TCB.consumo.periodo.map((value, index) => (
                <span key={index}>
                  {'P' + (index + 1)}:{' '}
                  <strong>{UTIL.formatoValor('energia', value)}</strong>
                </span>
              ))}
            </div>
          </li>
          <li style={styles.listitem}>
            {'Consumo durante horas de sol' + '  '}
            <span>
              <strong>
                {UTIL.formatoValor('energia', TCB.balance.consumoDiurno) +
                  '( ' +
                  UTIL.formatoValor(
                    'porciento',
                    (TCB.balance.consumoDiurno / TCB.consumo.cTotalAnual) * 100,
                  ) +
                  ') del total'}
              </strong>
            </span>
          </li>

          <SummaryPreciosTarifa></SummaryPreciosTarifa>
          {/* <div style={styles.listpowers}>
              {data.scenario.loadByPeriodKwh &&
                Object.entries(data.scenario.loadByPeriodKwh)
                  .sort()
                  .map(([key, value]) => (
                    <span key={key}>
                      {key}: <strong>{formatNumber(value)}€/kWh </strong>
                    </span>
                  ))}
            </div> */}
        </ul>
      </div>
      {/* REVISAR: Aqui va el mapa */}
      <div style={styles.image} ref={mapElement}></div>
      {/* Fin prueba mapa*/}

      <div style={styles.plaques}>
        <img src={casa} width="auto" height="200px" />
      </div>
      <div style={styles.installacio}>
        <h2 style={styles.title}>{t('REPORT.INSTALACIO_TITLE')}</h2>
        <ul style={styles.list}>
          <li style={styles.listitem}>
            {t('REPORT.INSTALACIO_NOMBRE')}: <strong>{TCB.totalPaneles}</strong>
          </li>
          <li style={styles.listitem}>
            {t('REPORT.INSTALACIO_POTENCIA')}:{' '}
            <strong>
              {UTIL.formatoValor(
                'potencia',
                TCB.totalPaneles * TCB.parametros.potenciaPanelInicio,
              )}
            </strong>
          </li>
          <li style={styles.listitem}>
            {t('REPORT.INSTALACIO_TOTAL')}:{' '}
            <strong>{'formatNumber(data.scenario.peakPowerKw)'} kWh</strong>
          </li>
          <li style={styles.listitem}>
            {t('REPORT.INSTALACIO_ANUAL')}:{' '}
            <strong>{UTIL.formatoValor('energia', TCB.produccion.pTotalAnual)}</strong>
          </li>
          <li style={styles.listitem}>
            {t('REPORT.INSTALACIO_COST')}:{' '}
            <strong>
              {UTIL.formatoValor('dinero', TCB.economico.precioInstalacionCorregido)}
            </strong>
          </li>
        </ul>
      </div>
      <div style={styles.estudi}>
        <h2 style={styles.heading}>{t('REPORT.ESTUDI_TITLE')}</h2>
        <Grid
          container
          spacing={0}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <Grid item xs={6}>
            <Grid container>
              <Grid xs={5} item style={styles.tableHeading}>
                {t('REPORT.ESTUDI_AUTOGENERACIO')}
              </Grid>
              <Grid xs={3} item style={styles.tableCell}>
                {UTIL.formatoValor('energia', TCB.produccion.pTotalAnual)}
              </Grid>
              <Grid xs={3} item style={styles.tableCell}>
                {UTIL.formatoValor(
                  'dinero',
                  UTIL.suma(TCB.economico.ahorradoAutoconsumoMes),
                )}
              </Grid>
            </Grid>
            <Grid container>
              <Grid xs={5} item style={styles.tableHeading}>
                {t('REPORT.ESTUDI_EXCEDENT')}
              </Grid>
              <Grid xs={3} item style={styles.tableCell}>
                {UTIL.formatoValor('energia', TCB.balance.excedenteAnual)}
              </Grid>
              <Grid xs={3} item style={styles.tableCell}>
                {UTIL.formatoValor(
                  'dinero',
                  UTIL.suma(TCB.economico.consumoConPlacasMensualCorregido),
                )}
              </Grid>
            </Grid>
            <Grid container>
              <Grid xs={5} item style={styles.tableHeading}>
                {t('REPORT.ESTUDI_XARXA')}
              </Grid>
              <Grid xs={3} item style={styles.tableCell}>
                {UTIL.formatoValor('energia', TCB.balance.deficitAnual)}
              </Grid>
              <Grid xs={3} item style={styles.tableCell}>
                {UTIL.formatoValor(
                  'dinero',
                  -UTIL.suma(TCB.economico.compensadoMensualCorregido),
                )}
              </Grid>
            </Grid>
            <Grid container>
              <Grid xs={5} item style={styles.tableHeading}>
                <strong>{t('REPORT.ESTUDI_ESTALVI')}</strong>
              </Grid>
              <Grid xs={6} item style={styles.tableCell}>
                {UTIL.formatoValor('dinero', TCB.economico.ahorroAnual)}
              </Grid>
            </Grid>
            <Grid container>
              <Grid xs={5} item style={styles.tableHeading}>
                <strong>{t('REPORT.ESTUDI_RETORN')}</strong>
              </Grid>
              <Grid xs={6} item style={styles.tableCell}>
                {TCB.economico.periodoAmortizacion}
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={3}>
            <PieChart
              percentage={(TCB.balance.autoconsumo / TCB.produccion.pTotalAnual) * 100}
              color="#b9db42"
              label={t('REPORT.PIE_AUTOCONSUM_TITLE')}
              description={t('REPORT.PIE_AUTOCONSUM_DESCRIPTION')}
            />
          </Grid>
          <Grid item xs={3}>
            {/* Por ahora ponemos autosuficiencia pero no es  */}
            <PieChart
              percentage={(TCB.balance.autoconsumo / TCB.consumo.totalAnual) * 100}
              color="#b9db42"
              label={t('REPORT.PIE_AUTOSUFICIENCIA_TITLE')}
              description={t('REPORT.PIE_AUTOSUFICIENCIA_DESCRIPTION')}
            />
          </Grid>
        </Grid>
      </div>
      {/* <div style={styles.graphicContainer}>
        <h3>{t('REPORT.PERFIL_TITLE')}</h3>
        <GraphicPerfil
          profile={data.scenario.dailyLoadProfileKwh}
          autoproduction={data.scenario.dailyProductionProfileKwh}
        />*/}
      <div style={styles.graphicContainer}>
        <h3>{t('REPORT.PERFIL_TITLE')}</h3>
        <HourlyEnergyBalance></HourlyEnergyBalance>
      </div>
      {/*}
      <div style={styles.graphicConsumContainer}>
        <h3>{t('REPORT.PIE_AUTOSUFICIENCIA_TITLE')}</h3>
        <ReportConsumGraph
          autoconsum={data.scenario.monthlyProductionToLoadEuro}
          consum={data.scenario.monthlyGridToLoadEuro}
          excedencia={data.scenario.monthlyProductionToGridEuro}
        />
      </div> */}
      <div style={styles.graphicContainer}>
        <h3>{t('REPORT.PIE_AUTOSUFICIENCIA_TITLE')}</h3>
        <MonthSaving></MonthSaving>
      </div>
      <div style={styles.properespases}>
        <h2 style={styles.heading}>{t('REPORT.PROPERESPASES_TITLE')}</h2>
        <div style={styles.container}>
          <div style={styles.properespasesContainer}>
            <h3 style={styles.primerpas}>
              <img style={styles.primerpasImage} src={dona} />
              {t('REPORT.PROPERESPASES_DESCRIPTION')}{' '}
              <strong style={styles.primerpasBold}>
                {t('REPORT.PROPERESPASES_DESCRIPTION_STRONG')}
              </strong>{' '}
              {t('REPORT.PROPERESPASES_DESCRIPTION_FINAL')}
            </h3>
            <p style={styles.properespasesAmbImage}>
              <a href="https://www.somenergia.coop/ca/produeix-energia-renovable/autoproduccio/">
                {t('REPORT.PROPERESPASES_TEXT')}
              </a>
            </p>
            <p style={styles.properespasesText}>
              <a href="https://ca.support.somenergia.coop/article/781-com-funcionen-les-compres-col-lectives-d-autoproduccio-de-som-energia">
                {t('REPORT.PROPERESPASES_LINK')}{' '}
              </a>
            </p>
          </div>
          <div style={styles.properespasesContainer}>
            <h3 style={styles.segonpas}>
              {t('REPORT.PROPERESPASES_TITLE_SEGON')}{' '}
              <strong style={styles.segonpasBold}>
                {t('REPORT.PROPERESPASES_TITLE_SEGON_STRONG')}{' '}
              </strong>
            </h3>
            <p style={styles.properespasesText}>
              <a href="https://docs.google.com/document/d/1b2J3-gZeJlrv6DkWiYRhpqvflW_ACQZcsOL3if8IyF0/edit">
                {t('REPORT.PROPERESPASES_TEXT_SEGON')}{' '}
              </a>
              .
            </p>
            <p style={styles.properespasesText}>
              <a href="https://www.idae.es/companies/energetic-services">
                {t('REPORT.PROPERESPASES_TEXT_TERCER')}{' '}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
      <div style={styles.autogeneracio}>
        <h2 style={styles.heading}>{t('REPORT.AUTOGENERACIO_TITLE')} </h2>
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
                <a href="https://ca.support.somenergia.coop/article/778-que-es-l-autoproduccio">
                  {t('REPORT.AUTOGENERACIO_LINK_PRIMER')}{' '}
                </a>
              </li>
              <li style={styles.listitem}>
                <a href="https://ca.support.somenergia.coop/article/783-com-funciona-la-compensacio-simplificada-dexcedents">
                  {t('REPORT.AUTOGENERACIO_LINK_SEGON')}{' '}
                </a>
              </li>
              <li style={styles.listitem}>
                <a href="https://ca.support.somenergia.coop/article/929-autoproduccio-que-passa-si-marxa-la-llum">
                  {t('REPORT.AUTOGENERACIO_LINK_TERCER')}{' '}
                </a>
              </li>
              <li style={styles.listitem}>
                <a href="https://ca.support.somenergia.coop/category/777-autoproduccio">
                  {t('REPORT.AUTOGENERACIO_LINK_CUART')}{' '}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div style={styles.calculs}>
        <h2 style={styles.heading}>{t('REPORT.INFORME_TITLE')} </h2>
      </div>
      <div style={styles.calculsContainer}>
        <img src={placa} style={styles.calculsImage} />
        <h3 style={styles.calculsTitle}>{t('REPORT.GENERACIO_TITLE')} </h3>
        <p style={styles.calculsPrimera}>{t('REPORT.GENERACIO_DESCRIPTION')} </p>
        <p style={styles.calculsSegona}>{t('REPORT.GENERACIO_TEXT')} </p>
      </div>
      <div style={styles.calculsContainer}>
        <img src={bombeta} style={styles.calculsImage} />
        <h3 style={styles.calculsTitle}>{t('REPORT.TITLE')} </h3>
        <p style={styles.calculsPrimera}>{t('REPORT.DESCRIPTION')} </p>
        <p style={styles.calculsSegona}>{t('REPORT.TEXT')} </p>
      </div>
      <div style={styles.calculsContainer}>
        <img src={euro} style={styles.calculsImage} />
        <h3 style={styles.calculsTitle}>{t('REPORT.ECONOMIQUES_TITLE')} </h3>
        <p style={styles.calculsPrimera}>
          <a href="https://www.somenergia.coop/ca/tarifes-d-electricitat/">
            {t('REPORT.ECONOMIQUES_DESCRIPTION')}{' '}
          </a>{' '}
        </p>
        <p style={styles.calculsSegona}></p>
      </div>
      <div style={styles.peu}>
        <p style={styles.peuText}>{t('REPORT.PEU')} </p>
        <img src={logo} width="120" />
      </div>
    </div>
  )
})

export default PDF
