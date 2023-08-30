import React from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import AppFrame from '../components/AppFrame'

export default function Page() {
  const { t, i18n } = useTranslation()
  return (
    <>
      <AppFrame>
        <Container>
          <h1>Simulator page</h1>
          <Button variant="outlined">Go</Button>
        </Container>
      </AppFrame>
    </>
  )
}
