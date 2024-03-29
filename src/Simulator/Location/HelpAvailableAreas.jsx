import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Box, Button } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'

//Solidar assets
import image001 from '../assets/image001.png'
import image002 from '../assets/image002.jpg'
import sombras from '../assets/sombras.mp4'

export default function HelpAvailableAreas(props) {
  const { t } = useTranslation()
  const { lat, lon, title } = props

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', flex: 1 }}>
          {props.level === 1 && (
            <>
              <Typography variant="body" sx={{ mb: '1rem' }}>
                {' '}
                {t('LOCATION.HELP.CUALES')}
              </Typography>
              {/* <Typography variant="body"> {t('LOCATION.HELP.CUALES_1')}</Typography>
              <Typography variant="body"> {t('LOCATION.HELP.CUALES_2')}</Typography> */}

              <img width={567} height={201} id="Imagen 1" src={image001}></img>
            </>
          )}
          {props.level === 2 && (
            <>
              <Typography variant="body"> {t('LOCATION.HELP.DOS_AGUAS')}</Typography>
              <img width={566} height={183} id="Imagen 2" src={image002}></img>
            </>
          )}
          {props.level === 3 && (
            <>
              <Typography variant="body">{t('LOCATION.HELP.SOMBRAS_1')}</Typography>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div>
                  <video autoPlay width="320" height="200" loop>
                    <source src={sombras} type="video/mp4" />
                  </video>
                </div>
              </div>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('LOCATION.HELP.SOMBRAS_2', { lat: lat, lon: lon }),
                }}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ mt: '1rem' }}>
        <Button onClick={() => props.onClose()}>{t('BASIC.LABEL_CANCEL')}</Button>
      </DialogActions>
    </>
  )
}
