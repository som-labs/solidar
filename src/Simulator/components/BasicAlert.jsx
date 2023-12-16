import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

export default function BasicAlert(props) {
  const { title, contents, type, onClose } = props
  return (
    <>
      <DialogTitle>{type + '--' + title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{contents}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Agree
        </Button>
      </DialogActions>
    </>
  )
}
