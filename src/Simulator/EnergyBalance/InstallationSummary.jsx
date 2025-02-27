import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, Grid, Tooltip, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { DataGrid, GridActionsCellItem, GridCellEditStopReasons } from '@mui/x-data-grid'
import InfoIcon from '@mui/icons-material/Info'
import clsx from 'clsx'

//React global components
import { BasesContext } from '../BasesContext'
import { EnergyContext } from '../EnergyContext'
import { GlobalContext } from '../GlobalContext.jsx'
import { SLDRFooterBox } from '../../components/SLDRComponents'
import { useAlert } from '../../components/AlertProvider.jsx'
import { useDialog } from '../../components/DialogProvider'
import DialogProperties from '../components/DialogProperties'

// Solidar objects
import Economico from '../classes/Economico'
import { optimizador } from '../classes/optimizador'
import * as UTIL from '../classes/Utiles'

export default function InstallationSummary() {
  const { t } = useTranslation()
  const theme = useTheme()

  const [openDialog, closeDialog] = useDialog()
  //const { SLDRAlert } = useContext(AlertContext)
  const { SLDRAlert } = useAlert()
  const { bases, setBases, addBase, modifyBase, deleteBase, tipoPanelActivo } =
    useContext(BasesContext)
  const { calculaResultados, setTotalPaneles, totalPaneles, consumoGlobal } =
    useContext(EnergyContext)
  const { setNewEnergyBalance } = useContext(GlobalContext)

  const getRowId = (row) => {
    return row.idBaseSolar
  }

  const columns = [
    {
      field: 'nombreBaseSolar',
      headerName: t('BaseSolar.PROP.nombreBaseSolar'),
      width: 250,
      description: t('BaseSolar.TOOLTIP.nombreBaseSolar'),
      sortable: false,
      editable: false,
    },
    {
      field: 'paneles',
      headerName: t('Instalacion.PROP.paneles'),
      type: 'number',
      editable: true,
      headerAlign: 'center',
      flex: 0.7,
      align: 'center',
      editProps: {
        min: 0,
        // max: 100,
      },
      description: t('Instalacion.TOOLTIP.paneles'),
      renderCell: (params) => {
        return UTIL.formatoValor('paneles', params.row.instalacion.paneles)
      },
      cellClassName: (params) => {
        return clsx('super-app', {
          negative: params.row.instalacion.paneles > params.row.panelesMaximo,
          positive: params.row.instalacion.paneles <= params.row.panelesMaximo,
        })
      },
    },
    {
      field: 'panelesMaximo',
      headerName: t('BaseSolar.PROP.panelesMaximo'),
      headerAlign: 'center',
      flex: 0.8,
      align: 'center',
      description: t('BaseSolar.TOOLTIP.panelesMaximo'),
      editable: false,
      sortable: false,
    },
    // {
    //   field: 'potenciaMaxima',
    //   headerName: t('BaseSolar.PROP.potenciaMaxima'),
    //   headerAlign: 'center',
    //   flex: 1,
    //   align: 'right',
    //   description: t('BaseSolar.TOOLTIP.potenciaMaxima'),
    //   sortable: false,
    //   renderCell: (params) => {
    //     return UTIL.formatoValor('potenciaMaxima', params.value)
    //   },
    // },
    {
      field: 'potenciaUnitaria',
      //editable: true, //por ahora no dejamos cambiar la potencia unitaria del panel despues de haber hecho el cálculo del balance de energía.
      headerName: t('Instalacion.PROP.potenciaUnitaria'),
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      description: t('Instalacion.TOOLTIP.potenciaUnitaria'),
      sortable: false,
      editable: false,
      renderCell: (params) => {
        return UTIL.formatoValor(
          'potenciaUnitaria',
          params.row.instalacion.potenciaUnitaria,
        )
      },
    },
    {
      field: 'potenciaTotal',
      headerName: t('Instalacion.PROP.potenciaTotal'),
      headerAlign: 'center',
      flex: 1,
      align: 'center',
      description: t('Instalacion.TOOLTIP.potenciaTotal'),
      sortable: false,
      editable: false,
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaTotal', params.row.instalacion.potenciaTotal)
      },
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      headerName: t('BASIC.LABEL_INFO'),
      getActions: (params) => [
        <GridActionsCellItem
          key={1}
          icon={
            <Tooltip title={t('ENERGY_BALANCE.SUMMARY_TOOLTIP_INFO')}>
              <InfoIcon sx={{ color: theme.palette.infoIcon.main }} />
            </Tooltip>
          }
          label="Info"
          onClick={() => showProperties(params.id)}
        />,
      ],
    },
  ]

  function showProperties(id) {
    const baseActiva = bases.find((base) => {
      return base.idBaseSolar === id
    })
    openDialog({
      children: <DialogProperties data={baseActiva} onClose={closeDialog} />,
    })
  }

  function footerSummary() {
    return (
      <SLDRFooterBox>
        <Grid container alignItems="center" justifyContent="center" spacing={2}>
          <Grid item xs={12} sx={{ mt: '1rem' }}>
            <Typography
              sx={theme.titles.level_2}
              textAlign={'center'}
              dangerouslySetInnerHTML={{
                __html:
                  t('ENERGY_BALANCE.SUMMARY_FOOTER', {
                    paneles: totalPaneles,
                    potencia: UTIL.formatoValor(
                      'potenciaTotal',
                      bases.reduce(
                        (sum, tBase) => sum + tBase.instalacion.potenciaTotal,
                        0,
                      ),
                    ),
                  }) +
                  ' de ' +
                  UTIL.formatoValor(
                    'potenciaTotal',
                    bases.reduce(
                      (sum, tBase) =>
                        sum + (tBase.panelesMaximo * tBase.tipoPanel.potencia) / 1000,
                      0,
                    ),
                  ) +
                  ' posibles',
              }}
            />
          </Grid>

          <Grid container sx={{ mt: '1rem', justifyContent: 'center', gap: 4 }}>
            <Button onClick={maxConfiguration} variant="contained" color="primary">
              {t('ENERGY_BALANCE.FOOTER_BUTON_MAXIMO', {
                paneles: Math.round(
                  bases.reduce((sum, tBase) => sum + tBase.panelesMaximo, 0),
                ),
              })}
            </Button>
            <Button onClick={recoverOptimos} variant="contained" color="primary">
              {t('ENERGY_BALANCE.FOOTER_BUTON_OPTIMO')}
            </Button>
          </Grid>
        </Grid>
      </SLDRFooterBox>
    )
  }

  function setNewPaneles() {
    /* Recalculamos el balance energetico con el nuevo numero de paneles */
    calculaResultados(consumoGlobal)
    setNewEnergyBalance(true)

    // TCB.economico = new Economico()
    // UTIL.debugLog('calculaResultados - economico global ', TCB.economico)
    // if (TCB.economico.periodoAmortizacion > 20) {
    //   alert(t('ECONOMIC_BALANCE.WARNING_AMORTIZATION_TIME'))
    // }
    //Update context with new TCB data
    //setBases([...TCB.BaseSolar])

    //Update total number of panels in TCB
    setTotalPaneles(
      bases.reduce((a, b) => {
        return a + b.instalacion.paneles
      }, 0),
    )
  }

  function maxConfiguration() {
    //Update all BaseSolar panels in TCB to maximun
    bases.forEach((base) => {
      base.instalacion.paneles = base.panelesMaximo
      modifyBase(base)
    })
    setNewPaneles()
  }

  function recoverOptimos() {
    // Se ejecuta el optimizador para determinar la configuración inicial propuesta
    let pendiente = optimizador(
      bases,
      consumoGlobal,
      tipoPanelActivo.potencia,
      modifyBase,
    )
    setNewPaneles()
  }
  /**
   * Funcion para gestionar el evento generado por cambio de paneles en la tabla de bases
   * @param {params} DataGrid params object {field, row} que ha cambiado de valor
   * @param {Event} event Valor cambiado
   */

  function nuevaInstalacion(newRow, oldRow) {
    let tmpPaneles = newRow.paneles
    newRow.instalacion.paneles = newRow.paneles

    if (UTIL.ValidateEntero(newRow.paneles)) {
      tmpPaneles = parseInt(newRow.paneles)
      if (tmpPaneles < 0) {
        SLDRAlert(
          'VALIDACION',
          'El número de paneles debe ser mayor o igual a cero e idealmente menor que los ' +
            newRow.panelesMaximo +
            ' paneles que estimamos se pueden instalar en el area definida',
          'error',
        )
        return
      }

      if (tmpPaneles > newRow.panelesMaximo) {
        SLDRAlert(
          'VALIDACION',
          'Esta asignando mas paneles que los ' +
            newRow.panelesMaximo +
            ' que estimamos se pueden instalar en el area definida',
          'error',
        )
      }

      //Update this BaseSolar panels and potenciaUnitaria in TCB

      modifyBase(newRow)
      // let baseActiva = bases.find((base) => {
      //   return base.idBaseSolar === params.id
      // })
      //baseActiva.instalacion.potenciaUnitaria = tmpPotenciaUnitaria
      //baseActiva.instalacion.paneles = tmpPaneles
      setNewPaneles()
    }
    return newRow
  }

  return (
    <>
      <Typography sx={theme.titles.level_2} textAlign="center">
        {t('ENERGY_BALANCE.SUMMARY_TITLE')}
      </Typography>
      <Grid
        container
        justifyContent={'center'}
        rowSpacing={1}
        sx={{
          '& .super-app.negative': {
            backgroundColor: '#ff0000',
            color: '#1a3e72',
            fontWeight: '400',
          },
          '& .super-app.positive': {
            backgroundColor: 'rgba(157, 255, 118, 0.49)',
            color: '#1a3e72',
            fontWeight: '400',
          },
        }}
      >
        <Grid item xs={11}>
          <DataGrid
            sx={theme.tables.headerWrap}
            getRowId={getRowId}
            rows={bases}
            columns={columns}
            hideFooter={false}
            rowHeight={30}
            autoHeight
            disableColumnMenu
            editMode="cell"
            processRowUpdate={nuevaInstalacion}
            slots={{ footer: footerSummary }}
          />
        </Grid>
      </Grid>
    </>
  )
}
