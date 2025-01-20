import { createContext, useContext, useState } from 'react'

import { useTranslation } from 'react-i18next'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

// Create the context
const AlertContext = createContext()

// Custom hook to use the dialog
export const useAlert = () => useContext(AlertContext)

export const AlertProvider = ({ children }) => {
  const { t } = useTranslation()
  const [dialogState, setDialogState] = useState({
    open: false,
    title: '',
    message: '',
    level: '',
    onConfirm: null,
  })

  const bColor = { Error: 'red', Warning: 'yellow', Message: 'green' }

  /**
   * Es la función llamada desde el Wizard para la gestion de la ventana de localización
   * @param {string} title Titulo del dialogo mostrado
   * @param {string} message Mensaje
   * @param {string} level [Error, Warning, Message] determina el color background
   * @returns {boolean} true si todo ha ido bien false si algo ha fallado
   */
  const SLDRAlert = (title, message, level) => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        title: title,
        message: message,
        level: level,
        onConfirm: () => {
          resolve() // Resolve the promise when OK is clicked
          setDialogState((prev) => ({ ...prev, open: false }))
        },
      })
    })
  }

  return (
    <AlertContext.Provider value={{ SLDRAlert }}>
      {children}
      <Dialog
        open={dialogState.open}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
      >
        <DialogTitle
          sx={{
            backgroundColor: bColor[dialogState.level],
          }}
        >
          {dialogState.title}
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: bColor[dialogState.level],
          }}
        >
          <DialogContentText dangerouslySetInnerHTML={{ __html: dialogState.message }} />
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: bColor[dialogState.level],
          }}
        >
          <Button
            onClick={() => {
              if (dialogState.onConfirm) dialogState.onConfirm()
            }}
            autoFocus
          >
            {t('BASIC.LABEL_CLOSE')}
          </Button>
        </DialogActions>
      </Dialog>
    </AlertContext.Provider>
  )
}
