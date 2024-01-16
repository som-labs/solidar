import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

//Formik objects
import { Formik, Form } from 'formik'

// OpenLayers objects
import { LineString } from 'ol/geom'
import { Style } from 'ol/style'

// MUI objects
import { Box, Button, Typography, Grid } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'

// REACT Solidar Components
import coplanarSvgFile from '../datos/coplanar.svg'
import horizontalSvgFile from '../datos/horizontal.svg'
import { SLDRInputField } from '../../components/SLDRComponents'

// Solidar global modules
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

/**
 * A React component to be used in conjunction with useDialog for create or edit a BaseSolar
 * @component
 * @property {string} cause Can be ['save'-> buton , 'cancel' -> buton, Pointevent -> backdropClick]
 * @param {Object} data - The properties of the BaseSolar component
 * @param {function} onClose - Function to be called when finishing edit. formData is the data after manipulation.
 * @returns {JSX.Element} The rendered JSX element.
 * @example
 *   openDialog({
 *     children: (
 *       <DialogBaseSolar
 *         data={nuevaBaseSolar}
 *         onClose={(cause, formData) => endDialog(cause, formData)}
 *       />
 *     ),
 *   })
 */

export default function DialogBaseSolar({ data, onClose }) {
  const { t } = useTranslation()
  /*
  roofType state is needed for UseEffect that is needed to recover canvas each time the user 
  goes through the Optimos option where canvas is not rendered.
  */
  const [roofType, setRoofType] = useState(data.roofType)
  const canvasRef = useRef()
  const inclinacionDefault = 20

  useEffect(() => {
    const canvas = canvasRef.current
    if (roofType !== 'Optimo') {
      drawHouse(canvas, inclinacionDefault, roofType)
    }
  }, [roofType])

  const drawHouse = (canvas, inclinacion, roofType) => {
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    const alfaRad = (inclinacion / 180) * Math.PI
    const w = canvasRef.current.width
    const h = canvasRef.current.height
    let c, d, t

    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.fillStyle = 'rgb(218,137,16)' //Same color then house in coplanar.svg
    if (roofType === 'Coplanar') {
      if ((w / 2) * Math.tan(alfaRad) < h / 2) {
        d = w / 2
        c = d * Math.tan(alfaRad)
        t = h / 2
      } else {
        c = h / 2
        d = c / Math.tan(alfaRad)
        t = c
      }
      ctx.fillRect(w / 2 - d, t, 2 * d, h - t)
      ctx.strokeRect(w / 2 - d, t, 2 * d, h - t)
      ctx.stroke()
      ctx.beginPath()

      ctx.fillStyle = 'red' //Same color then house in coplanar.svg
      ctx.moveTo(w / 2 - d, t)
      ctx.lineTo(w / 2, t - c)
      ctx.lineTo(w / 2 + d, t)

      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.fillStyle = 'grey' //Same color then house in coplanar.svg
      t = h / 3
      ctx.fillRect(0, t, w, t)
      ctx.strokeRect(0, t, w, t)
      ctx.stroke()
      for (let i = 1; i <= 3; i++) {
        const xb = i * 0.3 * w
        const xt = xb - w * 0.3 * Math.cos(alfaRad)
        const yt = t - w * 0.3 * Math.sin(alfaRad)
        ctx.beginPath()
        ctx.moveTo(xb, t)
        ctx.lineTo(xt, yt)
        ctx.stroke()
      }
    }
  }

  const changeRoofType = (event, setValues, values) => {
    /* 
    Al crear la geometria de la base hemos construido un acimut.
    El acimut se debe dibujar solo si la configuración no es de angulos optimos
    Cuando cambia la configuracion debemos hacer aparecer o desaparecer el acimut
    */
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
          inclinacion: inclinacionDefault,
          requierePVGIS: true,
        }))
        featAcimut.setStyle(null)
        setRoofType('Coplanar', values)
        drawHouse(canvasRef.current, inclinacionDefault, 'Coplanar')
        break
      case 'Horizontal':
        setValues((prev) => ({
          ...prev,
          roofType: 'Horizontal',
          inclinacionOptima: false,
          angulosOptimos: false,
          inclinacion: inclinacionDefault,
          requierePVGIS: true,
        }))
        featAcimut.setStyle(null)
        setRoofType('Horizontal')
        drawHouse(canvasRef.current, inclinacionDefault, 'Horizontal')
        break

      case 'Optimos': {
        setValues((prev) => ({
          ...prev,
          roofType: 'Optimos',
          angulosOptimos: true,
          inclinacionOptima: true,
          requierePVGIS: true,
        }))
        setRoofType('Optimo')
        featAcimut.setStyle(new Style({}))
        break
      }
    }
  }

  const changeTilt = (event, setValues, values) => {
    setValues((prevValues) => ({
      ...prevValues,
      inclinacion: parseInt(event.target.value),
      inclinacionOptima: false,
      angulosOptimos: false,
      requierePVGIS: true,
    }))
    drawHouse(canvasRef.current, parseInt(event.target.value), values.roofType)
  }

  // Removed based on request done by SOM-Autoproduccion meeting 9/3/2024
  // const setOptimalTilt = (event, setValues) => {
  //   setValues((prevValues) => ({
  //     ...prevValues,
  //     inclinacion: event.target.checked ? '' : 0,
  //     inclinacionOptima: event.target.checked,
  //     angulosOptimos: false,
  //     requierePVGIS: true,
  //   }))
  // }

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

  const handleCancel = (values) => {
    onClose('cancel', values)
  }

  async function handleClose(values) {
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
        if (value < 0 || value > 80) {
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

  //Just for alignment debug. TBRemoved
  const canvasStyle = {
    //border: '1px solid #000',
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
          <DialogTitle>{t('LOCATION.TITLE_DIALOG_NEW_BASE')}</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', flex: 1 }}
            >
              <Typography variant="body" sx={{ mb: '1rem' }}>
                {t('BaseSolar.DESCRIPTION.nombreBaseSolar')}
              </Typography>
              <SLDRInputField
                name="nombreBaseSolar"
                type="text"
                object="BaseSolar"
                unit=""
                sx={{ flex: 1, mb: '1rem', textAlign: 'center' }}
              />

              <Typography
                sx={{ mt: '1rem' }}
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('BaseSolar.DESCRIPTION.roofType'),
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
                  {t('BaseSolar.PROP.angulosOptimos')}
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
                      {t('BaseSolar.DESCRIPTION.inclinacionTejado')}
                    </Typography>

                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      {/* PENDIENTE: conseguir alineacion vertical de House, Slider y Field */}
                      <Grid container alignItems="center" justifyContent="center">
                        <Grid item xs={4} sx={{ flex: 2, mt: '-1rem' }}>
                          <canvas
                            ref={canvasRef}
                            width="100%"
                            height="100%"
                            style={canvasStyle}
                          ></canvas>
                        </Grid>
                        <Grid item xs={4}>
                          <input
                            name="inclinacion"
                            type="range"
                            min="5"
                            max="70"
                            value={values.inclinacion}
                            onChange={(event) => changeTilt(event, setValues, values)}
                          />
                          <label>{t('BaseSolar.PROP.inclinacion')}</label>
                        </Grid>
                        <Grid item xs={2}>
                          <SLDRInputField
                            name="inclinacion"
                            type="text"
                            unit=" º"
                            object="BaseSolar"
                            value={values.inclinacion}
                            onChange={(event) => changeTilt(event, setValues, values)}
                            sx={{ flex: 1, mb: '2rem' }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                    {/*  Removed based on request done by SOM-Autoproduccion meeting 9/3/2024
                    {values.roofType === 'Horizontal' && (
                      <Field name="inclinacionOptima">
                        {({ field }) => (
                          <FormControlLabel
                            labelPlacement="end"
                            control={
                              <Switch
                                {...field}
                                checked={values.inclinacionOptima}
                                onChange={(event) => setOptimalTilt(event, setValues)}
                                color="primary"
                              />
                            }
                            label={t('BaseSolar.DESCRIPTION.inclinacionOptima')}
                          />
                        )}
                      </Field>
                    )}
                          */}
                    <Typography variant="body" sx={{ mb: '1rem', mt: '1rem' }}>
                      {t('BaseSolar.DESCRIPTION.inAcimut')}
                    </Typography>
                    <Box
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <SLDRInputField
                        name="inAcimut"
                        type="text"
                        unit=" º"
                        object="BaseSolar"
                        value={values.inAcimut}
                        onBlur={(event) => changeAzimut(event, setValues, values)}
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  </Box>
                </>
              )}

              {values.roofType === 'Optimos' && (
                <>
                  <Box sx={{ mt: '1rem' }}>
                    <Typography variant="body">
                      {t('BaseSolar.DESCRIPTION.angulosOptimos')}
                    </Typography>
                  </Box>
                </>
              )}
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
