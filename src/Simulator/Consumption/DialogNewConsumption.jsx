import React, { useState, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Box, Button, MenuItem, FormControl, TextField } from '@mui/material'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { MuiFileInput } from 'mui-file-input'
import Alert from '../components/Alert'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import InputContext from '../InputContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import TipoConsumo from '../classes/TipoConsumo'

export default function DialogNewConsumption({ data, onClose }) {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState(data)
  const { tipoConsumo, setTipoConsumo } = useContext(InputContext)
  const REE = useRef()
  const [openDialog, closeDialog] = useDialog()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }))
  }

  const handleFile = (event) => {
    setFormData((prevFormData) => ({ ...prevFormData, ['ficheroCSV']: event }))
  }

  const handleCancel = (event) => {
    onClose(event)
  }

  async function handleClose(event) {
    const localEvent = event
    console.log(localEvent)

    if (
      formData.fuente === 'REE' &&
      (isNaN(Number(formData.consumoAnualREE)) || formData.consumoAnualREE === '')
    ) {
      openDialog({
        children: (
          <Alert
            contents={{
              title: 'Error definiendo fuente',
              description: t('CONSUMPTION.ERROR_DEFINIR_CONSUMO_REE'),
            }}
            onClose={() => {
              REE.current.focus()
              closeDialog()
            }}
          ></Alert>
        ),
      })
      return
    }
    if (formData.fuente !== 'REE' && formData.ficheroCSV === null) {
      openDialog({
        children: (
          <Alert
            contents={{
              title: 'Error definiendo fuente',
              description: t('CONSUMPTION.ERROR_FALTA_FICHERO_CONSUMO'),
            }}
            onClose={closeDialog}
          ></Alert>
        ),
      })
      return
    }

    TCB.requiereOptimizador = true
    TCB.cambioTipoConsumo = true

    let nuevoTipoConsumo = {
      idTipoConsumo: TCB.featIdUnico,
      nombreTipoConsumo: formData.nombreTipoConsumo,
      fuente: formData.fuente,
      nombreTarifa: TCB.nombreTarifaActiva,
    }

    if (nuevoTipoConsumo.fuente === 'REE') {
      nuevoTipoConsumo.consumoAnualREE = formData.consumoAnualREE
      nuevoTipoConsumo.ficheroCSV = await UTIL.getFileFromUrl('./datos/REE.csv')
      nuevoTipoConsumo.nombreFicheroCSV = ''
    } else {
      nuevoTipoConsumo.consumoAnualREE = ''
      nuevoTipoConsumo.ficheroCSV = formData.ficheroCSV
      nuevoTipoConsumo.nombreFicheroCSV = formData.ficheroCSV.name
    }
    let idxTC = TCB.TipoConsumo.push(new TipoConsumo(nuevoTipoConsumo))

    //Si se ha pasado un inputFile como argumento se carga
    if (formData.ficheroCSV !== '') {
      try {
        let cargaResPromise = new Promise((resolve) => {
          let res = cargaCSV(
            TCB.TipoConsumo[idxTC - 1],
            TCB.TipoConsumo[idxTC - 1].ficheroCSV,
            TCB.TipoConsumo[idxTC - 1].fuente,
          )
          resolve(res)
        })
        cargaResPromise
          .then((respuesta) => {
            if (respuesta) {
              nuevoTipoConsumo.cTotalAnual = TCB.TipoConsumo[idxTC - 1].cTotalAnual
              setTipoConsumo([...tipoConsumo, nuevoTipoConsumo])
              console.log(nuevoTipoConsumo)
            } else {
              console.log('cargaCSV devolvio error ', respuesta)
              TCB.TipoConsumo.splice(idxTC - 1, 1)
            }
          })
          .catch((error) => {
            console.log('cargaCSV catch ', error)
            TCB.TipoConsumo.splice(idxTC - 1, 1)
          })
      } catch (error) {
        alert(error)
        onClose({ graph: false })
      }
    }
    //If a new TipoConsumo is defined show graphs
    //REVISAR: en 117 la fecha es un obj y en 118 un string?
    console.log(nuevoTipoConsumo)
    console.log(TCB.TipoConsumo[idxTC - 1])
    console.log(typeof TCB.TipoConsumo[idxTC - 1].idxTable[0].fecha)
    onClose(event)
  }

  async function cargaCSV(objTipoConsumo, ficheroCSV, fuente) {
    TCB.cambioTipoConsumo = true
    objTipoConsumo.inicializa()

    objTipoConsumo.ficheroCSV = ficheroCSV
    let opciones

    if (fuente === 'REE') {
      opciones = {
        delimiter: ';',
        decimal: '.',
        fechaHdr: 'FECHA',
        horaHdr: 'HORA',
        valorArr: [TCB.tipoTarifa],
        factor: objTipoConsumo.consumoAnualREE,
      }
    } else {
      opciones = {
        delimiter: ';',
        decimal: ',',
        fechaHdr: 'FECHA',
        horaHdr: 'HORA',
        valorArr: ['CONSUMO', 'CONSUMO_KWH', 'AE_KWH'],
        factor: 1,
        metodo: 'PROMEDIO',
      }
    }

    //Si la fuente es DATADIS loadcsv debera cambiar el formato de fecha de AAAA/MM/DD a DD/MM/AAAA
    opciones.fechaSwp = fuente === 'DATADIS'

    let aStatus
    await objTipoConsumo
      .loadFromCSV(ficheroCSV, opciones)
      .then((r) => {
        aStatus = true
      })
      .catch((e) => {
        alert(e)
        aStatus = false
      })

    setFormData(data)
    console.log('CONSUMO: ' + objTipoConsumo.cMaximoAnual)
    return aStatus
  }

  console.log('OPEN CONSUMPTION DIALOG')
  return (
    <div>
      <DialogTitle>{t('CONSUMPTION.TITLE_DIALOG_NEW_CONSUMPTION')}</DialogTitle>{' '}
      {/* PENDIENTE: definir mensaje */}
      <DialogContent>
        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}
        >
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              required
              type="text"
              onChange={handleChange}
              label={t('TipoConsumo.LABEL_nombreTipoConsumo')}
              name="nombreTipoConsumo"
              value={formData.nombreTipoConsumo}
            />
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              sx={{ width: 200, height: 50 }}
              select
              id="tipo-simple-select"
              onChange={handleChange}
              label={t('TipoConsumo.LABEL_fuente')}
              name="fuente"
              defaultValue="CSV"
            >
              <MenuItem value={'CSV'}>CSV</MenuItem>
              <MenuItem value={'DATADIS'}>DATADIS</MenuItem>
              <MenuItem value={'REE'}>REE</MenuItem>
            </TextField>
          </FormControl>

          {formData.fuente !== 'REE' ? (
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <MuiFileInput
                id="ficheroCSV"
                inputProps={{ accept: '.csv' }}
                onChange={handleFile}
                label={t('TipoConsumo.LABEL_nombreFicheroCSV')}
                name="ficheroCSV"
                value={formData.ficheroCSV}
              />
            </FormControl>
          ) : (
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <TextField
                id="consumoAnualREE"
                ref={REE}
                type="text"
                onChange={handleChange}
                label={t('TipoConsumo.LABEL_consumoAnualREE')}
                name="consumoAnualREE"
                value={formData.consumoAnualREE}
              />
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button id="cancel" onClick={handleCancel}>
          Cancel
        </Button>
        <Button id="save" onClick={handleClose}>
          Ok
        </Button>
      </DialogActions>
    </div>
  )
}
