import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Box,
  Typography,
  FormControl,
  TextField,
  InputAdornment,
  Container,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'
// REACT Solidar Components
//import { ConsumptionContext } from '../ConsumptionContext'
import { SLDRTooltip } from '../../components/SLDRComponents'

// Solidar objects
import TCB from '../classes/TCB'

export default function Subvencion() {
  const { t } = useTranslation()
  const theme = useTheme()

  const [valor, setValor] = useState(TCB.valorSubvencion)
  const [porciento, setPorciento] = useState(TCB.porcientoSubvencion)

  const { setValorSubvencion, setPorcientoSubvencion, ecoData, setEcoData } =
    useContext(EconomicContext)

  const setNewSubvencion = () => {
    if (porciento !== 0) {
      TCB.valorSubvencion = (ecoData.precioInstalacionCorregido * porciento) / 100
      TCB.porcientoSubvencion = porciento
    }
    if (valor !== 0) {
      TCB.valorSubvencion = valor
      TCB.porcientoSubvencion = (valor / ecoData.precioInstalacionCorregido) * 100
    }
    setValorSubvencion(TCB.valorSubvencion)
    setPorcientoSubvencion(TCB.porcientoSubvencion)

    TCB.economico.calculoFinanciero(100, 100)
    setEcoData(TCB.economico)
  }

  const onChangeSubvencion = (event) => {
    const { name, value } = event.target
    if (name === 'valorSubvencion') {
      setValor(value)
      setPorciento(
        ((parseFloat(value) / ecoData.precioInstalacionCorregido) * 100).toFixed(2),
      )
    } else {
      setPorciento(value) //porcientoSubvencion
      setValor(
        ((ecoData.precioInstalacionCorregido * parseFloat(value)) / 100).toFixed(0),
      )
    }
  }

  // if ((TCB.consumo.totalAnual / TCB.produccion.totalAnual) * 100 < 80) {
  //   setSubvencionEU('Sin')
  //   return (
  //     <Container>
  //       <Typography variant="h4" color="red" textAlign={'center'}>
  //         {t('No hay subvencion posible')}
  //       </Typography>
  //       <Typography
  //         variant="body"
  //         textAlign={'center'}
  //         dangerouslySetInnerHTML={{
  //           __html: t('ECONOMIC_BALANCE.DESCRIPTION_Consumo%Produccion', {
  //             Consumo_Produccion: UTIL.formatoValor(
  //               'porciento',
  //               (TCB.consumo.totalAnual / TCB.produccion.totalAnual) * 100,
  //             ),
  //           }),
  //         }}
  //       />
  //     </Container>
  //   )
  // } else {
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
            gap: '10px',
          }}
        >
          <Typography sx={theme.titles.level_1} textAlign={'center'}>
            {t('ECONOMIC_BALANCE.SUBVENCION_TITLE')}
          </Typography>
          <Typography
            variant="body"
            textAlign={'center'}
            dangerouslySetInnerHTML={{
              __html: t('ECONOMIC_BALANCE.SUBVENCION_DESCRIPTION'),
            }}
          />
          <SLDRTooltip title={<Typography>{t('ayuda mutua')}</Typography>}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <TextField
                type="text"
                onChange={onChangeSubvencion}
                onBlur={setNewSubvencion}
                label={t('Economico.PROP.valorSubvencion')}
                name="valorSubvencion"
                value={valor}
                InputProps={{
                  endAdornment: <InputAdornment position="start">&nbsp;€</InputAdornment>,
                  inputProps: {
                    style: { textAlign: 'right' },
                  },
                }}
              />
            </FormControl>
          </SLDRTooltip>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              type="text"
              onChange={onChangeSubvencion}
              onBlur={setNewSubvencion}
              label={t('Economico.PROP.porcientoSubvencion')}
              name="porcientoSubvencion"
              value={porciento}
              InputProps={{
                endAdornment: <InputAdornment position="start">&nbsp;%</InputAdornment>,
                inputProps: {
                  style: { textAlign: 'right' },
                },
              }}
            />
          </FormControl>
        </Box>
      </Container>
    </>
  )
  //}
}
