import { useTranslation } from 'react-i18next'

// MUI objects
import SettingsIcon from '@mui/icons-material/Settings'
import IconButton from '@mui/material/IconButton'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import DialogParameters from './DialogParameters'

//Solidar objects
import TCB from '../classes/TCB'

export default function ParametersMenu() {
  const { t } = useTranslation()
  const [openDialog, closeDialog] = useDialog()

  function openParameters() {
    openDialog({
      children: <DialogParameters parameters={TCB.parametros} onClose={endDialog} />,
    })
  }

  function endDialog(reason, values) {
    if (reason === undefined) return
    if (reason === 'save') {
      for (const objProp in values) {
        if (objProp !== 'tecnologia') {
          console.log()
          TCB.parametros[objProp] =
            typeof values[objProp] === 'string'
              ? parseFloat(values[objProp].replace(',', '.'))
              : values[objProp]
        } else {
          TCB.parametros.tecnologia = values.tecnologia
        }
      }
      closeDialog()
    } else {
      closeDialog()
    }
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
