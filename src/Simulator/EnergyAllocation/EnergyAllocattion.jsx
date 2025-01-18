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
//React global components
import { SLDRInfoBox, SLDRCollapsibleCard } from '../../components/SLDRComponents'
// REACT Solidar Components
import UnitTypeBox from './UnitTypeBox'
import { AlertContext } from '../components/Alert'
import HelpConsumption from '../Consumption/HelpConsumption'
// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'

//Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

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

  useEffect(() => {
    // Summarize total consumo as % of total consumo and produccion of fincas by group
    // uniqueGroup[group] = {
    //  consumo: como % del consumo total
    //  produccion: asignada como % de la produccion total
    //  criterio: de distribución de la produccion ['PARTICIPACION', 'CONSUMO', 'PARITARIO']
    //  unidades: numero de unidades que confirman el grupo. Las que pagarán las zonas comunes
    //  participes: numero de unidades que participan. Las que recibiran produccion
    //  participacionT: % de propiedad total de participacion
    //  participacionP: % de propiedad de los participes

    // first time produccion will be assigned same as consumo
    let uniqueGroup = {}

    //Get consumption from each Finca and add to allocationGroup by grupo value
    fincas.forEach((f) => {
      if (uniqueGroup[f.grupo]) {
        uniqueGroup[f.grupo].participacionT += f.participacion
        uniqueGroup[f.grupo].unidades++
        if (f.participa) {
          uniqueGroup[f.grupo].participacionP += f.participacion
          uniqueGroup[f.grupo].participes++
          const _consTC = TCB.TipoConsumo.find((a) => {
            return a.nombreTipoConsumo === f.nombreTipoConsumo
          }).totalAnual
          uniqueGroup[f.grupo].consumo += _consTC / TCB.consumo.totalAnual
          uniqueGroup[f.grupo].produccion +=
            f.coefEnergia > 0 ? f.coefEnergia : _consTC / TCB.consumo.totalAnual
        }
      } else {
        uniqueGroup[f.grupo] = {
          criterio: 'PARTICIPACION',
          participacionT: f.participacion,
          unidades: 1,
        }
        if (f.participa) {
          const _consTC = TCB.TipoConsumo.find((a) => {
            return a.nombreTipoConsumo === f.nombreTipoConsumo
          }).totalAnual
          uniqueGroup[f.grupo].participes = 1
          uniqueGroup[f.grupo].participacionP = f.participacion
          uniqueGroup[f.grupo].consumo = _consTC / TCB.consumo.totalAnual
          uniqueGroup[f.grupo].produccion =
            f.coefEnergia > 0 ? f.coefEnergia : _consTC / TCB.consumo.totalAnual
        } else {
          uniqueGroup[f.grupo].participes = 0
          uniqueGroup[f.grupo].participacionP = 0
          uniqueGroup[f.grupo].consumo = 0
          uniqueGroup[f.grupo].produccion = 0
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
            unidades: 0, //Flag para indicar que este grupo es una zona comun
          }
        }
      }
    })
    setAllocationGroup(uniqueGroup)

    //Primera asignacion de grupo basada en consumo y de participes basada en participacion
    for (const grupo in uniqueGroup) {
      //if (grupo in Finca.mapaUsoGrupo) {
      if (uniqueGroup[grupo].unidades > 0) {
        //Es grupo de catastro hay que calcular betas y asignarlo a cada finca
        for (const f of TCB.Finca) {
          if (f.participa && f.grupo === grupo) {
            f.coefEnergia = UTIL.roundDecimales(
              (f.participacion / uniqueGroup[grupo].participacionP) *
                uniqueGroup[grupo].produccion,
              6,
            )
          }
        }
      } else {
        //Es una zona comun el beta es directamente la energia asignada al grupo
        TCB.ZonaComun.find((z) => z.nombre === grupo).coefEnergia =
          uniqueGroup[grupo].produccion
      }
    }
    console.log('SETTING')
    closeBetasToOne()
    console.log('setting fincas in EnergyAllocation')
    setFincas([...TCB.Finca])
    setZonasComunes([...TCB.ZonaComun])
    setRepartoValido(true)
  }, [])

  function help(level) {
    if (level === 1)
      openDialog({
        children: <HelpConsumption onClose={() => closeDialog()} />,
      })
  }

  /**
    Hay que asegurar que la suma de lo beta con 6 decimales de exactamente 1.
    Si hubiera alguna diferencia se la asignamos al primer CUPS
   */
  function closeBetasToOne() {
    const chkTotal =
      TCB.Finca.reduce((t, f) => t + f.coefEnergia, 0) +
      TCB.ZonaComun.reduce((t, z) => t + z.coefEnergia, 0)
    const dummyFinca = TCB.Finca.find((f) => f.coefEnergia > 0)
    dummyFinca.coefEnergia += 1 - chkTotal
  }

  function generaFicheroReparto() {
    const betaList = []
    for (const f of TCB.Finca.filter((f) => f.coefEnergia > 0)) {
      betaList.push({ CUPS: f.CUPS, beta: f.coefEnergia })
    }
    for (const z of TCB.ZonaComun.filter((z) => z.coefEnergia > 0)) {
      betaList.push({ CUPS: z.CUPS, beta: z.coefEnergia })
    }
    UTIL.dumpData(TCB.parametros.CAU + '.txt', betaList)
  }

  return (
    <Container>
      <>
        <Grid container>
          <Grid item xs={12}>
            <Typography
              variant="body"
              dangerouslySetInnerHTML={{
                __html: t('ENERGY_ALLOCATION.DESCRIPTION'),
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
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Typography variant="h4">
                {t('ENERGY_ALLOCATION.TOTAL_ENERGY', {
                  energy: UTIL.formatoValor('energia', TCB.produccion.totalAnual),
                })}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box
          alignItems="center" // Vertically align items (optional)
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            mt: 2,
            mb: 3,
          }}
        >
          {/* <Box sx={{ display: 'flex', border: 1 }}> */}
          <AllocationGraph
            allocationGroup={allocationGroup}
            setAllocationGroup={setAllocationGroup}
          ></AllocationGraph>
          {/* </Box> */}
        </Box>

        {repartoValido ? (
          <>
            <Typography
              variant="body"
              dangerouslySetInnerHTML={{
                __html: t('ENERGY_ALLOCATION.DESCRIPTION_2'),
              }}
            />
            <Box sx={{ gap: 1, mt: 3, display: 'flex', flexDirection: 'column' }}>
              {Object.entries(allocationGroup).map((key, value) => (
                <Fragment key={key}>
                  <SLDRInfoBox
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      alignItems: 'center',
                      border: '1px solid',
                      borderRadius: 2,
                      justifyContent: 'center',
                    }}
                  >
                    <UnitTypeBox grupo={key[0]}></UnitTypeBox>
                  </SLDRInfoBox>
                </Fragment>
              ))}
            </Box>
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
