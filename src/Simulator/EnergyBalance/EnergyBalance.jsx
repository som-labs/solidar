import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

// REACT Solidar Components
import TCBContext from '../TCBContext'
import { optimizador } from '../classes/optimizador'
import calculaResultados from '../classes/calculaResultados'
import ConsumoGeneracion3D from './ConsumoGeneracion3D'
import EnergyFlow from './EnergyFlow'
import YearEnergyBalance from './YearEnergyBalance'
import MonthEnergyBalance from './MonthEnergyBalance'
import EnvironmentalImpact from './EnvironmentalImpact'

export default function EnergyBalanceStep() {
  const { t, i18n } = useTranslation()
  const [resumen, setResumen] = useState([])

  const { bases, setBases, tipoConsumo, setTipoConsumo } = useContext(TCBContext)

  function getRowId(row) {
    return row.idBaseSolar
  }

  const columns = [
    // { field: 'idBaseSolar', headerName: 'ID', width: 50 },
    {
      field: 'nombreBaseSolar',
      headerName: 'Nombre',
      headerAlign: 'center',
      width: 250,
    },
    {
      field: 'paneles',
      headerName: 'Paneles',
      headerAlign: 'center',
      flex: 0.5,
      align: 'center',
      renderCell: (params) => {
        return UTIL.formatoValor('paneles', params.value)
      },
    },
    {
      field: 'potenciaMaxima',
      headerName: 'Pot. Maxima',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaMaxima', params.value)
      },
    },
    {
      field: 'potenciaUnitaria',
      headerName: 'Potencia Unitaria',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaUnitaria', params.value)
      },
    },
    {
      field: 'potenciaTotal',
      headerName: 'Potencia Total de la base',
      headerAlign: 'center',
      flex: 1,
      align: 'right',
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaTotal', params.value)
      },
    },
  ]

  const wait = (seconds) => {
    setTimeout(() => {
      console.log(`Waited for ${seconds} seconds`)
    }, seconds * 1000) // Convert seconds to milliseconds
  }

  useEffect(() => {
    let cursorOriginal = document.body.style.cursor
    document.body.style.cursor = 'progress'

    //PENDIENTE: desabilitariamos la posibilidad de dar al boton siguiente mientras estamos preparando los resultados
    // document.getElementById('botonSiguiente').disabled = true

    //Si ha habido algún cambio que requiera la ejecución del optimizador lo ejecutamos
    console.log('a optimizador ' + TCB.requiereOptimizador)
    if (TCB.requiereOptimizador) {
      // Comprobamos que estan cargados todos los rendimientos. Es el flag rendimientoCreado de cada BaseSolar
      let waitLoop = 0
      for (let base of TCB.BaseSolar) {
        //var sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
        if (!base.rendimientoCreado) {
          alert('Esperando datos PVGIS para base: ' + base.nombreBaseSolar)
          //   if (TCB.importando) {
          //     //document.getElementById('importar').innerHTML = TCB.i18next.t("importarProyecto_MSG_importando");
          //   } else {
          //     document.getElementById('resultadosResumen').innerHTML =
          //       'Esperando PVGIS para base ' + base.idBaseSolar
          //   }

          while (
            !base.rendimientoCreado &&
            waitLoop++ < TCB.tiempoEsperaPVGIS &&
            base.rendimientoCreado !== 'error'
          ) {
            wait(1)
          }
          if (base.rendimientoCreado === 'error') {
            alert('Error obteniendo datos de PVGIS')
            base.rendimientoCreado = false
            // PENDIENTE: Reemplazar alert con error
            return
          }
          if (waitLoop >= TCB.tiempoEsperaPVGIS) {
            alert('Tiempo de respuesta excesivo en la llamada a PVGIS')
            // PENDIENTE: reemplazar alert con confimr de espera
            return
          }
          // PENDIENTE: limpiar alert
        }
      }

      // Se ejecuta el optimizador para determinar la configuración inicial propuesta
      let pendiente = optimizador(
        TCB.BaseSolar,
        TCB.consumo,
        TCB.parametros.potenciaPanelInicio,
      )
      if (pendiente > 0) {
        alert(
          'No es posible instalar los paneles necesarios.\nPendiente: ' +
            UTIL.formatoValor('energia', pendiente) +
            '\nContinuamos con el máximo número de paneles posible',
        )
      }
      document.body.style.cursor = cursorOriginal
    }

    // Cada base en TCB.BaseSolar ha sido asignada por el optimizador con el número de paneles óptimo.
    // Si es una importación con los paneles que se hubieran salvado en la simulacion previa.
    // Update local state to new configuration
    let oldBases = [...bases]
    TCB.BaseSolar.forEach((base) => {
      const nIndex = oldBases.findIndex((t) => {
        return t.idBaseSolar === base.idBaseSolar
      })
      oldBases[nIndex].paneles = base.instalacion.paneles
      oldBases[nIndex].potenciaUnitaria = base.instalacion.potenciaUnitaria
      oldBases[nIndex].potenciaTotal = base.instalacion.potenciaTotal
    })
    setBases(oldBases)

    //Volvemos a habilitar la secuencia del wizard
    // document.getElementById('botonSiguiente').disabled = false

    // return status
    //}
  }, [])

  useEffect(() => {
    // Se realiza el cálculo de todas las variables de energia del sistema
    calculaResultados()
    setResumen(TCB.produccion.resumenMensual('suma'))
  }, [bases])

  return (
    <>
      <Container>
        <Typography variant="h3">{t('ENERGY_BALANCE.TITLE')}</Typography>

        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('ENERGY_BALANCE.DESCRIPTION'),
          }}
        />
        <div>
          <Typography variant="body">{t('tabla bases asignadas')}</Typography>
          <DataGrid
            getRowId={getRowId}
            rows={bases}
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
          />
        </div>
        <div>
          <Typography variant="h5">
            {t('ENERGY_BALANCE.TOTAL_PANELS', {
              paneles: Math.round(bases.reduce((sum, tBase) => sum + tBase.paneles, 0)),
            })}
          </Typography>
        </div>

        <Box>
          <ConsumoGeneracion3D></ConsumoGeneracion3D>
        </Box>
        <EnergyFlow></EnergyFlow>
        <YearEnergyBalance></YearEnergyBalance>
        <MonthEnergyBalance resumen={resumen}></MonthEnergyBalance>
        <EnvironmentalImpact></EnvironmentalImpact>
      </Container>
    </>
  )
}
