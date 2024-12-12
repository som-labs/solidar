import { useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Box, Typography, Container, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { useDialog } from '../../components/DialogProvider'
import UnitsSummary from './UnitsSummary'

// Solidar objects
import TCB from '../classes/TCB.js'
import * as UTIL from '../classes/Utiles'

export default function UnitTypeBox(props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { fincas, tipoConsumo } = useContext(ConsumptionContext)
  const [openDialog, closeDialog] = useDialog()
  const [totalConsumption, setTotalConsumption] = useState()
  const { tipo } = props

  const units = fincas.filter((e) => e.grupo === tipo)

  const participacionTotal = units.reduce((a, b) => {
    return a + UTIL.returnFloat(b.participacion)
  }, 0)

  useEffect(() => {
    let total = 0
    units.forEach((unit) => {
      if ((unit.nombreTipoConsumo !== '') & unit.participa) {
        const tc = tipoConsumo.find((t) => {
          return t.nombreTipoConsumo === unit.nombreTipoConsumo
        })
        total += tc.totalAnual
      }
    })
    setTotalConsumption(total)
  }, [])

  function showDetails() {
    openDialog({
      children: (
        <UnitsSummary
          grupo={tipo}
          units={units}
          maxWidth={'xs'}
          fullWidth={true}
          onClose={closeDialog}
          setTotalConsumption={setTotalConsumption}
        ></UnitsSummary>
      ),
    })
  }

  return (
    <>
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            border: '1px solid grey',
            borderRadius: 2,
            padding: 2,
            maxWidth: 300,
          }}
        >
          <Typography sx={theme.titles.level_1} textAlign={'center'} marginTop="1rem">
            {tipo}
          </Typography>
          <Typography
            variant="body"
            textAlign={'center'}
            dangerouslySetInnerHTML={{
              __html:
                '<br />Cantidad: ' +
                units.length +
                '<br />Participación: ' +
                UTIL.formatoValor('porciento', participacionTotal) +
                '<br />Uso de energía: ' +
                UTIL.formatoValor('energia', totalConsumption) +
                '<br />% uso de energía total: ' +
                UTIL.formatoValor(
                  'porciento',
                  (totalConsumption / TCB.consumo.totalAnual) * 100,
                ) +
                '<br />Energia Total asignada: ' +
                UTIL.formatoValor(
                  'energia',
                  (TCB.produccion.totalAnual * totalConsumption) / TCB.consumo.totalAnual,
                ),
            }}
          />

          <Button onClick={showDetails}>{t('UNITS.LABEL_VER_DETALLES')}</Button>
        </Box>
      </Container>
    </>
  )
}
