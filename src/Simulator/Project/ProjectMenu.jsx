/**
 * @module  projectMenu
 * @fileoverview Módulo para la gestion de la información general de proyecto.

 * @version      
 * @author       José Luis García (SOM Madrid)
 * @copyright
 */

import { useTranslation } from 'react-i18next'

// MUI objects
import ImportExport from '@mui/icons-material/ImportExport'
import IconButton from '@mui/material/IconButton'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import DialogProject from './DialogProject'

export default function ProjectMenu() {
  const { t } = useTranslation()
  const [openDialog, closeDialog] = useDialog()

  function openDialogProject() {
    openDialog({
      children: <DialogProject onClose={closeDialog} />,
    })
  }

  return (
    <>
      <IconButton
        color={'inherit'}
        aria-label={t('APP_FRAME.IMPORT_EXPORT')}
        title={t('APP_FRAME.IMPORT_EXPORT')}
        onClick={openDialogProject}
      >
        <ImportExport />
      </IconButton>
    </>
  )
}
