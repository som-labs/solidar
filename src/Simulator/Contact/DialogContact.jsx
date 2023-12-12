import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Box,
  Typography,
  Button,
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
  Checkbox,
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material'
import { TextareaAutosize } from '@mui/base/TextareaAutosize'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'

export default function DialogContact({ initialData, recoverFormData, onClose }) {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState(initialData)

  useEffect(() => {
    console.log(initialData)
    setFormData(initialData)
  }, [])

  const handleInputChange = (e) => {
    let { name, value } = e.target
    if (name === 'mantenerContacto') value = e.target.checked
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleEnd = (e) => {
    e.preventDefault()
    console.log('SENDINGDATABACK', e.target.id, formData)
    recoverFormData(e.target.id, formData)
    onClose(e.target.id)
  }

  return (
    <>
      <form id="save" onSubmit={handleEnd}>
        <DialogTitle>{t('CONTACTO.DIALOG_TITLE')}</DialogTitle>{' '}
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            <Typography variant="body" align="center">
              {t('CONTACTO.LABEL_descripcion')}
            </Typography>

            <FormControl variant="standard">
              <InputLabel htmlFor="nombre">{t('CONTACTO.LABEL_nombre')}</InputLabel>
              <Input
                required
                id="nombre"
                name="nombre"
                aria-describedby="tt_nombre"
                value={formData.nombre}
                onChange={handleInputChange}
              />
              {/* <FormHelperText id="tt_nombre">{t('contacto_LBL_nombre')}</FormHelperText> */}
            </FormControl>
            <FormControl variant="standard">
              <InputLabel htmlFor="email">{t('CONTACTO.LABEL_email')}</InputLabel>
              <Input
                required
                id="email"
                name="email"
                type="email"
                aria-describedby="tt_email"
                value={formData.email}
                onChange={handleInputChange}
              />
              {/* <FormHelperText id="tt_email">{t('contacto_LBL_email')}</FormHelperText> */}
            </FormControl>

            <FormControl variant="standard">
              <InputLabel htmlFor="telefono">{t('CONTACTO.LABEL_telefono')}</InputLabel>
              <Input
                id="telefono"
                name="telefono"
                type="phone"
                aria-describedby="tt_telefono"
                value={formData.telefono}
                onChange={handleInputChange}
              />
              {/* <FormHelperText id="tt_email">{t('contacto_LBL_telefono')}</FormHelperText> */}
            </FormControl>
            <FormControl sx={{ mt: '1rem' }}>
              <FormLabel id="demo-radio-buttons-group-label">
                {t('CONTACTO.LABEL_tipoPropuesta')}
              </FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="error"
                name="gridRadios"
                onChange={handleInputChange}
                value={formData.gridRadios}
              >
                <FormControlLabel
                  sx={{ ml: '3rem' }}
                  value="error"
                  control={<Radio />}
                  label={t('CONTACTO.LABEL_error')}
                />
                <FormControlLabel
                  sx={{ ml: '3rem', mt: '-0.5rem' }}
                  value="mejora"
                  control={<Radio />}
                  label={t('CONTACTO.LABEL_mejora')}
                />
                <FormControlLabel
                  sx={{ ml: '3rem', mt: '-0.5rem' }}
                  value="comentario"
                  control={<Radio />}
                  label={t('CONTACTO.LABEL_comentario')}
                />
              </RadioGroup>
            </FormControl>
            <Typography
              variant="body"
              align="left"
              dangerouslySetInnerHTML={{
                __html: t('CONTACTO.LABEL_advertencia'),
              }}
            />
            <FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    name="mantenerContacto"
                    checked={formData.mantenerContacto}
                    onChange={handleInputChange}
                  />
                }
                label={t('CONTACTO.LABEL_respuesta')}
              />
            </FormControl>
            <TextareaAutosize
              required
              value={formData.mensaje}
              aria-label="minimum height"
              minRows={3}
              name="mensaje"
              onChange={handleInputChange}
              placeholder={t('CONTACTO.LABEL_mensaje')}
              sx={{
                width: '100%', // Adjust the width as needed
                padding: '8px', // Adjust padding
                fontSize: '16px', // Adjust font size
                border: '1px solid', // Adjust border
                borderRadius: '8px', // Adjust border radius
                resize: 'vertical', // Allow vertical resizing only
                '&:focus': {
                  outline: 'none', // Remove outline on focus
                  border: '1px solid blue', // Adjust border on focus
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button id="cancel" onClick={handleEnd}>
            {t('BASIC.LABEL_CANCEL')}
          </Button>
          <Button id="save" type="submit">
            {t('BASIC.LABEL_SEND')}
          </Button>
        </DialogActions>
      </form>
    </>
  )
}
