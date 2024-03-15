import { useTranslation } from 'react-i18next'
import { Typography, Box, Button } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'

export default function HelpEnergyBalance(props) {
  const { t } = useTranslation()

  return (
    <>
      <DialogTitle>{t('ENERGY_BALANCE.ADVISE_TITLE')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', flex: 1 }}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ENERGY_BALANCE.ADVISE_DESCRIPTION'),
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
