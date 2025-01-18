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
import { all } from 'ol/events/condition.js'

export default function UnitTypeBox(props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const { allocationGroup, fincas } = useContext(ConsumptionContext)
  const [openDialog, closeDialog] = useDialog()

  const { grupo } = props
  console.log(grupo)
  console.log(fincas.filter((e) => e.grupo === grupo))
  const units = fincas.filter((e) => e.grupo === grupo)

  function showDetails() {
    openDialog({
      children: (
        <UnitsSummary
          grupo={grupo}
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
      <Typography sx={theme.titles.level_1} textAlign={'center'}>
        {grupo}
      </Typography>

      {allocationGroup[grupo].unidades > 0 ? (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '90%',
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flex: 1,
                  border: '1px solid',
                  alignItems: 'center',
                  padding: 0.5,
                  justifyContent: 'center',
                }}
              >
                Unidades: {allocationGroup[grupo].unidades}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flex: 1,
                  border: '1px solid',
                  padding: 0.5,
                  justifyContent: 'center',
                }}
              >
                Participes: {allocationGroup[grupo].participes}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flex: 2,
                  border: '1px solid',
                  padding: 0.5,
                  justifyContent: 'center',
                }}
              >
                Criterio distribución: {allocationGroup[grupo].criterio}
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flex: 1,
                  border: '1px solid',
                  padding: 0.5,
                  justifyContent: 'center',
                }}
              >
                Uso eléctrico demandado:{' '}
                {UTIL.formatoValor(
                  'energia',
                  allocationGroup[grupo].consumo * TCB.consumo.totalAnual,
                )}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flex: 1,
                  border: '1px solid',
                  padding: 0.5,
                  justifyContent: 'center',
                }}
              >
                Producción asignada:{' '}
                {UTIL.formatoValor(
                  'energia',
                  allocationGroup[grupo].produccion * TCB.produccion.totalAnual,
                )}
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <Button onClick={showDetails}>{t('UNITS.LABEL_VER_DETALLES')}</Button>
            </Box>
          </Box>
          {/* <Typography
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
              <Button onClick={showDetails}>{t('UNITS.LABEL_VER_DETALLES')}</Button> */}
        </>
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              width: '90%',
              paddingBottom: 2,
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                border: '1px solid',
                padding: 0.5,
                justifyContent: 'center',
              }}
            >
              Uso eléctrico demandado:{' '}
              {UTIL.formatoValor(
                'energia',
                allocationGroup[grupo].consumo * TCB.consumo.totalAnual,
              )}
            </Box>
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                border: '1px solid',
                padding: 0.5,
                justifyContent: 'center',
              }}
            >
              Producción asignada:{' '}
              {UTIL.formatoValor(
                'energia',
                allocationGroup[grupo].produccion * TCB.produccion.totalAnual,
              )}
            </Box>
          </Box>

          {/* <Typography
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
              /> */}
        </>
      )}
    </>
  )
}
