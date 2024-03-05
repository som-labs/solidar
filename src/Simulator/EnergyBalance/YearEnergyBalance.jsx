import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

import * as UTIL from '../classes/Utiles'

import TCB from '../classes/TCB'

export default function YearEnergyBalance() {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Container>
        <Typography variant="h4">
          {t('ENERGY_BALANCE.TITLE_YEAR_ENERGY_BALANCE')}
        </Typography>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('ENERGY_BALANCE.DESCRIPTION_YEAR_ENERGY_BALANCE', {
              consumoTotal: UTIL.formatoValor('energia', TCB.consumo.totalAnual),
              porcientoAutoconsumo: UTIL.formatoValor(
                'porciento',
                (TCB.balance.autoconsumo / TCB.consumo.totalAnual) * 100,
              ),
              porcientoDemanda: UTIL.formatoValor(
                'porciento',
                (TCB.balance.deficitAnual / TCB.consumo.totalAnual) * 100,
              ),
              porcientoAutoproduccion: UTIL.formatoValor(
                'porciento',
                (TCB.balance.autoconsumo / TCB.produccion.totalAnual) * 100,
              ),
              produccionTotal: UTIL.formatoValor('energia', TCB.produccion.totalAnual),
              porcientoVertido: UTIL.formatoValor(
                'porciento',
                (TCB.balance.excedenteAnual / TCB.produccion.totalAnual) * 100,
              ),
            }),
          }}
        />

        <Typography variant="h4" color={'green'} textAlign={'center'}>
          Gráficos de consumo y autoproducción
        </Typography>
        <Typography variant="body">
          {t('ECONOMIC_BALANCE.PROMPT_AMORTIZATION_TIME')}
        </Typography>
      </Container>
    </>
  )
}
