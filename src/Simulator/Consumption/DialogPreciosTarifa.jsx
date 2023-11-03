import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'

import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { MuiFileInput } from 'mui-file-input'

import TipoConsumo from '../classes/TipoConsumo'
import Tarifa from '../classes/Tarifa'
import TCB from '../classes/TCB'
import TCBContext from '../TCBContext'
import * as UTIL from '../classes/Utiles'

export default function DialogPreciosTarifa({ tarifa, onClose }) {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState()
  const [nombreTarifa, setNombreTarifa] = useState(tarifa)
  const { tipoConsumo, setTipoConsumo } = useContext(TCBContext)
  const [precios, setPrecios] = useState()

  const handleChange = (event) => {
    const { name, value } = event.target
    console.log(name, value)
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }))
  }

  const handleCancel = (event, reason) => {
    onClose()
  }

  async function handleClose(event, reason) {
    onClose()
  }

  console.log(tarifa)
  const entries = Object.entries(tarifa.precios)
  console.log(entries)

  return (
    <div>
      <DialogTitle>{t('TARIFA.DIALOG_PRECIOS', { tarifa: tarifa.nombre })}</DialogTitle>{' '}
      {/* PENDIENTE: definir mensaje */}
      <DialogContent>
        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}
        >
          <div>
            {entries.map((precioP, i) => (
              <>
                {precioP[1] !== 0 ? (
                  <Box>
                    <TextField
                      key={i++}
                      type="text"
                      value={precioP[1]}
                      onChange={(ev) => handleChange(ev.target)}
                      label={t('TARIFA.LABEL_' + precioP[0])}
                      name={precioP[0]}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="start"> €</InputAdornment>
                        ),
                        inputProps: {
                          style: { textAlign: 'right' },
                        },
                      }}
                    />
                  </Box>
                ) : (
                  ''
                )}
              </>
            ))}
          </div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleClose}>Ok</Button>
      </DialogActions>
    </div>
  )
}
