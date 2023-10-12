import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import TCB from '../classes/TCB.js'
import TCBContext from '../TCBContext.jsx'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import MapComponent from './MapComponent.jsx'
import Summary from './Summary/Summary.jsx'

const LocationStep = () => {

    const { t, i18n } = useTranslation()

    return <>
      <Container>
        <Typography variant='h3'>{t("LOCATION.TITLE")}</Typography>
        <Typography variant='body'>{t("LOCATION.DESCRIPTION")}</Typography>
         {/* REVISAR los eventos del mapa*/}
        <Typography variant='body'>{t("LOCATION.PROMPT_DRAW")}</Typography>
        {/* REVISAR: hay que ver como onseguir que la mapa permanezca en el estado definido por el usuario al volver de otras pestañas */}
        <MapComponent />
        <div>
          <Summary></Summary>
        </div>
      </Container>
    </>
}

export default LocationStep;