import { useContext, Fragment } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Box, Typography, Container, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { EnergyContext } from '../EnergyContext.jsx'
import { useDialog } from '../../components/DialogProvider'
import UnitsSummary from './UnitsSummary'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import { EconomicContext } from '../EconomicContext.jsx'

export default function UnitTypeBox(props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const { fincas, allocationGroup, zonasComunes } = useContext(ConsumptionContext)
  const { consumoGlobal, produccionGlobal } = useContext(EnergyContext)
  const { economicoGlobal } = useContext(EconomicContext)
  const [openDialog, closeDialog] = useDialog()
  const { grupo } = props

  function showDetails() {
    openDialog({
      children: (
        <UnitsSummary
          grupo={grupo}
          units={fincas.filter((f) => f.grupo === grupo)}
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
            {allocationGroup[grupo].nombre}
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
                    UTIL.formatoValor('energia', allocationGroup[grupo].consumo) +
                    '</b><br />% uso de energía total:  <b>' +
                    UTIL.formatoValor(
                      'porciento',
                      (allocationGroup[grupo].consumo / consumoGlobal.totalAnual) * 100,
                    ) +
                    '</b><br />Energia Total asignada: <b>' +
                    UTIL.formatoValor(
                      'energia',
                      produccionGlobal.totalAnual * allocationGroup[grupo].produccion,
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
                    economicoGlobal.precioInstalacionCorregido *
                      allocationGroup[grupo].produccion,
                  )}
                </Typography>

                {zonasComunes.map((zc) => (
                  <Fragment key={zc.id}>
                    <Typography sx={{ textAlign: 'center' }}>
                      {zc.nombre}:{' '}
                      {UTIL.formatoValor(
                        'dinero',
                        allocationGroup[grupo].zonasComunes[zc.id]
                          ? ((allocationGroup[zc.id].produccion *
                              allocationGroup[grupo].participacionT) /
                              allocationGroup[zc.id].participacionT) *
                              economicoGlobal.precioInstalacionCorregido
                          : 0,
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
                    UTIL.formatoValor('energia', allocationGroup[grupo].consumo) +
                    '</b><br />% uso de energía total:  <b>' +
                    UTIL.formatoValor(
                      'porciento',
                      (allocationGroup[grupo].consumo / consumoGlobal.totalAnual) * 100,
                    ) +
                    '</b><br />Energia Total asignada:  <b>' +
                    UTIL.formatoValor(
                      'energia',
                      produccionGlobal.totalAnual * allocationGroup[grupo].produccion,
                    ) +
                    '</b><br />Coste <b>' +
                    UTIL.formatoValor(
                      'dinero',
                      economicoGlobal.precioInstalacionCorregido *
                        allocationGroup[grupo].produccion,
                    ) +
                    '</b><br />Ahorro anual <b>' +
                    UTIL.formatoValor(
                      'dinero',
                      zonasComunes.find((zc) => zc.id === grupo).economico.ahorroAnual,
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
