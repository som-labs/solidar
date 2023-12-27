import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Box from '@mui/material/Box'
import { Table, TableRow, TableCell } from '@mui/material'
import { Typography } from '@mui/material'

// REACT Solidar Components

// Solidar objects
import * as UTIL from '../classes/Utiles'

export default function DialogProperties({ data, onClose }) {
  const { t } = useTranslation()
  const [objeto, setObjeto] = useState(data)

  console.log('EN DIALOGO DE PROPIEDADES')
  const vectorPropiedades = UTIL.obtenerPropiedades(objeto, 0)
  for (let val in vectorPropiedades) {
    //console.log(val, vectorPropiedades[val])
    vectorPropiedades[val].sort((a, b) => {
      if (a.valor === 'Objeto' || b.valor === 'Objeto') return -1
      else return UTIL.campos[a.nombre].order - UTIL.campos[b.nombre].order
    })
  }
  console.log(vectorPropiedades)
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
                          {t(objName + '.LABEL_' + prop.nombre)}
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
