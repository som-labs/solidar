import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { MuiFileInput } from 'mui-file-input'
import { DataGrid } from '@mui/x-data-grid'
import TipoConsumo from '../classes/TipoConsumo.js'
import Tarifa from '../classes/Tarifa.js'
import TCB from '../classes/TCB.js'

const ConsumptionStep = () => {
    const { t, i18n } = useTranslation()

    const [tipoConsumo, setTipoConsumo] = React.useState([])
    const nuevoTipoConsumo = (inputFile) => {
        TCB.requiereOptimizador = true
        TCB.cambioTipoConsumo = true
        let nuevoTipoConsumo = {}
        nuevoTipoConsumo.idTipoConsumo = TCB.featIdUnico++
        nuevoTipoConsumo.nombreTipoConsumo = "TCons " + nuevoTipoConsumo.idTipoConsumo
        nuevoTipoConsumo.fuente = "CSV"
        nuevoTipoConsumo.consumoAnualREE = ""
        nuevoTipoConsumo.ficheroCSV = inputFile
        nuevoTipoConsumo.nombreFicheroCSV = inputFile.name
        nuevoTipoConsumo.nombreTarifa = "2.0TD"
        nuevoTipoConsumo.territorio = 'Peninsula' //TCB.territorio cuando Location lo haga

        let idxTC = TCB.TipoConsumo.push( new TipoConsumo(nuevoTipoConsumo))
        TCB.TipoConsumo[idxTC-1].tarifa = new Tarifa(nuevoTipoConsumo.nombreTarifa, nuevoTipoConsumo.territorio)     
               
        //La funcion cargaCSV debería ser llamada de forma sincrona con await. ¿como se hace?

        if (cargaCSV(TCB.TipoConsumo[idxTC-1], inputFile, "CSV")) {
            nuevoTipoConsumo.cTotalAnual = TCB.TipoConsumo[idxTC-1].cTotalAnual;
            setTipoConsumo([...tipoConsumo, nuevoTipoConsumo])
            {console.dir( TCB.TipoConsumo[idxTC-1] )}
        } else {
            TCB.TipoConsumo.splice(idxTC-1, 1)
        }
    }

    function getRowId(row) {
        return row.idTipoConsumo;
    }

    const columns = [
        { field: 'idTipoConsumo', headerName: 'ID', width: 70 },
        { field: 'fuente', headerName: 'Tipo fuente', width: 130 },
        { field: 'nombreFicheroCSV', headerName: 'Fichero', width: 130 },
        { field: 'totalAnual', headerName: 'Consumo Anual', type: 'number', width: 90}
    ]

    async function cargaCSV (objTipoConsumo, ficheroCSV, fuente) {
        TCB.cambioTipoConsumo = true
        objTipoConsumo.inicializa()
        objTipoConsumo.ficheroCSV = ficheroCSV
        let opciones = {delimiter:";", decimal:",", fechaHdr:"FECHA", horaHdr:"HORA", 
        valorArr:["CONSUMO","CONSUMO_KWH","AE_KWH"], factor:1};
  
        //Si la fuente es DATADIS loadcsv debera cambiar el formato de fecha de AAAA/MM/DD a DD/MM/AAAA
        opciones.fechaSwp = (fuente === "DATADIS")
        await objTipoConsumo.loadFromCSV(ficheroCSV, opciones)
        if (objTipoConsumo.numeroRegistros > 0) {
        //   let consumoMsg = TCB.i18next.t('consumo_MSG_resumen', {registros: objTipoConsumo.numeroRegistros, 
        //                             desde: objTipoConsumo.fechaInicio.toLocaleDateString(),
        //                             hasta: objTipoConsumo.fechaFin.toLocaleDateString()});
        //   document.getElementById("csvResumen").innerHTML = consumoMsg;
    
        //   _tablaTipoConsumo.updateData([objTipoConsumo.select_tablaTipoConsumo()]);
        //   muestraGraficosObjeto(objTipoConsumo);
            return true
        }
        return false;
    }

    return <>
        <Container>
        <Typography variant='h3'>{t("SIMULATOR.TITLE_CONSUMPTION")}</Typography>
        <Typography variant='body'>{t("SIMULATOR.DESC_CONSUMPTION")}</Typography>
        <div>
            <MuiFileInput 
                inputProps={{ accept: 'csv/*' }} 
                onChange={nuevoTipoConsumo} 
            />
        </div>
        <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    getRowId={getRowId}
                    rows={tipoConsumo}
                    columns={columns}
                    initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                    }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                />
        </div>
        </Container>
    </>
}

export default ConsumptionStep;