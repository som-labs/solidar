import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import LOCALE_CA from './locale-ca.yaml'
import LOCALE_ES from './locale-es.yaml'
import LOCALE_GL from './locale-gl.yaml'
import LOCALE_EU from './locale-eu.yaml'

console.log("LOCALE_ES",LOCALE_ES)

const resources = {
  ca: {
    translation: { ...LOCALE_CA }
  },
  es: {
    translation: { ...LOCALE_ES }
  },
  gl: {
    translation: { ...LOCALE_GL }
  },
  eu: {
    translation: { ...LOCALE_EU }
  }
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'es',
    lng: 'es',
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n