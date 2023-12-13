import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import EmailIcon from '@mui/icons-material/Email'
import IconButton from '@mui/material/IconButton'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import DialogContact from './DialogContact'

//Solidar objects
import TCB from '../classes/TCB'

export default function Contact() {
  const { t, i18n } = useTranslation()
  const [openDialog, closeDialog] = useDialog()

  const defaultData = {
    nombre: '',
    email: '',
    telefono: '',
    gridRadios: 'error',
    mantenerContacto: false,
    mensaje: '',
  }

  const [contactData, setContactData] = useState(defaultData)

  function sendEmail(formData) {
    // Convert the object to a query string
    console.log(contactData)
    //console.log(formData)
    //const queryString = Object.keys(contactData)
    const queryString = Object.keys(contactData)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(contactData[key])}`)
      .join('&')

    if (TCB.modoActivo === 'DESARROLLO')
      TCB.basePath = 'http://localhost/SOM/REACT/solidar/src/Simulator/'

    // URL of the PHP file including the query string
    const phpFileURL = TCB.basePath + `contacto.php?${queryString}`
    console.log(phpFileURL)
    console.log(JSON.stringify(formData))
    // Fetch request to the PHP file
    fetch(phpFileURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok.')
        }
        return response.text() // or response.json() if expecting JSON data
      })
      .then((data) => {
        // Handle the response data from the PHP file
        alert(data)
      })
      .catch((error) => {
        // Handle any errors that occurred during the fetch
        console.error('There was a problem with the fetch operation:', error)
      })
  }

  function openDialogContact() {
    const storedName = sessionStorage.getItem('contacto')

    let parsedMessage = JSON.parse(storedName)
    parsedMessage.mensaje = ''
    setContactData(parsedMessage)

    //REVISAR: En esta llamada si uso contactData como argumento initialData el campo mensaje mantiene el valor original como si la setContactData no hiciera nada, si se usa parsedMessage funcion bien
    openDialog({
      children: (
        <DialogContact
          initialData={contactData} //si uso parsedMessage -> OK
          recoverFormData={getContactFromDialog}
          onClose={() => {}}
        />
      ),
    })
  }

  function getContactFromDialog(reason, formData) {
    // console.log('REASON', reason)
    // console.log('SETFROMDIALOG', formData)

    setContactData(formData)
    if (reason === 'save') {
      sendEmail(formData)
      sessionStorage.setItem('contacto', JSON.stringify(formData))
    }
    closeDialog()
  }

  return (
    <>
      <IconButton
        color={'inherit'}
        aria-label={t('APP_FRAME.TOGGLE_COLOR_MODE')}
        title={t('APP_FRAME.TOGGLE_COLOR_MODE')}
        onClick={openDialogContact}
      >
        <EmailIcon />
      </IconButton>
    </>
  )
}
