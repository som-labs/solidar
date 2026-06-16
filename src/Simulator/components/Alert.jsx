import { createContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useDialog } from '../../components/DialogProvider'

const AlertContext = createContext()

// MUI objects
import HelpIcon from '@mui/icons-material/Help'
import IconButton from '@mui/material/IconButton'

const colorPorTipo = {
  Mensaje: 'info.light',
  Aviso: 'warning.light',
  Error: 'error.light',
}

function BasicAlert(props) {
  const { t } = useTranslation()
  const { title, contents, type, onClose } = props

  const bgColor = colorPorTipo[type] ?? 'grey.200'

  return (
    <>
      <DialogTitle sx={{ backgroundColor: bgColor }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" sx={{ whiteSpace: 'pre-line' }}>
          {contents}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          {t('BASIC.LABEL_CLOSE')}
        </Button>
      </DialogActions>
    </>
  )
}

const AlertProvider = ({ children }) => {
  const [inLineHelp, setInLineHelp] = useState(false)
  const [openDialog, closeDialog] = useDialog()

  /** Muestra dialogo de alerta
   * @param {String} title
   * @param {String} mensaje
   * @param {String} type ['Mensaje', 'Aviso', "Error"]
   */
  function SLDRAlert(title, message, type) {
    openDialog({
      children: (
        <BasicAlert
          title={title}
          contents={message}
          type={type}
          onClose={() => closeDialog()}
        ></BasicAlert>
      ),
    })
  }

  function DisplayInLineHelp() {
    console.log('inlinehelp')
    const swapInLineHelp = () => {
      setInLineHelp(!inLineHelp)
    }

    return (
      <>
        <IconButton color={'inherit'} onClick={swapInLineHelp}>
          <HelpIcon />
        </IconButton>
      </>
    )
  }

  //DEMO: Detalle
  const contextValue = {
    SLDRAlert,
    inLineHelp,
    setInLineHelp,
    DisplayInLineHelp,
  }
  return <AlertContext.Provider value={contextValue}>{children}</AlertContext.Provider>
}

export { AlertContext, AlertProvider }
