import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Box, Typography, TextField, MenuItem, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import DeleteIcon from '@mui/icons-material/Delete'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import TipoConsumo from '../classes/TipoConsumo'

export default function ZonaComunTypeBox(props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const {
    zonasComunes,
    setZonasComunes,
    allocationGroup,
    setAllocationGroup,
    tipoConsumo,
    tarifas,
  } = useContext(ConsumptionContext)

  const [error, setError] = useState({ status: false, field: '' })
  const { zonaComun } = props

  function changeTipoConsumo(tipo) {
    //Change zonaComun tipo de consumo en state
    setZonasComunes((prev) =>
      prev.map((_zc) =>
        _zc.id === zonaComun.id ? { ..._zc, nombreTipoConsumo: tipo } : _zc,
      ),
    )

    //Change consumo de la zona comun en allocationGroup
    const tConsumo = tipo !== '' ? TipoConsumo.getTotal(tipo) : 0
    setAllocationGroup((prev) => ({
      ...prev,
      [zonaComun.id]: {
        ...prev[zonaComun.id],
        consumo: tConsumo,
      },
    }))

    TCB.requiereReparto = true
    TCB.cambioTipoConsumo = true
  }

  function changeTarifa(id) {
    //Change zonaComun tarifa en state
    setZonasComunes((prev) =>
      prev.map((_zc) => (_zc.id === zonaComun.id ? { ..._zc, idTarifa: id } : _zc)),
    )
  }

  function changeNombreZonaComun(event) {
    const { id, value } = event.target
    if (zonasComunes.find((zc) => zc.nombre === value)) {
      setError({ status: true, field: id, name: value })
    } else {
      setZonasComunes((prev) =>
        prev.map((_zc) => (_zc.id === zonaComun.id ? { ..._zc, nombre: value } : _zc)),
      )
      setError({ status: false, field: id })
    }
  }

  function setNombreZonaComun(event) {
    const { value } = event.target

    setAllocationGroup((prev) => ({
      ...prev,
      [zonaComun.id]: { ...prev[zonaComun.id], nombre: value },
    }))

    setZonasComunes((prev) =>
      prev.map((item) => (item.id === zonaComun.id ? { ...item, nombre: value } : item)),
    )
  }

  function changeCUPS(CUPS) {
    setZonasComunes((prev) =>
      prev.map((_zc) => (_zc.id === zonaComun.id ? { ..._zc, CUPS: CUPS } : _zc)),
    )
  }

  function deleteZonaComun() {
    setZonasComunes((prev) => [...prev.filter((_zc) => _zc.id !== zonaComun.id)])

    if (allocationGroup) {
      setAllocationGroup((prev) => {
        const tmpAG = prev
        for (const ag in tmpAG) {
          console.log(ag, zonaComun)
          if (tmpAG[ag].unidades > 0) delete tmpAG[ag].zonasComunes[zonaComun.id]
          if (ag === zonaComun.id) delete tmpAG[ag]
        }
        return tmpAG
      })
    }

    TCB.requiereReparto = true
    TCB.cambioTipoConsumo = true
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
        sx={{ width: 200, height: 30, mt: '0.2rem', mb: '1rem' }}
        size="small"
        type="text"
        id="nombreZonaComun"
        value={zonaComun.nombre}
        onChange={changeNombreZonaComun}
        onBlur={setNombreZonaComun}
        error={error.status && error.field === 'nombreZonaComun'}
        helperText={
          error.status && error.field === 'nombreZonaComun'
            ? t(error.name + ' Duplicado')
            : ''
        }
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
        label={t('Tarifa.PROP.nombreTarifa')}
        sx={{ width: 200, height: 30, mt: '1rem', mb: 2 }}
        size="small"
        select
        id="tarifa"
        value={zonaComun.idTarifa}
        onChange={(event) => changeTarifa(event.target.value)}
      >
        {tarifas.map((_t, index) => (
          <MenuItem key={index} value={_t.idTarifa}>
            {_t.nombreTarifa}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Uso eléctrico"
        sx={{ width: 200, height: 30, mt: '1rem', mb: 2 }}
        size="small"
        select
        id="tipo"
        value={zonaComun.nombreTipoConsumo}
        onChange={(event) => changeTipoConsumo(event.target.value)}
      >
        {tipoConsumo.map((_tc, index) => (
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
            'Uso de energía: ' +
            UTIL.formatoValor('energia', allocationGroup[zonaComun.id].consumo),
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
