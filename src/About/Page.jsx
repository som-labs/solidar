import React from 'react'
import { useTranslation } from 'react-i18next'


export default function Page() {
  const {t, i18n} = useTranslation()
  return <>
    <h1>About page</h1>
  </>
}

