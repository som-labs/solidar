import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AddIcon from '@mui/icons-material/Add';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField'
import { MuiFileInput } from 'mui-file-input'

import TipoConsumo from '../classes/TipoConsumo.js'
import Tarifa from '../classes/Tarifa.js'
import TCB from '../classes/TCB.js'
import TCBContext from '../TCBContext.jsx'

export default function DialogNewConsumption({data}) {

    const { t, i18n } = useTranslation()

    const initialValues = data || {nombreTipoConsumo: "",
    fuente: "CSV",
    nombreTarifa: "2.0TD", 
    ficheroCSV: null, 
    consumoAnualREE: "" }

    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState(initialValues)

    const {bases, setBases, tipoConsumo, setTipoConsumo} = useContext(TCBContext)

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }))
    }  

    const handleFile = (event) => {
        setFormData((prevFormData) => ({ ...prevFormData, ['ficheroCSV']: event }))
    }

    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleCancel = (event, reason) => {
        if (reason !== 'backdropClick') {
            setOpen(false);
        }
    }

    const handleClose = (event, reason) => {
        
        if (reason === 'backdropClick') return
        if (formData.ficheroCSV === null) {
            alert (t('CONSUMO.MSG_alMenosUnTipoConsumo'))
            return
        }
        setOpen(false);

        // alert(`nombreTipoConsumo: ${formData.nombreTipoConsumo}, fuente: ${formData.fuente}, nombreTarifa: ${formData.nombreTarifa},
        // fuente: ${formData.ficheroCSV.name}, consumoAnualREE: ${formData.consumoAnualREE}`);    
    
        TCB.requiereOptimizador = true
        TCB.cambioTipoConsumo = true

        let nuevoTipoConsumo = {
            idTipoConsumo : TCB.featIdUnico++,
            nombreTipoConsumo : formData.nombreTipoConsumo,
            fuente : formData.fuente,
            nombreTarifa : formData.nombreTarifa,
            consumoAnualREE : "",
            ficheroCSV : formData.ficheroCSV,
            nombreFicheroCSV : formData.ficheroCSV.name,
            territorio : TCB.territorio
        }

        let idxTC = TCB.TipoConsumo.push( new TipoConsumo(nuevoTipoConsumo))
        TCB.TipoConsumo[idxTC-1].tarifa = new Tarifa(nuevoTipoConsumo.nombreTarifa, nuevoTipoConsumo.territorio)     

        //Si se ha pasado un inputFile como argumento se carga
        if (formData.ficheroCSV !== '') {
            try {
                let cargaResPromise = new Promise((resolve) => {
                    let res = cargaCSV(TCB.TipoConsumo[idxTC-1], TCB.TipoConsumo[idxTC-1].ficheroCSV, TCB.TipoConsumo[idxTC-1].fuente)
                    resolve(res)
                })

                cargaResPromise
                .then(respuesta => {
                    if (respuesta) {
                        nuevoTipoConsumo.cTotalAnual = TCB.TipoConsumo[idxTC-1].cTotalAnual;
                        setTipoConsumo([...tipoConsumo, nuevoTipoConsumo])
                    } else { 
                        console.log('cargaCSV devolvio error ', respuesta)
                        TCB.TipoConsumo.splice(idxTC-1, 1)
                    }})
                .catch(error => {
                    console.log('cargaCSV catch ', error)
                    TCB.TipoConsumo.splice(idxTC-1, 1)
                })

            } catch (error) {
                alert (error)
            }
        }
    }

    async function cargaCSV (objTipoConsumo, ficheroCSV, fuente) {
        TCB.cambioTipoConsumo = true
        objTipoConsumo.inicializa()
        objTipoConsumo.ficheroCSV = ficheroCSV
        let opciones = {delimiter:";", decimal:",", fechaHdr:"FECHA", horaHdr:"HORA", 
        valorArr:["CONSUMO","CONSUMO_KWH","AE_KWH"], factor:1};
  
        //Si la fuente es DATADIS loadcsv debera cambiar el formato de fecha de AAAA/MM/DD a DD/MM/AAAA
        opciones.fechaSwp = (fuente === "DATADIS")
        let aStatus;
        await objTipoConsumo.loadFromCSV(ficheroCSV, opciones)
        .then( (r) => { aStatus = true})
        .catch( (e) => {alert (e);
                        aStatus = false})
        

            // console.log('registros: '+ objTipoConsumo.numeroRegistros)
            // if (objTipoConsumo.numeroRegistros > 0) {
            //   let consumoMsg = TCB.i18next.t('consumo_MSG_resumen', {registros: objTipoConsumo.numeroRegistros, 
            //                             desde: objTipoConsumo.fechaInicio.toLocaleDateString(),
            //                             hasta: objTipoConsumo.fechaFin.toLocaleDateString()});
            //   document.getElementById("csvResumen").innerHTML = consumoMsg;
        
            //   _tablaTipoConsumo.updateData([objTipoConsumo.select_tablaTipoConsumo()]);
            //   muestraGraficosObjeto(objTipoConsumo);
        setFormData(initialValues)
        return aStatus
    }
    
//PENDIENTE:Agregar gestion de la potencia REE
  return (
    <div>
        <Tooltip title={t('CONSUMPTION.TT_botonNuevoTipoConsumo')} placement="top">
            <Button  startIcon={<AddIcon />} onClick={handleClickOpen}>{t('CONSUMPTION.LABEL_botonNuevoTipoConsumo')}</Button>
        </Tooltip>
        <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
            <DialogTitle>{t('CONSUMPTION.FORM_nuevoTipoConsumo')}</DialogTitle> {/* PENDIENTE: definir mensaje */}
                <DialogContent>
                <Box component="form" sx={{ display: 'flex',flexDirection:'column', flexWrap: 'wrap' }}>
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <TextField
                        required
                        type="text"
                        onChange={ handleChange }
                        label= {t('CONSUMPTION.LABEL_nombreTipoConsumo')}
                        name='nombreTipoConsumo'
                        value={formData.nombreTipoConsumo}
                    />
                    </FormControl>

                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <TextField
                                sx={{ width: 200, height: 50 }}
                                select
                                id="tipo-simple-select"
                                onChange={ handleChange }
                                label={t('CONSUMPTION.fuente_LBL')}
                                name='fuente'
                                defaultValue="CSV"
                            >
                            <MenuItem value={'CSV'}>CSV</MenuItem>
                            <MenuItem value={'DATADIS'}>DATADIS</MenuItem>
                            <MenuItem value={'REE'}>REE</MenuItem>
                        </TextField>
                    </FormControl>

                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <MuiFileInput 
                            id='ficheroCSV'
                            inputProps={{ accept: 'csv/*' }}
                            onChange={handleFile}
                            label='Fichero'
                            name={t('CONSUMPTION.nombreFicheroCSV_LBL')}
                            value={formData.ficheroCSV} 
                        />
                    </FormControl>

                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <TextField
                                sx={{ width: 200, height: 50 }}
                                id="tarifa-simple-select"
                                select
                                label={t('TARIFA.nombreTarifa_LBL')}
                                onChange={handleChange}
                                name='nombreTarifa'
                                defaultValue='2.0TD'
                            >
                            <MenuItem value={'2.0TD'}>2.0TD</MenuItem>
                            <MenuItem value={'3.0TD'}>3.0TD</MenuItem>
                        </TextField>
                    </FormControl>
                </Box>
                </DialogContent>
            <DialogActions>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleClose}>Ok</Button>
            </DialogActions>
        </Dialog>
    </div>
  )
}
