import { useState, useContext, useRef, useEffect } from 'react'
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

  const { allocationGroup, setAllocationGroup, preciosValidos, fincas, setFincas } =
    useContext(ConsumptionContext)

  const { grupo } = props
  const [units, setUnits] = useState(TCB.Finca.filter((e) => e.grupo === grupo))

  useEffect(() => {
    distributeAllocation(
      grupo,
      allocationGroup[grupo].produccion,
      allocationGroup[grupo].criterio,
    )
  }, [])

  const columns = [
    {
      field: 'nombreFinca',
      headerName: t('Finca.PROP.nombreFinca'),
      headerAlign: 'center',
      flex: 0.8,
      description: t('Finca.TOOLTIP.nombreFinca'),
      sortable: false,
    },
    // {
    //   field: 'refcat',
    //   headerName: t('Finca.PROP.refcat'),
    //   headerAlign: 'center',
    //   align: 'center',
    //   type: 'text',
    //   flex: 1,
    //   description: t('Finca.TOOLTIP.refcat'),
    //   sortable: false,
    // },
    // {
    //   field: 'planta',
    //   headerName: t('Finca.PROP.planta'),
    //   headerAlign: 'center',
    //   align: 'center',
    //   type: 'text',
    //   flex: 0.4,
    //   description: t('Finca.TOOLTIP.planta'),
    //   sortable: false,
    // },
    // {
    //   field: 'puerta',
    //   headerName: t('Finca.PROP.puerta'),
    //   headerAlign: 'center',
    //   align: 'center',
    //   type: 'text',
    //   flex: 0.4,
    //   description: t('Finca.TOOLTIP.puerta'),
    //   sortable: false,
    // },
    // {
    //   field: 'uso',
    //   headerName: t('Finca.PROP.uso'),
    //   headerAlign: 'center',
    //   align: 'center',
    //   type: 'text',
    //   flex: 0.8,
    //   description: t('Finca.TOOLTIP.uso'),
    //   sortable: false,
    // },
    // {
    //   field: 'superficie',
    //   headerName: t('Finca.PROP.superficie'),
    //   headerAlign: 'center',
    //   align: 'center',
    //   type: 'text',
    //   flex: 0.5,
    //   description: t('Finca.TOOLTIP.superficie'),
    //   sortable: false,
    // },
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
      flex: 0.8,
      description: t('TipoConsumo.TOOLTIP.nombreTipoConsumo'),
      sortable: false,
      valueGetter: (params) =>
        params.row.nombreTipoConsumo ? params.row.nombreTipoConsumo : 'Indefinido',
    },
    {
      field: 'coefEnergia',
      headerName: t('ENERGY_ALLOCATION.BETA_LABEL'),
      valueGetter: (params) => params.row.coefEnergia.toFixed(6),
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      flex: 0.7,
      description: t('ENERGY_ALLOCATION.BETA_TOOLTIP'),
      sortable: false,
    },
    {
      field: 'participa',
      headerName: t('Finca.PROP.participa'),
      description: t('Finca.TOOLTIP.participa'),
      type: 'boolean',
      flex: 0.5,
      sortable: false,
    },
  ]

  function getRowId(row) {
    return row.idFinca
  }

  function changeCriterio() {
    return (
      <FormControl>
        <FormLabel>
          Elige criterio para distribuir la energía asignada dentro del grupo
        </FormLabel>
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
    // console.log(
    //   'Distribuye grupo ' + grupo + ' coef ' + coefGrupo + ' criterio ' + criterio,
    // )

    switch (criterio) {
      case 'PARTICIPACION':
        setUnits((prevUnits) =>
          prevUnits.map((unit) => ({
            ...unit,
            coefEnergia: unit.participa
              ? (unit.participacion / allocationGroup[grupo].participacionP) * coefGrupo
              : 0,
          })),
        )
        for (const f of TCB.Finca) {
          f.coefEnergia = f.participa
            ? (f.participacion / allocationGroup[grupo].participacionP) * coefGrupo
            : 0
        }
        break
      case 'CONSUMO':
        setUnits((prevUnits) =>
          prevUnits.map((unit) => ({
            ...unit,
            coefEnergia: unit.participa
              ? (unit.coefConsumo / allocationGroup[grupo].consumo) * coefGrupo
              : 0,
          })),
        )
        for (const f of TCB.Finca) {
          f.coefEnergia = f.participa
            ? (f.coefConsumo / allocationGroup[grupo].consumo) * coefGrupo
            : 0
        }
        break
      case 'PARITARIO':
        setUnits((prevUnits) =>
          prevUnits.map((unit) => ({
            ...unit,
            coefEnergia: unit.participa
              ? coefGrupo / allocationGroup[grupo].participes
              : 0,
          })),
        )
        for (const f of TCB.Finca) {
          f.coefEnergia = f.participa ? coefGrupo / allocationGroup[grupo].participes : 0
        }
        break
    }

    setFincas([TCB.Finca])
  }

  return (
    <>
      {units && (
        <Dialog
          fullScreen
          open={true}
          onClose={closeDialog}
          aria-labelledby="full-screen-dialog-title"
        >
          <DialogTitle id="full-screen-dialog-title">
            {t('ENERGY_ALLOCATION.ALLOCATION_SUMMARY', { grupo: grupo })}
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
                    slots={{ toolbar: changeCriterio }} //, footer: footerSummary }}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog} color="primary">
              {t('BASIC.LABEL_CLOSE')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
