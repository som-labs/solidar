import { useTranslation } from 'react-i18next'
import { Typography, Box, Button } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useTheme } from '@mui/material/styles'

export default function HelpEnergyBalance(props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const level = props.level

  if (level === 1)
    return (
      <>
        <DialogTitle sx={theme.titles.level_1}>
          {t('ENERGY_BALANCE.ADVISE_TITLE')}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', flex: 1 }}
          >
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
  if (level === 2)
    return (
      <>
        <DialogTitle sx={theme.titles.level_1}>
          {t('ENERGY_BALANCE.TITLE_DISCLAIMER_PRODUCCION')}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 8,
              mt: '1rem',
            }}
          >
            <Box sx={{ display: 'flex', flex: 1 }}>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('ENERGY_BALANCE.DESCRIPTION_DISCLAIMER_PRODUCCION_SI'),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flex: 1 }}>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('ENERGY_BALANCE.DESCRIPTION_DISCLAIMER_PRODUCCION_NO'),
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ mt: '1rem' }}>
          <Button onClick={() => props.onClose()}>{t('BASIC.LABEL_CANCEL')}</Button>
        </DialogActions>
      </>
    )
}
