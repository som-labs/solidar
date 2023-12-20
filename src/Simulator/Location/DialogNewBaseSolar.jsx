import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Formik, Field, Form, ErrorMessage } from 'formik'

// OpenLayers objects
import { LineString } from 'ol/geom'
import Feature from 'ol/Feature'
import { Style } from 'ol/style'

// MUI objects
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import {
  OutlinedInput,
  FormControl,
  InputAdornment,
  FormHelperText,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import ApartmentIcon from '@mui/icons-material/Apartment'
import Switch from '@mui/material/Switch'
import { TextField, Input, InputLabel } from '@mui/material'

// REACT Solidar Components
import TCB from '../classes/TCB'
import coplanarSvgFile from '../datos/coplanar.svg'
import horizontalSvgFile from '../datos/horizontal.svg'
import { InputField } from '../../components/SLDRComponents'

// Solidar objects
import * as UTIL from '../classes/Utiles'

//PENDIENTE: convertir a formix
export default function DialogNewBaseSolar({ data, onClose }) {
  const { t } = useTranslation()

  const changeRoofType = (event, setValues, values) => {
    // //Al crear la geometria de la base hemos construido un acimut.
    // //El acimut se debe dibujar solo si la configuración no es de angulos optimos
    // //Cuando cambia la configuracion debemos hacer aparecer el acimut
    const componente = 'BaseSolar.acimut.' + data.idBaseSolar
    const featAcimut = TCB.origenDatosSolidar.getFeatureById(componente)

    switch (event.currentTarget.value) {
      case 'Coplanar':
        setValues((prev) => ({
          ...prev,
          roofType: 'Coplanar',
          inclinacionOptima: false,
          inAcimut: values.inAcimut,
          angulosOptimos: false,
          inclinacion: 0,
          requierePVGIS: true,
        }))
        featAcimut.setStyle(null)
        break
      case 'Horizontal':
        setValues((prev) => ({
          ...prev,
          roofType: 'Horizontal',
          inclinacionOptima: true,
          angulosOptimos: false,
          inclinacion: '', //El angulo optimo definitivo lo dará PVGIS pero para la peninsula esta entre 31º y 32º
          requierePVGIS: true,
        }))
        featAcimut.setStyle(null)
        break

      case 'Optimos': {
        setValues((prev) => ({
          ...prev,
          roofType: 'Optimos',
          angulosOptimos: true,
          inclinacionOptima: true,
          requierePVGIS: true,
        }))
        featAcimut.setStyle(new Style({}))
        break
      }
    }
  }

  const changeTilt = (event, setValues, values) => {
    setValues((prevValues) => ({
      ...prevValues,
      inclinacion: event.target.value,
      inclinacionOptima: false,
      angulosOptimos: false,
      requierePVGIS: true,
    }))
  }

  const setOptimalTilt = (event, setValues, values) => {
    setValues((prevValues) => ({
      ...prevValues,
      inclinacion: event.target.checked ? '' : 0,
      inclinacionOptima: event.target.checked,
      angulosOptimos: false,
      requierePVGIS: true,
    }))
  }

  const changeAzimut = (event, setValues, values) => {
    let featAcimut
    let geomAcimut
    let componente
    let angle

    componente = 'BaseSolar.acimut.' + values.idBaseSolar
    featAcimut = TCB.origenDatosSolidar.getFeatureById(componente)

    geomAcimut = featAcimut.getGeometry().clone()
    const azimutLength = geomAcimut.getLength()
    angle = (event.target.value / 180) * Math.PI

    componente = 'BaseSolar.area.' + values.idBaseSolar
    const featBase = TCB.origenDatosSolidar.getFeatureById(componente)
    const puntoAplicacion = featBase.getGeometry().getInteriorPoint().getCoordinates()

    let finAcimut = []
    finAcimut[0] = puntoAplicacion[0] + Math.sin(angle) * azimutLength
    finAcimut[1] = puntoAplicacion[1] - Math.cos(angle) * azimutLength
    geomAcimut = new LineString([puntoAplicacion, finAcimut])
    featAcimut.setGeometry(geomAcimut)

    setValues((prevValues) => ({
      ...prevValues,
      angulosOptimos: false,
      inAcimut: parseInt(event.target.value),
      requierePVGIS: true,
    }))
  }

  const handleCancel = () => {
    onClose('cancel')
  }

  async function handleClose(values) {
    console.log('CLOSING', values)
    // En caso de roofType coplanar pedimos confirmacion si la inclinacion es cero
    if (values.roofType === 'Coplanar' && values.inclinacion === 0) {
      if (!window.confirm(t('LOCATION.ERROR_COPLANAR_NOANGLE'))) {
        return
      }
    }
    onClose('save', values)
  }

  const validate = (values) => {
    const errors = {}
    let value

    if (values.nombreBaseSolar === '') {
      errors.nombre = 'Requerido'
    }

    if (values.roofType === 'Coplanar') {
      if (values.inclinacion === '' || values.inclinacion === 0) {
        errors.inclinacion = 'Requerido'
      }
      if (!UTIL.ValidateEntero(values.inclinacion)) {
        errors.inclinacion = 'Debe ser un número entero entre 0 y 90'
      } else {
        value = parseInt(values.inclinacion)
        if (value < 0 || value > 90) {
          errors.inclinacion = 'El valor de la inclinación debe estar entre 0º y 90º'
        }
      }
    }

    if (values.roofType === 'Horizontal') {
      if (!values.inclinacionOptima) {
        if (!UTIL.ValidateEntero(values.inclinacion)) {
          errors.inclinacion = 'Debe ser un número entero entre 0 y 90'
        } else {
          value = parseInt(values.inclinacion)
          if (values.inclinacion < 0 || values.inclinacion > 90) {
            errors.inclinacion = 'El valor de la inclinación debe estar entre 0º y 90º'
          }
        }
      }
    }

    if (!UTIL.ValidateEntero(values.inAcimut)) {
      errors.inAcimut = 'Debe ser un número entero entre -180º y 180º'
    } else {
      value = parseInt(values.inAcimut)
      if (value < -180 || value > 180) {
        errors.inAcimut = 'El valor del acimut debe estar entre -180º y 180º'
      }
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
          <DialogTitle>{t('LOCATION.TITLE_DIALOG_NEW_BASE')}</DialogTitle>{' '}
          <DialogContent>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', flex: 1 }}
            >
              <InputLabel htmlFor="nombreBaseSolar">
                {t('BaseSolar.LABEL_nombreBaseSolar')}
              </InputLabel>
              <Field name="nombreBaseSolar" as={Input} className="inputField" />
              <ErrorMessage name="nombreBaseSolar">
                {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
              </ErrorMessage>

              <Typography
                sx={{ mt: '1rem' }}
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('BaseSolar.DESCRIPTION_roofType'),
                }}
              />
              {/* PENDIENTE: hay que mejorar los iconos de los botones coplanar u horizontal */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  mt: '1rem',
                }}
              >
                <Button
                  variant={values.roofType === 'Coplanar' ? 'contained' : 'outlined'}
                  name="roofType"
                  value="Coplanar"
                  sx={{ flex: 1 }}
                  className={'roofTypeButton'}
                  onClick={(event) => changeRoofType(event, setValues, values)}
                >
                  <img src={coplanarSvgFile} width="70" height="70" alt="SVG Image" />
                  {/* <HomeIcon /> */}
                </Button>
                <Button
                  variant={values.roofType === 'Horizontal' ? 'contained' : 'outlined'}
                  name="roofType"
                  value="Horizontal"
                  sx={{ flex: 1 }}
                  className={'roofTypeButton'}
                  onClick={(event) => changeRoofType(event, setValues)}
                >
                  <img src={horizontalSvgFile} width="70" height="70" alt="SVG Image" />
                  {/* <ApartmentIcon /> */}
                </Button>
                <Button
                  variant={values.roofType === 'Optimos' ? 'contained' : 'outlined'}
                  name="roofType"
                  value="Optimos"
                  sx={{ flex: 1 }}
                  className={'roofTypeButton'}
                  onClick={(event) => changeRoofType(event, setValues)}
                >
                  {t('BaseSolar.LABEL_angulosOptimos')}
                </Button>
              </Box>

              {values.roofType !== 'Optimos' && (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      flex: 2,
                      flexDirection: 'column',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography variant="body" sx={{ mt: '1rem', mb: '1rem' }}>
                      {t('BaseSolar.DESCRIPTION_inclinacionTejado')}
                    </Typography>

                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <InputField
                        name="inclinacion"
                        unit=" º"
                        value={values.inclinacion}
                        onBlur={(event) => changeTilt(event, setValues)}
                        sx={{ flex: 0.4, mb: '1rem' }}
                      />
                    </Box>
                    {values.roofType === 'Horizontal' && (
                      <Field name="inclinacionOptima">
                        {({ field }) => (
                          <FormControlLabel
                            labelPlacement="end"
                            control={
                              <Checkbox
                                {...field}
                                checked={values.inclinacionOptima}
                                onChange={(event) => setOptimalTilt(event, setValues)}
                                color="primary"
                              />
                            }
                            label={t('BaseSolar.LABEL_inclinacionOptima')}
                          />
                        )}
                      </Field>
                    )}
                    <Typography variant="body" sx={{ mb: '1rem', mt: '1rem' }}>
                      {t('BaseSolar.DESCRIPTION_inAcimut')}
                    </Typography>
                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <InputField
                        name="inAcimut"
                        unit=" º"
                        value={values.inAcimut}
                        onBlur={(event) => changeAzimut(event, setValues, values)}
                        sx={{ flex: 0.4 }}
                      />
                    </Box>
                  </Box>
                </>
              )}

              {/* 
                    <Tooltip
                      title={t('BaseSolar.TOOLTIP_inclinacionOptima')}
                      placement="bottom"
                  >*/}
              {/* <InputLabel htmlFor="inclinacionOptima">
                      {t('BaseSolar.LABEL_inclinacionOptima')}
                    </InputLabel>
                    <Field
                      as={Switch} //"checkbox"
                      name="inclinacionOptima"
                      checked={values.inclinacionOptima}
                      onChange={(event) => setOptimalTilt(event, setValues)}
                      color="primary"
                    />
                  </Box>
                  <Box> */}
              {/*</Tooltip> */}
              {/* <ErrorMessage name="inclinacion">
                      {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
                    </ErrorMessage>

                    <Typography variant="body">
                      {t('BaseSolar.DESCRIPTION_inAcimut') + values.inAcimut}
                    </Typography>
                    <InputLabel htmlFor="inAcimut">
                      {t('BaseSolar.LABEL_inAcimut')}
                    </InputLabel> */}
              {/* <Tooltip title={t('BaseSolar.TOOLTIP_inAcimut')} placement="top"> */}

              {values.roofType === 'Optimos' && (
                <>
                  <Box>
                    <Typography variant="body">
                      {t('BaseSolar.DESCRIPTION_angulosOptimos')}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ mt: '1rem' }}>
            <Button onClick={handleCancel} id="cancel">
              {t('BASIC.LABEL_CANCEL')}
            </Button>
            <Button type="submit">{t('BASIC.LABEL_OK')}</Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  )
}
