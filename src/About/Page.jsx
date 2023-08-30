import React from 'react'
import { useTranslation } from 'react-i18next'
import AppFrame from '../components/AppFrame'

export default function Page() {
  const { t, i18n } = useTranslation()
  return (
    <>
      <AppFrame>
        <h1>About page</h1>
      </AppFrame>
    </>
  )
}
