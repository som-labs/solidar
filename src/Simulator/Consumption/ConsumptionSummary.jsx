import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import Tooltip from '@mui/material/Tooltip'
import DeleteIcon from '@mui/icons-material/Delete'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'

// REACT Solidar Components
import TCBContext from '../TCBContext'
import MapaMesHora from './MapaMesHora'
import MapaDiaHora from './MapaDiaHora'
import { useDialog } from '../../components/DialogProvider'
import DialogNewConsumption from './DialogNewConsumption'

// Solidar objects
import TCB from '../classes/TCB'
import { formatoValor } from '../classes/Utiles'
import { Container } from '@mui/material'

//PENDIENTE: Decidir si mostramos los datos en formato tabla o creamos boxes segun diseño de Clara
export default function ConsumptionSummary() {
  const { t, i18n } = useTranslation()

  const columns = [
    {
      field: 'nombreTipoConsumo',
      headerName: t('TipoConsumo.LABEL_nombreTipoConsumo'),
      editable: true,
      flex: 1,
      description: t('TipoConsumo.TOOLTIP_nombreTipoConsumo'),
    },
    {
      field: 'fuente',
      headerName: t('TipoConsumo.LABEL_fuente'),
      type: 'select',
      description: t('TipoConsumo.TOOLTIP_fuente'),
    },
    {
      field: 'nombreFicheroCSV',
      headerName: t('TipoConsumo.LABEL_nombreFicheroCSV'),
      type: 'text',
      flex: 1,
      description: t('TipoConsumo.TOOLTIP_nombreFicheroCSV'),
    },
    {
      field: 'cTotalAnual',
      headerName: t('TipoConsumo.LABEL_cTotalAnual'),
      type: 'number',
      width: 150,
      description: t('TipoConsumo.TOOLTIP_cTotalAnual'),
      valueFormatter: (params) => formatoValor('cTotalAnual', params.value),
    },
    {
      field: 'Actions',
      headerName: '',
      renderCell: (params) => {
        return (
          <Box>
            <IconButton
              variant="contained"
              size="small"
              tabIndex={params.hasFocus ? 0 : -1}
              onClick={() => showGraphsTC(params.row)}
            >
              <AnalyticsIcon />
            </IconButton>

            <IconButton
              variant="contained"
              size="small"
              tabIndex={params.hasFocus ? 0 : -1}
              onClick={(e) => deleteTC(e, params.row)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )
      },
    },
  ]

  const [activo, setActivo] = useState() //Corresponde al objeto TipoConsumo en State que se esta manipulando
  const { tipoConsumo, setTipoConsumo } = useContext(TCBContext)
  const [openDialog, closeDialog] = useDialog()

  function getRowId(row) {
    return row.idTipoConsumo
  }

  function openNewConsumptionDialog() {
    const initialValues = {
      nombreTipoConsumo: 'Consumo tipo ' + TCB.featIdUnico++,
      fuente: 'CSV',
      ficheroCSV: null,
      consumoAnualREE: '',
    }
    openDialog({
      children: <DialogNewConsumption data={initialValues} onClose={endDialog} />,
    })
  }

  //REVISAR: como hacer para que el dialogo funcione sincro y no se llame a showGraphs antes de que se termine de cargar el TipoConsumo
  function endDialog(showGraphs, nuevoTipoConsumo) {
    console.log('fin dialogo ', showGraphs, nuevoTipoConsumo)
    if (showGraphs) {
      //setActivo({ ...nuevoTipoConsumo })
    }
    closeDialog()
  }

  //PENDIENTE: esta funcion es por si se puede editar el TC desde la tabla. Por ahora solo el nombre
  function changeTC(params, event) {
    switch (params.field) {
      case 'nombreTipoConsumo':
        cambiaNombreTipoConsumo(params.row, event.target.value)
        break
    }
  }

  /**
   * Gestiona el cambio de nombre del TipoConsumo */
  function cambiaNombreTipoConsumo(row, nuevoTipo) {
    //PENDIENTE: Verificar duplicidad de nombre
    let oldTipoConsumo = [...tipoConsumo]
    const nIndex = oldTipoConsumo.findIndex((t) => {
      return t.idTipoConsumo === row.idTipoConsumo
    })

    TCB.TipoConsumo[nIndex].nombreTipoConsumo = nuevoTipo
    oldTipoConsumo[nIndex].nombreTipoConsumo = nuevoTipo
    setTipoConsumo(oldTipoConsumo)
    setActivo(TCB.TipoConsumo[nIndex])
  }

  function showGraphsTC(tc) {
    // console.log(tc)
    // const nIndex = TCB.TipoConsumo.findIndex((t) => {
    //   return t.idTipoConsumo === tc.idTipoConsumo
    // })
    console.log(tc)
    setActivo(tc)
  }

  function deleteTC(ev, tc) {
    ev.stopPropagation()
    let prevTipoConsumo = [...tipoConsumo]
    const nIndex = prevTipoConsumo.findIndex((t) => {
      return t.idTipoConsumo === tc.idTipoConsumo
    })
    TCB.requiereOptimizador = true
    TCB.cambioTipoConsumo = true
    prevTipoConsumo.splice(nIndex, 1)
    TCB.TipoConsumo.splice(nIndex, 1)
    setTipoConsumo(prevTipoConsumo)
    setActivo(undefined)
  }

  return (
    <>
      <Container>
        <Box>
          {/* Este boton permite crear un objeto TipoConsumo desde un formulario modal */}
          <br />
          <Tooltip
            title={t('CONSUMPTION.TOOLTIP_BUTTON_NUEVO_TIPOCONSUMO')}
            placement="top"
          >
            <Button startIcon={<AddIcon />} onClick={openNewConsumptionDialog}>
              {t('CONSUMPTION.LABEL_BUTTON_NUEVO_TIPOCONSUMO')}
            </Button>
          </Tooltip>
        </Box>
        {/* Consumption types table 
        REVISAR: hay que permitir ver el gráfico de la suma de todos los consumos */}
        <DataGrid
          autoHeight
          getRowId={getRowId}
          rows={tipoConsumo}
          columns={columns}
          hideFooter={true}
          sx={{
            boxShadow: 2,
            border: 2,
            borderColor: 'primary.light',
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
          onCellEditStop={(params, event) => {
            changeTC(params, event)
          }}
        />

        <Box
          sx={{
            mt: '0.3rem',
            display: 'flex',
            flexWrap: 'wrap',
            boxShadow: 2,
            flex: 1,
            border: 2,
            textAlign: 'center',
            borderColor: 'primary.light',
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
            backgroundColor: 'rgba(220, 249, 233, 1)',
          }}
          justifyContent="center"
        >
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
            }}
            textAlign={'center'}
            dangerouslySetInnerHTML={{
              __html: t(
                t('CONSUMPTION.TOTAL_DEMMAND', {
                  consumoTotal: formatoValor(
                    'energia',
                    Math.round(tipoConsumo.reduce((sum, tc) => sum + tc.cTotalAnual, 0)),
                  ),
                }),
              ),
            }}
          />
        </Box>

        {t('CONSUMPTION.TOTAL_DEMMAND', {
          consumoTotal: formatoValor(
            'energia',
            Math.round(tipoConsumo.reduce((sum, tc) => sum + tc.cTotalAnual, 0)),
          ),
        })}
        <Typography variant="h6"></Typography>

        {activo && (
          <>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                width: '100%',
                boxShadow: 2,
                border: 2,
                borderColor: 'primary.light',
                '& .MuiDataGrid-cell:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <MapaMesHora activo={activo}></MapaMesHora>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                width: '100%',
                boxShadow: 2,
                border: 2,
                borderColor: 'primary.light',
                '& .MuiDataGrid-cell:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <MapaDiaHora activo={activo}></MapaDiaHora>
            </Box>
          </>
        )}
      </Container>
    </>
  )
}
