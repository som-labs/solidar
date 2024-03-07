import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'

// Solidar objects
import * as UTIL from '../classes/Utiles'

export default function GraphBoxSavings() {
  const { t } = useTranslation()

  const { ecoData } = useContext(EconomicContext)
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        boxShadow: 2,
        flex: 1,
        width: '100%',
        border: 2,
        borderColor: 'primary.light',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}
    >
      <Box
        id="B1"
        sx={{
          flex: 1,
          display: 'flex',
          flexFlow: 'column',
        }}
      >
        <Box
          id="B11"
          sx={{
            height: 200,
            backgroundColor: '#FFB266',
            mr: '0.3rem',
            display: 'flex',
          }}
        ></Box>
        <Box
          id="B12"
          sx={{
            mr: '0.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body" textAlign={'center'}>
            {t('Economico.PROP.gastoSinPlacasAnual')}
          </Typography>
        </Box>
        <Box
          id="B13"
          sx={{
            mr: '0.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5" textAlign={'center'}>
            {UTIL.formatoValor('dinero', ecoData.gastoSinPlacasAnual)}
          </Typography>
        </Box>
      </Box>
      <Box
        id="B2"
        sx={{
          flex: 1,
          display: 'flex',
          flexFlow: 'column',
        }}
      >
        <Box
          id="B21"
          sx={{
            height: parseInt((200 / ecoData.gastoSinPlacasAnual) * ecoData.ahorroAnual),
            mr: '0.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0)',
            flexFlow: 'column',
            border: '2px dashed grey',
          }}
        >
          <Typography variant="body" textAlign={'center'}>
            {'ahorro anual'}
          </Typography>
          <Typography variant="h5" textAlign={'center'}>
            {UTIL.formatoValor('dinero', ecoData.ahorroAnual)}
          </Typography>
          <Typography variant="body" textAlign={'center'}>
            {UTIL.formatoValor(
              'porciento',
              (ecoData.ahorroAnual / ecoData.gastoSinPlacasAnual) * 100,
            )}
          </Typography>
        </Box>
        <Box
          id="B22"
          sx={{
            height: parseInt(
              (200 / ecoData.gastoSinPlacasAnual) * ecoData.gastoConPlacasAnual,
            ),
            mr: '0.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFB266',
          }}
        ></Box>
        <Box
          id="B23"
          sx={{
            mr: '0.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body" textAlign={'center'}>
            {t('Economico.PROP.gastoConPlacasAnual')}
          </Typography>
        </Box>
        <Box
          id="B24"
          sx={{
            mr: '0.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5" textAlign={'center'}>
            {UTIL.formatoValor('dinero', ecoData.gastoConPlacasAnual)}
          </Typography>
        </Box>
      </Box>
      {UTIL.suma(ecoData.perdidaMes) > 0 && (
        <Box
          id="B3"
          sx={{
            flex: 1,
            display: 'flex',
            flexFlow: 'column',
          }}
        >
          <Box
            id="B31"
            sx={{
              height: parseInt(
                (200 / ecoData.gastoSinPlacasAnual) *
                  (ecoData.gastoSinPlacasAnual - UTIL.suma(ecoData.perdidaMes)),
              ),
              mr: '0.3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0)',
            }}
          ></Box>
          <Box
            id="B32"
            sx={{
              height: parseInt(
                (200 / ecoData.gastoSinPlacasAnual) * UTIL.suma(ecoData.perdidaMes),
              ),
              mr: '0.3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'grey',
            }}
          ></Box>
          <Box
            id="B33"
            sx={{
              mr: '0.3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body" textAlign={'center'}>
              {t('Economico.PROP.noCompensadoAnual')}
            </Typography>
          </Box>
          <Box
            id="B34"
            sx={{
              mr: '0.3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h5" textAlign={'right'}>
              {UTIL.formatoValor('dinero', UTIL.suma(ecoData.perdidaMes))}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}
