import { useTranslation } from 'react-i18next'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
//import GraficoA from '../components/graphics/GraficoA'
import TCBContext from '../TCBContext'
import React, { useContext, useState } from 'react'

import { DataGrid } from '@mui/x-data-grid'
import * as UTIL from '../Utiles'

//import TCB from '../../classes/TCB.js'

const EnergyBalanceStep = () => {
    const { t, i18n } = useTranslation()
    const {bases, setBases, tipoConsumo, setTipoConsumo} = useContext(TCBContext)

    const columns = [
        // { field: 'idBaseSolar', headerName: 'ID', width: 50 },
         { field: 'nombreBaseSolar', headerName: 'Nombre' },
         { field: 'paneles', headerName: 'Paneles', width: 130, align:'right', renderCell: (params) => {
             return UTIL.formatoValor('paneles', params.value)}},
         { field: 'potenciaMaxima', headerName: 'Pot. Maxima', align:'right', renderCell: (params) => {
             return UTIL.formatoValor('potenciaMaxima',params.value)}},
        { field: 'potenciaUnitaria', headerName: 'Potencia Unitaria'},
        { field: 'potenciaTotal', headerName:'Potencia Total de la base'}
     ]

     function getRowId(row) {
        return row.idBaseSolar;
    }

    return <>
        <Container>
            <Typography variant='h3'>{t("ENERGY_BALANCE.TITLE")}</Typography>
            <Typography variant='body'>{t("ENERGY_BALANCE.DESCRIPTION")}</Typography>

            <div>
            <Typography variant='body'>{t("tabla bases asignadas")}</Typography>
            <DataGrid
                getRowId={getRowId}
                rows={bases}
                columns={columns}
                initialState={{
                  pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
                pageSizeOptions={[5, 10]}
                //checkboxSelection
            />
            </div>

                    <div className="form-group row justify-content-center">
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
                    <hr/>

        </Container>
    </>
}

export default EnergyBalanceStep