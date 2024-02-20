import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Box from '@mui/material/Box'
import { Table, TableRow, TableCell, Grid } from '@mui/material'
import { Typography } from '@mui/material'

// REACT Solidar Components

// Solidar objects
import * as UTIL from '../classes/Utiles'

export default function DialogProperties({ data, onClose }) {
  const { t } = useTranslation()
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
      <Grid container>
        <Grid container justifyContent="center" alignItems="center">
          <Typography variant="h3" textAlign={'center'}>
            {t('DIALOG_PROPERTIES.TITLE')}
          </Typography>
        </Grid>
        <div style={{ overflowY: 'auto', width: '100%', maxHeight: '70vh' }}>
          {Object.entries(vectorPropiedades).map(([objName, objProps]) => (
            <>
              {/* Object row */}
              <Grid
                container
                key={objName}
                alignItems="center"
                justifyContent="center"
                style={{
                  backgroundColor: 'rgba(220, 249, 233, 1)',
                  height: '50px',
                  fontWeight: 'bold',
                }}
              >
                {t(objName + '.NAME')}
              </Grid>
              {/* Property row */}
              <Grid>
                {objProps.map((prop) => (
                  <>
                    {UTIL.campos[prop.nombre] !== undefined &&
                      UTIL.campos[prop.nombre].mostrar && (
                        <Grid container direction="row">
                          <Grid
                            xs={6}
                            key={objName + prop.nombre}
                            style={{ height: '20px', padding: 8 }}
                          >
                            {t(objName + '.PROP.' + prop.nombre)}
                          </Grid>
                          <Grid item xs={6} style={{ padding: 8 }}>
                            {UTIL.formatoValor(prop.nombre, prop.valor)}
                          </Grid>
                        </Grid>
                      )}
                  </>
                ))}
              </Grid>
            </>
          ))}
        </div>
      </Grid>
    </>
  )
}
