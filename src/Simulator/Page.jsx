import React from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'


export default function Page() {
  const {t, i18n} = useTranslation()
  return <>
    <h1>Simulator page</h1>
    <Button variant="outlined">Go</Button>
  </>
}

