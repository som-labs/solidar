/* Función para mostrar el formulario modal de propiedades de un objeto generico
@param: objeto -> es el objeto del que se mostrará todas las propiedades que devuelve getOwnPropertyDescriptors en la función
                obtenerPropiedades. La llamada es recursiva, si una propiedad es un objeto se mostrarán la propiedades de ese
                objeto tambien.
@param: descripcion -> titulo del <body> del formulario modal
 */

import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Box from '@mui/material/Box'
import { Table, TableRow, TableCell } from '@mui/material'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import { MuiFileInput } from 'mui-file-input'

// REACT Solidar Components
import TCBContext from '../TCBContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import TipoConsumo from '../classes/TipoConsumo'
import Tarifa from '../classes/Tarifa'
import { Typography } from '@mui/material'

export default function DialogProperties({ data, onClose }) {
  const { t, i18n } = useTranslation()
  const [objeto, setObjeto] = useState(data)

  const vectorPropiedades = UTIL.obtenerPropiedades(objeto, 0)
  for (let val in vectorPropiedades) {
    //console.log(val, vectorPropiedades[val])
    vectorPropiedades[val].sort((a, b) => {
      if (a.valor === 'Objeto' || b.valor === 'Objeto') return -1
      else return UTIL.campos[a.nombre].order - UTIL.campos[b.nombre].order
    })
  }
  return (
    <>
      <Box>
        <Typography variant="h3">{t('OBJECT.LABEL_TITLE_PROPERTIES')}</Typography>
      </Box>
      <Box>
        <Table id="tablaPropiedades">
          {/* //class="table table-sm table-striped table-bordered text-end center"> */}
          {Object.entries(vectorPropiedades).map(([objName, objProps]) => (
            <>
              <TableRow sx={{ backgroundColor: 'rgba(220, 249, 233, 1)' }}>
                {/* class='table-info text-center'> */}
                <TableCell sx={{ columnSpan: 'all' }}>
                  {' '}
                  {t('OBJECT.' + objName)}
                </TableCell>
              </TableRow>
              {objProps.map((prop) => (
                <>
                  {/* {console.log(prop.nombre, UTIL.campos[prop.nombre], prop.valor)} */}
                  {UTIL.campos[prop.nombre] !== undefined &&
                    UTIL.campos[prop.nombre].mostrar && (
                      <TableRow sx={{ height: 'auto' }}>
                        <TableCell>
                          {/* //  class='text-start'>" */}
                          {TCB.i18next.t(objName + '.LABEL_' + prop.nombre)}
                        </TableCell>
                        <TableCell>
                          {/* // "</td><td class='text-end'>" + */}
                          {UTIL.formatoValor(prop.nombre, prop.valor)}
                        </TableCell>
                      </TableRow>
                    )}
                </>
              ))}
            </>
          ))}
        </Table>
      </Box>
    </>
  )
}
