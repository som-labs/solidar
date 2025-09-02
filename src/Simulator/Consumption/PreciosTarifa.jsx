import { useState, useEffect, Fragment, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'

import { Grid, MenuItem, FormControl, InputLabel } from '@mui/material'

// REACT Solidar Components
import { SLDRInputField } from '../../components/SLDRComponents'
import { ConsumptionContext } from '../ConsumptionContext'
// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

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
    let errors = {}
    setPreciosValidos(true)
    for (let i = 0; i < nPrecios; i++) {
      if (values[i] === '') {
        errors[i] = 'Requerido'
      } else {
        if (typeof values[i] === 'string') {
          if (!UTIL.ValidateDecimal(i18n.language, values[i])) {
            errors[i] = 'Debe ser un número mayor o igual que cero'
          }
        }
      }
    }
    //PreciosValidos in ConsumptionContext is a flag to know if we can proceed to EnergyBalance
    if (Object.keys(errors).length !== 0) setPreciosValidos(false)
    return errors
  }

  if (TCB.tarifaActiva.precios.length !== 0) {
    return (
      <Formik initialValues={TCB.tarifaActiva.precios} validate={validateFields}>
        {({ values, setValues, setPreciosValidos }) => (
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
                        //object="Tarifa" //Hace aparecer el tooltip
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
                        name={String(index)}
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
