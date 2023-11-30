import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

import * as UTIL from '../classes/Utiles'
import TCB from '../classes/TCB'

export default function EnvironmentalImpact() {
  const { t, i18n } = useTranslation()

  const radiusNoRenovable = 200
  const radiusRenovable = parseInt(
    (radiusNoRenovable * TCB.CO2AnualRenovable) / TCB.CO2AnualNoRenovable,
  )
  //REVISAR: que color poner para que con fondo oscuro los circulos se vean bien
  return (
    <>
      <Container>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Typography variant="h4">
            {t('ENERGY_BALANCE.TITLE_ENVIRONMENTAL_IMPACT')}
          </Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ENERGY_BALANCE.DESCRIPTION_ENVIRONMENTAL_IMPACT'),
            }}
          />
          <Typography variant="h4" color={'green'} textAlign={'center'}>
            {t('ENERGY_BALANCE.TITLE_graficoCO2')}
          </Typography>
          <br />
          <Box
            component="form"
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
                  backgroundColor: 'black',
                  justifyContent: 'center',
                  alignItems: 'center',
                  verticalAlign: 'center',
                }}
              >
                <Typography variant="h6" textAlign={'center'} color={'white'}>
                  {UTIL.formatoValor('peso', TCB.CO2AnualRenovable)}
                </Typography>
              </Box>
              <Typography
                variant="h6"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html: t('ENERGY_BALANCE.LABEL_kgCO2AnualRenovable'),
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
                  backgroundColor: 'black',
                  justifyContent: 'center',
                  alignItems: 'center',
                  verticalAlign: 'center',
                }}
              >
                <Typography variant="h6" textAlign={'center'} color={'white'}>
                  {UTIL.formatoValor('peso', TCB.CO2AnualNoRenovable)}
                </Typography>
              </Box>

              <Typography
                variant="h6"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html: t('ENERGY_BALANCE.LABEL_kgCO2AnualNoRenovable'),
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
