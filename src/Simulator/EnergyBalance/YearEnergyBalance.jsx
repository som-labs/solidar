import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import ReactMarkdown from 'react-markdown'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import { debounce } from '@mui/material/utils'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'

import * as UTIL from '../classes/Utiles'

import TCB from '../classes/TCB'

export default function YearEnergyBalance() {
  const { t, i18n } = useTranslation()

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
            {t('ENERGY_BALANCE.TITLE_YEAR_ENERGY_BALANCE')}
          </Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ENERGY_BALANCE.DESCRIPTION_YEAR_ENERGY_BALANCE', {
                consumoTotal: UTIL.formatoValor('energia', TCB.consumo.cTotalAnual),
                porcientoAutoconsumo: UTIL.formatoValor(
                  'porciento',
                  (TCB.balance.autoconsumo / TCB.consumo.cTotalAnual) * 100,
                ),
                porcientoDemanda: UTIL.formatoValor(
                  'porciento',
                  (TCB.balance.deficitAnual / TCB.consumo.cTotalAnual) * 100,
                ),
                porcientoAutoproduccion: UTIL.formatoValor(
                  'porciento',
                  (TCB.balance.autoconsumo / TCB.produccion.pTotalAnual) * 100,
                ),
                produccionTotal: UTIL.formatoValor('energia', TCB.produccion.pTotalAnual),
                porcientoVertido: UTIL.formatoValor(
                  'porciento',
                  (TCB.balance.excedenteAnual / TCB.produccion.pTotalAnual) * 100,
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
          <br />
        </Box>
      </Container>
    </>
  )
}
