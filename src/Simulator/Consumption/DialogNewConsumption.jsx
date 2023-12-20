import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Box, Button, MenuItem, FormControl, TextField } from '@mui/material'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { MuiFileInput } from 'mui-file-input'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'

// Solidar objects
import BasicAlert from '../components/BasicAlert'
//PENDIENTE: convertir a formix
export default function DialogNewConsumption({ data, onClose }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState(data)
  const REE = useRef()
  const [openDialog, closeDialog] = useDialog()

  const showAlert = (title, message, type) => {
    openDialog({
      children: (
        <BasicAlert
          title={title}
          contents={message}
          type={type}
          onClose={() => closeDialog()}
        ></BasicAlert>
      ),
    })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }))
  }

  const handleFile = (event) => {
    setFormData((prevFormData) => ({ ...prevFormData, ['ficheroCSV']: event }))
  }

  const handleCancel = (event) => {
    onClose(event.target.id)
  }

  async function handleClose(event) {
    if (
      formData.fuente === 'REE' &&
      (isNaN(Number(formData.consumoAnualREE)) || formData.consumoAnualREE === '')
    ) {
      showAlert(
        'Error definiendo fuente',
        t('CONSUMPTION.ERROR_DEFINIR_CONSUMO_REE'),
        'error',
      )
      return
    }

    if (formData.fuente !== 'REE' && formData.ficheroCSV === null) {
      showAlert(
        'Error definiendo fuente',
        t('CONSUMPTION.ERROR_FALTA_FICHERO_CONSUMO'),
        'error',
      )
      return
    }
    onClose(event.target.id, formData)
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
        <Button onClick={handleCancel} id="cancel">
          {t('BASIC.LABEL_CANCEL')}
        </Button>
        <Button onClick={handleClose} id="save">
          {t('BASIC.LABEL_OK')}
        </Button>
      </DialogActions>
    </div>
  )
}
