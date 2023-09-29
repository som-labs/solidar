import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Delete'


import TCB from '../classes/TCB.js'
import BasesContext from '../BasesContext'
import BaseSolar from '../classes/BaseSolar.js'

import Wizard from '../../components/Wizard'
import AreasStep from './Areas/Areas.jsx'
import TiltStep from './Tilt/Tilt.jsx'
import AzimutStep from './Azimut/Azimut.jsx'
import SummaryStep from './Summary/Summary.jsx'
import MapWrapper from '../MapWrapper'

const LocationStep = () => {
    const { t, i18n } = useTranslation()
    const [bases, setBases] = useState(TCB.BaseSolar.map( t => {
      return {
        idBaseSolar : t.idBaseSolar,
        nombreBaseSolar : t.nombreBaseSolar,
        areaMapa : t.areaMapa,
        areaReal : t.areaReal,
        lonlatBaseSolar : t.lonlatBaseSolar,
        potenciaMaxima : t.potenciaMaxima,
        inclinacionOptima : t.inclinacionOptima,
        inclinacionPaneles : t.inclinacionPaneles,
        inclinacionTejado : t.inclinacionTejado,
        angulosOptimos : t.angulosOptimos,
        inAcimut : t.inAcimut,
        requierePVGIS : t.requierePVGIS
      }}))

    function findAddress ( address) {
      {alert ('Buscaremos la siguiente direccion: ' + address)}
    }

    const validame = () => {
      if (TCB.BaseSolar.length > 0) {
        return false
      } else {
        return 'Debe existir al menos una base'
      } 
    }

    return <>
      <BasesContext.Provider value={{bases, setBases}}>
      <Container>
        <Typography variant='h3'>{t("SIMULATOR.TITLE_LOCATION")}</Typography>
        <Typography variant='body'>{t("SIMULATOR.DESC_LOCATION")}</Typography>

        {/* Aqui va el campo  para introducir una direccion */}
        <div>
              <TextField
              label={t('SIMULATOR.PROMPT_ADDRESS')}
              type="text"
              onChange={ (ev)=>findAddress( ev.target.value ) }
              />
        </div>  

        {/* Aqui va el mapa */}
        <Typography variant='body'>{t("SIMULATOR.PROMPT_DRAW")}</Typography>

          {/* <MapWrapper /> */}

        {/* Este boton simula la creacion de una base en el mapa */}
        <div>
          <Button
              variant="contained"
              onClick={ ()=> {
              let tarea = (Math.random() * 100) 
              let aBase = {                
                  idBaseSolar: TCB.featIdUnico,
                  nombreBaseSolar: "Area " + TCB.featIdUnico++,
                  areaMapa: tarea,
                  areaReal: tarea, 
                  inclinacionTejado: 0,
                  inAcimut: 0,
              }
              
              setBases([...bases, aBase])
              console.log(bases)
              TCB.BaseSolar.push( new BaseSolar(aBase)) 
              }}
            >
            {t('SIMULATOR.LABEL_CREATEAREA')}
          </Button>
        </div>

        <div>
          <Wizard variant='tabs'>
                <AreasStep label="area" title={t("SIMULATOR.LABEL_AREASDISPONIBLES")} validate={validame}/>
                <TiltStep label="tilt" title={t("SIMULATOR.LABEL_TILT")} />
                <AzimutStep label="azimut" title={t("SIMULATOR.LABEL_AZIMUT")} />
                <SummaryStep label="summary" title={t("SIMULATOR.LABEL_SUMMARY")} />
          </Wizard>
        </div>
      </Container>
      </BasesContext.Provider>
    </>
}

export default LocationStep;