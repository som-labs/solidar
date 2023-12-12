import React from 'react'

import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import { useDialog } from '../../components/DialogProvider'

export default function BasicAlert(desc) {
  const { title, contents, type } = desc
  console.log(desc)

  const [openDialog, closeDialog] = useDialog()

  const handleClose = () => {
    closeDialog()
  }

  openDialog({
    children: (
      <>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{contents}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Agree
          </Button>
        </DialogActions>

        {/* <Alert severity={alert.type} onClose={hideAlert} className={'centered-alert'}>
          {alert.message}
        </Alert> */}
      </>
    ),
  })
}
