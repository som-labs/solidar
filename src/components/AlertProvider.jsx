import { createContext, useContext, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

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
  const theme = useTheme()

  const [dialogState, setDialogState] = useState({
    open: false,
    title: '',
    message: '',
    level: '',
    onConfirm: null,
  })

  const bColor = {
    Error: theme.alert.color.Error,
    Warning: theme.alert.color.Warning,
    Message: theme.alert.color.Message,
  }

  /**
   * Es la función llamada desde el Wizard para la gestion de la ventana de localización
   * @param {string} title Titulo del dialogo mostrado
   * @param {string} message Mensaje
   * @param {string} level [Error, Warning, Message] determina el color background
   * @param {boolean} confirm If true will act as confirm dialog, if not as alert
   * @returns {boolean} true si todo ha ido bien false si algo ha fallado
   */
  const SLDRAlert = (title, message, level, confirm = false) => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        title: title,
        message: message,
        level: level,
        confirm: confirm,
        onConfirm: () => {
          resolve(true)
          setDialogState((prev) => ({ ...prev, open: false }))
        },
        onCancel: () => {
          setDialogState((prev) => ({ ...prev, open: false }))
          resolve(false)
        },
      })
    })
  }

  return (
    <AlertContext.Provider value={{ SLDRAlert }}>
      {children}
      <Dialog
        open={dialogState.open}
        disableEscapeKeyDown // Prevent closing with Escape key
        onClose={(event, reason) => {
          // Ignore backdrop click and Escape key
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setDialogState((prev) => ({ ...prev, open: false }))
          }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: bColor[dialogState.level],
            color: theme.alert.text,
          }}
        >
          {dialogState.title}
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: bColor[dialogState.level],
          }}
        >
          <DialogContentText
            sx={{ color: theme.alert.text }}
            dangerouslySetInnerHTML={{ __html: dialogState.message }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: bColor[dialogState.level],
          }}
        >
          {dialogState.confirm ? (
            <Button
              onClick={() => {
                if (dialogState.onConfirm) dialogState.onCancel()
              }}
              autoFocus
            >
              {t('BASIC.LABEL_NO')}
            </Button>
          ) : (
            ''
          )}
          <Button
            onClick={() => {
              if (dialogState.onConfirm) dialogState.onConfirm()
            }}
            autoFocus
          >
            {dialogState.confirm ? t('BASIC.LABEL_YES') : t('BASIC.LABEL_CLOSE')}
          </Button>
        </DialogActions>
      </Dialog>
    </AlertContext.Provider>
  )
}
