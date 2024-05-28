//import { useContext } from 'react'

//Formik
import { Formik, Field, Form, ErrorMessage } from 'formik'
import { useTranslation } from 'react-i18next'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
// MUI objects
import {
  Box,
  Button,
  MenuItem,
  Typography,
  FormControlLabel,
  FormControl,
  FormLabel,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material'
import { MuiFileInput } from 'mui-file-input'
import { useTheme } from '@mui/material/styles'
// REACT Solidar Components
//import { ConsumptionContext } from '../ConsumptionContext'
import { SLDRInputField, SLDRTooltip } from '../../components/SLDRComponents'

// Solidar objects
import * as UTIL from '../classes/Utiles'

import HelpDistribuidora from './HelpDistribuidora'

//React global components
import { useDialog } from '../../components/DialogProvider'

export default function DialogConsumption({ data, previous, onClose }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [openDialog, closeDialog] = useDialog()

  function help() {
    openDialog({
      children: <HelpDistribuidora onClose={() => closeDialog()} />,
    })
  }

  const handleFile = (event, setValues) => {
    setValues((prevValues) => ({ ...prevValues, ['ficheroCSV']: event }))
  }

  const handleFuente = (event, values, setValues) => {
    setValues((prev) => ({
      ...prev,
      ficheroCSV: '',
      fuente: event.target.value,
    }))
  }

  const handleCancel = () => {
    onClose('cancel')
  }

  async function handleClose(values) {
    onClose('save', values)
  }

  const validate = (values) => {
    const errors = {}
    if (!values.nombreTipoConsumo) {
      errors.nombreTipoConsumo = t('BASIC.LABEL_REQUIRED')
      return errors
    } else {
      previous.forEach((tc) => {
        if (
          tc.nombreTipoConsumo === values.nombreTipoConsumo &&
          tc.idTipoConsumo != values.idTipoConsumo
        ) {
          errors.nombreTipoConsumo = t('CONSUMPTION.ERROR_NOMBRE_TIPO_CONSUMO_DUPLICADO')
          return errors
        }
      })
    }

    if (values.fuente === '') {
      errors.fuente = t('BASIC.LABEL_REQUIRED')
    }

    if (values.fuente === 'REE') {
      if (values.consumoAnualREE === '' || values.consumoAnualREE === 0) {
        errors.consumoAnualREE = t('BASIC.LABEL_REQUIRED')
      } else {
        if (!UTIL.ValidateEntero(values.consumoAnualREE) || values.consumoAnualREE < 0) {
          errors.consumoAnualREE = t('CONSUMPTION.ERROR_DEFINIR_CONSUMO_REE')
        }
      }
    }
    if (values.fuente !== 'REE' && values.ficheroCSV === null) {
      errors.ficheroCSV = t('CONSUMPTION.ERROR_FALTA_FICHERO_CONSUMO')
    }
    return errors
  }

  return (
    <Formik
      initialValues={data}
      validate={validate}
      onSubmit={(values, event) => {
        handleClose(values, event)
      }}
    >
      {({ values, setValues }) => (
        <Form>
          <DialogTitle>{t('CONSUMPTION.TITLE_DIALOG_NEW_CONSUMPTION')}</DialogTitle>
          <DialogContent>
            <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
              <SLDRInputField
                name="nombreTipoConsumo"
                type="text"
                object="TipoConsumo"
                sx={{ flex: 1, textAlign: 'center' }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'left',
                gap: 2,
              }}
            >
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('TipoConsumo.DESCRIPTION_FUENTE_1'),
                }}
              />
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('TipoConsumo.DESCRIPTION_FUENTE_2'),
                }}
              />

              <Grid container sx={{ ml: 2 }}>
                <Grid item>
                  <Typography
                    variant="body"
                    dangerouslySetInnerHTML={{
                      __html: t('TipoConsumo.DESCRIPTION_FUENTE_SOM'),
                    }}
                  />
                </Grid>
                <Grid item>
                  <Typography
                    variant="body"
                    dangerouslySetInnerHTML={{
                      __html: t('TipoConsumo.DESCRIPTION_FUENTE_DISTRIBUIDORA'),
                    }}
                  />
                  <a href="#" onClick={() => help()}>
                    {t('TipoConsumo.LINK_FUENTE_DISTRIBUIDORA')}
                  </a>
                  {/* <IconButton
                    onClick={() => help()}
                    size="small"
                    style={{
                      color: theme.palette.helpIcon.main,
                      fontSize: 'inherit',
                      verticalAlign: 'text-center',
                      transform: 'scale(0.8)',
                      padding: 0,
                    }}
                  >
                    <HelpIcon />
                  </IconButton> */}
                </Grid>

                <Grid item>
                  {i18n.language.substring(0, 2) === 'ca' ? (
                    <Typography
                      variant="body"
                      dangerouslySetInnerHTML={{
                        __html: t('TipoConsumo.DESCRIPTION_FUENTE_DATADIS', {
                          lng: 'CAT',
                        }),
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body"
                      dangerouslySetInnerHTML={{
                        __html: t('TipoConsumo.DESCRIPTION_FUENTE_DATADIS', {
                          lng: 'ES',
                        }),
                      }}
                    />
                  )}
                </Grid>
              </Grid>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('TipoConsumo.DESCRIPTION_FUENTE_3'),
                }}
              />

              <Typography
                variant="body"
                sx={{ ml: 2 }}
                dangerouslySetInnerHTML={{
                  __html: t('TipoConsumo.DESCRIPTION_FUENTE_REE'),
                }}
              />

              <Box
                sx={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <FormControlLabel
                  labelPlacement="start"
                  padding={3}
                  control={
                    <SLDRInputField
                      sx={{ flex: 1, ml: '1rem', width: 390 }}
                      //sx={{ width: 350, height: 50, mr: 2 }}
                      select
                      value={values.fuente}
                      name="fuente"
                      object="TipoConsumo"
                      onChange={(event) => handleFuente(event, values, setValues)}
                    >
                      <MenuItem value={'SOM'}>Som Energía</MenuItem>
                      <MenuItem value={'CSV'}>Empresa distribuidora</MenuItem>
                      <MenuItem value={'DATADIS'}>DATADIS</MenuItem>
                      <MenuItem value={'REE'}>Perfil estándar (REE)</MenuItem>
                    </SLDRInputField>
                  }
                  label={t('TipoConsumo.PROP.fuente')}
                />

                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                  }}
                >
                  {values.fuente !== 'REE' && values.fuente !== '' && (
                    <>
                      <Field name="ficheroCSV">
                        {({ field }) => (
                          <FormControlLabel
                            labelPlacement="start"
                            control={
                              <Tooltip title={t('TipoConsumo.TOOLTIP.nombreFicheroCSV')}>
                                <MuiFileInput
                                  {...field}
                                  size="small"
                                  sx={{ flex: 1, ml: '1rem' }}
                                  inputProps={{ accept: '.csv' }}
                                  onChange={(event) => handleFile(event, setValues)}
                                  value={values.ficheroCSV}
                                />
                              </Tooltip>
                            }
                            label={t('TipoConsumo.PROP.nombreFicheroCSV')}
                          />
                        )}
                      </Field>
                      <ErrorMessage name="ficheroCSV">
                        {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
                      </ErrorMessage>
                    </>
                  )}
                  {values.fuente === 'REE' && (
                    <>
                      <FormControl>
                        <Grid
                          container
                          spacing={1}
                          alignItems={'center'}
                          justifyContent={'center'}
                        >
                          <Grid item>
                            <FormLabel>{t('TipoConsumo.PROP.consumoAnualREE')}</FormLabel>
                          </Grid>
                          <Grid item>
                            <SLDRInputField
                              type="text"
                              object="TipoConsumo"
                              unit="kWh"
                              name="consumoAnualREE"
                            />
                          </Grid>
                        </Grid>
                      </FormControl>
                    </>
                  )}
                </Box>
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
