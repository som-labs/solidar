import { useEffect, useRef, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

//Formik objects
import { Formik, Form } from 'formik'

// MUI objects
import { Box, Button, Typography, Grid, FormLabel } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useTheme } from '@mui/material/styles'

//Solidar assets
import coplanarSvgFile from '../assets/coplanar.png'
import horizontalSvgFile from '../assets/horizontal.png'

//React global components
import { SLDRInputField } from '../../components/SLDRComponents'
import { BasesContext } from '../BasesContext'

// Solidar global modules
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
  const theme = useTheme()
  const { bases } = useContext(BasesContext)
  /*
  roofType state is needed for UseEffect that is needed to recover canvas each time the user 
  goes through the Optimos option where canvas is not rendered.
  */
  const [roofType, setRoofType] = useState(data.roofType)
  const [inclinacionOptima, setInclinacionOptima] = useState(false)
  const canvasRef = useRef()
  const inclinacionDefault = 30

  useEffect(() => {
    const canvas = canvasRef.current
    if (!inclinacionOptima) drawHouse(canvas, inclinacionDefault, roofType)
  }, [roofType, inclinacionOptima])

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
    if (roofType === 'Inclinado') {
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
    switch (event.currentTarget.value) {
      case 'Inclinado':
        setValues((prev) => ({
          ...prev,
          roofType: 'Inclinado',
          inclinacionOptima: false,
          //inAcimut: values.inAcimut,
          angulosOptimos: false,
          inclinacion: inclinacionDefault,
          requierePVGIS: true,
        }))
        setRoofType('Inclinado', values)
        setInclinacionOptima(false)
        drawHouse(canvasRef.current, inclinacionDefault, 'Inclinado')
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
        setRoofType('Horizontal')
        setInclinacionOptima(false)
        drawHouse(canvasRef.current, inclinacionDefault, 'Horizontal')
        break
    }
  }

  const changeTilt = (event, setValues, values) => {
    if (UTIL.ValidateEntero(event.target.value)) {
      setValues((prevValues) => ({
        ...prevValues,
        inclinacion: event.target.value,
        inclinacionOptima: false,
        angulosOptimos: false,
        requierePVGIS: true,
      }))
      drawHouse(canvasRef.current, parseInt(event.target.value), values.roofType)
    }
  }

  const changeInclinacionOptima = (event, setValues, values) => {
    setInclinacionOptima(!values.inclinacionOptima)
    setValues((prevValues) => ({
      ...prevValues,
      inclinacionOptima: !values.inclinacionOptima,
      inclinacion: inclinacionDefault,
      requierePVGIS: true,
    }))
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

  // const changeAzimut = (event, setValues, values) => {
  //   let featAcimut
  //   let geomAcimut
  //   let componente
  //   let angle

  //   componente = 'BaseSolar.acimut.' + values.idBaseSolar
  //   featAcimut = TCB.origenDatosSolidar.getFeatureById(componente)

  //   geomAcimut = featAcimut.getGeometry().clone()
  //   const azimutLength = geomAcimut.getLength()
  //   angle = (event.target.value / 180) * Math.PI

  //   componente = 'BaseSolar.area.' + values.idBaseSolar
  //   const featBase = TCB.origenDatosSolidar.getFeatureById(componente)
  //   const puntoAplicacion = featBase.getGeometry().getInteriorPoint().getCoordinates()

  //   let finAcimut = []
  //   finAcimut[0] = puntoAplicacion[0] - Math.sin(angle) * azimutLength
  //   finAcimut[1] = puntoAplicacion[1] - Math.cos(angle) * azimutLength
  //   geomAcimut = new LineString([puntoAplicacion, finAcimut])
  //   featAcimut.setGeometry(geomAcimut)

  //   setValues((prevValues) => ({
  //     ...prevValues,
  //     angulosOptimos: false,
  //     inAcimut: parseInt(event.target.value),
  //     requierePVGIS: true,
  //   }))
  // }

  const handleCancel = (values) => {
    onClose('cancel', values)
  }

  async function handleClose(values) {
    onClose('save', values)
  }

  const validate = (values) => {
    const errors = {}
    let value

    if (values.nombreBaseSolar === '') {
      errors.nombre = t('BASIC.LABEL_REQUIRED')
      return errors
    } else {
      bases.forEach((base) => {
        if (
          base.nombreBaseSolar === values.nombreBaseSolar &&
          base.idBaseSolar != values.idBaseSolar
        ) {
          errors.nombreBaseSolar = t('LOCATION.ERROR_NOMBRE_BASE_SOLAR_DUPLICADO')
          return errors
        }
      })
    }

    if (values.roofType === 'Inclinado') {
      if (values.inclinacion === '') {
        errors.inclinacion = t('BASIC.LABEL_REQUIRED')
      }
      if (parseInt(values.inclinacion) === 0) {
        errors.inclinacion = t('LOCATION.ERROR_INCLINADO_NOANGLE')
      }
      if (!UTIL.ValidateEntero(values.inclinacion)) {
        errors.inclinacion = t('LOCATION.ERROR_INCLINACION')
      } else {
        value = parseInt(values.inclinacion)
        if (value < 0 || value > 80) {
          errors.inclinacion = t('LOCATION.ERROR_INCLINACION')
        }
      }
    }

    if (values.roofType === 'Horizontal') {
      if (!values.inclinacionOptima) {
        if (!UTIL.ValidateEntero(values.inclinacion)) {
          errors.inclinacion = t('LOCATION.ERROR_INCLINACION')
        } else {
          value = parseInt(values.inclinacion)
          if (values.inclinacion < 0 || values.inclinacion > 90) {
            errors.inclinacion = t('LOCATION.ERROR_INCLINACION')
          }
        }
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
          <DialogTitle sx={theme.titles.level_1} textAlign={'center'}>
            {t('LOCATION.TITLE_DIALOG_NEW_BASE')}
          </DialogTitle>
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
                sx={{ flex: 1, textAlign: 'center' }}
              />

              <Typography
                sx={{ mt: '1rem' }}
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('BaseSolar.DESCRIPTION.roofType'),
                }}
              />
              {/* PENDIENTE: hay que mejorar los iconos de los botones inclinado u horizontal */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  mt: '1rem',
                  mb: '1rem',
                  justifyContent: 'space-between',
                }}
              >
                <Button
                  style={{
                    backgroundColor:
                      values.roofType === 'Inclinado' ? 'green' : 'lightgray',
                    color: values.roofType === 'Inclinado' ? 'white' : 'black',
                    boxShadow:
                      values.roofType !== 'Inclinado'
                        ? '7px 7px 1px 2px rgba(0, 0, 0, 0.3)'
                        : 'none',
                  }}
                  name="roofType"
                  value="Inclinado"
                  sx={{ ml: '2rem', flex: 0.4 }}
                  onClick={(event) => changeRoofType(event, setValues, values)}
                >
                  <img src={coplanarSvgFile} width="170" height="90" alt="SVG Image" />
                  {/* <HomeIcon /> */}
                </Button>
                <Button
                  style={{
                    backgroundColor:
                      values.roofType === 'Horizontal' ? 'green' : 'lightgray',
                    color: values.roofType === 'Horizontal' ? 'white' : 'black',
                    boxShadow:
                      values.roofType !== 'Horizontal'
                        ? '7px 7px 1px 2px rgba(0, 0, 0, 0.3)'
                        : 'none',
                  }}
                  name="roofType"
                  value="Horizontal"
                  sx={{ mr: '2rem', flex: 0.4 }}
                  onClick={(event) => changeRoofType(event, setValues)}
                >
                  <img
                    src={horizontalSvgFile}
                    width="170"
                    height="80"
                    style={{ padding: 1 }}
                    alt="SVG Image"
                  />
                  {/* <ApartmentIcon /> */}
                </Button>
                {/* <Button
                  variant={values.roofType === 'Optimos' ? 'contained' : 'outlined'}
                  name="roofType"
                  value="Optimos"
                  sx={{ flex: 1 }}
                  className={'roofTypeButton'}
                  onClick={(event) => changeRoofType(event, setValues)}
                >
                  {t('BaseSolar.PROP.angulosOptimos')}
                </Button> */}
              </Box>

              {/* {!values.inclinacionOptima && ( */}
              <>
                <Box
                  sx={{
                    display: 'flex',
                    flex: 2,
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                  }}
                >
                  {values.roofType === 'Inclinado' && (
                    <Typography variant="body" sx={{ mt: '1rem', mb: '1rem' }}>
                      {t('BaseSolar.DESCRIPTION.inclinacionTejado')}
                    </Typography>
                  )}

                  {values.roofType === 'Horizontal' && (
                    <>
                      <Typography variant="body" sx={{ mt: '1rem', mb: '1rem' }}>
                        {t('BaseSolar.DESCRIPTION.inclinacionPaneles')}
                      </Typography>

                      <FormLabel>
                        <SLDRInputField
                          MUIType="Checkbox"
                          name="inclinacionOptima"
                          object="BaseSolar"
                          checked={values.inclinacionOptima}
                          onChange={(event) =>
                            changeInclinacionOptima(event, setValues, values)
                          }
                        />
                        {t('BaseSolar.DESCRIPTION.inclinacionOptima')}
                      </FormLabel>
                    </>
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column',
                      mt: '1rem',
                    }}
                  >
                    {!values.inclinacionOptima ? (
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
                    ) : (
                      <Typography variant="body" sx={{ mt: '1rem', mb: '1rem' }}>
                        {t('BaseSolar.DESCRIPTION.angulosOptimos')}
                      </Typography>
                    )}
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
                  {/*
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
                    </Box>*/}
                </Box>
              </>
              {/* )} */}

              {/* {values.roofType === 'Optimos' && (
                <>
                  <Box sx={{ mt: '1rem' }}>
                    <Typography variant="body">
                      {t('BaseSolar.DESCRIPTION.angulosOptimos')}
                    </Typography>
                  </Box>
                </>
              )} */}
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
