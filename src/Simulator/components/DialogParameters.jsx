/* Función para mostrar el formulario modal de propiedades de un objeto generico
@param: objeto -> es el objeto del que se mostrará todas las propiedades que devuelve getOwnPropertyDescriptors en la función
                obtenerPropiedades. La llamada es recursiva, si una propiedad es un objeto se mostrarán la propiedades de ese
                objeto tambien.
@param: descripcion -> titulo del <body> del formulario modal
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Grid, TextField, MenuItem, Box, Typography, Tooltip } from '@mui/material'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function DialogParameters({ onClose }) {
  const { t, i18n } = useTranslation()
  const [param, setParam] = useState(TCB.parametros)

  console.log(TCB.parametros)
  let parametersVector = []
  for (let key in param) {
    console.log(`${key}: ${param[key]}`)
    parametersVector.push({ key: key, value: param[key] })
  }
  console.log(parametersVector)

  function changeParameter(key, value) {
    setParam((prevParam) => ({ ...prevParam, [key]: value }))
    TCB.parametros[key] = value
  }
  //   for (let val in vectorPropiedades) {
  //     //console.log(val, vectorPropiedades[val])
  //     vectorPropiedades[val].sort((a, b) => {
  //       if (a.valor === 'Objeto' || b.valor === 'Objeto') return -1
  //       else return UTIL.campos[a.nombre].order - UTIL.campos[b.nombre].order
  //     })
  //   }
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flex: 1,
        }}
      >
        <Typography variant="h4" align="center">
          {t('PARAMETROS.DIALOG_TITLE')}
        </Typography>
        <Typography
          variant="body"
          align="center"
          dangerouslySetInnerHTML={{
            __html: t('PARAMETROS.DIALOG_DESCRIPTION'),
          }}
        />

        <Grid
          container
          spacing={3}
          sx={{ mb: '1rem', mt: '1rem' }}
          alignItems="center"
          justifyContent="space-evenly"
        >
          {/* //class="table table-sm table-striped table-bordered text-end center"> */}
          {parametersVector.map(({ key, value }) => (
            <>
              {console.log(key, UTIL.campos[key], value)}
              <Tooltip title={t('PARAMETROS.TOOLTIP_' + key)} placement="top">
                <Grid item xs={5}>
                  {key === 'tecnologia' ? (
                    <TextField
                      key={key}
                      sx={{ width: 200, height: 50, textAlign: 'center', mb: '1rem' }}
                      id="tarifa-simple-select"
                      select
                      label={t('PARAMETROS.LABEL_' + key)}
                      onChange={(ev) => changeParameter(key, ev.target.value)}
                      name="nombreTarifa"
                      value={param[key]}
                    >
                      <MenuItem value="crystSi">Crystaline silicon</MenuItem>
                      <MenuItem value="CIS">CIS</MenuItem>
                      <MenuItem value="Cadmium Telluride">cdTe</MenuItem>
                      <MenuItem value="Unknown">
                        {t('PARAMETROS.LABEL_tecnologiaDesconocida')}
                      </MenuItem>
                    </TextField>
                  ) : (
                    <TextField
                      sx={{ width: '100%', display: 'flex', flex: 1 }}
                      key={key}
                      type="text"
                      value={param[key]}
                      onChange={(ev) => changeParameter(key, ev.target.value)}
                      label={t('PARAMETROS.LABEL_' + key)}
                      name={key}
                      InputProps={{
                        inputProps: {
                          style: { textAlign: 'right' },
                        },
                      }}
                    ></TextField>
                  )}
                </Grid>
              </Tooltip>
            </>
          ))}
        </Grid>
      </Box>
    </>
  )
}
