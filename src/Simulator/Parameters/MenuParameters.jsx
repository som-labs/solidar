import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import SettingsIcon from '@mui/icons-material/Settings'
import IconButton from '@mui/material/IconButton'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import DialogParameters from './DialogParameters'

//Solidar objects
import TCB from '../classes/TCB'
import TCBContext from '../TCBContext'

export default function MenuParameter() {
  const { t } = useTranslation()
  const [openDialog, closeDialog] = useDialog()

  const { parameters, setParameters } = useContext(TCBContext)
  const [newParameters, setNewParameters] = useState(parameters)

  function openParameters() {
    openDialog({
      children: (
        <DialogParameters
          newParameters={parameters}
          updateParameters={updateParameters}
          onClose={endDialog}
        />
      ),
    })
  }

  function updateParameters(params) {
    console.log('UPDATEPARAMETERS', params)
    setNewParameters((prevParam) => ({
      ...prevParam,
      ...params,
    }))
  }

  function endDialog(reason) {
    console.log('VUELVO', reason)
    if (reason === undefined) return
    console.log('NEWPARAMETERS En MENU', newParameters)
    if (reason === 'save') {
      setParameters((prevParam) => ({
        ...prevParam,
        ...newParameters,
      }))
      console.log('UPDATETCB', newParameters)
      for (const objProp in newParameters) {
        TCB.parametros[objProp] = newParameters[objProp]
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
