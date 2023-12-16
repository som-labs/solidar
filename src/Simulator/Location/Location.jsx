import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

// REACT Solidar Components
import MapComponent from './MapComponent'
import BasesSummary from './BasesSummary'
import InputContext from '../InputContext'

const LocationStep = () => {
  const { t } = useTranslation()
  const { bases, setBases } = useContext(InputContext)
  return (
    <>
      <Container
        maxWidth="lg"
        //PENDIENTE: se pretende definir el formato de los headers de las tablas pero solo funciona el BackgroundColor
        // sx={{
        //   width: '100%',
        //   '.dataGrid-headers': {
        //     backgroundColor: 'rgb(200, 249, 233)',
        //     fontWeight: 'bold',
        //     textAlign: 'center',
        //   },
        // }}
      >
        <Typography variant="h3">{t('LOCATION.TITLE')}</Typography>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('LOCATION.DESCRIPTION'),
          }}
        />
        <MapComponent></MapComponent>
        <BasesSummary></BasesSummary>
      </Container>
    </>
  )
}

export default LocationStep
