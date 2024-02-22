import { useTranslation } from 'react-i18next'
import { Typography, Box, Button } from '@mui/material'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'
//import { useDialog } from '../../components/DialogProvider'

export default function HelpAvailableAreas(props) {
  const { t } = useTranslation()
  const { lat, lon, title } = props
  //const [openDialog, closeDialog] = useDialog()
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

              <img
                width={567}
                height={201}
                id="Imagen 2"
                src="./datos/image001.png"
              ></img>
            </>
          )}
          {props.level === 2 && (
            <>
              <Typography variant="body"> {t('LOCATION.HELP.DOS_AGUAS')}</Typography>
              <img
                width={566}
                height={183}
                id="Imagen 1"
                src="./datos/image002.jpg"
              ></img>
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
                    <source src="./datos/sombras.mp4" type="video/mp4" />
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
        {/* REVISAR: CloseDialog cierra los dos dialogos abiertos 
        <Button
          onClick={() =>
            openDialog({
              children: <HelpAvailableAreas level={2} onClose={() => closeDialog()} />,
            })
          }
        >
          {t('BASIC.LABEL_OK')}
        </Button>
        */}
      </DialogActions>
    </>
  )
}
