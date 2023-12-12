/* Función para mostrar el formulario modal de propiedades de un objeto generico
@param: objeto -> es el objeto del que se mostrará todas las propiedades que devuelve getOwnPropertyDescriptors en la función
                obtenerPropiedades. La llamada es recursiva, si una propiedad es un objeto se mostrarán la propiedades de ese
                objeto tambien.
@param: descripcion -> titulo del <body> del formulario modal
 */

import { useState, Fragment } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Grid,
  TextField,
  MenuItem,
  Box,
  Typography,
  Tooltip,
  Button,
} from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'

export default function DialogParameters({ newParameters, updateParameters, onClose }) {
  const { t, i18n } = useTranslation()
  const [localParameters, setLocalParameters] = useState(newParameters)

  let parametersVector = []
  for (let key in localParameters) {
    parametersVector.push(key)
  }

  function changeParameter(key, value) {
    setLocalParameters((prev) => ({ ...prev, [key]: value }))
    console.log('CHANGES PARAMETERS', localParameters)
  }

  const handleEnd = (event) => {
    console.log('NEWPARAMETERS END DIALOGO', localParameters)
    updateParameters(localParameters)
    onClose(event.target.id)
  }

  return (
    <>
      <DialogTitle>{t('PARAMETROS.DIALOG_TITLE')}</DialogTitle>{' '}
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            flex: 1,
          }}
        >
          <Typography
            variant="body"
            align="left"
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
            {parametersVector.map((key) => (
              <Fragment key={key}>
                <Tooltip title={t('PARAMETROS.TOOLTIP_' + key)} placement="top">
                  <Grid item xs={5}>
                    {key === 'tecnologia' ? (
                      <TextField
                        sx={{ width: 200, height: 50, textAlign: 'center', mb: '1rem' }}
                        id="tarifa-simple-select"
                        select
                        label={t('PARAMETROS.LABEL_' + key)}
                        onChange={(ev) => changeParameter(key, ev.target.value)}
                        name="nombreTarifa"
                        value={localParameters[key]}
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
                        type="text"
                        value={localParameters[key]}
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
              </Fragment>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button id="cancel" onClick={handleEnd}>
          Cancel
        </Button>
        <Button id="save" onClick={handleEnd}>
          Ok
        </Button>
      </DialogActions>
    </>
  )
}
