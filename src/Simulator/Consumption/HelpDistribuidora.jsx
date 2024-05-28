import { useTranslation } from 'react-i18next'
import { Typography, Box, Button, Grid } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'

export default function HelpDistribuidora(props) {
  const { t, i18n } = useTranslation()

  function getLink(number) {
    let link
    switch (number) {
      case 1:
        switch (i18n.language.substring(0, 2)) {
          case 'ca':
            link = '/datos/Guias publicadas/[CAT] IDE.pdf'
            break
          default:
            link = '/datos/Guias publicadas/[ES] IDE.pdf'
            break
        }
        break
      case 2:
        switch (i18n.language.substring(0, 2)) {
          case 'ca':
            link = '/datos/Guias publicadas/[CAT] E-distribucion.pdf'
            break
          default:
            link = '/datos/Guias publicadas/[ES] E-distribucion.pdf'
            break
        }
        break
      case 3:
        switch (i18n.language.substring(0, 2)) {
          default:
            link = '/datos/Guias publicadas/[ES] UFD.pdf'
            break
        }
        break
      case 4:
        switch (i18n.language.substring(0, 2)) {
          default:
            link = '/datos/Guias publicadas/[ES] E-REDES.pdf'
            break
        }
        break
      case 5:
        switch (i18n.language.substring(0, 2)) {
          default:
            link = '/datos/Guias publicadas/[ES] Viesgo.pdf'
            break
        }
        break
    }

    return link
  }

  //const [openDialog, closeDialog] = useDialog()
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
                <a href={getLink(1)} target="_blank" rel="noreferrer">
                  i-DE- Iberdrola distribución
                </a>
              </li>
              <li>
                <a href={getLink(2)} target="_blank" rel="noreferrer">
                  E-distribución - Endesa distribución
                </a>
              </li>
              <li>
                <a href={getLink(3)} target="_blank" rel="noreferrer">
                  UFD - Grupo Naturgy - Unión Fenosa Distribución
                </a>
              </li>
              <li>
                <a href={getLink(4)} target="_blank" rel="noreferrer">
                  E-REDES - Empresa distribuidora del grupo EDP
                </a>
              </li>
              <li>
                <a href={getLink(5)} target="_blank" rel="noreferrer">
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
