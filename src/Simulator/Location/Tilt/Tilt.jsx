import React, { useContext} from 'react'
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

const TiltStep = () => {

    const { t, i18n } = useTranslation()
    const {bases, setBases, tipoConsumo, setTipoConsumo} = useContext(TCBContext)

    function setTilt( index, value) {
        let oldBases = [...bases]
        let nIndex = oldBases.findIndex((t) => t.idBaseSolar == index )

        oldBases[nIndex].inclinacionTejado = value
        oldBases[nIndex].areaReal = TCB.BaseSolar[nIndex].areaMapa / Math.cos(value / 180 * Math.PI)
        oldBases[nIndex].potenciaMaxima = oldBases[nIndex].areaReal / TCB.parametros.conversionAreakWp

        TCB.BaseSolar[nIndex].inclinacionTejado = value
        TCB.BaseSolar[nIndex].areaReal = TCB.BaseSolar[nIndex].areaMapa / Math.cos(value / 180 * Math.PI)
        TCB.BaseSolar[nIndex].potenciaMaxima = oldBases[nIndex].areaReal / TCB.parametros.conversionAreakWp
        TCB.BaseSolar[nIndex].requierePVGIS = true
        setBases(oldBases)
    }

    function deleteBase( index) {
        let oldBases = [...bases]
        let nIndex = oldBases.findIndex( t => t.idBaseSolar == index )
        oldBases.splice(nIndex, 1)
        TCB.BaseSolar.splice(nIndex, 1)
        setBases(oldBases)
    }

    return <>
        <Container>
            <Typography variant='body'>{t("LOCATION.PROMPT_TILT")}</Typography>
            {/* Aqui va el array de las inclinaciones de las bases */}
            <div className="gridBases">
                {bases.map(tBase => (
                <>
                    <Box>
                        <p>{ tBase.nombreBaseSolar }</p>
                        <TextField
                            key={ tBase.idBaseSolar }
                            type="text"
                            value={ tBase.inclinacionTejado }
                            onChange={ (ev)=>setTilt( tBase.idBaseSolar, ev.target.value) }
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                    <IconButton edge="end" color="primary" onClick={ ()=>deleteBase( tBase.idBaseSolar )}>
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
}

export default TiltStep;
