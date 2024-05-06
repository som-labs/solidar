import { useTranslation } from 'react-i18next'
import { Typography, Box, Button } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useTheme } from '@mui/material/styles'

export default function HelpEconomicBalance(props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const level = props.level

  if (level === 1)
    return (
      <>
        <DialogTitle sx={theme.titles.level_1}>
          {t('ECONOMIC_BALANCE.ADVICE_PRICE_TITLE')}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', flex: 1 }}
          >
            <Typography
              variant="body"
              dangerouslySetInnerHTML={{
                __html: t('ECONOMIC_BALANCE.ADVICE_PRICE_DESCRIPTION'),
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
          {t('ECONOMIC_BALANCE.HELP_TITLE_VAN')}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', flex: 1 }}
          >
            <Typography
              variant="body"
              dangerouslySetInnerHTML={{
                __html: t('ECONOMIC_BALANCE.HELP_VAN'),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ mt: '1rem' }}>
          <Button onClick={() => props.onClose()}>{t('BASIC.LABEL_CANCEL')}</Button>
        </DialogActions>
      </>
    )
  if (level === 3)
    return (
      <>
        <DialogTitle sx={theme.titles.level_1}>
          {t('ECONOMIC_BALANCE.HELP_TITLE_TIR')}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', flex: 1 }}
          >
            <Typography
              variant="body"
              dangerouslySetInnerHTML={{
                __html: t('ECONOMIC_BALANCE.HELP_TIR'),
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
