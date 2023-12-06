import { useTranslation } from 'react-i18next'

// MUI objects
import SettingsIcon from '@mui/icons-material/Settings'
import IconButton from '@mui/material/IconButton'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import DialogParameters from './DialogParameters'

export default function MenuParameter() {
  const { t, i18n } = useTranslation()
  const [openDialog, closeDialog] = useDialog()

  function openParameters() {
    openDialog({
      children: <DialogParameters onClose={closeDialog} />,
    })
  }

  return (
    <>
      <IconButton
        color={'inherit'}
        aria-label={t('APP_FRAME.TOGGLE_COLOR_MODE')}
        title={t('APP_FRAME.TOGGLE_COLOR_MODE')}
        onClick={openParameters}
      >
        <SettingsIcon />
      </IconButton>
    </>
  )
}
