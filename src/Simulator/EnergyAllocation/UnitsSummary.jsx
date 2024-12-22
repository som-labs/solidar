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
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
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
  const { allocationGroup, setAllocationGroup, preciosValidos } =
    useContext(ConsumptionContext)

  const { grupo, units, setUnits } = props

  const [activo, setActivo] = useState() //Corresponde al objeto TipoConsumo en State que se esta manipulando
  const [criterio, setCriterio] = useState()

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
      field: 'coefEnergia',
      headerName: 'Beta', //t('TipoConsumo.PROP.nombreTipoConsumo'),
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      flex: 1,
      description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
      sortable: false,
    },

    // {
    //   field: 'actions',
    //   type: 'actions',
    //   headerName: t('BASIC.LABEL_ACCIONES'),
    //   sortable: false,
    //   getActions: (params) => [
    //     <GridActionsCellItem
    //       key={1}
    //       icon={
    //         <Tooltip title={t('CONSUMPTION.TOOLTIP_botonBorraTipoConsumo')}>
    //           <DeleteIcon />
    //         </Tooltip>
    //       }
    //       label="ShowGraphs"
    //       onClick={(e) => deleteTipoConsumo(e, params.row)}
    //     />,
    //     <GridActionsCellItem
    //       key={2}
    //       icon={
    //         <Tooltip title={t('CONSUMPTION.TOOLTIP_botonEditaTipoConsumo')}>
    //           <EditIcon />
    //         </Tooltip>
    //       }
    //       label="Edit"
    //       onClick={() => editTipoConsumo(params.row)}
    //     />,
    //   ],
    // },
  ]

  function getRowId(row) {
    return row.idFinca
  }

  function changeCriterio() {
    return (
      <FormControl>
        <FormLabel>Elige criterio para distribuir la energía asignada</FormLabel>
        <RadioGroup
          row
          value={allocationGroup[grupo].criterio}
          onChange={(evt) => handleChange(evt.target)}
        >
          <FormControlLabel
            value="PARTICIPACION"
            control={<Radio />}
            label="Participación"
          />
          <FormControlLabel value="CONSUMO" control={<Radio />} label="Uso eléctrico" />
          <FormControlLabel
            value="PARITARIO"
            control={<Radio />}
            label="Partes iguales"
          />
        </RadioGroup>
      </FormControl>
    )
  }

  function handleChange(evt) {
    setAllocationGroup((prev) => ({
      ...prev,
      [grupo]: {
        ...prev[grupo],
        criterio: evt.value,
      },
    }))
    distributeAllocation(grupo, allocationGroup[grupo].produccion, evt.value)
  }

  function distributeAllocation(grupo, coefGrupo, criterio) {
    console.log('Distribuye grupo ' + grupo + 'coef ' + coefGrupo)
    //Fincas que participan del grupo
    //const participes = TCB.Finca.filter((f) => f.participa && f.grupo === grupo)

    let consumoTotal
    switch (criterio) {
      case 'PARTICIPACION':
        for (const f of TCB.Finca) {
          if (f.participa && f.grupo === grupo) {
            f.coefEnergia =
              (f.participacion / 100 / allocationGroup[grupo].participacion) * coefGrupo
          }
        }
        break
      case 'CONSUMO':
        consumoTotal = allocationGroup[grupo].consumo * TCB.consumo.totalAnual
        for (const f of TCB.Finca) {
          if (f.participa && f.grupo === grupo) {
            const mConsumo = TCB.TipoConsumo.find(
              (e) => e.nombreTipoConsumo === f.nombreTipoConsumo,
            ).totalAnual
            f.coefEnergia = (mConsumo / consumoTotal) * coefGrupo
          }
        }
        break
      case 'PARITARIO':
        for (const f of TCB.Finca) {
          if (f.participa && f.grupo === grupo) {
            f.coefEnergia = coefGrupo / allocationGroup[grupo].unidades
          }
        }
        break
    }
  }

  console.log(allocationGroup[grupo])
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
                rows={TCB.Finca.filter((e) => e.participa && e.grupo === grupo)}
                columns={columns}
                hideFooter={false}
                rowHeight={30}
                autoHeight
                disableColumnMenu
                localeText={{ noRowsLabel: t('BASIC.LABEL_NO_ROWS') }}
                slots={{ toolbar: changeCriterio }} //, footer: footerSummary }}
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
