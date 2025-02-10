import { useContext, useEffect, useState } from 'react'
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
  const { fincas, tipoConsumo, allocationGroup, setAllocationGroup } =
    useContext(ConsumptionContext)
  const [openDialog, closeDialog] = useDialog()

  const { grupo } = props

  const unidades = fincas.reduce((p, f) => {
    return f.grupo === grupo ? p + 1 : p
  }, 0)

  const participes = fincas.reduce((p, f) => {
    return f.grupo === grupo && f.participa ? p + 1 : p
  }, 0)

  const participacionTotal = fincas.reduce((p, f) => {
    return f.grupo === grupo ? p + UTIL.returnFloat(f.participacion) : p
  }, 0)

  function consumoTotal() {
    return fincas
      .filter(
        (unit) => unit.grupo === grupo && unit.participa && unit.nombreTipoConsumo !== '',
      )
      .reduce(
        (t, u) =>
          t +
          tipoConsumo.find((t) => t.nombreTipoConsumo === u.nombreTipoConsumo).totalAnual,
        0,
      )
  }

  function showDetails() {
    openDialog({
      children: (
        <UnitsSummary
          grupo={grupo}
          maxWidth={'lg'}
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
            {grupo}
          </Typography>
          <Typography
            variant="body"
            textAlign={'center'}
            dangerouslySetInnerHTML={{
              __html:
                '<br />Participes: ' +
                participes +
                ' de ' +
                unidades +
                '<br />Participación: ' +
                UTIL.formatoValor('porciento', participacionTotal) +
                '<br />Uso de energía: ' +
                //UTIL.formatoValor('energia', consumoTotal()),
                UTIL.formatoValor('energia', allocationGroup[grupo].consumo),
            }}
          />
          <Button onClick={showDetails}>{t('UNITS.LABEL_VER_DETALLES')}</Button>
        </Box>
      </Container>
    </>
  )
}
