import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Typography, Container } from '@mui/material'

import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'
import { useTheme } from '@mui/material/styles'
import { EnergyContext } from '../EnergyContext'

export default function EnvironmentalImpact() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { produccionGlobal } = useContext(EnergyContext)

  const radiusNoRenovable = 200
  const radiusRenovable = parseInt(
    (radiusNoRenovable * produccionGlobal.CO2AnualRenovable) /
      produccionGlobal.CO2AnualNoRenovable,
  )
  return (
    <>
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            width: '100%',
            mt: '1rem',
            mb: '1rem',
          }}
        >
          <Typography sx={theme.titles.level_2} textAlign={'center'} color={'#4D4D4D'}>
            {t('ENERGY_BALANCE.TITLE_graficoCO2')}
          </Typography>

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
                <Typography
                  variant="h6"
                  textAlign={'center'}
                  color={theme.palette.circulo.text}
                >
                  {UTIL.formatoValor(
                    'CO2AnualRenovable',
                    produccionGlobal.CO2AnualRenovable,
                  )}
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
                  {UTIL.formatoValor(
                    'CO2AnualNoRenovable',
                    produccionGlobal.CO2AnualNoRenovable,
                  )}
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
            href="./datos/Factores_emision_CO2.pdf"
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
