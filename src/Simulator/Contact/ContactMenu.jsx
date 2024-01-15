import { useTranslation } from 'react-i18next'

// MUI objects
import EmailIcon from '@mui/icons-material/Email'
import IconButton from '@mui/material/IconButton'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import DialogContact from './DialogContact'

//Solidar objects
import TCB from '../classes/TCB'

export default function ContactMenu() {
  const { t } = useTranslation()
  const [openDialog, closeDialog] = useDialog()

  const defaultData = {
    nombre: '',
    email: '',
    telefono: '',
    gridRadios: 'error',
    mantenerContacto: false,
    mensaje: '',
  }

  //PENDIENTE: convertir a push

  async function sendEmail(message) {
    // Convert the object to a query string
    const queryString = Object.keys(message)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(message[key])}`)
      .join('&')

    if (TCB.modoActivo === 'DESARROLLO')
      TCB.basePath = 'http://localhost/SOM/REACT/solidar/src/Simulator/'

    //URL of the PHP file including the query string
    const phpFileURL = TCB.basePath + `contacto.php?${queryString}`
    console.log(phpFileURL)
    //Fetch request to the PHP file
    fetch(phpFileURL)
      // await fetch(TCB.basePath + 'contacto.php?', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json', // Set the content type to JSON
      //   },
      //   body: JSON.stringify(message),
      // })
      .then((response) => {
        if (!response.ok) {
          console.log(response)
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
    const storedMessage = sessionStorage.getItem('message')
    let previousMessage = storedMessage === null ? defaultData : JSON.parse(storedMessage)
    previousMessage.mensaje = ''

    openDialog({
      children: (
        <DialogContact
          initialData={previousMessage}
          recoverFormData={getContactFromDialog}
          onClose={closeDialog}
        />
      ),
    })
  }

  async function getContactFromDialog(formData) {
    await sendEmail(formData)
    sessionStorage.setItem('message', JSON.stringify(formData))
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
