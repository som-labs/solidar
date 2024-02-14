import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

//Formik objects
import { Formik, Form } from 'formik'

// MUI objects
import {
  Box,
  Button,
  InputLabel,
  MenuItem,
  FormControl,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

// REACT Solidar Components
import { SLDRInputField } from '../../components/SLDRComponents'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function DialogBaseSolar({ data, onClose }) {
  const { t, i18n } = useTranslation()
  const ndxPanel = useRef(-1)
  const [tipoPanel, setTipoPanel] = useState(TCB.tipoPanelActivo)

  const tecnologias = [
    { value: 'crystSi', text: 'Crystaline silicon' },
    { value: 'CIS', text: 'CIS' },
    { value: 'Cadmium Telluride', text: 'cdTe' },
    { value: 'Unknown', text: t('Instalacion.LABEL_tecnologiaDesconocida') },
  ]

  useEffect(() => {
    //setNdxPanel(0)
    setTipoPanel(data)
  }, [])

  function cambiaTipoPanel(event, values, setValues) {
    const newValues = TCB.tipoPaneles[event.target.value]
    setValues((prevValues) => ({
      ...prevValues,
      ...newValues,
    }))
    ndxPanel.current = event.target.value
  }

  const handleCancel = () => {
    onClose('cancel')
  }

  function handleClose(values) {
    onClose('save', values)
  }

  function validateFields(values) {
    let errors = {}

    for (const prop in values) {
      if (prop !== 'tecnologia' && prop !== 'nombre') {
        if (values[prop] === '') {
          errors[prop] = 'Requerido'
        } else {
          if (typeof values[prop] === 'string') {
            if (!UTIL.ValidateDecimal(i18n.language, values[prop])) {
              errors[prop] = 'Formato incorrecto'
            } else if (values[prop] <= 0) {
              errors[prop] = 'Debe ser mayor que cero'
            } else {
              TCB.tipoPanelActivo[prop] = values[prop]
            }
          }
        }
      }
    }
    return errors
  }

  return (
    <Formik
      initialValues={data}
      validate={validateFields}
      onSubmit={(values, event) => {
        handleClose(values, event)
      }}
    >
      {({ values, setValues }) => (
        <Form>
          <DialogTitle>{t('DIALOG_PANELS.TITLE')}</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="body" sx={{ ml: '1rem' }}>
                {t('DIALOG_PANELS.DESCRIPTION')}
              </Typography>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <SLDRInputField
                  sx={{ width: 200, height: 50, textAlign: 'center', mb: '1rem' }}
                  select
                  label={t('Instalacion.PROP.tipoPanel')}
                  onChange={(e) => cambiaTipoPanel(e, values, setValues)}
                  name="tipoPanel"
                  value={ndxPanel.current}
                  object="Instalacion"
                >
                  <MenuItem key={-1} value={-1}>
                    {'Select value'}
                  </MenuItem>
                  {TCB.tipoPaneles.map((panelType, index) => (
                    <MenuItem key={index} value={index}>
                      {panelType.nombre}
                    </MenuItem>
                  ))}
                </SLDRInputField>
              </FormControl>
              <Typography variant="body" sx={{ ml: '1rem' }}>
                {t('DIALOG_PANELS.OTHERS')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  flexDirection: 'column',
                  flex: 1,
                  padding: '5px',
                }}
              >
                <InputLabel htmlFor="tecnologia">
                  {t('Instalacion.PROP.tecnologia')}
                </InputLabel>
                <SLDRInputField
                  toolTipPlacement="right"
                  sx={{
                    height: 50,
                    textAlign: 'center',
                    mb: '1rem',
                  }}
                  select
                  object="Instalacion"
                  name="tecnologia"
                  value={values.tecnologia}
                >
                  {tecnologias.map((tecnologia, index) => (
                    <MenuItem key={index} value={tecnologia.value}>
                      {tecnologia.text}
                    </MenuItem>
                  ))}
                </SLDRInputField>

                <InputLabel htmlFor="potencia">
                  {t('Instalacion.PROP.potencia')}
                </InputLabel>
                <SLDRInputField
                  id="potencia"
                  name="potencia"
                  object="Instalacion"
                  unit=" kWp"
                  sx={{ textAlign: 'right', width: '100%' }}
                ></SLDRInputField>

                <InputLabel htmlFor="ancho">{t('Instalacion.PROP.ancho')}</InputLabel>
                <SLDRInputField
                  id="ancho"
                  name="ancho"
                  object="Instalacion"
                  unit=" m"
                  sx={{ textAlign: 'right', width: '100%' }}
                ></SLDRInputField>

                <InputLabel htmlFor="largo">{t('Instalacion.PROP.largo')}</InputLabel>
                <SLDRInputField
                  id="largo"
                  name="largo"
                  object="Instalacion"
                  unit=" m"
                  sx={{ textAlign: 'right', width: '100%' }}
                ></SLDRInputField>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ mt: '1rem' }}>
            <Button onClick={() => handleCancel(values)}>
              {t('BASIC.LABEL_CANCEL')}
            </Button>
            <Button type="submit">{t('BASIC.LABEL_OK')}</Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  )
}
