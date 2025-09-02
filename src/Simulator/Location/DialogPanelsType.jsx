import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

//Formik objects
import { Formik, Form } from 'formik'

// MUI objects
import {
  Box,
  Button,
  InputLabel,
  MenuItem,
  FormControlLabel,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { SLDRInputField } from '../../components/SLDRComponents'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function DialogPanelsType({ data, onClose }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()

  const ndxPanel = useRef(2)
  //const [tipoPanel, setTipoPanel] = useState(TCB.tipoPanelActivo)

  //20250303 - Correccion lista posibles tecnologias. Quitamos unknown porque PVGIS no retorna el campo P y se corrige CdTe que estab mal escrito
  const tecnologias = [
    { value: 'crystSi', text: 'Silicio Cristalino' },
    { value: 'CIS', text: 'CIS' },
    { value: 'CdTe', text: 'Cadmium Telluride' },
    // { value: 'Unknown', text: t('Instalacion.LABEL_tecnologiaDesconocida') },
  ]

  function cambiaTipoPanel(index, values, setValues) {
    console.log(index, TCB.tipoPaneles[index])
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
                {t('DIALOG_PANELS.DESCRIPTION')}
              </Typography>

              <FormControlLabel
                labelPlacement="start"
                control={
                  <SLDRInputField
                    sx={{
                      width: 200,
                      height: 40,
                      justifyContent: 'flex-end',
                      textAlign: 'center',
                      ml: 2,
                    }}
                    MUIType="Select"
                    value={ndxPanel.current}
                    name="tipoPanel"
                    object="Instalacion"
                    onChange={(event) =>
                      cambiaTipoPanel(event.target.value, values, setValues)
                    }
                  >
                    {TCB.tipoPaneles.map((panelType, index) => (
                      <MenuItem
                        key={index}
                        value={index}
                        sx={{ justifyContent: 'flex-end' }}
                      >
                        {panelType.nombre}
                      </MenuItem>
                    ))}
                  </SLDRInputField>
                }
                label={t('Instalacion.LABEL_tipoPanel')}
              />

              <Typography variant="body" sx={{ ml: '1rem', mt: '1rem' }}>
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
                  }}
                  MUIType="Select"
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
                  unit=" Wp"
                  value={UTIL.formatoValor('potenciaWp', values.potencia, '')}
                  sx={{ textAlign: 'right', width: '100%' }}
                ></SLDRInputField>

                <InputLabel htmlFor="ancho">{t('Instalacion.PROP.ancho')}</InputLabel>
                <SLDRInputField
                  id="ancho"
                  name="ancho"
                  object="Instalacion"
                  unit=" m"
                  value={UTIL.formatoValor('longitud', values.ancho, '')}
                  sx={{ textAlign: 'right', width: '100%' }}
                ></SLDRInputField>

                <InputLabel htmlFor="largo">{t('Instalacion.PROP.largo')}</InputLabel>
                <SLDRInputField
                  id="largo"
                  name="largo"
                  object="Instalacion"
                  unit=" m"
                  value={UTIL.formatoValor('longitud', values.largo, '')}
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
