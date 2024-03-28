import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'

// MUI objects
import { Box, Typography, Button, InputLabel, Tooltip } from '@mui/material'

import { SLDRInputField } from '../../components/SLDRComponents'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'

// Solidar objects
import TCB from '../classes/TCB'

export default function DialogProject({ recoverFormData, onClose }) {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)

  const defaultData = {
    nombreProyecto: undefined,
    emailContacto: undefined,
    telefonoContacto: undefined,
    fechaCreacion: TCB.fechaCreacion,
    descripcion: undefined,
  }
  let initialData = {}
  for (let key in defaultData) {
    initialData[key] = TCB[key]
  }

  const handleImportClick = () => {
    // Trigger click event of the hidden file input element
    fileInputRef.current.click()
  }

  const importProject = (event) => {
    const selectedFile = event.target.files[0]
    recoverFormData('importProject', selectedFile)
  }

  function exportProject(values) {
    recoverFormData('exportProject', values)
  }

  function cancelProject() {
    recoverFormData('cancel')
  }

  function saveProject(values) {
    recoverFormData('save', values)
  }

  const validate = (values) => {
    const errors = {}

    if (values.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      console.log(emailPattern.test(values.email))
      if (!emailPattern.test(values.email)) {
        errors.emailContacto = 'Formato de email incorrecto'
        return errors
      }
    }

    //Pattern for Spanish phone numbers (landline or mobile)
    if (values.telefonoContacto) {
      const patternSpain = /^(?:(?:\+|00)34)?[6-9]\d{8}$/
      if (!patternSpain.test(values.telefono)) {
        errors.telefonoContacto =
          'No es un número de teléfono correcto, verificalo por favor'
        return errors
      }
    }
    return errors
  }

  return (
    <Formik
      initialValues={initialData}
      validate={validate}
      onSubmit={(values) => {
        console.log('SUBMIT')
        saveProject(values)
      }}
    >
      {({ values }) => (
        <Form>
          <DialogTitle>{t('Proyecto.DIALOG_TITLE')}</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flexDirection: 'column',
                flex: 1,
                padding: '5px',
                mb: '2rem',
              }}
            >
              <Typography variant="body" align="center">
                {t('Proyecto.DIALOG_DESCRIPTION')}
              </Typography>

              <InputLabel htmlFor="nombreProyecto">
                {t('Proyecto.PROP.nombreProyecto')}
              </InputLabel>
              <SLDRInputField
                name="nombreProyecto"
                type="text"
                object="Proyecto"
                unit=""
                sx={{ textAlign: 'left', width: '100%' }}
              />

              <InputLabel htmlFor="emailContacto">
                {t('Proyecto.PROP.emailContacto')}
              </InputLabel>
              <SLDRInputField
                name="emailContacto"
                object="Proyecto"
                sx={{ textAlign: 'left', width: '100%' }}
              ></SLDRInputField>

              <InputLabel htmlFor="telefonoContacto">
                {t('Proyecto.PROP.telefonoContacto')}
              </InputLabel>
              <SLDRInputField
                name="telefonoContacto"
                object="Proyecto"
                sx={{ textAlign: 'left' }}
              ></SLDRInputField>

              <InputLabel htmlFor="fechaCreacion">
                {t('Proyecto.PROP.fechaCreacion')}
              </InputLabel>
              <SLDRInputField
                disabled
                name="fechaCreacion"
                object="Proyecto"
                sx={{ textAlign: 'left', mb: '1rem' }}
              ></SLDRInputField>
              <SLDRInputField
                name="descripcion"
                style={{
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
                MUIType="TextareaAutosize"
                aria-label="descripcion"
                placeholder={t('Proyecto.PROP.descripcion')}
                minRows={3}
                object="Proyecto"
              ></SLDRInputField>
            </Box>
            <Box
              style={{
                mt: '4rem',
                border: 1,
                display: 'flex',
                gap: 8,
                flexDirection: 'row',
              }}
            >
              {/* Hidden file input element */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".solimp"
                style={{ display: 'none' }}
                onChange={importProject}
              />

              {/* Material-UI button that triggers file input click */}
              <Tooltip title={t('Proyecto.TOOLTIP.importarProyecto')}>
                <Button
                  variant="contained"
                  fullWidth
                  color="primary"
                  size="large"
                  onClick={handleImportClick}
                >
                  {t('Proyecto.LABEL.importarProyecto')}
                </Button>
              </Tooltip>

              <Button
                variant="contained"
                fullWidth
                color="primary"
                size="large"
                onClick={() => exportProject(values)}
              >
                {t('Proyecto.LABEL.exportarProyecto')}
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelProject}>{t('BASIC.LABEL_CANCEL')}</Button>
            <Button type="submit">{t('BASIC.LABEL_OK')}</Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  )
}
