import { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Button, IconButton, Typography, Tooltip, Grid } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import AnalyticsIcon from '@mui/icons-material/Analytics'
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

//PENDIENTE: Decidir si mostramos los datos en formato tabla o creamos boxes segun diseño de Clara
export default function ConsumptionSummary() {
  const { t } = useTranslation()
  const [openDialog, closeDialog] = useDialog()

  const [activo, setActivo] = useState() //Corresponde al objeto TipoConsumo en State que se esta manipulando
  const { tipoConsumo, setTipoConsumo, preciosValidos, addTCBTipoToState } =
    useContext(ConsumptionContext)

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
      field: 'cTotalAnual',
      headerName: t('TipoConsumo.PROP.cTotalAnual'),
      type: 'number',
      width: 150,
      description: t('TipoConsumo.TOOLTIP.cTotalAnual'),
      valueFormatter: (params) => formatoValor('cTotalAnual', params.value),
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
          onClick={(e) => deleteTC(e, params.row)}
        />,
      ],
    },
  ]

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
        <DialogConsumption
          data={initialValues}
          previous={tipoConsumo}
          onClose={(cause, formData) => endDialog(cause, formData)}
        ></DialogConsumption>
      ),
    })
  }

  async function cargaCSV(objTipoConsumo, ficheroCSV, fuente) {
    TCB.cambioTipoConsumo = true
    objTipoConsumo.inicializa()

    objTipoConsumo.ficheroCSV = ficheroCSV
    let opciones

    if (fuente === 'REE') {
      opciones = {
        delimiter: ';',
        decimal: '.',
        fechaHdr: 'FECHA',
        horaHdr: 'HORA',
        valorArr: [TCB.tipoTarifa],
        factor: objTipoConsumo.consumoAnualREE,
      }
    } else {
      opciones = {
        delimiter: ';',
        decimal: ',',
        fechaHdr: 'FECHA',
        horaHdr: 'HORA',
        valorArr: ['CONSUMO', 'CONSUMO_KWH', 'AE_KWH'],
        factor: 1,
        metodo: 'PROMEDIO',
      }
    }

    //Si la fuente es DATADIS loadcsv debera cambiar el formato de fecha de AAAA/MM/DD a DD/MM/AAAA
    opciones.fechaSwp = fuente === 'DATADIS'
    let aStatus
    await objTipoConsumo
      .loadFromCSV(ficheroCSV, opciones)
      .then((r) => {
        aStatus = true
      })
      .catch((e) => {
        alert(e)
        aStatus = false
      })
    return aStatus
  }

  async function endDialog(reason, formData) {
    if (reason === undefined) return
    if (reason === 'save') {
      TCB.requiereOptimizador = true
      TCB.cambioTipoConsumo = true

      let nuevoTipoConsumo = {
        idTipoConsumo: TCB.featIdUnico,
        nombreTipoConsumo: formData.nombreTipoConsumo,
        fuente: formData.fuente,
      }

      if (nuevoTipoConsumo.fuente === 'REE') {
        nuevoTipoConsumo.consumoAnualREE = formData.consumoAnualREE
        nuevoTipoConsumo.ficheroCSV = await UTIL.getFileFromUrl('./datos/REE.csv')
        nuevoTipoConsumo.nombreFicheroCSV = ''
      } else {
        nuevoTipoConsumo.consumoAnualREE = ''
        nuevoTipoConsumo.ficheroCSV = formData.ficheroCSV
        nuevoTipoConsumo.nombreFicheroCSV = formData.ficheroCSV.name
      }
      let idxTC = TCB.TipoConsumo.push(new TipoConsumo(nuevoTipoConsumo)) - 1
      let cursorOriginal = document.body.style.cursor

      //Si se ha pasado un inputFile como argumento se carga
      if (formData.ficheroCSV !== '') {
        try {
          let cargaResPromise = new Promise((resolve) => {
            document.body.style.cursor = 'progress'
            let res = cargaCSV(
              TCB.TipoConsumo[idxTC],
              TCB.TipoConsumo[idxTC].ficheroCSV,
              TCB.TipoConsumo[idxTC].fuente,
            )
            resolve(res)
          })
          cargaResPromise
            .then((respuesta) => {
              if (respuesta) {
                // nuevoTipoConsumo.cTotalAnual = TCB.TipoConsumo[idxTC].cTotalAnual
                addTCBTipoToState(TCB.TipoConsumo[idxTC])
                // setTipoConsumo((prevTipos) => [...prevTipos, nuevoTipoConsumo])
                showGraphsTC(nuevoTipoConsumo)
              } else {
                console.log('cargaCSV devolvio error ', respuesta)
                TCB.TipoConsumo.splice(idxTC, 1)
              }
              document.body.style.cursor = cursorOriginal
            })
            .catch((error) => {
              console.log('cargaCSV catch ', error)
              TCB.TipoConsumo.splice(idxTC, 1)
              document.body.style.cursor = cursorOriginal
            })
        } catch (error) {
          alert(error)
          document.body.style.cursor = cursorOriginal
          closeDialog()
        }
      }
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

  // showGraphsTC recibe una fila del datagrid y activa el objeto TipoConsumo de TCB que correponde
  function showGraphsTC(tc) {
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
        <SLDRTooltip
          title={t('CONSUMPTION.TOOLTIP_BUTTON_NUEVO_TIPOCONSUMO')}
          placement="top"
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openNewConsumptionDialog}
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
                    Math.round(tipoConsumo.reduce((sum, tc) => sum + tc.cTotalAnual, 0)),
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

        {/* <Typography
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
        <Tooltip title={t('CONSUMPTION.TOOLTIP_BUTTON_TOTAL_DEMMAND')} placement="top">
          <IconButton
            variant="contained"
            size="small"
            onClick={showGraphTotales}
            sx={{ display: 'inline' }}
          >
            <AnalyticsIcon />
          </IconButton>
        </Tooltip> */}
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
            sx={{
              mb: '1rem',
            }}
            onCellEditStop={(params, event) => {
              changeTC(params, event)
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
