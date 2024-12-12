import { useState, useEffect } from 'react'

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
  const [ready, setReady] = useState('yellow')
  const [totalConsumption, setTotalConsumption] = useState()

  useEffect(() => {
    if (tipoConsumoZC !== '') {
      setTotalConsumption(
        TCB.TipoConsumo.find((_tc) => {
          return _tc.nombreTipoConsumo === tipoConsumoZC
        }).totalAnual,
      )
    }
  }, [])

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
        alignItems: 'center',
        border: '1px solid grey',
        borderRadius: 2,
        padding: 2,
        maxWidth: 300,
        backgroundColor: { ready },
      }}
    >
      <Typography sx={theme.titles.level_1} textAlign={'center'} marginTop="1rem">
        {'Zona Común'}
      </Typography>

      <TextField
        label="Nombre"
        sx={{ width: 250, height: 30, mt: '1rem', mb: '1rem' }}
        type="text"
        id="nombre"
        value={nombreZC}
        onChange={(event) => changeNombreZonaComun(event.target.value)}
      />

      <Typography
        variant="body"
        textAlign={'center'}
        dangerouslySetInnerHTML={{
          __html:
            '<br />Uso eléctrico: ' +
            tipoConsumoZC +
            '<br />Uso de energía: ' +
            UTIL.formatoValor('energia', totalConsumption) +
            '<br />% sobre total: ' +
            UTIL.formatoValor(
              'porciento',
              (totalConsumption / TCB.consumo.totalAnual) * 100,
            ) +
            '<br />Energia Total asignada: ' +
            UTIL.formatoValor(
              'energia',
              (TCB.produccion.totalAnual * totalConsumption) / TCB.consumo.totalAnual,
            ),
        }}
      />
    </Box>
  )
}
