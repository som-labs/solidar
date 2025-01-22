import { useEffect, useState, useContext } from 'react'

// MUI objects
import { Box, Typography, TextField, MenuItem, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import DeleteIcon from '@mui/icons-material/Delete'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function ZonaComunTypeBox(props) {
  const theme = useTheme()

  const { zonasComunes, setZonasComunes, allocationGroup, setAllocationGroup } =
    useContext(ConsumptionContext)

  const { zonaComun } = props
  const [totalConsumption, setTotalConsumption] = useState()

  useEffect(() => {
    if (zonaComun.nombreTipoConsumo != '') {
      setTotalConsumption(
        TCB.TipoConsumo.find((_tc) => {
          return _tc.nombreTipoConsumo === zonaComun.nombreTipoConsumo
        }).totalAnual,
      )
    }
  }, [])

  function changeTipoConsumo(tipo) {
    TCB.ZonaComun.find((_zc) => {
      return _zc.idZonaComun === zonaComun.idZonaComun
    }).nombreTipoConsumo = tipo
    setZonasComunes([...TCB.ZonaComun])
    setTotalConsumption(
      TCB.TipoConsumo.find((_tc) => {
        return _tc.nombreTipoConsumo === tipo
      }).totalAnual,
    )

    TCB.requiereOptimizador = true
    TCB.requiereReparto = true
    TCB.cambioTipoConsumo = true
  }

  function changeNombreZonaComun(nombre) {
    TCB.ZonaComun.find((_zc) => {
      return _zc.idZonaComun === zonaComun.idZonaComun
    }).nombre = nombre
    setZonasComunes([...TCB.ZonaComun])
  }

  function changeCUPS(CUPS) {
    TCB.ZonaComun.find((_zc) => {
      return _zc.idZonaComun === props.zonaComun.idZonaComun
    }).CUPS = CUPS
    setZonasComunes([...TCB.ZonaComun])
  }

  function deleteZonaComun() {
    let prevZonasComunes = [...zonasComunes]
    const nIndex = prevZonasComunes.findIndex((zc) => {
      return zc.idZonaComun === props.zonaComun.idZonaComun
    })
    prevZonasComunes.splice(nIndex, 1)
    TCB.ZonaComun.splice(nIndex, 1)
    setZonasComunes([...prevZonasComunes])

    if (allocationGroup) {
      const newAllocationGroup = { ...allocationGroup }
      delete newAllocationGroup[props.zonaComun.nombre]
      setAllocationGroup(newAllocationGroup)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        gap: '4px',
        alignItems: 'center',
        border: '1px solid grey',
        borderRadius: 2,
        padding: 2,
        maxWidth: 300,
      }}
    >
      <Typography sx={theme.titles.level_1} textAlign={'center'} marginTop="1rem">
        {'Zona Común'}
      </Typography>

      <TextField
        label="Nombre"
        sx={{ width: 200, height: 30, mt: '0.2rem', mb: '0.2rem' }}
        size="small"
        type="text"
        id="nombre"
        value={zonaComun.nombre}
        onChange={(event) => changeNombreZonaComun(event.target.value)}
      />

      <TextField
        label="CUPS"
        sx={{ width: 200, height: 30, mt: '1rem', mb: '0.2rem' }}
        size="small"
        type="text"
        id="CUPS"
        value={zonaComun.CUPS}
        onChange={(event) => changeCUPS(event.target.value)}
      />

      <TextField
        label="Uso eléctrico"
        sx={{ width: 200, height: 30, mt: '1rem' }}
        size="small"
        select
        id="tipo"
        value={zonaComun.nombreTipoConsumo}
        onChange={(event) => changeTipoConsumo(event.target.value)}
      >
        {TCB.TipoConsumo.map((_tc, index) => (
          <MenuItem key={index} value={_tc.nombreTipoConsumo}>
            {_tc.nombreTipoConsumo}
          </MenuItem>
        ))}
      </TextField>
      <Typography
        variant="body"
        textAlign={'center'}
        dangerouslySetInnerHTML={{
          __html:
            '<br />Uso de energía: ' + UTIL.formatoValor('energia', totalConsumption),
        }}
      />
      <IconButton
        onClick={deleteZonaComun}
        size="small"
        style={{
          color: theme.palette.helpIcon.main,
          fontSize: 'inherit',
          verticalAlign: 'text-center',
          transform: 'scale(1)',
          padding: 0,
        }}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  )
}
