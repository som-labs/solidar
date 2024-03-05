import { useState, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Button, IconButton, Typography, Tooltip, Grid } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import EditIcon from '@mui/icons-material/Edit'
import { DataGrid, GridToolbarContainer, GridActionsCellItem } from '@mui/x-data-grid'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import MapaMesHora from './MapaMesHora'
import MapaDiaHora from './MapaDiaHora'
import { useDialog } from '../../components/DialogProvider'
import DialogConsumption from './DialogConsumption'
import { SLDRFooterBox, SLDRInfoBox, SLDRTooltip } from '../../components/SLDRComponents'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import { formatoValor } from '../classes/Utiles'
import TipoConsumo from '../classes/TipoConsumo'

export default function ConsumptionSummary() {
  const { t } = useTranslation()
  const [openDialog, closeDialog] = useDialog()
  const [activo, setActivo] = useState() //Corresponde al objeto TipoConsumo en State que se esta manipulando
  const { tipoConsumo, setTipoConsumo, preciosValidos, addTCBTipoToState } =
    useContext(ConsumptionContext)
  const editing = useRef()

  const columns = [
    {
      field: 'nombreTipoConsumo',
      headerName: t('TipoConsumo.PROP.nombreTipoConsumo'),
      editable: true,
      flex: 1,
      description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
      sortable: false,
    },
    {
      field: 'fuente',
      headerName: t('TipoConsumo.PROP.fuente'),
      type: 'select',
      description: t('TipoConsumo.TOOLTIP.fuente'),
      sortable: false,
    },
    {
      field: 'nombreFicheroCSV',
      headerName: t('TipoConsumo.PROP.nombreFicheroCSV'),
      type: 'text',
      flex: 1,
      description: t('TipoConsumo.TOOLTIP.nombreFicheroCSV'),
      sortable: false,
    },
    {
      field: 'totalAnual',
      headerName: t('TipoConsumo.PROP.totalAnual'),
      type: 'number',
      width: 150,
      description: t('TipoConsumo.TOOLTIP.totalAnual'),
      valueFormatter: (params) => formatoValor('totalAnual', params.value),
      sortable: false,
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      getActions: (params) => [
        <GridActionsCellItem
          key={1}
          icon={
            <Tooltip title={t('CONSUMPTION.TOOLTIP_botonMuestraMapaTipoConsumo')}>
              <AnalyticsIcon />
            </Tooltip>
          }
          label="ShowGraphs"
          onClick={() => showGraphsTC(params.row)}
        />,
        <GridActionsCellItem
          key={1}
          icon={
            <Tooltip title={t('CONSUMPTION.TOOLTIP_botonBorraTipoConsumo')}>
              <DeleteIcon />
            </Tooltip>
          }
          label="ShowGraphs"
          onClick={(e) => deleteTipoConsumo(e, params.row)}
        />,
        <GridActionsCellItem
          key={2}
          icon={
            <Tooltip title={t('LOCATION.TOOLTIP_EDITA_BASE')}>
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => editTipoConsumo(params.row)}
        />,
      ],
    },
  ]

  function getRowId(row) {
    return row.idTipoConsumo
  }

  function editTipoConsumo(row) {
    editing.current = true
    console.log(row.nombreFicheroCSV)
    //console.log('EDITING EDIT', editing)
    openDialog({
      children: (
        <DialogConsumption
          data={row}
          previous={tipoConsumo}
          maxWidth={'lg'}
          fullWidth={true}
          onClose={(cause, formData) => endDialog(cause, formData)}
        ></DialogConsumption>
      ),
    })
  }

  function createTipoConsumo() {
    editing.current = false
    // console.log('EDITING NEW', editing)
    const initialValues = {
      nombreTipoConsumo: 'Vivienda ' + TCB.featIdUnico,
      fuente: 'CSV',
      ficheroCSV: null,
      consumoAnualREE: '',
    }
    openDialog({
      children: (
        <DialogConsumption
          data={initialValues}
          maxWidth={'lg'}
          fullWidth={true}
          previous={tipoConsumo} //Needed to check duplicate name
          onClose={(cause, formData) => endDialog(cause, formData)}
        ></DialogConsumption>
      ),
    })
  }

  async function endDialog(reason, formData) {
    let nuevoTipoConsumo
    let cursorOriginal

    if (reason === undefined) return
    if (reason === 'save') {
      //Can reach this by saving new tipo consumo or editing existing one
      TCB.requiereOptimizador = true
      TCB.cambioTipoConsumo = true

      if (editing.current) nuevoTipoConsumo = { idTipoConsumo: formData.idTipoConsumo }
      else nuevoTipoConsumo = { idTipoConsumo: TCB.featIdUnico++ }

      nuevoTipoConsumo.nombreTipoConsumo = formData.nombreTipoConsumo
      nuevoTipoConsumo.fuente = formData.fuente

      if (nuevoTipoConsumo.fuente === 'REE') {
        nuevoTipoConsumo.consumoAnualREE = formData.consumoAnualREE
        nuevoTipoConsumo.ficheroCSV = await UTIL.getFileFromUrl('./datos/REE.csv')
        nuevoTipoConsumo.nombreFicheroCSV = ''
        //Consumption profile of REE depends on TipoTarifa
        nuevoTipoConsumo.tipoTarifaREE = TCB.tipoTarifa
      } else {
        nuevoTipoConsumo.consumoAnualREE = ''
        nuevoTipoConsumo.ficheroCSV = formData.ficheroCSV
        nuevoTipoConsumo.nombreFicheroCSV = formData.ficheroCSV.name
      }

      let astatus
      let idxTC
      cursorOriginal = document.body.style.cursor
      document.body.style.cursor = 'progress'

      //Will create a new TipoConsumo always, if editing will replace previous one by new one.
      idxTC = TCB.TipoConsumo.push(new TipoConsumo(nuevoTipoConsumo)) - 1
      astatus = await TCB.TipoConsumo[idxTC].loadTipoConsumoFromCSV()
      if (astatus) {
        if (editing.current) {
          //Editando uno existente moveremos el recien creado a su posicion original
          idxTC = TCB.TipoConsumo.findIndex((tc) => {
            return tc.idTipoConsumo === formData.idTipoConsumo
          })

          TCB.TipoConsumo.splice(idxTC, 1, TCB.TipoConsumo.pop())
        }
        addTCBTipoToState(TCB.TipoConsumo[idxTC])
        //showGraphsTC(nuevoTipoConsumo)
      } else {
        console.log('cargaCSV catch ')
        TCB.TipoConsumo.pop()
      }
    }

    document.body.style.cursor = cursorOriginal
    closeDialog()
  }

  // showGraphsTC recibe una fila del datagrid y activa el objeto TipoConsumo de TCB que correponde
  function showGraphsTC(tc) {
    setActivo(
      TCB.TipoConsumo.find((t) => {
        return t.idTipoConsumo === tc.idTipoConsumo
      }),
    )
  }

  function deleteTipoConsumo(ev, tc) {
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
        <SLDRTooltip
          title={t('CONSUMPTION.TOOLTIP_BUTTON_NUEVO_TIPOCONSUMO')}
          placement="top"
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createTipoConsumo}
            size="medium"
          >
            {t('CONSUMPTION.LABEL_BUTTON_NUEVO_TIPOCONSUMO')}
          </Button>
        </SLDRTooltip>
      </GridToolbarContainer>
    )
  }

  function footerSummary() {
    return (
      <SLDRFooterBox>
        <Grid container alignItems="center" justifyContent="center" spacing={1}>
          <Grid item>
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
                    Math.round(tipoConsumo.reduce((sum, tc) => sum + tc.totalAnual, 0)),
                  ),
                }),
              }}
            />
          </Grid>
          <Grid item>
            <IconButton onClick={showGraphTotales}>
              <AnalyticsIcon />
            </IconButton>
          </Grid>
        </Grid>
      </SLDRFooterBox>
    )
  }

  function showGraphTotales() {
    if (tipoConsumo.length > 0) {
      const dummyType = new TipoConsumo({ nombreTipoConsumo: 'Totales' })
      for (let tc of TCB.TipoConsumo) {
        dummyType.suma(tc)
      }
      dummyType.fechaInicio = new Date(2023, 1, 1)
      setActivo(dummyType)
    }
  }

  return (
    <div>
      {preciosValidos && (
        <SLDRInfoBox>
          <DataGrid
            getRowId={getRowId}
            rows={tipoConsumo}
            columns={columns}
            hideFooter={false}
            rowHeight={30}
            autoHeight
            disableColumnMenu
            localeText={{ noRowsLabel: t('BASIC.LABEL_NO_ROWS') }}
            sx={{
              mb: '1rem',
            }}
            slots={{ toolbar: newConsumption, footer: footerSummary }}
          />
        </SLDRInfoBox>
      )}
      {activo && preciosValidos && (
        <>
          <SLDRInfoBox>
            <MapaMesHora activo={activo}></MapaMesHora>
          </SLDRInfoBox>
          <SLDRInfoBox>
            <MapaDiaHora activo={activo}></MapaDiaHora>
          </SLDRInfoBox>
        </>
      )}
    </div>
  )
}
