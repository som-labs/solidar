import { useTranslation } from 'react-i18next'
import { Typography, Box, Button } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'

export default function HelpDistribuidora(props) {
  const { t } = useTranslation()

  return (
    <>
      <DialogTitle>{t('CONSUMPTION.TITLE_USO_DISTRIBUIDORA')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', flex: 1 }}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('CONSUMPTION.DESCRIPTION_USO_DISTRIBUIDORA'),
            }}
          />

          <Box sx={{ display: 'flex', flex: 1 }}>
            <ul>
              <li>
                <a
                  href={t('CONSUMPTION.INSTRUCTIONS_IDE_LINK')}
                  target="_blank"
                  rel="noreferrer"
                >
                  i-DE- Iberdrola distribución
                </a>
              </li>
              <li>
                <a
                  href={t('CONSUMPTION.INSTRUCTIONS_EDIST_LINK')}
                  target="_blank"
                  rel="noreferrer"
                >
                  E-distribución - Endesa distribución
                </a>
              </li>
              <li>
                <a
                  href={t('CONSUMPTION.INSTRUCTIONS_UFD_LINK')}
                  target="_blank"
                  rel="noreferrer"
                >
                  UFD - Grupo Naturgy - Unión Fenosa Distribución
                </a>
              </li>
              <li>
                <a
                  href={t('CONSUMPTION.INSTRUCTIONS_EREDES_LINK')}
                  target="_blank"
                  rel="noreferrer"
                >
                  E-REDES - Empresa distribuidora del grupo EDP
                </a>
              </li>
              <li>
                <a
                  href={t('CONSUMPTION.INSTRUCTIONS_VIESGO_LINK')}
                  target="_blank"
                  rel="noreferrer"
                >
                  Viesgo - Viesgo Distribución
                </a>
              </li>
            </ul>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ mt: '1rem' }}>
        <Button onClick={() => props.onClose()}>{t('BASIC.LABEL_CANCEL')}</Button>
      </DialogActions>
    </>
  )
}
