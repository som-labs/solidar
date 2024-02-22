import { useTranslation } from 'react-i18next'
import { Typography, Box, Button } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'
//import { useDialog } from '../../components/DialogProvider'

export default function HelpExcedentCompensation(props) {
  const { t } = useTranslation()

  //const [openDialog, closeDialog] = useDialog()
  return (
    <>
      <DialogTitle>{t('CONSUMPTION.COMPENSACION_TITLE')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', flex: 1 }}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('CONSUMPTION.COMPENSACION_DESCRIPTION'),
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ mt: '1rem' }}>
        <Button onClick={() => props.onClose()}>{t('BASIC.LABEL_CANCEL')}</Button>
      </DialogActions>
    </>
  )
}
