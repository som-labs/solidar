import React from 'react'
import { useTranslation } from 'react-i18next'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

const SummaryStep = () => {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Container>
        <Typography variant="h3">{t('SUMMARY.TITLE')}</Typography>
        <Typography variant="body">{t('SUMMARY.DESCRIPTION')}</Typography>
      </Container>
    </>
  )
}

export default SummaryStep
