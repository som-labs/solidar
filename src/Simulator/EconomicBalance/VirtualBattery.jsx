import { useContext, useEffect } from 'react'
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

import * as UTIL from '../classes/Utiles'
import EconomicContext from './EconomicContext'
import TCB from '../classes/TCB'

const VirtualBattery = () => {
  const { t, i18n } = useTranslation()

  const { recognition, setRecognition, fee, setFee } = useContext(EconomicContext)

  const changeFee = () => {
    TCB.cuotaHucha = parseFloat(fee)
    TCB.economico.calculoFinanciero(100, 100)
  }
  const changeRecognition = () => {
    TCB.coefHucha = parseFloat(recognition)
    TCB.economico.calculoFinanciero(100, 100)
  }

  useEffect(() => {
    setFee(TCB.cuotaHucha)
    setRecognition(TCB.coefHucha)
  }, [])

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
            {t('ECONOMIC_BALANCE.TITLE_VIRTUAL_BATTERY')}
          </Typography>
          <ReactMarkdown children={t('ECONOMIC_BALANCE.DESCRIPTION_VIRTUAL_BATTERY')} />
          <Typography variant="body">
            {t('ECONOMIC_BALANCE.DESCRIPTION_RECOGNITION_VIRTUAL_BATTERY')}
          </Typography>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onBlur={changeRecognition}
              onChange={(event) => {
                setRecognition(event.target.value)
              }}
              label={t('ECONOMIC_BALANCE.LABEL_RECOGNITION_VIRTUAL_BATTERY')}
              name="coefHucha"
              InputProps={{
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              //REVISAR: Seria bueno poder expresar la cantidad con la unidad
              value={recognition} //{UTIL.formatoValor('precioInstalacion', precioInstalacion)}
            />
          </FormControl>
          <Typography variant="body">
            {t('ECONOMIC_BALANCE.DESCRIPTION_FEE_VIRTUAL_BATTERY')}
          </Typography>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onBlur={changeFee}
              onChange={(event) => {
                setFee(event.target.value)
              }}
              label={t('ECONOMIC_BALANCE.LABEL_FEE_VIRTUAL_BATTERY')}
              name="cuotaHucha"
              InputProps={{
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
              //REVISAR: Seria bueno poder expresar la cantidad con la unidad
              value={fee} //{UTIL.formatoValor('precioInstalacion', precioInstalacion)}
            />
          </FormControl>
        </Box>
      </Container>
    </>
  )
}

export default VirtualBattery
