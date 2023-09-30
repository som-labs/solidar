// Dialog provider enables imperative dialog opening
// avoiding keeping dialog opening state.
// Children can access useDialog() custom hook which
// provides openDialog and closeDialog functions.
// The first one appends the provided component
// as direct child of the Provider.

// based on https://stackoverflow.com/questions/63737526/material-ui-how-to-open-dialog-imperatively-programmatically/63737527#63737527

import React from 'react'
import Dialog from '@mui/material/Dialog'
import Grow from '@mui/material/Grow'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

const no_function = () => {}

const DialogContext = React.createContext([no_function, no_function])

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow ref={ref} {...props} />
})

function DialogContainer(props) {
  const { children, open, onClose, onKill, fullScreenBelow='md', ...extraprops } = props
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down(fullScreenBelow))

  return (
    <Dialog
      TransitionComponent={Transition}
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      TransitionProps={{
        onExited: onKill,
      }}
      scroll="paper"
      {...extraprops}
    >
      {children}
    </Dialog>
  )
}

export default function DialogProvider({ children }) {
  const [dialogs, setDialogs] = React.useState([])
  const createDialog = (option) => {
    const dialog = { ...option, open: true }
    setDialogs((dialogs) => [...dialogs, dialog])
  }

  const closeDialog = () => {
    setDialogs((dialogs) => {
      const latestDialog = dialogs.pop()
      if (!latestDialog) return dialogs
      if (latestDialog.onClose) latestDialog.onClose()
      return [...dialogs].concat({ ...latestDialog, open: false })
    })
  }
  const contextValue = React.useRef([createDialog, closeDialog])

  return (
    <DialogContext.Provider value={contextValue.current}>
      {children}
      {dialogs.map((dialog, i) => {
        const { onClose, ...dialogParams } = dialog
        const handleKill = () => {
          if (dialog.onExited) dialog.onExited()
          setDialogs((dialogs) => dialogs.slice(0, dialogs.length - 1))
        }

        return (
          <DialogContainer
            key={i}
            onClose={closeDialog}
            onKill={handleKill}
            {...dialogParams}
          />
        )
      })}
    </DialogContext.Provider>
  )
}

export const useDialog = () => React.useContext(DialogContext)
