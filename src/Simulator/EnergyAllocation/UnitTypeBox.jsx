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
import Finca from '../classes/Finca.js'
import TCB from '../classes/TCB.js'
import * as UTIL from '../classes/Utiles'

export default function UnitTypeBox(props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { fincas, tipoConsumo, allocationGroup } = useContext(ConsumptionContext)
  const [openDialog, closeDialog] = useDialog()

  const { grupo } = props

  function showDetails() {
    openDialog({
      children: (
        <UnitsSummary
          grupo={grupo}
          units={TCB.Finca.filter((f) => f.participa && f.grupo === grupo)}
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
            {grupo}
          </Typography>

          {Finca.mapaUsoGrupo[grupo] ? (
            <>
              <Typography
                variant="body"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html:
                    '<br />Cantidad: <b>' +
                    allocationGroup[grupo].unidades +
                    '</b><br />Participación:  <b>' +
                    UTIL.formatoValor('porciento', allocationGroup[grupo].participacion) +
                    '</b><br />Uso de energía:  <b>' +
                    UTIL.formatoValor(
                      'energia',
                      allocationGroup[grupo].consumo * TCB.consumo.totalAnual,
                    ) +
                    '</b><br />% uso de energía total:  <b>' +
                    UTIL.formatoValor('porciento', allocationGroup[grupo].consumo * 100) +
                    '</b><br />Energia Total asignada: <b>' +
                    UTIL.formatoValor(
                      'energia',
                      TCB.produccion.totalAnual * allocationGroup[grupo].produccion,
                    ) +
                    '</b><br />Criterio asignación <b>' +
                    allocationGroup[grupo].criterio +
                    '</b>',
                }}
              />
              <Button onClick={showDetails}>{t('UNITS.LABEL_VER_DETALLES')}</Button>
            </>
          ) : (
            <>
              <Typography
                variant="body"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html:
                    '<br />Uso de energía:  <b>' +
                    UTIL.formatoValor(
                      'energia',
                      allocationGroup[grupo].consumo * TCB.consumo.totalAnual,
                    ) +
                    '</b><br />% uso de energía total:  <b>' +
                    UTIL.formatoValor('porciento', allocationGroup[grupo].consumo * 100) +
                    '</b><br />Energia Total asignada:  <b>' +
                    UTIL.formatoValor(
                      'energia',
                      TCB.produccion.totalAnual * allocationGroup[grupo].produccion,
                    ),
                }}
              />
            </>
          )}
        </Box>
      </Container>
    </>
  )
}
