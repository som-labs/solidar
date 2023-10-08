import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import TCB from '../classes/TCB.js'
import TCBContext from '../TCBContext.jsx'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import MapWrapper from './MapWrapper'

import Wizard from '../../components/Wizard'
import AreasStep from './Areas/Areas.jsx'
import TiltStep from './Tilt/Tilt.jsx'
import AzimutStep from './Azimut/Azimut.jsx'
import SummaryStep from './Summary/Summary.jsx'

const LocationStep = () => {

    const { t, i18n } = useTranslation()

//REVISAR: el mensaje aparece al inicio sin dar al next
    const validame = () => {
      if (TCB.BaseSolar.length > 0) {
        return false
      } else {
        return (t('LOCATION.MSG_alMenosUnaBase'))
      } 
    }

    return <>
      <Container>
        <Typography variant='h3'>{t("LOCATION.TITLE")}</Typography>
        <Typography variant='body'>{t("LOCATION.DESCRIPTION")}</Typography>
         {/* REVISAR los eventos del mapa*/}
        <Typography variant='body'>{t("LOCATION.PROMPT_DRAW")}</Typography>
        {/* REVISAR: hay que ver como onseguir que la mapa permanezca en el estado definido por el usuario al volver de otras pestañas */}
        <MapWrapper/>
        <div>
          <Wizard variant='tabs'>
                <AreasStep label="area" title={t("LOCATION.LABEL_AREASDISPONIBLES")} validate={validame}/>
                <TiltStep label="tilt" title={t("LOCATION.LABEL_TILT")} />
                <AzimutStep label="azimut" title={t("LOCATION.LABEL_AZIMUT")} />
                <SummaryStep label="summary" title={t("LOCATION.LABEL_SUMMARY")} />
          </Wizard>
        </div>
      </Container>
    </>
}

export default LocationStep;