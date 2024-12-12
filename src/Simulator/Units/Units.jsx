import { useContext, Fragment } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { IconButton, Grid, Typography, Container, Box, Button } from '@mui/material'
import HelpIcon from '@mui/icons-material/HelpOutlineRounded.js'
import AddBoxIcon from '@mui/icons-material/AddBox'
import { useTheme } from '@mui/material/styles'

// REACT Solidar Components
import PreciosTarifa from '../Consumption/PreciosTarifa'
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

export default function UnitsStep() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { inLineHelp } = useContext(AlertContext)
  const { fincas, setFincas, zonasComunes, setZonasComunes } =
    useContext(ConsumptionContext)

  const [openDialog, closeDialog] = useDialog()

  function help(level) {
    if (level === 1)
      openDialog({
        children: <HelpConsumption onClose={() => closeDialog()} />,
      })
  }

  const uniqueTypes = {}
  fincas.forEach((f) => {
    if (uniqueTypes[f.grupo]) {
      uniqueTypes[f.grupo]++
    } else {
      uniqueTypes[f.grupo] = 1
    }
  })

  function creaZonaComun() {
    const _zonaComun = {
      nombreTipoConsumo: '',
      idZonaComun: (++TCB.idFinca).toFixed(0),
      nombre: 'Zona Comun ' + TCB.idFinca,
      coefEnergia: 0,
      coefHucha: 0,
      cuotaHucha: 0,
    }

    TCB.ZonaComun.push(_zonaComun)
    TCB.requiereOptimizador = true
    setZonasComunes([...zonasComunes, _zonaComun])
  }

  return (
    <Container>
      <Grid container rowSpacing={3}>
        <Grid item xs={12}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('UNITS.DESCRIPTION_1'),
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
        </Grid>

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
              padding: 2,
              gap: '15px',
            }}
          >
            {Object.entries(uniqueTypes).map((key, value) => (
              <Fragment key={key}>
                <Box sx={{ display: 'flex', flex: 1 }}>
                  <UnitTypeBox tipo={key[0]}></UnitTypeBox>
                </Box>
              </Fragment>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('UNITS.DESCRIPTION_3'),
            }}
          />
          <IconButton
            onClick={creaZonaComun}
            size="small"
            style={{
              color: theme.palette.helpIcon.main,
              fontSize: 'inherit',
              verticalAlign: 'text-center',
              transform: 'scale(0.8)',
              padding: 0,
            }}
          >
            <AddBoxIcon />
          </IconButton>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: 2,
              gap: '15px',
            }}
          >
            {TCB.ZonaComun.map((key, value) => (
              <Fragment key={key}>
                <Box sx={{ display: 'flex', flex: 1 }}>
                  <ZonaComunTypeBox zonaComun={key}></ZonaComunTypeBox>
                </Box>
              </Fragment>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Button onClick={() => UTIL.dumpData('Fincas.csv', TCB.Finca)}>Exportar</Button>
      <Button>Importar</Button>
    </Container>
  )
}
