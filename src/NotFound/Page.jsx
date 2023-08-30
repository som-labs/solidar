import React from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import AppFrame from '../components/AppFrame'
import koFirefly from '../assets/cuca-marejada.svg'
import { useNavigate } from 'react-router-dom'

export default function Page() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  return (
    <>
      <AppFrame>
        <Container
          sx={{
            display: 'flex',
            flexFlow: 'column',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Typography variant="h4">{t('APP_FRAME.PAGE_NOT_FOUND')}</Typography>
          <img
            src={koFirefly}
            style={{
              maxHeight: '10rem',
              marginBlock: '2rem',
            }}
          />
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button variant="contained" color="secondary" onClick={() => navigate('/')}>
              {t('APP_FRAME.GO_HOME')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/simulator')}
            >
              {t('APP_FRAME.GO_SIMULATOR')}
            </Button>
          </Box>
        </Container>
      </AppFrame>
    </>
  )
}
