import { useContext, useState, useEffect, Fragment } from 'react'
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
  const { fincas, tipoConsumo, allocationGroup, zonasComunes } =
    useContext(ConsumptionContext)
  const [openDialog, closeDialog] = useDialog()
  const [extraCost, setExtraCost] = useState({})

  const { grupo } = props

  let tCost = {}
  for (const zc of zonasComunes) {
    tCost[zc.nombre] = 0
    for (const fx of TCB.Finca.filter(
      (f) => f.grupo === grupo && f.extraCost[zc.nombre] > 0,
    )) {
      tCost[zc.nombre] += fx.extraCost[zc.nombre]
    }
  }

  function showDetails() {
    openDialog({
      children: (
        <UnitsSummary
          grupo={grupo}
          units={TCB.Finca.filter((f) => f.grupo === grupo)}
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
            //maxWidth: 300,
            backgroundColor: 'aquamarine',

            // backgroundColor: radial-gradient(
            //   ellipse at right top,
            //   #107667ed 0%,
            //   #151419 47%,
            //   #151419 100%
            // );
          }}
        >
          <Typography sx={theme.titles.level_1} textAlign={'center'} marginTop="1rem">
            {grupo}
          </Typography>
          {allocationGroup[grupo].unidades > 0 ? (
            <>
              <Typography
                variant="body"
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html:
                    '<br />Participes: <b>' +
                    allocationGroup[grupo].participes +
                    ' de ' +
                    allocationGroup[grupo].unidades +
                    '</b><br />Participación:  <b>' +
                    UTIL.formatoValor(
                      'porciento',
                      allocationGroup[grupo].participacionP,
                    ) +
                    ' de ' +
                    UTIL.formatoValor(
                      'porciento',
                      allocationGroup[grupo].participacionT,
                    ) +
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
                    '<br /><br />COSTES',
                }}
              />
              <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                <Typography sx={{ textAlign: 'center' }}>
                  Propio:{' '}
                  {UTIL.formatoValor(
                    'dinero',
                    TCB.economico.precioInstalacionCorregido *
                      allocationGroup[grupo].produccion,
                  )}
                </Typography>

                {Object.keys(tCost).map((key, value) => (
                  <Fragment key={key}>
                    <Typography sx={{ textAlign: 'center' }}>
                      {key}:{' '}
                      {UTIL.formatoValor(
                        'dinero',
                        tCost[key] * TCB.economico.precioInstalacionCorregido,
                      )}
                    </Typography>
                  </Fragment>
                ))}
              </Box>
              <Button onClick={showDetails}>{t('UNITS.LABEL_VER_DETALLES')}</Button>
            </>
          ) : (
            <Box>
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
                    ) +
                    '</b><br />Coste <b>' +
                    UTIL.formatoValor(
                      'dinero',
                      TCB.economico.precioInstalacionCorregido *
                        allocationGroup[grupo].produccion,
                    ),
                }}
              />
            </Box>
          )}
        </Box>
      </Container>
    </>
  )
}
