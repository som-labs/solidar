import { useState, useContext } from 'react'
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

import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid'

// REACT Solidar Components
import InputContext from '../InputContext'
import MapaMesHora from './MapaMesHora'
import MapaDiaHora from './MapaDiaHora'
import { useDialog } from '../../components/DialogProvider'
import DialogNewConsumption from './DialogNewConsumption'

// Solidar objects
import TCB from '../classes/TCB'
import { formatoValor } from '../classes/Utiles'
import { Container } from '@mui/material'
import TipoConsumo from '../classes/TipoConsumo'

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
  const { tipoConsumo, setTipoConsumo } = useContext(InputContext)
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
      children: (
        <DialogNewConsumption
          data={initialValues}
          onClose={(cause) => endDialog(cause)}
        ></DialogNewConsumption>
      ),
    })
  }

  //REVISAR: como hacer para que el dialogo funcione sincro y no se llame a showGraphs antes de que se termine de cargar el TipoConsumo
  function endDialog(closingEvent, tc) {
    if (closingEvent === undefined) return
    console.log('fin dialogo ', closingEvent)

    // if (closingEvent.target.id === 'save') {
    //   console.log(tc)
    //   setActivo(TCB.TipoConsumo[TCB.TipoConsumo.length - 1])
    // }
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

  // showGraphsTC recibe una fila del datagrid y activa el objeto TipoConsumo de TCB que correponde
  function showGraphsTC(tc) {
    console.log(tc)
    setActivo(
      TCB.TipoConsumo.find((t) => {
        return t.idTipoConsumo === tc.idTipoConsumo
      }),
    )
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

  function newConsumption() {
    return (
      <GridToolbarContainer>
        <Tooltip
          title={t('CONSUMPTION.TOOLTIP_BUTTON_NUEVO_TIPOCONSUMO')}
          placement="top"
        >
          <Button startIcon={<AddIcon />} onClick={openNewConsumptionDialog}>
            {t('CONSUMPTION.LABEL_BUTTON_NUEVO_TIPOCONSUMO')}
          </Button>
        </Tooltip>
      </GridToolbarContainer>
    )
  }

  function footerSummary() {
    return (
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
          backgroundColor: 'grey',
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
            __html: t('CONSUMPTION.TOTAL_DEMMAND', {
              consumoTotal: formatoValor(
                'energia',
                Math.round(tipoConsumo.reduce((sum, tc) => sum + tc.cTotalAnual, 0)),
              ),
            }),
          }}
        />
        <Tooltip
          title={t('CONSUMPTION.TOOLTIP_BUTTON_NUEVO_TIPOCONSUMO')}
          placement="top"
        >
          <IconButton variant="contained" size="small" onClick={showGraphTotales}>
            <AnalyticsIcon />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }

  function showGraphTotales() {
    if (tipoConsumo.length > 0) {
      const dummyType = new TipoConsumo({ nombreTipoConsumo: 'Totales' })
      TCB.TipoConsumo.forEach((tc) => {
        dummyType.suma(tc)
      })
      dummyType.fechaInicio = new Date(2023, 1, 1)
      setActivo(dummyType)
    }
  }

  return (
    <>
      <Container>
        {/* Consumption types table 
        PENDIENTE: hay que permitir ver el gráfico de la suma de todos los consumos */}
        <DataGrid
          autoHeight
          getRowId={getRowId}
          rows={tipoConsumo}
          columns={columns}
          hideFooter={false}
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
          slots={{ toolbar: newConsumption, footer: footerSummary }}
        />
        <Typography variant="h6"></Typography>

        {activo && (
          <>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                border: 2,
                borderColor: 'primary.light',
                mt: '1rem',
                mb: '1rem',
                borderRadius: 4,
              }}
            >
              <MapaMesHora activo={activo}></MapaMesHora>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                border: 2,
                borderColor: 'primary.light',
                mt: '1rem',
                mb: '1rem',
                borderRadius: 4,
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
