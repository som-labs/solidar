import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Typography from '@mui/material/Typography'
import ReactMarkdown from 'react-markdown'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'

import TCBContext from '../TCBContext'
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'

import { optimizador } from '../classes/optimizador'
import calculaResultados from '../classes/calculaResultados'
import ConsumoGeneracion3D from './ConsumoGeneracion3D'
import PerfilDiario from './PerfilDiario'

const EnergyBalanceStep = () => {
  const { t, i18n } = useTranslation()

  TCB.i18next = i18n
  const { bases, setBases, tipoConsumo, setTipoConsumo } = useContext(TCBContext)

  useEffect(() => {
    console.log('a prepara')
    prepara()
  }, [])

  const columns = [
    // { field: 'idBaseSolar', headerName: 'ID', width: 50 },
    { field: 'nombreBaseSolar', headerName: 'Nombre' },
    {
      field: 'paneles',
      headerName: 'Paneles',
      width: 130,
      align: 'center',
      renderCell: (params) => {
        return UTIL.formatoValor('paneles', params.value)
      },
    },
    {
      field: 'potenciaMaxima',
      headerName: 'Pot. Maxima',
      align: 'right',
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaMaxima', params.value)
      },
    },
    {
      field: 'potenciaUnitaria',
      headerName: 'Potencia Unitaria',
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaUnitaria', params.value)
      },
    },
    {
      field: 'potenciaTotal',
      headerName: 'Potencia Total de la base',
      renderCell: (params) => {
        return UTIL.formatoValor('potenciaTotal', params.value)
      },
    },
  ]

  function getRowId(row) {
    return row.idBaseSolar
  }

  /**
   * Función que se ejecuta antes de activar el panel de resultados
   * @returns {boolean} true si todo ha ido bien false si algo ha fallado
   */
  async function prepara() {
    //desabilitamos la posibilidad de dar al boton siguiente mientras estamos preparando los resultados
    console.log('en prepara')
    let cursorOriginal = document.body.style.cursor
    document.body.style.cursor = 'progress'
    // document.getElementById('botonSiguiente').disabled = true

    //Si ha habido algún cambio que requiera la ejecución del optimizador lo ejecutamos
    console.log('a optimizador ' + TCB.requiereOptimizador)
    if (TCB.requiereOptimizador) {
      // Comprobamos que estan cargados todos los rendimientos. Es el flag rendimientoCreado de cada BaseSolar
      let waitLoop = 0
      for (let base of TCB.BaseSolar) {
        console.log(base)
        var sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
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
            // document.getElementById('resultadosResumen').innerHTML =
            //   waitLoop + ' seg. (max: ' + TCB.tiempoEsperaPVGIS + ')'
            await sleep(1000)
          }
          if (base.rendimientoCreado === 'error') {
            alert('Error obteniendo datos de PVGIS')
            base.rendimientoCreado = false
            // document.getElementById('resultadosResumen').innerHTML = ' '
            // TCB._tablaBasesAsignadas.clearAlert()
            return
          }
          if (waitLoop >= TCB.tiempoEsperaPVGIS) {
            alert('Tiempo de respuesta excesivo en la llamada a PVGIS')
            // document.getElementById('resultadosResumen').innerHTML = ' '
            // TCB._tablaBasesAsignadas.clearAlert()
            return
          }
          //   document.getElementById('resultadosResumen').innerHTML = ' '
          //   TCB._tablaBasesAsignadas.clearAlert()
        }
      }

      // Se crea el objeto de consumo global de toda la configuración en caso de importación o si ha cambiado algo que requiere optimizador

      // Se ejecuta el optimizador para determinar la configuración inicial propuesta
      let pendiente = await optimizador(
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

      // Se realiza el cálculo de todas las variables de energia del sistema
      await calculaResultados()
      TCB.requiereOptimizador = false
    }

    //Cada base ha sido asignada por el optimizador con el número de paneles óptimo o si es una importación con los paneles que se hubieran salvado en la simulacion previa. Mostramos esta asignación en la tabla
    // TCB._tablaBasesAsignadas.clearData()
    // for (let base of TCB.BaseSolar) {
    //   TCB._tablaBasesAsignadas.updateOrAddData([
    //     BaseSolar.getTabulatorRow('idBaseSolar', base.idBaseSolar),
    //   ])
    // }

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

    // Se muestran en pantalla los resultados
    let status
    if (TCB.balanceCreado) {
      status = true
    } else {
      status = false
    }

    // //Volvemos a habilitar la secuencia del wizard
    // document.getElementById('botonSiguiente').disabled = false
    document.body.style.cursor = cursorOriginal
    return status
  }

  return (
    <>
      <Container>
        <Typography variant="h3">{t('ENERGY_BALANCE.TITLE')}</Typography>
        <ReactMarkdown children={t('ENERGY_BALANCE.DESCRIPTION')} />
        <div>
          <Typography variant="body">{t('tabla bases asignadas')}</Typography>
          <DataGrid
            getRowId={getRowId}
            rows={bases}
            columns={columns}
            hideFooter={true}
          />
        </div>
        <div>
          <Typography variant="h5">
            {t('LOCATION.MSG_AREA_TOTAL', {
              areaTotal: UTIL.formatoValor(
                'paneles',
                Math.round(bases.reduce((sum, tBase) => sum + tBase.paneles, 0)),
              ),
            })}
          </Typography>
        </div>

        <Box>
          <ConsumoGeneracion3D></ConsumoGeneracion3D>
        </Box>

        {/* <div className="form-group row justify-content-center">
                        <label className="col-md-2" data-i18n="cMaximoAnual_LBL"></label>
                        <div className="col-md-2 text-end" id="cMaximoAnual" data-bs-toggle="tooltip" data-bs-placement="top">
                        <a data-i18n="resultados_LBL_pendienteCalculo"></a>
                        </div>
                        <label className="col-md-2 offset-md-1" data-i18n="potenciaTotal_LBL"></label>
                        <div className="col-md-2 text-end" id="potenciaTotal" data-bs-toggle="tooltip" data-bs-placement="top"> 
                        <a data-i18n="resultados_LBL_pendienteCalculo"></a>
                        </div>
                    </div>
                        
                    <div className="form-group row justify-content-center">
                        <label className="col-md-2" data-i18n="consumoDiario_LBL"></label>
                        <div className="col-md-2 text-end" id="consumoDiario" data-bs-toggle="tooltip" data-bs-placement="top">
                        <a data-i18n="resultados_LBL_pendienteCalculo"></a>
                        </div>
                        <label className="col-md-2 offset-md-1" data-i18n="produccionDiaria_LBL"></label>
                        <div className="col-md-2 text-end" id="produccionDiaria" data-bs-toggle="tooltip" data-bs-placement="top">
                        <a data-i18n="resultados_LBL_pendienteCalculo"></a>
                        </div>
                    </div>

                    <div className="form-group row justify-content-center">
                        <label className="col-md-2" data-i18n="consumoMensual_LBL"></label>
                        <div className="col-md-2 text-end" id="consumoMensual"  data-bs-toggle="tooltip" data-bs-placement="top">
                        <a data-i18n="resultados_LBL_pendienteCalculo"></a>
                        </div>
                        <label className="col-md-2 offset-md-1" data-i18n="produccionMensual_LBL"></label>
                        <div className="col-md-2 text-end" id="produccionMensual" data-bs-toggle="tooltip" data-bs-placement="top">
                        <a data-i18n="resultados_LBL_pendienteCalculo"></a>
                        </div>
                    </div>

                    <div className="form-group row justify-content-center">
                        <label className="col-md-2" data-i18n="cTotalAnual_LBL"></label>
                        <div className="col-md-2 text-end" id="cTotalAnual" data-bs-toggle="tooltip" data-bs-placement="top">
                        <a data-i18n="resultados_LBL_pendienteCalculo"></a>
                        </div>
                        <label className="col-md-2 offset-md-1" data-i18n="pTotalAnual_LBL"></label>
                        <div className="col-md-2 text-end" id="pTotalAnual" data-bs-toggle="tooltip" data-bs-placement="top">
                        <a data-i18n="resultados_LBL_pendienteCalculo"></a>
                        </div>
                    </div>
                    <hr/>

                    <div className="card">
                        <h6 className="card-header">
                            <a className="collapsed d-inline" data-bs-toggle="collapse"
                            data-bs-target=".multi-collapse" href="#produccionDisclaimer" aria-expanded="true" aria-controls="si no" id="produccionDisclaimerHdr" data-i18n="resultados_MSG_disclaimerProduccion">
                            </a>
                            <a href='https://joint-research-centre.ec.europa.eu/pvgis-online-tool/getting-started-pvgis/pvgis-user-manual_en' target='_blank'><i className='fa fa-question-circle-o d-inline'></i></a>
                            <i className="fa fa-chevron-down pull-right d-inline"></i>
                        </h6>

                        <div className="row">
                            <div className="col">
                                <div className="collapse multi-collapse" id="si">
                                    <div className="card card-body text-start" data-i18n="resultados_MSG_disclaimerProduccionSi">
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="collapse multi-collapse" id="no">
                                    <div className="card-body text-start" data-i18n="resultados_MSG_disclaimerProduccionNo">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <img src="./datos/consumo.svg" 
                    id="graficoConsumo"
                    //style="position:relative; display:none;"
                    alt="Consumos totales"
                    height="87"
                    width="100"
                    title="Consumos totales" />

                    <img src="./datos/red.svg" 
                    id="graficoExcedente"
                    //style="position:relative; display:none;"
                    alt="Energía vertida a la red"
                    height="87"
                    width="100"
                    title="Energía vertida a la red" />

                    <svg id="bar" xmlns="http://www.w3.org/2000/svg" width="100%" height="300"></svg>

                    <img src="./datos/red.svg" 
                    id="graficoDeficit"
                    //style="position:relative; display:none;"
                    alt="Energia recibida de la red"
                    height="87"
                    width="100"
                    title="Energia recibida de la red" />
                    
                    <img  
                        src="./datos/paneles.svg"
                        id="graficoProduccion"
                        //style="position:relative; display:none;"
                        alt="Producción en paneles"
                        height="87"
                        width="100"
                        title="Producción en paneles" />
                    <hr/>
                    <hr/> 
                    <div className="form-group row justify-content-center">
                        <label className="col-md-2" data-i18n="Consumo%Produccion_LBL"></label>
                        <div className="col-md-2 text-end" id="Consumo%Produccion" data-bs-toggle="tooltip" data-bs-placement="top">
                        <a data-i18n="resultados_LBL_pendienteCalculo"></a>
                        </div>
                        <label className="col-md-2 offset-md-1" data-i18n="Produccion%Consumo_LBL"></label>
                        <div className="col-md-2 text-end" id="Produccion%Consumo" data-bs-toggle="tooltip" data-bs-placement="top">
                        <a data-i18n="resultados_LBL_pendienteCalculo"></a>
                        </div>
                    </div>

                    <div className="col-md-12 text-center justify-content-center">
                        <a id="fuenteInfoCO2"
                            href="https://energia.gob.es/desarrollo/EficienciaEnergetica/RITE/Reconocidos/Reconocidos/Otros%20documentos/Factores_emision_CO2.pdf"
                            target="_blank"></a>
                    </div>
                    
                    <div className="form-group row justify-content-center">
                        <label className="col-md-2" data-i18n="kgCO2AnualRenovable_LBL"></label>
                        <div className="col-md-2 text-end" id="kgCO2AnualRenovable" data-bs-toggle="tooltip" data-bs-placement="top">
                        <a data-i18n="resultados_LBL_pendienteCalculo"></a>
                        </div>
                        <label className="col-md-2 offset-md-1" data-i18n="kgCO2AnualNoRenovable_LBL"></label>
                        <div className="col-md-2 text-end" id="kgCO2AnualNoRenovable" data-bs-toggle="tooltip" data-bs-placement="top">
                        <a data-i18n="resultados_LBL_pendienteCalculo"></a>
                        </div>
                    </div>
                    <hr/> */}
      </Container>
    </>
  )
}

export default EnergyBalanceStep
