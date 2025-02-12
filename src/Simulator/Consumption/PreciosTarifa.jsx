import { useState, useEffect, Fragment, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'

import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'

// REACT Solidar Components
import { SLDRInputField } from '../../components/SLDRComponents'
import { ConsumptionContext } from '../ConsumptionContext'
import { GlobalContext } from '../GlobalContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import Tarifa from '../classes/Tarifa'

export default function PreciosTarifa() {
  const { t, i18n } = useTranslation()
  const {
    setPreciosValidos,
    addConsumptionData,
    modifyConsumptionData,
    deleteConsumptionData,
    tarifas,
  } = useContext(ConsumptionContext)
  const { setNewPrecios } = useContext(GlobalContext)
  const [nPrecios, setNPrecios] = useState()

  useEffect(() => {
    //En modo INDIVIDUAL existe una unica Tarifa
    if (tarifas.length === 0) {
      addConsumptionData('Tarifa', new Tarifa('Tarifa SOM', '2.0TD'))
    }

    setNPrecios(4)
    if (tarifas[0].tipo === '3.0TD') {
      setNPrecios(7)
    } else {
      setNPrecios(4)
    }
  }, [])

  function cambiaTipoTarifa(newTipo, setValues) {
    let detalle
    if (newTipo === '3.0TD') {
      detalle = '3.0TD-' + TCB.territorio
      setNPrecios(7)
    } else {
      detalle = '2.0TD'
      setNPrecios(4)
    }

    const modifiedTarifa = tarifas[0]
    modifiedTarifa.tipo = newTipo
    modifiedTarifa.detalle = detalle
    modifiedTarifa.precios = [...TCB.tarifas[detalle].precios]
    modifyConsumptionData('Tarifa', modifiedTarifa)

    setValues((prev) => {
      prev, modifiedTarifa
    })
  }

  function cambiaPrecio(posicion, nuevoValor, values, setValues) {
    setValues((prev) => ({
      ...prev,
      precios: values.precios.map((_p, ndx) => (ndx === posicion ? nuevoValor : _p)),
    }))
    const modifiedTarifa = tarifas[0]
    modifiedTarifa.precios[posicion] = parseFloat(nuevoValor.replace(',', '.'))
    modifyConsumptionData('Tarifa', modifiedTarifa)
    setNewPrecios(true)
  }

  function validateFields(values) {
    let errors = {}
    setPreciosValidos(true)

    for (let i = 0; i < nPrecios; i++) {
      if (values.precios[i] === '') {
        errors[i] = t('BASIC.LABEL_REQUIRED')
      } else {
        if (typeof values.precios[i] === 'string') {
          if (!UTIL.ValidateDecimal(i18n.language, values.precios[i])) {
            errors[i] = t('BASIC.LABEL_NUMBER')
          }
        }
      }
    }
    //PreciosValidos in ConsumptionContext is a flag to know if we can proceed to EnergyBalance
    if (Object.keys(errors).length !== 0) setPreciosValidos(false)
    return errors
  }

  if (nPrecios) {
    return (
      <Formik initialValues={tarifas[0]} validate={validateFields}>
        {({ values, setValues, setPreciosValidos }) => (
          <Form>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <SLDRInputField
                sx={{ width: 200, height: 50, textAlign: 'center', mb: '1rem' }}
                select
                label={t('Tarifa.PROP.tipoTarifa')}
                onChange={(e) => cambiaTipoTarifa(e.target.value, setValues)}
                name="tipo"
                value={values.tipo}
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

            <Grid container spacing={1} alignItems="center" justifyContent="space-evenly">
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
                        label={t('Tarifa.PROP.' + values.tipo + '.P' + index)}
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
