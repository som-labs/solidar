import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function GraphBoxAutoconsumo() {
  const { t, i18n } = useTranslation()

  let gapConsumo
  let gapProduccion
  let heightGap
  let coef

  if (TCB.consumo.cTotalAnual > TCB.produccion.pTotalAnual) {
    gapConsumo = false
    gapProduccion = true
    coef = 200 / TCB.consumo.cTotalAnual
    heightGap = (TCB.consumo.cTotalAnual - TCB.produccion.pTotalAnual) * coef
  } else {
    gapConsumo = true
    gapProduccion = false
    coef = 200 / TCB.produccion.pTotalAnual
    heightGap = (TCB.produccion.pTotalAnual - TCB.consumo.cTotalAnual) * coef
  }

  const heightAutoconsumo = parseInt(TCB.balance.autoconsumo * coef)
  const heightConsumo = parseInt(
    (TCB.consumo.cTotalAnual - TCB.balance.autoconsumo) * coef,
  )
  const heightProduccion = parseInt(
    (TCB.produccion.pTotalAnual - TCB.balance.autoconsumo) * coef,
  )

  return (
    <Box
      id="F"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        boxShadow: 2,
        border: 2,
        borderColor: 'primary.light',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        mt: 3,
        mb: 3,
      }}
    >
      <Box
        id="F1"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          borderColor: 'primary.light',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          width: '80%',
        }}
      >
        <Box
          id="F1C1"
          sx={{
            flex: 1,
            display: 'flex',
            flexFlow: 'column',
          }}
        >
          {gapConsumo && (
            <>
              <Box
                id="F1C1G"
                sx={{
                  height: heightGap,
                  backgroundColor: 'rgba(0,0,0,0)',
                  display: 'flex',
                }}
              ></Box>
            </>
          )}

          <Box
            id="F1C1C"
            sx={{
              height: heightConsumo,
              backgroundColor: '#FFB266',
              display: 'flex',
            }}
          ></Box>
        </Box>
        <Box
          id="F1C2"
          sx={{
            flex: 1,
            display: 'flex',
            flexFlow: 'column',
          }}
        >
          {gapProduccion && (
            <>
              <Box
                id="F1C2G"
                sx={{
                  height: heightGap,
                  backgroundColor: 'rgb(0,0,0,0)',
                  display: 'flex',
                }}
              ></Box>
            </>
          )}
          <Box
            id="F1C2P"
            sx={{
              height: heightProduccion,
              backgroundColor: '#33FF33',
              display: 'flex',
            }}
          ></Box>
        </Box>
      </Box>

      <Box
        id="F2"
        sx={{
          display: 'flex',
          border: '3px dashed green',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          width: '80%',
        }}
      >
        <Box
          id="F2C1"
          sx={{
            height: heightAutoconsumo,
            backgroundColor: '#FFFF66',
            display: 'flex',
            verticalAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Typography variant="h5" textAlign={'center'}>
            {t('ENERGY_BALANCE.LABEL_AUTOCONSUMO')}
          </Typography>
        </Box>
        <Box
          id="F2C2"
          sx={{
            height: heightAutoconsumo,
            backgroundColor: '#FFFF66',
            display: 'flex',
            verticalAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Typography variant="h5" textAlign={'right'}>
            {UTIL.formatoValor('energia', TCB.balance.autoconsumo)}
          </Typography>
        </Box>
      </Box>
      <Box
        id="F3"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          width: '80%',
          mt: 2,
        }}
      >
        <Box
          id="F3C1"
          sx={{
            mr: '0.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            verticalAlign: 'center',
            flex: 1,
          }}
        >
          <Typography variant="body" textAlign={'center'}>
            {t('Consumo.LABEL_cTotalAnual')}
          </Typography>
        </Box>
        <Box
          id="F3C2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <Typography variant="body" textAlign={'center'}>
            {t('Produccion.LABEL_pTotalAnual')}
          </Typography>
        </Box>
      </Box>
      <Box
        id="F4"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          width: '80%',
        }}
      >
        <Box
          id="F4C1"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <Typography variant="h5" textAlign={'center'}>
            {UTIL.formatoValor('energia', TCB.consumo.cTotalAnual)}
          </Typography>
        </Box>
        <Box
          id="F4C1"
          sx={{
            mr: '0.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <Typography variant="h5" textAlign={'center'}>
            {UTIL.formatoValor('energia', TCB.produccion.pTotalAnual)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
