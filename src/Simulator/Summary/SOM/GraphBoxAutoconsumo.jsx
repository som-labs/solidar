import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Solidar objects
import * as UTIL from '../../classes/Utiles'
import { EnergyContext } from '../../EnergyContext'

export default function GraphBoxAutoconsumo() {
  const { t } = useTranslation()
  const { consumoGlobal, produccionGlobal, balanceGlobal } = useContext(EnergyContext)

  //PENDIENTE: analizar mover a Summary ya que no se utiliza en energybalance
  let gapConsumo
  let gapProduccion
  let heightGap
  let coef

  if (consumoGlobal.totalAnual > produccionGlobal.totalAnual) {
    gapConsumo = false
    gapProduccion = true
    coef = 200 / consumoGlobal.totalAnual
    heightGap = (consumoGlobal.totalAnual - produccionGlobal.totalAnual) * coef
  } else {
    gapConsumo = true
    gapProduccion = false
    coef = 200 / produccionGlobal.totalAnual
    heightGap = (produccionGlobal.totalAnual - consumoGlobal.totalAnual) * coef
  }

  const heightAutoconsumo = parseInt(balanceGlobal.autoconsumo * coef)
  const heightConsumo = parseInt(
    (consumoGlobal.totalAnual - balanceGlobal.autoconsumo) * coef,
  )
  const heightProduccion = parseInt(
    (produccionGlobal.totalAnual - balanceGlobal.autoconsumo) * coef,
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
              backgroundColor: 'rgba(255,178,102,1)',
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
              backgroundColor: 'rgba(51,255,51,1)',
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
            backgroundColor: 'rgba(255,178,102,0.6)', //'#CCB233',
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
            backgroundColor: 'rgba(51,255,51,0.6)',
            display: 'flex',
            verticalAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Typography variant="h5" textAlign={'right'}>
            {UTIL.formatoValor('energia', balanceGlobal.autoconsumo)}
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
            {t('Consumo.PROP.totalAnual')}
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
            {t('Produccion.PROP.totalAnual')}
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
            {UTIL.formatoValor('energia', consumoGlobal.totalAnual)}
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
            {UTIL.formatoValor('energia', produccionGlobal.totalAnual)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
