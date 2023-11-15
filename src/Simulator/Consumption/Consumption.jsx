import React, { useEffect, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import Tooltip from '@mui/material/Tooltip'
import Container from '@mui/material/Container'
import DeleteIcon from '@mui/icons-material/Delete'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'

// REACT Solidar Components
import MapaMesHora from './MapaMesHora'
import { useDialog } from '../../components/DialogProvider'
import DialogNewConsumption from './DialogNewConsumption'
import PreciosTarifa from './PreciosTarifa'

// Solidar objects
import TCBContext from '../TCBContext'
import TCB from '../classes/TCB'
import { formatoValor } from '../classes/Utiles'
import MapaDiaHora from './MapaDiaHora'
import ConsumptionSummary from './ConsumptionSummary'

//PENDIENTE: Decidir si mostramos los datos en formato tabla o creamos boxes segun diseño de Clara
const ConsumptionStep = () => {
  const { t, i18n } = useTranslation()

  // const [activo, setActivo] = useState() //Corresponde al objeto TipoConsumo en TCB que se esta manipulando
  // const { tipoConsumo, setTipoConsumo } = useContext(TCBContext)
  // const [openDialog, closeDialog] = useDialog()

  // function getRowId(row) {
  //   return row.idTipoConsumo
  // }

  // function openNewConsumptionDialog() {
  //   const initialValues = {
  //     nombreTipoConsumo: 'Consumo tipo ' + TCB.featIdUnico++,
  //     fuente: 'CSV',
  //     ficheroCSV: null,
  //     consumoAnualREE: '',
  //   }
  //   openDialog({
  //     children: <DialogNewConsumption data={initialValues} onClose={endDialog} />,
  //   })
  // }

  // //REVISAR: como hacer para que el dialogo funcion sincro y no se llame a showGraphs antes de que se termine de cargar el TipoConsumo
  // function endDialog(showGraphs, newTC) {
  //   console.log('fin dialogo ', showGraphs, newTC)
  //   // if (showGraphs) {
  //   //   showGraphsTC(newTC)
  //   // }
  //   closeDialog()
  // }

  // //PENDIENTE: esta funcion es por si se puede editar el TC desde la tabla. Por ahora solo el nombre
  // function changeTC(params, event) {
  //   switch (params.field) {
  //     case 'nombreTipoConsumo':
  //       cambiaNombreTipoConsumo(params.row, event.target.value)
  //       break
  //   }
  // }

  // /**
  //  * Gestiona el cambio de nombre del TipoConsumo */
  // function cambiaNombreTipoConsumo(row, nuevoTipo) {
  //   //PENDIENTE: Verificar duplicidad de nombre
  //   let oldTipoConsumo = [...tipoConsumo]
  //   const nIndex = oldTipoConsumo.findIndex((t) => {
  //     return t.idTipoConsumo === row.idTipoConsumo
  //   })

  //   TCB.TipoConsumo[nIndex].nombreTipoConsumo = nuevoTipo
  //   oldTipoConsumo[nIndex].nombreTipoConsumo = nuevoTipo
  //   setTipoConsumo(oldTipoConsumo)
  //   setActivo(TCB.TipoConsumo[nIndex])
  // }

  // function showGraphsTC(tc) {
  //   const nIndex = TCB.TipoConsumo.findIndex((t) => {
  //     return t.idTipoConsumo === tc.idTipoConsumo
  //   })
  //   setActivo(TCB.TipoConsumo[nIndex])
  // }

  // function deleteTC(ev, tc) {
  //   ev.stopPropagation()
  //   let prevTipoConsumo = [...tipoConsumo]
  //   const nIndex = prevTipoConsumo.findIndex((t) => {
  //     return t.idTipoConsumo === tc.idTipoConsumo
  //   })
  //   TCB.requiereOptimizador = true
  //   TCB.cambioTipoConsumo = true
  //   prevTipoConsumo.splice(nIndex, 1)
  //   TCB.TipoConsumo.splice(nIndex, 1)
  //   setTipoConsumo(prevTipoConsumo)
  //   setActivo(undefined)
  // }

  // const columns = [
  //   {
  //     field: 'nombreTipoConsumo',
  //     headerName: t('CONSUMPTION.LABEL_nombreTipoConsumo'),
  //     editable: true,
  //     flex: 1,
  //     description: t('CONSUMPTION.TT_nombreTipoConsumo'),
  //   },
  //   {
  //     field: 'fuente',
  //     headerName: t('CONSUMPTION.LABEL_fuente'),
  //     type: 'select',
  //     description: t('CONSUMPTION.TT_fuente'),
  //   },
  //   {
  //     field: 'nombreFicheroCSV',
  //     headerName: t('CONSUMPTION.LABEL_nombreFicheroCSV'),
  //     type: 'text',
  //     flex: 1,
  //     description: t('CONSUMPTION.TT_nombreFicheroCSV'),
  //   },
  //   {
  //     field: 'cTotalAnual',
  //     headerName: t('CONSUMPTION.LABEL_TOTAL_ANUAL'),
  //     type: 'number',
  //     width: 150,
  //     description: t('CONSUMPTION.TOOLTIP_TOTAL_ANUAL'),
  //     valueFormatter: (params) => formatoValor('cTotalAnual', params.value),
  //   },
  //   {
  //     field: 'Actions',
  //     headerName: '',
  //     renderCell: (params) => {
  //       return (
  //         <Box>
  //           <IconButton
  //             variant="contained"
  //             size="small"
  //             tabIndex={params.hasFocus ? 0 : -1}
  //             onClick={() => showGraphsTC(params.row)}
  //           >
  //             <AnalyticsIcon />
  //           </IconButton>

  //           <IconButton
  //             variant="contained"
  //             size="small"
  //             tabIndex={params.hasFocus ? 0 : -1}
  //             onClick={(e) => deleteTC(e, params.row)}
  //           >
  //             <DeleteIcon />
  //           </IconButton>
  //         </Box>
  //       )
  //     },
  //   },
  // ]

  return (
    <>
      <Container>
        <Typography variant="h3">{t('CONSUMPTION.TITLE')}</Typography>
        <PreciosTarifa></PreciosTarifa>
        <Box>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('CONSUMPTION.DESCRIPTION'),
            }}
          />
          <ConsumptionSummary>{{ inSummary: true }}</ConsumptionSummary>
          {/* Este boton permite crear un objeto TipoConsumo desde un formulario modal */}
          {/* <br />
          <Tooltip
            title={t('CONSUMPTION.TOOLTIP_BUTTON_NUEVO_TIPOCONSUMO')}
            placement="top"
          >
            <Button startIcon={<AddIcon />} onClick={openNewConsumptionDialog}>
              {t('CONSUMPTION.LABEL_BUTTON_NUEVO_TIPOCONSUMO')}
            </Button>
          </Tooltip>
        </Box> */}
          {/* Consumption types table 
        REVISAR: hay que permitir ver el gráfico de la suma de todos los consumos */}
          {/* <DataGrid
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
        <Typography variant="h6">
          {t('CONSUMPTION.TOTAL_DEMMAND', {
            consumoTotal: formatoValor(
              'energia',
              Math.round(tipoConsumo.reduce((sum, tc) => sum + tc.cTotalAnual, 0)),
            ),
          })}
        </Typography> */}

          {/* {activo && (
          <>
            <Box>
              <MapaMesHora>{activo}</MapaMesHora>
            </Box>
            <Box>
              <MapaDiaHora>{activo}</MapaDiaHora>
            </Box>
          </>
        )} */}
        </Box>
      </Container>
    </>
  )
}

export default ConsumptionStep
