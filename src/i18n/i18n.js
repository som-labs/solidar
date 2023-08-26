import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import LOCALE_CA from './locale-ca.yaml'
import LOCALE_ES from './locale-es.yaml'
import LOCALE_GL from './locale-gl.yaml'
import LOCALE_EU from './locale-eu.yaml'

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
  .use(LanguageDetector) // detects language in the browser
  .init({
    resources,
    fallbackLng: 'es',
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      lookupQuerystring: 'lang',
    },
  })

export default i18n
