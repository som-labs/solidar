import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import TCB from '../Simulator/classes/TCB'

const translations = import.meta.globEager('./locale-*.yaml')

const resources = Object.fromEntries(
  Object.keys(translations).map((key) => {
    const code = key.slice('./locale-'.length, -'.yaml'.length)
    const translation = translations[key].default
    return [code, { translation }]
  }),
)

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector) // detects language in the browser
  .init({
    resources,
    fallbackLng: 'es', // Comment out to better spot untranslated texts
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: [
        'querystring',
        'cookie',
        'localStorage',
        'sessionStorage',
        'navigator',
        'htmlTag',
        'path',
        'subdomain',
      ],
      lookupQuerystring: 'lang',
    },
  })

// Added line to avoid changing many lines of code in components coming from
TCB.i18next = i18n

export default i18n
