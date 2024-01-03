import { useTranslation } from 'react-i18next'
import { Formik, Field, Form } from 'formik'

// MUI objects
import {
  Box,
  Typography,
  Button,
  FormControlLabel,
  InputLabel,
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material'
import { SLDRInputField } from '../../components/SLDRComponents'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'

export default function DialogContact({ initialData, recoverFormData, onClose }) {
  const { t } = useTranslation()

  const validateFields = (values) => {
    const errors = {}

    if (!values.nombre) {
      errors.nombre = 'Requerido'
      return errors
    }

    if (!values.email) {
      errors.email = 'Requerido'
      return errors
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(values.email)) {
        errors.email = 'Formato de email incorrecto'
        return errors
      }
    }

    //Pattern for Spanish phone numbers (landline or mobile)
    if (values.telefono) {
      const patternSpain = /^(?:(?:\+|00)34)?[6-9]\d{8}$/
      if (!patternSpain.test(values.telefono)) {
        errors.telefono = 'No es un número de teléfono correcto, verificalo por favor'
        return errors
      }
    }

    if (values.mensaje == '') {
      errors.mensaje = 'Requerido'
      return errors
    }
    return errors
  }

  return (
    <Formik
      initialValues={initialData}
      validate={validateFields}
      onSubmit={(values) => {
        recoverFormData(values)
      }}
    >
      <Form>
        <DialogTitle>{t('CONTACTO.DIALOG_TITLE')}</DialogTitle>{' '}
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'column',
              flex: 1,
              padding: '5px',
            }}
          >
            <Typography variant="body" align="center">
              {t('CONTACTO.DIALOG_DESCRIPTION')}
            </Typography>

            <InputLabel htmlFor="nombre">{t('CONTACTO.PROP.nombre')}</InputLabel>
            <SLDRInputField
              id="nombre"
              name="nombre"
              object="CONTACTO"
              sx={{ textAlign: 'left', width: '100%' }}
            ></SLDRInputField>

            <InputLabel htmlFor="email">{t('CONTACTO.PROP.email')}</InputLabel>
            <SLDRInputField
              name="email"
              object="CONTACTO"
              sx={{ textAlign: 'left', width: '100%' }}
            ></SLDRInputField>

            <InputLabel htmlFor="telefono">{t('CONTACTO.PROP.telefono')}</InputLabel>
            <SLDRInputField
              name="telefono"
              object="CONTACTO"
              sx={{ textAlign: 'left' }}
            ></SLDRInputField>

            <FormLabel id="demo-radio-buttons-group-label">
              {t('CONTACTO.PROP.tipoPropuesta')}
            </FormLabel>
            <Field name="gridRadios" object="CONTACTO">
              {({ field }) => (
                <RadioGroup
                  {...field}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  defaultValue="error"
                >
                  <FormControlLabel
                    sx={{ ml: '3rem' }}
                    control={<Radio />}
                    value="error"
                    label={t('CONTACTO.PROP.error')}
                  />
                  <FormControlLabel
                    sx={{ ml: '3rem', mt: '-0.5rem' }}
                    control={<Radio />}
                    value="mejora"
                    label={t('CONTACTO.PROP.mejora')}
                  />
                  <FormControlLabel
                    sx={{ ml: '3rem', mt: '-0.5rem' }}
                    control={<Radio />}
                    value="comentario"
                    label={t('CONTACTO.PROP.comentario')}
                  />
                </RadioGroup>
              )}
            </Field>

            <Typography
              variant="body"
              align="left"
              dangerouslySetInnerHTML={{
                __html: t('CONTACTO.PROP.advertencia'),
              }}
            />
            <FormLabel>
              <SLDRInputField
                MUIType="Checkbox"
                name="mantenerContacto"
                object="CONTACTO"
              />
              {t('CONTACTO.PROP.respuesta')}
            </FormLabel>

            <SLDRInputField
              name="mensaje"
              style={{
                textAlign: 'left',
                width: '100%',
                fontFamily: 'inherit',
                fontSize: 'inherit',
              }}
              MUIType="TextareaAutosize"
              aria-label="mensaje"
              placeholder={t('CONTACTO.PROP.mensaje')}
              minRows={3}
              object="CONTACTO"
            ></SLDRInputField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('BASIC.LABEL_CANCEL')}</Button>
          <Button type="submit">{t('BASIC.LABEL_SEND')}</Button>
        </DialogActions>
      </Form>
    </Formik>
  )
}
