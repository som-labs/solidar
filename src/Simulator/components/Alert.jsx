import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

const Alert = ({ contents, onClose }) => {
  const handleClose = () => {
    onClose()
  }

  console.log('AALLERT!')

  return (
    <div>
      <DialogTitle id="alert-dialog-title">{contents.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {contents.description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </div>
  )
}
export default Alert
