import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import DeleteIcon from '@mui/icons-material/Delete'

import TCBContext from '../../TCBContext'
import TCB from '../../classes/TCB'
import BaseSolar from '../../classes/BaseSolar'

const AzimutStep = () => {
  const { t, i18n } = useTranslation()
  const { bases, setBases, tipoConsumo, setTipoConsumo } = useContext(TCBContext)

  function setAzimut(index, value) {
    let oldBases = [...bases]
    let nIndex = oldBases.findIndex((t) => t.idBaseSolar == index)
    oldBases[nIndex].inAcimut = value
    TCB.BaseSolar[nIndex].inAcimut = value
    TCB.BaseSolar[nIndex].requierePVGIS = true
    setBases(oldBases)
  }

  function deleteBase(index) {
    let oldBases = [...bases]
    let nIndex = oldBases.findIndex((t) => t.idBaseSolar == index)
    oldBases.splice(nIndex, 1)
    TCB.BaseSolar.splice(nIndex, 1)
    setBases(oldBases)
  }

  return (
    <>
      <Container>
        <Typography variant="body">{t('LOCATION.PROMPT_AZIMUT')}</Typography>
        {/* Aqui va el array de los acimiut de las bases */}
        <div className="gridBases">
          {bases.map((tBase) => (
            <>
              <Box>
                <p>{tBase.nombreBaseSolar}</p>
                <TextField
                  key={tBase.idBaseSolar}
                  type="text"
                  value={tBase.inAcimut}
                  onChange={(ev) => setAzimut(tBase.idBaseSolar, ev.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          color="primary"
                          onClick={() => deleteBase(tBase.idBaseSolar)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </>
          ))}
        </div>
      </Container>
    </>
  )
}

export default AzimutStep
