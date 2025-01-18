import { useContext, Fragment } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { IconButton, Grid, Typography, Container, Box, Button } from '@mui/material'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
import AddBoxIcon from '@mui/icons-material/AddBox'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import UnitTypeBox from './UnitTypeBox'
import ZonaComunTypeBox from './ZonaComunTypeBox'
import { AlertContext } from '../components/Alert'
import HelpConsumption from '../Consumption/HelpConsumption'
// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'

//Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import Finca from '../classes/Finca'

//React global components
import { useDialog } from '../../components/DialogProvider'

export default function UnitsStep() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { inLineHelp } = useContext(AlertContext)
  const { fincas, setFincas, zonasComunes, setZonasComunes } =
    useContext(ConsumptionContext)

  const [openDialog, closeDialog] = useDialog()

  /**
   * Fields to be dumped / readed into csv file
   */
  const dumpFields = [
    'nombreTipoConsumo',
    'participa',
    'idFinca',
    'refcat',
    'planta',
    'puerta',
    'nombreFinca',
    'uso',
    'superficie',
    'participacion',
    'CUPS',
    'grupo',
  ]

  function help(level) {
    if (level === 1)
      openDialog({
        children: <HelpConsumption onClose={() => closeDialog()} />,
      })
  }

  const uniqueTypes = {}
  fincas.forEach((f) => {
    if (uniqueTypes[f.grupo]) {
      uniqueTypes[f.grupo]++
    } else {
      uniqueTypes[f.grupo] = 1
    }
  })

  function loadFincasFromCSV(event) {
    const file = event.target.files[0]
    if (file) {
      console.log('Selected file:', file.name)
    }

    let reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onerror = (err) => {
        alert(t('precios_MSG_errorLecturaFicheroImportacion') + '\nReader.error: ' + err)
        reject('...error de lectura')
      }

      reader.onload = (e) => {
        TCB.Finca = []
        setFincas([])

        const text = e.target.result
        const data = csvToArray(text, ';')
        for (let finca of data) {
          finca.participacion = parseFloat(finca.participacion)
          finca.participa = String(finca.participa).toLowerCase() === 'true'
          //Si la finca cargada tiene un tipo de consumo inexistente lo limpiamos
          if (finca.nombreTipoConsumo !== '') {
            if (
              !TCB.TipoConsumo.find(
                (tc) => tc.nombreTipoConsumo === finca.nombreTipoConsumo,
              )
            ) {
              finca.nombreTipoConsumo = ''
            }
          }
          Finca.actualiza_creaFinca(finca)
        }
        console.log('setting fincas in UNITS loadCSV')
        setFincas(TCB.Finca)
        TCB.requiereOptimizador = true
        console.log(TCB.Finca)
        //_tablaFinca.updateOrAddData(data)
      }
      reader.readAsText(file)
    })
  }

  function csvToArray(str, delimiter = ',') {
    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    try {
      var headers = str.slice(0, str.indexOf('\n')).split(delimiter)
      for (let i = 0; i < headers.length; i++)
        headers[i] = headers[i].trim().replace(/['"]+/g, '')
    } catch (e) {
      alert('Posible error de formato fichero de consumos\n' + str)
      return
    }
    UTIL.debugLog('Cabecera CSV:', headers)

    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const rows = str.slice(str.indexOf('\n') + 1).split('\n')
    let arr = []
    for (let i = 0; i < rows.length; i++) {
      let el = {}
      let valores = rows[i].split(delimiter)
      if (valores.length === headers.length) {
        for (let j = 0; j < headers.length; j++) {
          el[headers[j]] = valores[j].replace(/['"\r]+/g, '')
        }
        if (parseInt(el.idFinca) > TCB.idFinca) TCB.idFinca = parseInt(el.idFinca)
        arr.push(el)
      }
    }
    return arr
  }

  function creaZonaComun() {
    const _zonaComun = {
      nombreTipoConsumo: '',
      idZonaComun: (++TCB.idFinca).toFixed(0),
      CUPS: 'CUPS de ' + TCB.idFinca.toFixed(0),
      nombre: 'Zona Comun ' + TCB.idFinca,
      coefEnergia: 0,
      coefHucha: 0,
      cuotaHucha: 0,
    }

    TCB.ZonaComun.push(_zonaComun)
    TCB.requiereOptimizador = true
    TCB.requiereReparto = true
    setZonasComunes((prev) => [...prev, _zonaComun])
  }

  return (
    <Container>
      <Grid container rowSpacing={3}>
        <Grid item xs={12}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('UNITS.DESCRIPTION_1'),
            }}
          />
          <IconButton
            onClick={() => help(1)}
            size="small"
            style={{
              color: theme.palette.helpIcon.main,
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
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('UNITS.DESCRIPTION_2'),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: 2,
              gap: '15px',
            }}
          >
            {Object.keys(uniqueTypes).map((group) => (
              <Fragment key={group}>
                <Box sx={{ display: 'flex', width: '30%' }}>
                  <UnitTypeBox tipo={group}></UnitTypeBox>
                </Box>
              </Fragment>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('UNITS.DESCRIPTION_3'),
            }}
          />
          <IconButton
            onClick={creaZonaComun}
            size="small"
            style={{
              color: theme.palette.helpIcon.main,
              fontSize: 'inherit',
              verticalAlign: 'text-center',
              transform: 'scale(0.8)',
              padding: 0,
            }}
          >
            <AddBoxIcon />
          </IconButton>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: 2,
              gap: '15px',
            }}
          >
            {zonasComunes.map((zc, index) => (
              <Fragment key={index}>
                <Box sx={{ display: 'flex', width: '30%' }}>
                  <ZonaComunTypeBox zonaComun={zc}></ZonaComunTypeBox>
                </Box>
              </Fragment>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Button onClick={() => UTIL.dumpData('Fincas.csv', TCB.Finca, null, dumpFields)}>
        Exportar
      </Button>

      <div>
        <input
          accept="*/*"
          id="file-input"
          type="file"
          style={{ display: 'none' }}
          onChange={loadFincasFromCSV}
        />
        <label htmlFor="file-input">
          <Button variant="contained" color="primary" component="span">
            Importar
          </Button>
        </label>
      </div>
    </Container>
  )
}
