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
    units.forEach((e) => {
      if (e.nombreTipoConsumo !== undefined) {
        const tc = tipoConsumo.find((t) => {
          return t.nombreTipoConsumo === e.nombreTipoConsumo
        })
        total += tc.totalAnual
        setTotalConsumption(total)
      }
    })
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
            width: '100%',
            gap: '10px',
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
                '<br />Uso de energía total: ' +
                UTIL.formatoValor('energia', totalConsumption),
            }}
          />
          <Button onClick={showDetails}>{t('UNITS.LABEL_VER_DETALLES')}</Button>
        </Box>
      </Container>
    </>
  )
}
