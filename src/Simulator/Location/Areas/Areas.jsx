import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import DeleteIcon from '@mui/icons-material/Delete'

import BasesContext from '../../BasesContext'
import TCB from '../../classes/TCB.js'
import BaseSolar from '../../classes/BaseSolar.js'

const AreasStep = () => {
    const { t, i18n } = useTranslation()
    const {bases, setBases} = useContext(BasesContext)

    function setName( index, value) {
        let oldBases = [...bases]
        let nIndex = oldBases.findIndex((t) => t.idBaseSolar == index )
        oldBases[nIndex].nombreBaseSolar = value
        TCB.BaseSolar[nIndex].nombreBaseSolar = value
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
            {/* Aqui va el array de las superficies en m2 de las bases creadas */}
            <div className="gridBases">
                {bases.map(tBase => (
                <>
                    <Box>
                        <TextField
                            key={ tBase.idBaseSolar }
                            type="text"
                            value={ tBase.nombreBaseSolar }
                            onChange={ (ev)=>setName( tBase.idBaseSolar, ev.target.value) }
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
                        <p>{ tBase.areaMapa.toFixed(2) + " m²" }</p>
                    </Box>
                </>
                ))} 
            </div> 

            {/* Aqui va la superficie total en m2 de las bases creadas */}
            <div>
                <Typography variant='h5'>
                {"Area total: " + Math.round(bases.reduce( (sum, tBase) => sum + tBase.areaMapa, 0 )) + " m²"}
                </Typography>
            </div>
        </Container>
    </>
}

export default AreasStep;