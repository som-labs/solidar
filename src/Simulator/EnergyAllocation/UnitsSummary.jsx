import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import {
  Grid,
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

import { useTheme } from '@mui/material/styles'
import { DataGrid } from '@mui/x-data-grid'

// REACT Solidar Components
import { ConsumptionContext } from '../ConsumptionContext'
import { useDialog } from '../../components/DialogProvider'

// Solidar objects
import * as UTIL from '../classes/Utiles'

export default function UnitsSummary(props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const [openDialog, closeDialog] = useDialog()

  const { allocationGroup, setAllocationGroup, fincas, setFincas, getConsumoTotal } =
    useContext(ConsumptionContext)

  const { grupo } = props

  useEffect(() => {
    distributeAllocation(
      grupo,
      allocationGroup[grupo].produccion,
      allocationGroup[grupo].criterio,
    )
  }, [allocationGroup])

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
      renderHeader: () => (
        <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
          {'Beta'}
          <br />
          {'(' +
            UTIL.roundDecimales(
              fincas
                .filter((e) => e.grupo === grupo)
                .reduce((a, b) => a + b.coefEnergia, 0) * 100,
              2,
            ) +
            '%)'}
        </div>
      ),
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
        <FormLabel>{t('ENERGY_ALLOCATION.SELECT_CRITERIO')}</FormLabel>
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

  /**
   * Distribuye el coeficiente de producción asigando al grupo entre la fincas que lo forman
   * segun el criterio propuesto
   * Modifica tanto fincas en state como en TCB
   * @param {string} grupo Nombre del grupo al que se realizará el cambio de criterio
   * @param {double} coefGrupo Coeficiente de energia asignado al grupo
   * @param {string} criterio Criterio con el que se distribuye [PARTICIPACION, CONSUMO, PARITARIO]
   */
  function distributeAllocation(grupo, coefGrupo, criterio) {
    switch (criterio) {
      case 'PARTICIPACION':
        setFincas((prev) =>
          prev.map((f) => {
            if (f.grupo === grupo && f.participa) {
              f.coefEnergia =
                (f.participacion / allocationGroup[grupo].participacionP) * coefGrupo
            }
            return f
          }),
        )
        break

      case 'CONSUMO':
        setFincas((prev) =>
          prev.map((f) => {
            if (f.grupo === grupo && f.participa) {
              f.coefEnergia =
                (getConsumoTotal(f.nombreTipoConsumo) / allocationGroup[grupo].consumo) *
                coefGrupo
            }
            return f
          }),
        )
        break

      case 'PARITARIO':
        setFincas((prev) =>
          prev.map((f) => {
            if (f.grupo === grupo && f.participa) {
              f.coefEnergia = coefGrupo / allocationGroup[grupo].participes
            }
            return f
          }),
        )
        break
    }
  }

  return (
    <>
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
            <Grid item xs={11}>
              <DataGrid
                sx={theme.tables.headerWrap}
                getRowId={getRowId}
                rows={fincas.filter((f) => f.grupo === grupo)}
                columns={columns}
                hideFooter={false}
                rowHeight={30}
                autoHeight
                disableColumnMenu
                localeText={{ noRowsLabel: t('BASIC.LABEL_NO_ROWS') }}
                slots={{ toolbar: changeCriterio }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            {t('BASIC.LABEL_CLOSE')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
