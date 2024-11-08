import { useState, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  IconButton,
  Typography,
  Tooltip,
  Grid,
  MenuItem,
  Dialog,
  FormControlLabel,
  Select,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'

import { SLDRInputField } from '../../components/SLDRComponents'
import { useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import EditIcon from '@mui/icons-material/Edit'
import { DataGrid, GridToolbarContainer, GridActionsCellItem } from '@mui/x-data-grid'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { useDialog } from '../../components/DialogProvider'
import DialogConsumption from '../Consumption/DialogConsumption'
import { SLDRFooterBox, SLDRInfoBox, SLDRTooltip } from '../../components/SLDRComponents'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import { formatoValor } from '../classes/Utiles'
import TipoConsumo from '../classes/TipoConsumo'

export default function UnitsSummary(props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const [openDialog, closeDialog] = useDialog()
  const {
    tipoConsumo,
    setTipoConsumo,
    preciosValidos,
    addTCBTipoToState,
    fincas,
    setFincas,
  } = useContext(ConsumptionContext)

  const { grupo, units, setTotalConsumption } = props

  const [activo, setActivo] = useState() //Corresponde al objeto TipoConsumo en State que se esta manipulando
  const [tipoConsumoAsignado, setTipoConsumoAsignado] = useState()

  const editing = useRef()

  const columns = [
    {
      field: 'nombreFinca',
      headerName: t('Finca.PROP.nombreFinca'),
      headerAlign: 'center',
      flex: 1,
      description: t('Finca.TOOLTIP.nombreFinca'),
      sortable: false,
    },
    {
      field: 'refcat',
      headerName: t('Finca.PROP.refcat'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 1,
      description: t('Finca.TOOLTIP.refcat'),
      sortable: false,
    },
    {
      field: 'planta',
      headerName: t('Finca.PROP.planta'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 0.5,
      description: t('Finca.TOOLTIP.planta'),
      sortable: false,
    },
    {
      field: 'puerta',
      headerName: t('Finca.PROP.puerta'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 0.5,
      description: t('Finca.TOOLTIP.puerta'),
      sortable: false,
    },
    {
      field: 'uso',
      headerName: t('Finca.PROP.uso'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 1,
      description: t('Finca.TOOLTIP.uso'),
      sortable: false,
    },
    {
      field: 'superficie',
      headerName: t('Finca.PROP.superficie'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 0.5,
      description: t('Finca.TOOLTIP.superficie'),
      sortable: false,
    },
    {
      field: 'participacion',
      headerName: t('Finca.PROP.participacion'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 0.5,
      description: t('Finca.TOOLTIP.participacion'),
      sortable: false,
    },
    {
      field: 'nombreTipoConsumo',
      headerName: t('TipoConsumo.PROP.nombreTipoConsumo'),
      headerAlign: 'center',
      align: 'center',
      type: 'text',
      flex: 1,
      description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
      sortable: false,
    },

    {
      field: 'actions',
      type: 'actions',
      headerName: t('BASIC.LABEL_ACCIONES'),
      sortable: false,
      getActions: (params) => [
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
            <Tooltip title={t('CONSUMPTION.TOOLTIP_botonEditaTipoConsumo')}>
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
    return row.idFinca
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
    const initialValues = {
      nombreTipoConsumo: 'Vivienda ' + TCB.featIdUnico,
      fuente: '',
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
        //showGraphsTC(nuevoTipoConsumo) //Autoproduccion tema decides not to show graph after loaded
      } else {
        UTIL.debugLog('Error detectado en carga de CSV')
        TCB.TipoConsumo.pop()
      }
    }

    document.body.style.cursor = cursorOriginal
    closeDialog()
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

  function handleTipoConsumo(event) {
    setTipoConsumoAsignado(event.target.value)
    const newFincas = fincas.map((f) => {
      if (f.grupo === grupo) {
        f.nombreTipoConsumo = event.target.value
      }
      return f
    })
    setFincas(newFincas)
    TCB.cambioTipoConsumo = true
    TCB.requiereOptimizador = true
  }

  function newConsumption() {
    return (
      <GridToolbarContainer>
        {/* <SLDRTooltip
          title={<Typography>{t('UNITS.xxTOOLTIP_TIPO_USO')}</Typography>}
          placement="end"
        > */}
        <FormControlLabel
          labelPlacement="start"
          padding={3}
          control={
            <Select
              sx={{ flex: 1, ml: '1rem', width: 390 }}
              value={tipoConsumoAsignado}
              name="fuente"
              object="TipoConsumo"
              onChange={(event) => handleTipoConsumo(event)}
            >
              <MenuItem value={undefined}>Indefinido</MenuItem>
              {tipoConsumo.map((e, index) => (
                <MenuItem key={index} value={e.nombreTipoConsumo}>
                  {e.nombreTipoConsumo}
                </MenuItem>
              ))}
            </Select>
          }
          label={t('UNITS.LABEL_TIPO_USO')}
        />
        {/* </SLDRTooltip> */}
      </GridToolbarContainer>
    )
  }

  function totalConsumption() {
    let total = 0

    units.forEach((e) => {
      if (e.nombreTipoConsumo !== undefined) {
        const tc = tipoConsumo.find((t) => {
          return t.nombreTipoConsumo === e.nombreTipoConsumo
        })
        total += tc.totalAnual
        setTotalConsumption(total)
      }
    })
    console.log('CONSUMO TOTAL', { grupo, total })
    return total
  }

  function footerSummary() {
    return (
      <SLDRFooterBox>
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={{ mt: '2rem' }}
        >
          <Grid item>
            <Typography
              sx={theme.titles.level_2}
              textAlign={'center'}
              dangerouslySetInnerHTML={{
                __html: t('CONSUMPTION.TOTAL_DEMMAND', {
                  consumoTotal: formatoValor('energia', totalConsumption()),
                }),
              }}
            />
          </Grid>
          <Grid item>
            <Tooltip title={t('CONSUMPTION.TOOLTIP_botonMuestraTodosTipoConsumo')}>
              <IconButton onClick={showGraphTotales}>
                <AnalyticsIcon />
              </IconButton>
            </Tooltip>
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
    <Dialog
      fullScreen
      open={true}
      onClose={closeDialog}
      aria-labelledby="full-screen-dialog-title"
    >
      <DialogTitle id="full-screen-dialog-title">
        {'Unidades con uso ' + grupo}
      </DialogTitle>

      <DialogContent>
        <Grid container justifyContent={'center'} rowSpacing={4}>
          {preciosValidos && (
            <Grid item xs={11}>
              <DataGrid
                sx={theme.tables.headerWrap}
                getRowId={getRowId}
                rows={units}
                columns={columns}
                hideFooter={false}
                rowHeight={30}
                autoHeight
                disableColumnMenu
                localeText={{ noRowsLabel: t('BASIC.LABEL_NO_ROWS') }}
                slots={{ toolbar: newConsumption, footer: footerSummary }}
              />
            </Grid>
          )}
          {/* {activo && preciosValidos && (
        <>
          <Grid item xs={12}>
            <SLDRInfoBox>
              <MapaMesHora activo={activo}></MapaMesHora>
            </SLDRInfoBox>
          </Grid>
          <Grid item xs={12}>
            <SLDRInfoBox>
              <MapaDiaHora activo={activo}></MapaDiaHora>
            </SLDRInfoBox>
          </Grid>
        </>
      )} */}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
