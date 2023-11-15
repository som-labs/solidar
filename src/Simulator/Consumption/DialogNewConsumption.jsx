import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import { MuiFileInput } from 'mui-file-input'

// REACT Solidar Components
import TCBContext from '../TCBContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import TipoConsumo from '../classes/TipoConsumo'
import Tarifa from '../classes/Tarifa'

export default function DialogNewConsumption({ data, onClose }) {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState(data)
  const { tipoConsumo, setTipoConsumo } = useContext(TCBContext)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }))
  }

  const handleFile = (event) => {
    setFormData((prevFormData) => ({ ...prevFormData, ['ficheroCSV']: event }))
  }

  const handleCancel = () => {
    onClose(false)
  }

  async function handleClose() {
    if (
      formData.fuente === 'REE' &&
      (isNaN(Number(formData.consumoAnualREE)) || formData.consumoAnualREE === '')
    ) {
      alert(t('CONSUMPTION.ERROR_DEFINIR_CONSUMO_REE'))
      return
    }
    if (formData.fuente !== 'REE' && formData.ficheroCSV === null) {
      alert(t('CONSUMPTION.ERROR_FALTA_FICHERO_CONSUMO'))
      return
    }

    TCB.requiereOptimizador = true
    TCB.cambioTipoConsumo = true

    let nuevoTipoConsumo = {
      idTipoConsumo: TCB.featIdUnico,
      nombreTipoConsumo: formData.nombreTipoConsumo,
      fuente: formData.fuente,
      nombreTarifa: TCB.nombreTarifaActiva,
      territorio: TCB.territorio,
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
    TCB.TipoConsumo[idxTC - 1].tarifa = new Tarifa(
      nuevoTipoConsumo.nombreTarifa,
      nuevoTipoConsumo.territorio,
    )

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
        onClose(false)
      }
    }
    //If a new TipoConsumo is defined show graphs
    onClose(true, TCB.TipoConsumo[idxTC - 1])
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
        valorArr: [objTipoConsumo.tarifa.nombreTarifa],
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
    return aStatus
  }

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
              label={t('CONSUMPTION.LABEL_NOMBRE_TIPO_CONSUMO')}
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
              label={t('CONSUMPTION.LABEL_FUENTE')}
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
                label={t('CONSUMPTION.LABEL_NOMBRE_FICHERO_CSV')}
                name="ficheroCSV"
                value={formData.ficheroCSV}
              />
            </FormControl>
          ) : (
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <TextField
                id="consumoAnualREE"
                type="text"
                onChange={handleChange}
                label={t('CONSUMPTION.LABEL_CONSUMO_ANUAL_REE')}
                name="consumoAnualREE"
                value={formData.consumoAnualREE}
              />
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleClose}>Ok</Button>
      </DialogActions>
    </div>
  )
}
