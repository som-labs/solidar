import { useContext, Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Plotly objects
import Plot from 'react-plotly.js'
import Plotly from 'plotly.js-dist'

// MUI objects
import {
  IconButton,
  Grid,
  Typography,
  Container,
  Box,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
import AddBoxIcon from '@mui/icons-material/AddBox'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import UnitTypeBox from './UnitTypeBox'
import ZonaComunTypeBox from './ZonaComunTypeBox'
import { AlertContext } from '../components/Alert'
import HelpConsumption from '../Consumption/HelpConsumption'
// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'

//Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import Finca from '../classes/Finca'

//React global components
import { useDialog } from '../../components/DialogProvider'
import AllocationGraph from './AllocattionGraph'

export default function EnergyAllocationStep() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { inLineHelp } = useContext(AlertContext)

  const {
    fincas,
    setFincas,
    zonasComunes,
    setZonasComunes,
    repartoValido,
    setRepartoValido,
    allocationGroup,
    setAllocationGroup,
  } = useContext(ConsumptionContext)

  const [openDialog, closeDialog] = useDialog()

  const allocationBox = useRef()
  const pieConsumption = useRef()

  useEffect(() => {
    // Summarize total consumo as % of total consumo and produccion of fincas by group
    // uniqueGroup[group] = {consumo, produccion, criterio}
    // Values 0 <= values <= 1
    // Criterio = ['PARTICIPACION', 'CONSUMO', 'PARITARIO']
    // first time produccion will be assigned same as consumo

    let uniqueGroup = {}

    //Get consumption from each Finca and add to allocationGroup by grupo value
    fincas.forEach((f) => {
      if (f.nombreTipoConsumo !== '' && f.participa) {
        const _consTC = TCB.TipoConsumo.find((a) => {
          return a.nombreTipoConsumo === f.nombreTipoConsumo
        }).totalAnual
        if (uniqueGroup[f.grupo]) {
          uniqueGroup[f.grupo].consumo += _consTC / TCB.consumo.totalAnual
          uniqueGroup[f.grupo].produccion +=
            f.coefEnergia > 0 ? f.coefEnergia : _consTC / TCB.consumo.totalAnual
          uniqueGroup[f.grupo].participacion += f.participacion
          uniqueGroup[f.grupo].unidades++
        } else {
          uniqueGroup[f.grupo] = {
            consumo: _consTC / TCB.consumo.totalAnual,
            produccion:
              f.coefEnergia > 0 ? f.coefEnergia : _consTC / TCB.consumo.totalAnual,
            criterio: 'PARTICIPACION',
            participacion: f.participacion,
            unidades: 1,
          }
        }
      }
    })

    // Get consumption from each Zona Comun and add to the allocationGroup
    zonasComunes.forEach((z) => {
      if (z.nombreTipoConsumo !== '') {
        const _consTC = TCB.TipoConsumo.find(
          (a) => a.nombreTipoConsumo === z.nombreTipoConsumo,
        ).totalAnual
        if (uniqueGroup[z.nombre]) {
          uniqueGroup[z.nombre].consumo += _consTC / TCB.consumo.totalAnual
          uniqueGroup[z.nombre].produccion +=
            z.coefEnergia > 0 ? z.coefEnergia : _consTC / TCB.consumo.totalAnual
        } else {
          uniqueGroup[z.nombre] = {
            consumo: _consTC / TCB.consumo.totalAnual,
            produccion:
              z.coefEnergia > 0 ? z.coefEnergia : _consTC / TCB.consumo.totalAnual,
          }
        }
      }
    })
    //console.log(uniqueGroup)
    setAllocationGroup(uniqueGroup)

    //Primera asignacion de grupo basada en consumo y de participes basada en participacion
    for (const grupo in uniqueGroup) {
      if (grupo in Finca.mapaUsoGrupo) {
        //Es grupo de catastro hay que calcular betas y asignarlo a cada finca
        for (const f of TCB.Finca) {
          if (f.participa && f.grupo === grupo) {
            f.coefEnergia =
              (f.participacion / uniqueGroup[grupo].participacion) *
              uniqueGroup[grupo].produccion
            // actualiza las fincas en state
            const newFincas = fincas.map((p) => {
              if (p.idFinca === f.idFinca) {
                p.coefEnergia = f.coefEnergia
              }
              return p
            })
            setFincas(newFincas)
          }
        }
      } else {
        //Es una zona comun el beta es directamente la energia asignada al grupo
        TCB.ZonaComun.find((z) => z.nombre === grupo).coefEnergia =
          uniqueGroup[grupo].produccion

        const newZonas = zonasComunes.map((p) => {
          if (p.nombre === grupo) {
            p.coefEnergia = uniqueGroup[grupo].produccion
          }
          return p
        })
        setZonasComunes(newZonas)
      }
    }
    setRepartoValido(true)

    // Trace configuration for consumption Pie chart
    const traceConsumption = {
      labels: Object.keys(uniqueGroup),
      values: Object.values(uniqueGroup).map((g) => g.consumo),
      type: 'pie',
      textinfo: 'label+percent',
      hoverinfo: 'label+value+percent',
    }

    // Layout configuration for consumption Pie chart
    const layoutConsumption = {
      title: 'Distribución consumo',
      height: 400,
      width: 400,
    }

    // Consumption Pie chart
    Plotly.react(pieConsumption.current, [traceConsumption], layoutConsumption)
  }, [])

  function help(level) {
    if (level === 1)
      openDialog({
        children: <HelpConsumption onClose={() => closeDialog()} />,
      })
  }

  function generaFicheroReparto() {
    const betaList = []
    let chkTotal = 0
    let beta6
    for (const f of TCB.Finca.filter((f) => f.coefEnergia > 0)) {
      beta6 = UTIL.roundDecimales(f.coefEnergia, 6)
      chkTotal += beta6
      betaList.push({ CUPS: f.CUPS, beta: beta6 })
    }

    for (const z of TCB.ZonaComun.filter((z) => z.coefEnergia > 0)) {
      beta6 = UTIL.roundDecimales(z.coefEnergia, 6)
      chkTotal += beta6
      betaList.push({ CUPS: z.CUPS, beta: beta6 })
    }

    //Hay que asegurar que la suma de lo beta con 6 decimales de exactamente 1.
    //Si hubiera alguna diferencia se la asignamos al primer CUPS
    if (chkTotal !== 1) {
      const gap = UTIL.roundDecimales(1 - chkTotal, 6)
      betaList[0].beta = UTIL.roundDecimales(betaList[0].beta + gap, 6)
      //console.log('Añadido a CUPS :' + betaList[0].CUPS + ' ' + gap)
    }

    UTIL.dumpData(TCB.parametros.CAU + '.txt', betaList)
  }

  return (
    <Container>
      <>
        <Grid container rowSpacing={3}>
          <Grid item xs={12}>
            <Typography
              variant="body"
              dangerouslySetInnerHTML={{
                __html: t('ALLOCATION.DESCRIPTION_1'),
              }}
            />

            <IconButton
              onClick={() => help(1)}
              size="small"
              style={{
                color: theme.palette.helpIcon.main,
                fontSize: 'inherit',
                verticalAlign: 'text-center',
                transform: 'scale(0.8)',
                padding: 0,
              }}
            >
              <HelpIcon />
            </IconButton>
            <Typography variant="h4">
              {UTIL.formatoValor('energia', TCB.produccion.totalAnual)}
            </Typography>
          </Grid>
        </Grid>

        <Box
          ref={allocationBox}
          justifyContent="space-between" // Equal spacing between boxes
          alignItems="center" // Vertically align items (optional)
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            border: 1,
            mt: 4,
          }}
        >
          <Box ref={pieConsumption} sx={{ display: 'flex', flex: 0.6 }}></Box>
          <Box sx={{ display: 'flex', flex: 0.8 }}>
            <AllocationGraph
              allocationGroup={allocationGroup}
              setAllocationGroup={setAllocationGroup}
            ></AllocationGraph>
          </Box>
        </Box>

        {repartoValido ? (
          <>
            <Grid item xs={12}>
              <Typography
                variant="body"
                dangerouslySetInnerHTML={{
                  __html: t('UNITS.DESCRIPTION_2'),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}
              >
                {Object.entries(allocationGroup).map((key, value) => (
                  <Fragment key={key}>
                    <Box sx={{ display: 'flex', flex: 1 }}>
                      <UnitTypeBox grupo={key[0]}></UnitTypeBox>
                    </Box>
                  </Fragment>
                ))}
              </Box>
            </Grid>
          </>
        ) : (
          ' '
        )}
      </>

      <Button onClick={() => UTIL.dumpData('Fincas.csv', TCB.Finca)}>Exportar</Button>
      <Button onClick={generaFicheroReparto}>Fichero reparto</Button>
      <Button>Importar</Button>
    </Container>
  )
}
