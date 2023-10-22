import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import ReactMarkdown from 'react-markdown'
import MapComponent from './MapComponent'
import Summary from './Summary/Summary'

const LocationStep = () => {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Container>
        <Typography variant="h3">{t('LOCATION.TITLE')}</Typography>
        <ReactMarkdown children={t('LOCATION.DESCRIPTION')} />
        <Typography variant="body">{t('LOCATION.PROMPT_DRAW')}</Typography>
        <MapComponent />
        <div>
          <Summary></Summary>
        </div>
      </Container>
    </>
  )
}

export default LocationStep
