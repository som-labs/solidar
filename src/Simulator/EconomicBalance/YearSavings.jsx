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
import EconomicContext from './EconomicContext'
import TCB from '../classes/TCB'

export default function YearSaving() {
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
          <Typography variant="h4">{t('ECONOMIC_BALANCE.TITLE_YEAR_SAVINGS')}</Typography>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.DESCRIPTION_YEAR_SAVINGS', {
                porcientoAhorro: UTIL.formatoValor(
                  'porciento',
                  (TCB.economico.ahorroAnual / TCB.economico.gastoSinPlacasAnual) * 100,
                ),
              }),
            }}
          />

          <Typography variant="h5">
            {t('ECONOMIC_BALANCE.GRAPH_TITLE_YEAR_SAVINGS')}
          </Typography>
          <br />
        </Box>
      </Container>
    </>
  )
}
