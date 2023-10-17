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

import BaseSolar from '../classes/BaseSolar'
import Tarifa from '../classes/Tarifa'
import TCB from '../classes/TCB'
import TCBContext from '../TCBContext'

export default function DialogNewBaseSolar({data, onChange, onClose, onCancel }) {

    const { t, i18n } = useTranslation()
    //const [formData, setFormData] = useState(current)

console.log(data)
    //const [open, setOpen] = useState(false)
    
  return (
    <div>
        <Dialog disableEscapeKeyDown open={open} onClose={onClose}>
            <DialogTitle>{t('LOCCATION.FORM_nuevaBaseSolar')}</DialogTitle> {/* PENDIENTE: definir mensaje */}
                <DialogContent>
                <Box component="form" sx={{ display: 'flex',flexDirection:'column', flexWrap: 'wrap' }}>
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <TextField
                        required
                        type="text"
                        onChange={ (e) => onChange(e) }
                        label= {t('LOCATION.LABEL_nombreBaseSolar')}
                        name='nombreBaseSolar'
                        value={data.nombreBaseSolar}
                    />
                    </FormControl>

                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <TextField
                        required
                        type="text"
                        onChange={ onChange }
                        label= {t('LOCATION.LABEL_tilt')}
                        name='inclinacionPaneles'
                        value={data.inclinacionPaneles}
                    />
                    </FormControl>

                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <TextField
                        required
                        type="text"
                        onChange={ onChange }
                        label= {t('LOCATION.LABEL_inAcimut')}
                        name='inAcimut'
                        value={data.inAcimut}
                    />
                    </FormControl>
                </Box>
                </DialogContent>
            <DialogActions>
            <Button onClick={onCancel}>Cancel</Button>
            <Button onClick={onClose}>Ok</Button>
            </DialogActions>
        </Dialog>
    </div>
  )
}
