import { useTranslation } from 'react-i18next'
import { Typography, Box } from '@mui/material'
import { DialogContent, DialogTitle } from '@mui/material'

export default function HelpAvailableAreas(props) {
  const { t } = useTranslation()
  return (
    <>
      <DialogTitle>{t('LOCATION.HELP.TITLE')}</DialogTitle>
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
        </Box>
      </DialogContent>
    </>
  )
}
