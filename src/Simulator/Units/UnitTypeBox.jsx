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
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function UnitTypeBox(props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { fincas, tipoConsumo, allocationGroup } = useContext(ConsumptionContext)
  const [openDialog, closeDialog] = useDialog()
  const [totalConsumption, setTotalConsumption] = useState()

  const { tipo } = props

  const units = fincas.filter((e) => e.grupo === tipo)

  const participes = units.filter((fnc) => fnc.participa).length

  const participacionTotal = units.reduce((a, b) => {
    return a + UTIL.returnFloat(b.participacion)
  }, 0)

  const consumoTotal = () => {
    let total = 0
    units.forEach((unit) => {
      if (unit.participa && unit.nombreTipoConsumo !== '') {
        const tc = tipoConsumo.find((t) => {
          return t.nombreTipoConsumo === unit.nombreTipoConsumo
        })
        total += tc.totalAnual
      }
    })
    return total
  }

  function showDetails() {
    openDialog({
      children: (
        <UnitsSummary
          grupo={tipo}
          units={units}
          maxWidth={'xs'}
          fullWidth={true}
          onClose={closeDialog}
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
                '<br />Participes: ' +
                participes +
                ' de ' +
                units.length +
                '<br />Participación: ' +
                UTIL.formatoValor('porciento', participacionTotal) +
                '<br />Uso de energía: ' +
                UTIL.formatoValor('energia', consumoTotal()),
            }}
          />
          <Button onClick={showDetails}>{t('UNITS.LABEL_VER_DETALLES')}</Button>
        </Box>
      </Container>
    </>
  )
}
