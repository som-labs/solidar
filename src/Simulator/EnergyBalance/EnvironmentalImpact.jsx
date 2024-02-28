import { useTranslation } from 'react-i18next'

import { Box, Typography, Container } from '@mui/material'

import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'
import { useTheme } from '@mui/material/styles'
//import { ColorModeContext } from '../../components/GlobalTheme'

export default function EnvironmentalImpact() {
  const { t } = useTranslation()
  const theme = useTheme()
  //const { current } = React.useContext(ColorModeContext)

  const radiusNoRenovable = 200
  const radiusRenovable = parseInt(
    (radiusNoRenovable * TCB.produccion.CO2AnualRenovable) /
      TCB.produccion.CO2AnualNoRenovable,
  )
  //PENDIENTE: que color poner para que con fondo oscuro los circulos se vean bien. Revisar la cuestion del theme
  return (
    <>
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Typography variant="h4" color={'green'} textAlign={'center'}>
            {t('ENERGY_BALANCE.TITLE_graficoCO2')}
          </Typography>
          <br />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                height: 300,
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  width: radiusRenovable + 'px',
                  height: radiusRenovable + 'px',
                  borderRadius: '50%',
                  backgroundColor: theme.palette.circulo.main,
                  justifyContent: 'center',
                  alignItems: 'center',
                  verticalAlign: 'center',
                }}
              >
                <Typography variant="h6" textAlign={'center'} color={'white'}>
                  {UTIL.formatoValor('peso', TCB.produccion.CO2AnualRenovable)}
                </Typography>
              </Box>
              <Typography
                variant="h6"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html: t('ENERGY_BALANCE.LABEL_CO2AnualRenovable'),
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                height: 300,
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  width: radiusNoRenovable + 'px',
                  height: radiusNoRenovable + 'px',
                  borderRadius: '50%',
                  backgroundColor: theme.palette.circulo.main,
                  justifyContent: 'center',
                  alignItems: 'center',
                  verticalAlign: 'center',
                }}
              >
                <Typography variant="h6" textAlign={'center'} color={'white'}>
                  {UTIL.formatoValor('peso', TCB.produccion.CO2AnualNoRenovable)}
                </Typography>
              </Box>

              <Typography
                variant="h6"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html: t('ENERGY_BALANCE.LABEL_CO2AnualNoRenovable'),
                }}
              />
            </Box>
          </Box>
          <Typography
            variant="h6"
            component="a"
            href="https://energia.gob.es/desarrollo/EficienciaEnergetica/RITE/Reconocidos/Reconocidos/Otros%20documentos/Factores_emision_CO2.pdf"
            target="_blank"
            rel="noopener noreferrer"
            dangerouslySetInnerHTML={{
              __html: t('ENERGY_BALANCE.LABEL_fuenteInfoCO2', {
                territorio: TCB.territorio,
              }),
            }}
          />
        </Box>
      </Container>
    </>
  )
}
