import { useContext, Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { IconButton, Grid, Typography, Container, Box, Button } from '@mui/material'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
import AddBoxIcon from '@mui/icons-material/AddBox'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import UnitTypeBox from './UnitTypeBox'
import ZonaComunTypeBox from './ZonaComunTypeBox'
import { useAlert } from '../../components/AlertProvider.jsx'
import HelpConsumption from '../Consumption/HelpConsumption'
// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'

//Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

//React global components
import { useDialog } from '../../components/DialogProvider'
import TipoConsumo from '../classes/TipoConsumo.js'

export default function UnitsStep() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { SLDRAlert } = useAlert()

  const {
    fincas,
    setFincas,
    zonasComunes,
    setZonasComunes,
    tipoConsumo,
    allocationGroup,
    setAllocationGroup,
    updateTCBUnitsFromState,
  } = useContext(ConsumptionContext)
  const [uniqueTypes, setUniqueTypes] = useState()
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

  useEffect(() => {
    //Copy fincas and zonas comunes in state to TCB
    updateTCBUnitsFromState()

    if (!allocationGroup) {
      //Build allocationGroup
      let uniqueGroup = {}

      //Get consumption from each Finca and add to allocationGroup by grupo value
      fincas.forEach((f) => {
        if (uniqueGroup[f.grupo]) {
          uniqueGroup[f.grupo].participacionT += f.participacion
          uniqueGroup[f.grupo].unidades++
          if (f.participa) {
            uniqueGroup[f.grupo].participacionP += f.participacion
            uniqueGroup[f.grupo].participes++
            uniqueGroup[f.grupo].consumo +=
              f.nombreTipoConsumo !== '' ? TipoConsumo.getTotal(f.nombreTipoConsumo) : 0
          }
        } else {
          uniqueGroup[f.grupo] = {
            nombre: f.grupo,
            criterio: 'PARTICIPACION',
            participacionT: f.participacion,
            unidades: 1,
            consumo: 0,
            produccion: 0,
          }
          if (f.participa) {
            uniqueGroup[f.grupo].participes = 1
            uniqueGroup[f.grupo].participacionP = f.participacion
            uniqueGroup[f.grupo].consumo +=
              f.nombreTipoConsumo !== '' ? TipoConsumo.getTotal(f.nombreTipoConsumo) : 0
          } else {
            uniqueGroup[f.grupo].participes = 0
            uniqueGroup[f.grupo].participacionP = 0
          }
        }
      })

      //Get consumption from each ZonaComun and add to allocationGroup by name
      zonasComunes.forEach((zc) => {
        uniqueGroup[zc.id] = {
          nombre: zc.nombre,
          unidades: 0,
          produccion: 0,
          consumo:
            zc.nombreTipoConsumo !== '' ? TipoConsumo.getTotal(zc.nombreTipoConsumo) : 0,
        }
      })

      setAllocationGroup(uniqueGroup)
    }
  }, [])

  function loadFincasFromCSV(event) {
    const file = event.target.files[0]
    if (file) {
      console.log('Selected file:', file.name)
    }

    let reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onerror = (err) => {
        SLDRAlert(
          'CARGA FINCAS',
          t('precios_MSG_errorLecturaFicheroImportacion') + '\nReader.error: ' + err,
          'Error',
        )
        reject('...error de lectura')
      }

      reader.onload = (e) => {
        const newFincas = []
        const text = e.target.result
        const data = csvToArray(text, ';')
        if (data.length > 0) {
          for (let finca of data) {
            finca.participacion = parseFloat(finca.participacion)
            finca.participa = String(finca.participa).toLowerCase() === 'true'
            //Si la finca cargada tiene un tipo de consumo inexistente lo limpiamos
            if (finca.nombreTipoConsumo !== '') {
              if (
                !tipoConsumo.find(
                  (tc) => tc.nombreTipoConsumo === finca.nombreTipoConsumo,
                )
              ) {
                finca.nombreTipoConsumo = ''
              }
            }
            newFincas.push(finca)
          }

          console.log('setting fincas in UNITS loadCSV')
          setFincas([...newFincas])
          TCB.cambioTipoConsumo = true
        }
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

    const fields = [
      { name: 'nombreFinca', required: true },
      { name: 'uso', required: true },
      { name: 'superficie', required: false },
      { name: 'participacion', required: true },
      { name: 'CUPS', required: false },
      { name: 'grupo', required: false },
      { name: 'nombreTipoConsumo', required: false },
      { name: 'participa', required: false },
      { name: 'idFinca', required: true },
      { name: 'refcat', required: false },
    ]

    for (let f in fields) {
      if (fields[f].required) {
        if (!headers.includes(fields[f].name)) {
          SLDRAlert(
            'IMPORTA FINCAS',
            t('UNITS.HEADER_FIELDS', { field: fields[f].name }),
            'Error',
          )
          return
        }
      }
    }
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
    const newZonaComun = {
      nombreTipoConsumo: '',
      id: (++TCB.idFinca).toFixed(0),
      CUPS: 'CUPS de ' + TCB.idFinca.toFixed(0),
      nombre: 'Zona Comun ' + TCB.idFinca,
      coefEnergia: 0,
      coefHucha: 0,
      cuotaHucha: 0,
    }

    //Initially al groups participate in the cost of all zonas
    const participacionTotal = fincas.reduce((p, f) => {
      return p + UTIL.returnFloat(f.participacion)
    }, 0)

    //Add new zona comun to allocationGroup
    setAllocationGroup((prev) => {
      const tmpAG = prev
      for (const grupo in tmpAG) {
        if (tmpAG[grupo].unidades > 0)
          //Is a DGC group, need to add new zonacomun to the list
          tmpAG[grupo].zonasComunes = {
            ...tmpAG[grupo].zonasComunes,
            [newZonaComun.id]: true,
          }
      }
      //Add newZonaComun to alloactionGroup
      tmpAG[newZonaComun.id] = {
        nombre: newZonaComun.nombre,
        participacionT: participacionTotal,
        consumo: 0,
        produccion: 0,
        unidades: 0,
      }
      return tmpAG
    })

    //Add new zona comun to state
    setZonasComunes((prev) => [...prev, newZonaComun])
    //Add new zona comun to TCB
    TCB.ZonaComun.push(newZonaComun)
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
              __html: t('UNITS.DESCRIPTION_2', {
                url: TCB.basePath + '/public/FincasSample.csv',
              }),
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
            {allocationGroup
              ? Object.keys(allocationGroup).map((group) => (
                  <Fragment key={group}>
                    {allocationGroup[group].unidades > 0 ? (
                      <Box sx={{ display: 'flex', width: '30%' }}>
                        <UnitTypeBox grupo={group}></UnitTypeBox>
                      </Box>
                    ) : (
                      ''
                    )}
                  </Fragment>
                ))
              : ''}
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

      <Button onClick={() => UTIL.dumpData('Fincas.csv', fincas, null, dumpFields)}>
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
