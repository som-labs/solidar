import { useEffect, useState } from 'react'

// MUI objects
import { Box, Typography, TextField, MenuItem } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

export default function ZonaComunTypeBox(props) {
  const theme = useTheme()
  const [nombreZC, setNombreZC] = useState(props.zonaComun.nombre)
  const [tipoConsumoZC, setTipoConsumoZC] = useState(props.zonaComun.nombreTipoConsumo)
  const [totalConsumption, setTotalConsumption] = useState()

  const [ready, setReady] = useState('yellow')

  useEffect(() => {
    if (tipoConsumoZC != '') {
      setTotalConsumption(
        TCB.TipoConsumo.find((_tc) => {
          return _tc.nombreTipoConsumo === tipoConsumoZC
        }).totalAnual,
      )
    }
  }, [])

  //REVISAR: al asignar un tipo consumo da warning
  function changeTipoConsumo(tipo) {
    TCB.ZonaComun.find((_zc) => {
      return _zc.idZonaComun === props.zonaComun.idZonaComun
    }).nombreTipoConsumo = tipo
    setTipoConsumoZC(tipo)
    setTotalConsumption(
      TCB.TipoConsumo.find((_tc) => {
        return _tc.nombreTipoConsumo === tipo
      }).totalAnual,
    )

    if (tipo !== undefined) setReady('green')
    TCB.requiereOptimizador = true
    TCB.cambioTipoConsumo = true
  }

  function changeNombreZonaComun(nombre) {
    TCB.ZonaComun.find((_zc) => {
      return _zc.idZonaComun === props.zonaComun.idZonaComun
    }).nombre = nombre
    setNombreZC(nombre)
  }

  return (
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
        {'Zona Común'}
      </Typography>

      <TextField
        label="Nombre"
        sx={{ width: 200, height: 30, mt: '1rem', mb: '1rem' }}
        type="text"
        id="nombre"
        value={nombreZC}
        onChange={(event) => changeNombreZonaComun(event.target.value)}
      />

      <TextField
        label="Uso eléctrico"
        sx={{ width: 200, height: 30, mt: '1rem', mb: '1rem' }}
        select
        id="tipo"
        value={tipoConsumoZC}
        onChange={(event) => changeTipoConsumo(event.target.value)}
      >
        <MenuItem key={-1} value={undefined}>
          Indefinido
        </MenuItem>
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
    </Box>
  )
}
