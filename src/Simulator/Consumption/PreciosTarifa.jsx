import { useState, useEffect, Fragment, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'

import { Grid, MenuItem, FormControl, InputLabel } from '@mui/material'

// REACT Solidar Components
import { SLDRInputField } from '../../components/SLDRComponents'
import { ConsumptionContext } from '../ConsumptionContext'
// Solidar objects
import TCB from '../classes/TCB'
import { decimalSeparator } from '../classes/Utiles'

export default function PreciosTarifa() {
  const { t, i18n } = useTranslation()
  const { setPreciosValidos } = useContext(ConsumptionContext)

  const [nPrecios, setNPrecios] = useState()
  const [tipoTarifa, setTipoTarifa] = useState(TCB.tipoTarifa)

  useEffect(() => {
    setTipoTarifa(TCB.tipoTarifa)
    setNPrecios(4)
    if (TCB.tipoTarifa === '3.0TD') {
      setNPrecios(7)
    } else {
      setNPrecios(4)
    }
  }, [])

  function cambiaTipoTarifa(event, setValues) {
    setTipoTarifa(event.target.value)
    TCB.tipoTarifa = event.target.value

    setNPrecios(4)
    if (TCB.tipoTarifa === '3.0TD') {
      TCB.nombreTarifaActiva = '3.0TD-' + TCB.territorio
      setNPrecios(7)
    } else {
      TCB.nombreTarifaActiva = TCB.tipoTarifa
      setNPrecios(4)
    }

    TCB.tarifaActiva = TCB.tarifas[TCB.nombreTarifaActiva]
    setValues(TCB.tarifaActiva.precios)
  }

  function cambiaPrecio(posicion, nuevoValor, values, setValues) {
    let prevPrecios = [...values]
    prevPrecios[posicion] = nuevoValor
    setValues(prevPrecios)
    TCB.tarifaActiva.precios[posicion] = parseFloat(nuevoValor.replace(',', '.'))
  }

  function validateFields(values) {
    const errors = {}
    setPreciosValidos(true)

    Object.entries(values).forEach(([campo, valor]) => {
      if (valor === '') {
        errors[campo] = 'Requerido'
      } else {
        if (isNaN(Number(valor))) {
          errors[campo] = t('BASIC.LABEL_NUMBER')
        } else if (valor < 0) {
          errors[campo] = t('BASIC.LABEL_NUMBER')
        }
      }
    })
    //PreciosValidos in ConsumptionContext is a flag to know if we can proceed to nextStep
    if (Object.keys(errors).length !== 0) setPreciosValidos(false)
    return errors
  }

  console.log('Precios POTENCIAS en tarifa activa:', TCB.tarifaActiva.potencia)
  if (TCB.tarifaActiva.precios.length !== 0) {
    return (
      <Formik
        initialValues={TCB.tarifaActiva.precios}
        validate={validateFields}
        validateOnChange={true}
        validateOnBlur={true}
        validateOnMount={true}
        onSubmit={() => {}}
      >
        {({ values, setValues }) => (
          <Form>
            <InputLabel htmlFor="tipoTarifa">{t('Tarifa.PROP.tipoTarifa')}</InputLabel>
            <SLDRInputField
              sx={{ width: 200, textAlign: 'center', mb: '1rem' }}
              MUIType="Select"
              label={t('Tarifa.PROP.tipoTarifa')}
              onChange={(e) => cambiaTipoTarifa(e, setValues)}
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

            <Grid container spacing={1} alignItems="center" justifyContent="space-evenly">
              {values.map((precio, index) => (
                <Fragment key={index}>
                  {index < nPrecios && (
                    <Grid item xs>
                      <InputLabel htmlFor={String(index)}>
                        {t('Tarifa.PROP.' + tipoTarifa + '.P' + index)}
                      </InputLabel>
                      <SLDRInputField
                        unit=" €"
                        name={String(index)}
                        value={String(values[index] ?? '').replace('.', decimalSeparator)}
                        onChange={(ev) => {
                          const crudo = ev.target.value
                          const normalizado = crudo.replace(decimalSeparator, '.')
                          cambiaPrecio(index, normalizado, values, setValues)
                        }}
                      ></SLDRInputField>
                    </Grid>
                  )}
                </Fragment>
              ))}
            </Grid>
          </Form>
        )}
      </Formik>
    )
  }
}
