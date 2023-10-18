import React from 'react'
import { useTranslation } from 'react-i18next'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

const EconomicBalanceStep = () => {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Container>
        <Typography variant="h3">{t('ECONOMIC_BALANCE.TITLE')}</Typography>
        <Typography variant="body">{t('ECONOMIC_BALANCE.DESCRIPTION')}</Typography>
      </Container>
    </>
  )
}

export default EconomicBalanceStep
