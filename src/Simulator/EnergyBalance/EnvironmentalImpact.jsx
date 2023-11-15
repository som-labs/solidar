import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function EnvironmentalImpact() {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Container>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Typography variant="h4">
            {t('ENERGY_BALANCE.TITLE_ENVIRONMENTAL_IMPACT')}
          </Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ENERGY_BALANCE.DESCRIPTION_ENVIRONMENTAL_IMPACT'),
            }}
          />
          <Typography variant="h4" color={'green'} textAlign={'center'}>
            Gráficos de ahorro CO2
          </Typography>
          <br />
        </Box>
      </Container>
    </>
  )
}
