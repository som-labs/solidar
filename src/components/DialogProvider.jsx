// Dialog provider enables imperative dialog opening
// avoiding keeping dialog opening state.
// Children can access useDialog() custom hook which
// provides openDialog and closeDialog functions.
// The first one appends the provided component
// as direct child of the Provider.
// Multiple dialogs are stacked in opening order.
//
// At some upper level component use
//
// import DialogProvider from 'DialogProvider'
//
// and then, in the top level component:
//
// return (<>
//   ...
//   <DialogProvider>
//     ... {/* here the components that open dialogs */}
//   </DialogProvider>
//   ...
//   </>)
//
// Then in your inner component:
//
// import {useDialog} from 'DialogProvider'
//
// function MyComponent(...) {
// ...
// [ openDialog, closeDialog ] = useDialog()
//
//   function handleOpenMyDialog(...) {
//      openDialog(<MyDialogComponent onClose={closeDialog} ... />)
//   }
// }
//
// MyDialogComponent should not provide the <Dialog> component
// but the content.
//
//

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
  const { children, open, onClose, onKill, fullScreenBelow = 'md', ...extraprops } = props

  let fullScreen, maxWidth
  const theme = useTheme()
  fullScreen = useMediaQuery(theme.breakpoints.down(fullScreenBelow))
  if (props.children.props.fullScreen !== undefined) {
    fullScreen = props.children.props.fullScreen
  }
  if (props.children.props.maxWidth !== undefined) {
    maxWidth = props.children.props.maxWidth
  }

  return (
    <Dialog
      TransitionComponent={Transition}
      TransitionProps={{
        onExited: onKill,
      }}
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      scroll="paper"
      maxWidth={maxWidth}
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

      //Removed line to avoid closing all dialogs when stacked.
      //if (latestDialog.children.props.onClose) latestDialog.children.props.onClose(args)
      const t = [...dialogs].concat({ ...latestDialog, open: false })
      return t
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
