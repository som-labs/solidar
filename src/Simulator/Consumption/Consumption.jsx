import React, { useEffect, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'

import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import DeleteIcon from '@mui/icons-material/Delete';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import Box from '@mui/material/Box'

//import { Alert } from '../components/Alert'
import { DataGrid } from '@mui/x-data-grid';

import { MuiFileInput } from 'mui-file-input'
import Select from '@mui/material/Select'
import { MenuItem } from '@mui/material'
import InputLabel from '@mui/material/InputLabel'
import TipoConsumo from '../classes/TipoConsumo'
import Tarifa from '../classes/Tarifa'

import TCBContext from '../TCBContext'
import TCB from '../classes/TCB'
import MapaMesHora from './MapaMesHora'

import DialogNewConsumption from './DialogNewConsumption'
import { formatoValor } from '../classes/Utiles'

//PENDIENTE: Decidir si mostramos los datos en formato tabla o creamos boxes segun diseño de Clara
const ConsumptionStep = () => {
    const { t, i18n } = useTranslation()
    const [fuente, setFuente] = useState('')
    const [activo, setActivo] = useState() //Corresponde al objeto TipoConsumo en TCB que se esta manipulando
    const {bases, setBases, tipoConsumo, setTipoConsumo} = useContext(TCBContext)

    function getRowId(row) {
        return row.idTipoConsumo;
    }

//PENDIENTE: esta funcion es por si se puede editar el TC desde la tabla
    function changeTC ( params, event) {
        console.log(params)
        //event.stopPropagation();
        setActivo(TCB.TipoConsumo.find( (t) => {return (t.idTipoConsumo === params.row.idTipoConsumo)}))
        switch (params.field) {
        case "nombreTipoConsumo": 
            cambiaNombreTipoConsumo(params.row)
            break
        case "nombreTarifa":
            cambiaNombreTarifa(params.row)
            break
        }
    }
    
    /**
 * Gestiona el cambio de nombre del TipoConsumo teniendo en cuenta que la relacion entre Finca y TipoConsumo se basa en el nombre de éste.
 * @param {Tabulator.cell} cell Identificación del TipoConsumo que estamos cambiando
 */
    function cambiaNombreTipoConsumo ( row, evento) {
//REVISAR: No esta llegando el nuevo valor introducido en la celda
//PENDIENTE: Verificar duplicidad de nombre
//PENDIENTE: Validar si hay fincas utilinzaod este tipo de consumo para el caso no INDIVIDUAL

        console.log("cambio nombre de ", row.nombreTipoConsumo)
        console.log(evento)

        let oldTipoConsumo = [...tipoConsumo]
        const nIndex = oldTipoConsumo.findIndex((t) => {return t.idTipoConsumo === row.idTipoConsumo})
        oldTipoConsumo[nIndex].nombreTipoConsumo = row.nombreTipoConsumo
        setActivo(TCB.TipoConsumo[nIndex])
        activo.nombreTipoConsumo = row.nombreTipoConsumo
        setTipoConsumo(oldTipoConsumo)

        // //Buscamos las fincas que tuvieran este TipoConsumo asociado y les cambiamos el nombre
        // for (let finca of TCB.Finca) {
        //     if (finca.nombreTipoConsumo === cell.getOldValue()) finca.nombreTipoConsumo = cell.getValue();
        // }
    }
    
    function cambiaNombreTarifa( value) {
        //PENDIENTE: si se puede editar desde la tabla hay que poner un select en esta columna
        console.log("cambia nombre tarifa a ",value)
    }

    function showGraphsTC(ev, tc) {
        ev.stopPropagation();
        setActivo(TCB.TipoConsumo.find( (t) => {return (t.idTipoConsumo === tc.idTipoConsumo)}))
    }

    function deleteTC(ev, tc) {
        ev.stopPropagation();
        let prevTipoConsumo = [...tipoConsumo]
        const nIndex = prevTipoConsumo.findIndex( (t) => {return (t.idTipoConsumo === tc.idTipoConsumo)})
        //if (TCB.modoActivo !== INDIVIDUAL) { //Search Fincas using this TC
            const _idx = TCB.Finca.findIndex( (finca) => {return finca.nombreTipoConsumo === tc.nombreTipoConsumo});
            if (_idx >= 0) { //No finca is using this TC
                alert ("Hay fincas con este tipo de consumo"); //PENDIENTE: incluir en mensajes
                return
            }
        //}
        TCB.requiereOptimizador = true;
        TCB.cambioTipoConsumo = true;
        prevTipoConsumo.splice(nIndex, 1)
        TCB.TipoConsumo.splice(nIndex, 1)
        setTipoConsumo(prevTipoConsumo)
        setActivo(undefined)
    }

    const columns = [
        { field: 'nombreTipoConsumo', headerName: (t('CONSUMPTION.LABEL_nombreTipoConsumo')), editable: true, flex: 1,
            description: (t('CONSUMPTION.TT_nombreTipoConsumo'))},
        { field: 'fuente', headerName: (t('CONSUMPTION.LABEL_fuente')), type: 'select',
            description: (t('CONSUMPTION.TT_fuente'))},
        { field: 'nombreFicheroCSV', headerName: (t('CONSUMPTION.LABEL_nombreFicheroCSV')), type: 'text', flex: 1,
            description: (t('CONSUMPTION.TT_nombreFicheroCSV'))},
        { field: 'cTotalAnual', headerName: (t('CONSUMPTION.LABEL_cTotalAnual')), type: 'number', width:150,
            description: (t('CONSUMPTION.TT_cTotalAnual')) ,
            valueFormatter: (params) => formatoValor('cTotalAnual', params.value) },
        { field: 'nombreTarifa', headerName: (t('TARIFA.LABEL_nombreTarifa')), type: 'text',
            description: (t('CONSUMPTION.TT_cTotalAnual'))}, //PENDIENTE: Puede cambiar a select

    //REVISAR: que pasa con esta definicion de actions. No funciona. Parece que llamam a las funciones multiples veces.
    // Por ahora usamos el básico renderCell
        // { field: 'actions', 
        //     type: 'actions',
        //     getActions: (params) => [
        //         <GridActionsCellItem
        //         key={1}
        //         icon={<DeleteIcon />}
        //         label="Delete"
        //         onClick={actionA(params.id)}
        //         />,

        //         <GridActionsCellItem
        //         key={2}
        //         icon={<PrintIcon />}
        //         label="Print"
        //         onClick={actionB(params.id)}
        //         />
        //     ]
        // },
        { field: 'Actions', headerName: '',
            renderCell: (params) => {
                return (
                    <Box>
                    <IconButton
                        variant="contained"
                        size="small"
                        tabIndex={params.hasFocus ? 0 : -1}
                        onClick= {(e) => showGraphsTC(e, params.row)}
                    >
                    <AnalyticsIcon />
                    </IconButton>

                    <IconButton
                        variant="contained"
                        size="small"
                        tabIndex={params.hasFocus ? 0 : -1}
                        onClick= {(e) => deleteTC(e, params.row)}
                    >
                    <DeleteIcon />
                    </IconButton>
                    </Box>
                )
            }
        }
    ]

    return <>
        <Container>
        <Typography variant='h3'>{t("CONSUMPTION.TITLE")}</Typography>
        <Typography variant='body'>{t("CONSUMPTION.DESCRIPTION")}</Typography>
        
        {/* Este boton permite crear un objeto TipoConsumo desde un formulario modal */}
        <div className="clipping-container">
            <DialogNewConsumption></DialogNewConsumption>
        </div>

        {/* Consumption types table 
        REVISAR: seria bueno quitar el pagination que aparece y crear una fila al final que suma la energia consumida por la suma d los consumos (se supone que aggregation lo hace pero no funciona y tenga un boton para ver el grafico de la suma*/}

        {/* <div style={{ height: 400, width: '100%' }}> */}
                <DataGrid
                    autoHeight
                    getRowId={getRowId}
                    rows={tipoConsumo}
                    columns={columns}
                    initialState={{
                        aggregation: {
                            model: {
                                cTotalAnual: 'sum',
                            },
                        },
                    }}
                    onCellEditStop={(params, event) => {changeTC ( params, event)}}

                />
        {/* </div> */}
        <Box>
            <MapaMesHora>{activo}</MapaMesHora>
        </Box>
        </Container>
    </>
}

export default ConsumptionStep;
