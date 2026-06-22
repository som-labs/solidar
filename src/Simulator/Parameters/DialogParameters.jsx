import { Fragment } from 'react'
import { Formik, Form } from 'formik'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Grid,
  MenuItem,
  Box,
  Typography,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'

// REACT Solidar Components
import { SLDRInputField } from '../../components/SLDRComponents'

// Solidar objects
import * as UTIL from '../classes/Utiles'

export default function DialogParameters({ parameters, onClose }) {
  const { t, i18n } = useTranslation()

  //Convert object properties into array to be managed by map instruction
  let parametersVector = []
  for (let key in parameters) {
    parametersVector.push(key)
  }

  function validateFields(values) {
    let errors = {}
    for (let prop in values) {
      if (prop !== 'tecnologia') {
        if (!values[prop]) {
          errors[prop] = 'Requerido'
        } else {
          if (typeof values[prop] === 'string') {
            if (!UTIL.ValidateDecimal(i18n.language, values[prop]))
              errors[prop] = 'Formato incorrecto'
          }
        }
      }
    }
    return errors
  }

  return (
    <Formik
      initialValues={parameters}
      validate={validateFields}
      onSubmit={(values) => {
        console.log(JSON.stringify(values, null, 2))
        onClose('save', values)
      }}
    >
      {({ values }) => (
        <Form>
          <DialogTitle>{t('PARAMETROS.DIALOG_TITLE')}</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
              }}
            >
              <Typography
                variant="body"
                align="left"
                dangerouslySetInnerHTML={{
                  __html: t('PARAMETROS.DIALOG_DESCRIPTION'),
                }}
              />

              <Grid
                container
                spacing={3}
                sx={{ mb: '1rem', mt: '1rem' }}
                alignItems="center"
                justifyContent="space-evenly"
              >
                {parametersVector.map((key) => (
                  <Fragment key={key}>
                    <Grid item xs={5}>
                      <SLDRInputField
                        value={values[key].toLocaleString(i18n.language)}
                        object="PARAMETROS"
                        label={t('PARAMETROS.PROP.' + key)}
                        name={key}
                      ></SLDRInputField>
                    </Grid>
                  </Fragment>
                ))}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            {/* PENDIENTE: Decidir si ponemos un checkbox para guardar preferencias */}
            <Button onClick={() => onClose('cancel')}>{t('BASIC.LABEL_CANCEL')}</Button>
            <Button type="submit">{t('BASIC.LABEL_OK')}</Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  )
}
