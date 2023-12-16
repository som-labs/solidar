import { useTranslation } from 'react-i18next'
import { Formik, Field, Form, ErrorMessage } from 'formik'

// MUI objects
import {
  Box,
  Typography,
  Button,
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
  FormLabel,
  RadioGroup,
  Radio,
} from '@mui/material'
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize'
import { styled } from '@mui/material/styles'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useTheme } from '@mui/material/styles'

export default function DialogContact({ initialData, recoverFormData, onClose }) {
  const theme = useTheme()

  const TextareaAutosize = styled(BaseTextareaAutosize)(() => ({
    width: '100%',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize,
    lineHeight: '1.5',
    padding: '8px 12px',
    borderRadius: '8px',
    color: 'grey',
    border: '1px solid grey',
    boxShadow: '0px 2px 2px grey',
  }))

  const { t } = useTranslation()

  const validate = (values) => {
    const errors = {}
    if (values.nombre == '') {
      errors.nombre = 'Requerido'
    }

    if (!values.email) {
      errors.email = 'Requerido'
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(values.email)) errors.email = 'Invalid email address'
    }

    if (values.telefono) {
      //Pattern for Spanish phone numbers (landline or mobile)
      const patternSpain = /^(?:(?:\+|00)34)?[6-9]\d{8}$/
      //Check if the phone number matches the pattern
      if (!patternSpain.test(values.telefono))
        errors.telefono = 'No es un número de teléfono correcto, verificalo por favor'
    }

    if (values.mensaje == '') {
      errors.mensaje = 'Requerido'
    }

    return errors
  }

  return (
    <Formik
      initialValues={initialData}
      validate={validate}
      onSubmit={(values, actions) => {
        //actions.setSubmitting(true)
        console.log(JSON.stringify(values, null, 2))
        recoverFormData(values)
        //actions.setSubmitting(false)
      }}
    >
      <>
        <Form>
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

              <InputLabel htmlFor="nombre">{t('CONTACTO.LABEL_nombre')}</InputLabel>
              <Field
                name="nombre"
                as={Input}
                className="inputField"
                disableUnderline
              ></Field>
              <ErrorMessage name="nombre">
                {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
              </ErrorMessage>

              <InputLabel htmlFor="email">{t('CONTACTO.LABEL_email')}</InputLabel>
              <Field name="email" as={Input}></Field>
              <ErrorMessage name="email">
                {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
              </ErrorMessage>

              <InputLabel htmlFor="telefono">{t('CONTACTO.LABEL_telefono')}</InputLabel>
              <Field name="telefono" as={Input}></Field>
              <ErrorMessage name="telefono">
                {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
              </ErrorMessage>

              <FormControl></FormControl>
              <FormLabel id="demo-radio-buttons-group-label">
                {t('CONTACTO.LABEL_tipoPropuesta')}
              </FormLabel>
              <Field name="gridRadios">
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
                      label={t('CONTACTO.LABEL_error')}
                    />
                    <FormControlLabel
                      sx={{ ml: '3rem', mt: '-0.5rem' }}
                      control={<Radio />}
                      value="mejora"
                      label={t('CONTACTO.LABEL_mejora')}
                    />
                    <FormControlLabel
                      sx={{ ml: '3rem', mt: '-0.5rem' }}
                      control={<Radio />}
                      value="comentario"
                      label={t('CONTACTO.LABEL_comentario')}
                    />
                  </RadioGroup>
                )}
              </Field>

              <Typography
                variant="body"
                align="left"
                dangerouslySetInnerHTML={{
                  __html: t('CONTACTO.LABEL_advertencia'),
                }}
              />
              <FormLabel>
                <Field type="checkbox" name="mantenerContacto" />
                {t('CONTACTO.LABEL_respuesta')}
              </FormLabel>

              {/* //REVISAR: como hacer para que respete el font */}
              <ErrorMessage name="mensaje">
                {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
              </ErrorMessage>
              <Field name="mensaje">
                {({ field }) => (
                  <TextareaAutosize
                    {...field}
                    aria-label="mensaje"
                    placeholder={t('CONTACTO.LABEL_mensaje')}
                    minRows={3}
                    /*   style={{
                      width: '100%', // Adjust the width as needed
                      padding: '8px', // Adjust padding
                      // fontSize: '16px', // Adjust font size
                      resize: 'vertical', // Allow vertical resizing only
                      '&:focus': {
                        outline: 'none', // Remove outline on focus
                        border: '1px solid red', // Adjust border on focus
                      },
                    }} */
                  />
                )}
              </Field>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>{t('BASIC.LABEL_CANCEL')}</Button>
            <Button type="submit">{t('BASIC.LABEL_SEND')}</Button>
          </DialogActions>
        </Form>
      </>
    </Formik>
  )
}
