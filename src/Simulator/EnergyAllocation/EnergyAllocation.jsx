import { useContext, Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Grid, Typography, Container, Box, Button } from '@mui/material'

import { useTheme } from '@mui/material/styles'
//React global components
import { SLDRInfoBox } from '../../components/SLDRComponents'
// REACT Solidar Components
import UnitTypeBox from './UnitTypeBox'

import { useAlert } from '../../components/AlertProvider.jsx'
import HelpConsumption from '../Consumption/HelpConsumption'
// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'

//Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

//React global components
import { useDialog } from '../../components/DialogProvider'
import AllocationGraph from './AllocationGraph'
import { EnergyContext } from '../EnergyContext.jsx'
import { GlobalContext } from '../GlobalContext.jsx'

export default function EnergyAllocationStep() {
  const { t } = useTranslation()
  const theme = useTheme()

  const {
    fincas,
    setFincas,
    zonasComunes,
    setZonasComunes,
    repartoValido,
    setRepartoValido,
    allocationGroup,
    setAllocationGroup,
    modifyConsumptionData,
  } = useContext(ConsumptionContext)

  const { consumoGlobal, produccionGlobal } = useContext(EnergyContext)
  const { newEnergyBalance, setNewEnergyBalance } = useContext(GlobalContext)

  const [openDialog, closeDialog] = useDialog()

  useEffect(() => {
    /*
    allocationGroup = { 
       group: {
         consumo: como % del consumo total
         produccion: asignada como % de la produccion total
         criterio: de distribución de la produccion ['PARTICIPACION', 'CONSUMO', 'PARITARIO']
         unidades: numero de unidades que conforman el grupo. Las que pagarán las zonas comunes
         participes: numero de unidades que participan. Las que recibiran produccion
         participacionT: % de propiedad total de participacion
         participacionP: % de propiedad de los participes
       }
    }
    */
    // console.log(
    //   'UE EnergyAllocation',
    //   JSON.stringify(allocationGroup),
    //   TCB.requiereAllocation,
    // )

    if (newEnergyBalance) {
      //Primera asignacion de produccion a cada grupo basada en el consumo grupal
      setAllocationGroup((prev) => {
        const newAllocation = { ...prev }
        Object.keys(newAllocation).forEach(
          (group) =>
            (newAllocation[group].produccion =
              newAllocation[group].consumo / consumoGlobal.totalAnual),
        )
        return newAllocation
      })

      //Distribución de la produccion del grupo entre sus participes basada en participacion
      for (const grupo in allocationGroup) {
        //Si el grupo tiene unidades esta formado por fincas de DGC
        if (allocationGroup[grupo].unidades > 0) {
          //Es grupo de catastro hay que calcular betas y asignarlo a cada finca
          for (const f of fincas) {
            if (f.participa && f.grupo === grupo) {
              f.coefEnergia = UTIL.roundDecimales(
                (f.participacion / allocationGroup[grupo].participacionP) *
                  allocationGroup[grupo].produccion,
                6,
              )
            } else {
              f.coefEnergia = 0
            }
            modifyConsumptionData('Finca', f)
          }
        } else {
          //Es una zona comun el beta es directamente la energia asignada al grupo
          setZonasComunes((prev) =>
            prev.map((_zc) => {
              return { ..._zc, coefEnergia: allocationGroup[_zc.id].produccion }
            }),
          )
        }
      }
      closeBetasToOne()
      setRepartoValido(true)
      setNewEnergyBalance(false)
    }
  }, [])

  function help(level) {
    if (level === 1)
      openDialog({
        children: <HelpConsumption onClose={() => closeDialog()} />,
      })
  }

  /**
    Hay que asegurar que la suma de los beta con 6 decimales de exactamente 1.
    Si hubiera alguna diferencia se la asignamos a la primera zonaComun, si no hubiera zona comun con produccion asignada se lo asignamos a la primera finca
   */
  function closeBetasToOne() {
    const betaFincas = fincas.reduce(
      (t, f) => t + UTIL.roundDecimales(f.coefEnergia, 6),
      0,
    )
    const betaZonasComunes = zonasComunes.reduce(
      (t, z) => t + UTIL.roundDecimales(z.coefEnergia, 6),
      0,
    )
    const deltaTotal = 1 - betaFincas - betaZonasComunes
    if (zonasComunes.length > 0) {
      zonasComunes[0].coefEnergia += deltaTotal
      modifyConsumptionData('ZonaComun', zonasComunes[0])
    } else {
      fincas[0].coefEnergia += deltaTotal
      modifyConsumptionData('Finca', fincas[0])
    }
  }

  function generaFicheroReparto() {
    closeBetasToOne()
    const betaList = []
    for (const f of fincas.filter((f) => f.coefEnergia > 0)) {
      betaList.push({ CUPS: f.CUPS, beta: f.coefEnergia.toFixed(6) })
    }
    console.log('GENERAFICHERO', zonasComunes)
    for (const z of zonasComunes.filter((z) => z.coefEnergia > 0)) {
      betaList.push({ CUPS: z.CUPS, beta: z.coefEnergia.toFixed(6) })
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

            {/* <IconButton
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
            </IconButton> */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Typography variant="h4">
                {t('ENERGY_ALLOCATION.TOTAL_ENERGY', {
                  energy: UTIL.formatoValor('energia', produccionGlobal.totalAnual),
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
          <AllocationGraph
            allocationGroup={allocationGroup}
            setAllocationGroup={setAllocationGroup}
          ></AllocationGraph>
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
              {Object.entries(allocationGroup).map((key) => (
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

      <Button onClick={() => UTIL.dumpData('Fincas.csv', fincas)}>Exportar</Button>
      <Button onClick={generaFicheroReparto}>Genera fichero reparto</Button>
    </Container>
  )
}
