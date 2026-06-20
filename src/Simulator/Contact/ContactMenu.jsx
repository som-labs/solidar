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
  const phpFileURL = TCB.basePath + 'contacto.php'
  fetch(phpFileURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })
    .then((response) => {
      if (!response.ok) {
        console.log(response)
        throw new Error('Network response was not ok.')
      }
      return response.text()
    })
    .then((data) => {
      alert(data)
    })
    .catch((error) => {
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
        aria-label={t('CONTACTO.DIALOG_TITLE')}
        title={t('CONTACTO.DIALOG_TITLE')}
        onClick={openDialogContact}
      >
        <EmailIcon />
      </IconButton>
    </>
  )
}
