import { useState, useEffect, Fragment, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'

import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  FormControl,
  Button,
  Box,
  InputAdornment,
} from '@mui/material'

// REACT Solidar Components
import { SLDRInputField } from '../../components/SLDRComponents'
import { ConsumptionContext } from '../ConsumptionContext'
// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function DialogTarifa({ tarifa, previous, onClose }) {
  const { t, i18n } = useTranslation()

  const [nPrecios, setNPrecios] = useState()
  const [tipoTarifa, setTipoTarifa] = useState(TCB.tipoTarifa)

  useEffect(() => {
    setTipoTarifa(tarifa.tipo)
    setNPrecios(4)
    if (tarifa.tipo === '3.0TD') {
      setNPrecios(7)
    } else {
      setNPrecios(4)
    }
  }, [])

  function cambiaTipoTarifa(event, values, setValues) {
    const { value } = event.target
    setTipoTarifa(value)
    setNPrecios(4)

    if (value === '3.0TD') {
      setValues((prevValues) => ({
        ...prevValues,
        detalle: value + '-' + TCB.territorio,
        tipo: value,
        precios: TCB.tarifas[value + '-' + TCB.territorio].precios.map((a) => a),
      }))
      setNPrecios(7)
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        detalle: value,
      }))
      setNPrecios(4)
    }
  }

  function cambiaPrecio(posicion, nuevoValor, values, setValues) {
    setValues((prevValues) => ({
      ...prevValues,
      precios: prevValues.precios.map((precio, index) =>
        index === posicion ? nuevoValor : precio,
      ),
    }))
  }

  function validateFields(values) {
    let errors = {}
    if (typeof values.coefHucha === 'string') {
      if (!UTIL.ValidateDecimal(i18n.language, values.coefHucha)) {
        errors.coefHucha = t('BASIC.LABEL_NUMBER')
      } else {
        if (values.coefHucha > 100) {
          errors.coefHucha = 'debe ser menor que 100'
        }
      }
    }

    if (typeof values.cuotaHucha === 'string') {
      if (!UTIL.ValidateDecimal(i18n.language, values.cuotaHucha)) {
        errors.cuotaHucha = t('BASIC.LABEL_NUMBER')
      }
    }

    //Precios no vacios y numericos
    for (let i = 0; i < nPrecios; i++) {
      if (values.precios[i] === '') {
        errors[i] = t('BASIC.LABEL_REQUIRED')
      } else {
        if (typeof values.precios[i] === 'string') {
          if (!UTIL.ValidateDecimal(i18n.language, values.precios[i])) {
            errors['P' + i] = t('BASIC.LABEL_NUMBER')
          }
        }
      }
    }
    //Nombre tarifa requerido
    if (values.nombreTarifa === '') {
      errors.nombreTarifa = t('BASIC.LABEL_REQUIRED')
    } else {
      //Nomb re tarifa no duplicado
      if (
        previous.find(
          (_t) =>
            _t.nombreTarifa === values.nombreTarifa && _t.idTarifa !== values.idTarifa,
        )
      ) {
        errors.nombreTarifa = t('CONSUMPTION.ERROR_NOMBRE_TARIFA_DUPLICADO')
      }
    }
    return errors
  }

  const handleCancel = () => {
    onClose('cancel')
  }

  async function handleClose(values) {
    onClose('save', values)
  }

  if (tarifa) {
    return (
      <Formik
        initialValues={tarifa}
        validate={validateFields}
        onSubmit={(values, event) => {
          handleClose(values, event)
        }}
      >
        {({ values, setValues, setPreciosValidos }) => (
          <Form>
            <DialogTitle>{t('CONSUMPTION.TITLE_DIALOG_NEW_TARIFA')}</DialogTitle>
            <DialogContent>
              <Box
                sx={{ display: 'flex', mb: 3, gap: 2, padding: 1, alignItems: 'center' }}
              >
                <FormControl sx={{ display: 'flex', flex: 0.8 }}>
                  <SLDRInputField
                    sx={{
                      textAlign: 'center',
                    }}
                    select
                    label={t('Tarifa.PROP.tipoTarifa')}
                    onChange={(e) => cambiaTipoTarifa(e, values, setValues)}
                    name="tipoTarifa"
                    value={tipoTarifa}
                    object="Tarifa"
                  >
                    <MenuItem key={'A1'} value={'2.0TD'}>
                      2.0TD
                    </MenuItem>
                    <MenuItem key={'A2'} value={'3.0TD'}>
                      3.0TD
                    </MenuItem>
                  </SLDRInputField>
                </FormControl>
                <FormControl sx={{ display: 'flex', flex: 1.7 }}>
                  <SLDRInputField
                    sx={{
                      textAlign: 'center',
                    }}
                    label={t('Tarifa.PROP.nombreTarifa')}
                    name="nombreTarifa"
                    value={values.nombreTarifa}
                    object="Tarifa"
                  ></SLDRInputField>
                </FormControl>
                <FormControl sx={{ display: 'flex', flex: 1 }}>
                  <SLDRInputField
                    label={t('Tarifa.PROP.coefHucha')}
                    name="coefHucha"
                    value={values.coefHucha}
                    object="Tarifa"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">&nbsp;%</InputAdornment>
                      ),
                      inputProps: {
                        style: { textAlign: 'right' },
                      },
                    }}
                  ></SLDRInputField>
                </FormControl>
                <FormControl sx={{ display: 'flex', flex: 1 }}>
                  <SLDRInputField
                    label={t('Tarifa.PROP.cuotaHucha')}
                    name="cuotaHucha"
                    value={values.cuotaHucha}
                    object="Tarifa"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">&nbsp;€</InputAdornment>
                      ),
                      inputProps: {
                        style: { textAlign: 'right' },
                      },
                    }}
                  ></SLDRInputField>
                </FormControl>
              </Box>
              <Grid
                container
                spacing={1}
                alignItems="center"
                justifyContent="space-evenly"
              >
                {values.precios.map((precio, index) => (
                  <Fragment key={index}>
                    {index < nPrecios && (
                      <Grid item xs>
                        <SLDRInputField
                          unit=" €"
                          //object="Tarifa"
                          value={precio.toLocaleString(i18n.language)}
                          onChange={(ev) =>
                            cambiaPrecio(
                              index,
                              ev.target.value,
                              values,
                              setValues,
                              setPreciosValidos,
                            )
                          }
                          label={t('Tarifa.PROP.' + tipoTarifa + '.P' + index)}
                          name={'P' + index}
                        ></SLDRInputField>
                      </Grid>
                    )}
                  </Fragment>
                ))}
              </Grid>
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
}
