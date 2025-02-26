import { useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'

//Formik objects
import { Formik, Form } from 'formik'

// MUI objects
import {
  Box,
  Button,
  InputLabel,
  MenuItem,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
} from '@mui/material'

// REACT Solidar Global Components
import { SLDRInputField } from '../../components/SLDRComponents'

// REACT Solidar contexts
import { BasesContext } from '../BasesContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
/**
 * Permite definir el tipo de panel activo y configurar un tipo de panel de usuario
 * Los paneles tipo estan en TCB.TipoPaneles
 * El tipo de panel de usuario se define en TCB.TipoPaneles[0]
 *
 * @param {*} param0
 * @returns
 */
export default function DialogPanelsType({ onClose }) {
  const { t, i18n } = useTranslation()
  const { tipoPanelActivo } = useContext(BasesContext)

  const ndxPanel = useRef(tipoPanelActivo.id)
  const data = TCB.tipoPaneles[tipoPanelActivo.id]

  const tecnologias = [
    { value: 'crystSi', text: 'Silicio Cristalino' },
    { value: 'CIS', text: 'CIS' },
    { value: 'Cadmium Telluride', text: 'CdTe' },
    { value: 'Unknown', text: t('Instalacion.LABEL_tecnologiaDesconocida') },
  ]

  function cambiaTipoPanel(index, values, setValues) {
    ndxPanel.current = index
    const newValues = TCB.tipoPaneles[index]
    setValues((prevValues) => ({
      ...prevValues,
      ...newValues,
    }))
  }

  const handleCancel = () => {
    onClose('cancel')
  }

  function handleClose(values) {
    if (ndxPanel.current === 0) TCB.tipoPaneles[0] = values
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
              <Typography variant="body" sx={{ ml: '1rem', mb: '1rem' }}>
                {t('DIALOG_PANELS.DESCRIPTION_1')}
              </Typography>

              <Grid container alignItems="center">
                <Grid item xs={6} style={{ textAlign: 'right' }}>
                  <InputLabel htmlFor="tipoPanel">
                    {t('Instalacion.PROP.tecnologia')}
                  </InputLabel>
                </Grid>
                <Grid item xs={6}>
                  <SLDRInputField
                    fullWidth
                    size="small"
                    sx={{
                      justifyContent: 'flex-end',
                    }}
                    select
                    value={ndxPanel.current}
                    name="tipoPanel"
                    object="Instalacion"
                    onChange={(event) =>
                      cambiaTipoPanel(event.target.value, values, setValues)
                    }
                  >
                    {TCB.tipoPaneles.map((panel) => (
                      <MenuItem
                        key={panel.id}
                        value={panel.id}
                        sx={{ justifyContent: 'flex-end' }}
                      >
                        {panel.nombre}
                      </MenuItem>
                    ))}
                  </SLDRInputField>
                </Grid>
              </Grid>

              <Typography variant="body" sx={{ ml: '1rem', mt: '1rem' }}>
                {t('DIALOG_PANELS.OTHERS')}
              </Typography>
            </Box>

            <Grid container alignItems="center">
              <Grid item xs={6} style={{ textAlign: 'right' }}>
                <InputLabel htmlFor="tecnologia">
                  {t('Instalacion.PROP.tecnologia')}
                </InputLabel>
              </Grid>
              <Grid item xs={6}>
                <SLDRInputField
                  toolTipPlacement="right"
                  fullWidth
                  size="small"
                  sx={{
                    textAlign: 'center',
                  }}
                  select
                  object="Instalacion"
                  name="tecnologia"
                  value={values.tecnologia}
                  disabled={ndxPanel.current !== 0}
                >
                  {tecnologias.map((tecnologia, index) => (
                    <MenuItem key={index} value={tecnologia.value}>
                      {tecnologia.text}
                    </MenuItem>
                  ))}
                </SLDRInputField>
              </Grid>
              <Grid item xs={6} style={{ textAlign: 'right' }}>
                <InputLabel htmlFor="potencia">
                  {t('Instalacion.PROP.potencia')}
                </InputLabel>
              </Grid>
              <Grid item xs={6}>
                <SLDRInputField
                  fullWidth
                  size="small"
                  id="potencia"
                  name="potencia"
                  object="Instalacion"
                  unit=" Wp"
                  value={UTIL.formatoValor('potenciaWp', values.potencia, '')}
                  disabled={ndxPanel.current !== 0}
                  sx={{ textAlign: 'right' }}
                ></SLDRInputField>
              </Grid>
              <Grid item xs={6} style={{ textAlign: 'right' }}>
                <InputLabel htmlFor="ancho">{t('Instalacion.PROP.ancho')}</InputLabel>
              </Grid>
              <Grid item xs={6}>
                <SLDRInputField
                  fullWidth
                  size="small"
                  id="ancho"
                  name="ancho"
                  object="Instalacion"
                  unit=" m"
                  value={UTIL.formatoValor('longitud', values.ancho, '')}
                  disabled={ndxPanel.current !== 0}
                  sx={{ textAlign: 'right' }}
                ></SLDRInputField>
              </Grid>
              <Grid item xs={6} style={{ textAlign: 'right' }}>
                <InputLabel htmlFor="largo">{t('Instalacion.PROP.largo')}</InputLabel>
              </Grid>
              <Grid item xs={6}>
                <SLDRInputField
                  fullWidth
                  size="small"
                  id="largo"
                  name="largo"
                  object="Instalacion"
                  unit=" m"
                  value={UTIL.formatoValor('longitud', values.largo, '')}
                  disabled={ndxPanel.current !== 0}
                  sx={{ textAlign: 'right' }}
                ></SLDRInputField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
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
