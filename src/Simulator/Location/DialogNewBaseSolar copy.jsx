import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined'
import Checkbox from '@mui/material/Checkbox'
import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'

export default function DialogNewBaseSolar({ data, onChange, onClose, onCancel }) {
  const { t, i18n } = useTranslation()

  const setOptimalTilt = (event) => {
    const localEvent = { name: 'inclinacionPaneles', value: 'Optima' }
    onChange(localEvent)
    onChange(event.target)
  }

  const changeTilt = (event) => {
    const localEvent = { name: 'inclinacionOptima', value: false }
    onChange(localEvent)
    onChange(event.target)
  }

  const setOptimalAzimut = (event) => {
    const localEvent = { name: 'inAcimut', value: 'Optima' }
    onChange(localEvent)
    onChange(event.target)
  }

  const changeAzimut = (event) => {
    const localEvent = { name: 'inAcimutOptimo', value: false }
    onChange(localEvent)
    onChange(event.target)
  }

  return (
    <div>
      <Dialog disableEscapeKeyDown open={true} onClose={onClose}>
        <DialogTitle>{t('LOCATION.DIALOG_NEW_BASE')}</DialogTitle>{' '}
        <DialogContent>
          <Box
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}
          >
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Tooltip title={t('LOCATION.TOOLTIP_BASE_NAME')} placement="top">
                <TextField
                  required
                  type="text"
                  onChange={(e) => onChange(e.target)}
                  label={t('LOCATION.LABEL_BASE_NAME')}
                  name="nombreBaseSolar"
                  value={data.nombreBaseSolar}
                />
              </Tooltip>
            </FormControl>
            <Typography variant="body">{t('LOCATION.DESCRIPTION_TILT')}</Typography>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Tooltip title={t('LOCATION.TOOLTIP_TILT')} placement="top">
                <TextField
                  required
                  type="text"
                  onChange={changeTilt}
                  label={t('LOCATION.LABEL_TILT')}
                  name="inclinacionPaneles"
                  value={data.inclinacionPaneles}
                />
              </Tooltip>
            </FormControl>
            <Tooltip title={t('LOCATION.TOOLTIP_OPTIMUM_TILT')} placement="bottom">
              <FormControlLabel
                control={
                  <Switch
                    checked={data.inclinacionOptima}
                    name="inclinacionOptima"
                    onChange={setOptimalTilt}
                    color="primary"
                  />
                }
                label={t('LOCATION.LABEL_OPTIMUM_TILT')}
              />
            </Tooltip>
            <Typography variant="body">{t('LOCATION.DESCRIPTION_AZIMUT')}</Typography>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <TextField
                required
                type="text"
                onChange={changeAzimut}
                label={t('LOCATION.LABEL_AZIMUT')}
                name="inAcimut"
                value={data.inAcimut}
              />
            </FormControl>
            <Tooltip title={t('LOCATION.TOOLTIP_OPTIMUM_AZIMUT')} placement="bottom">
              <FormControlLabel
                control={
                  <Switch
                    checked={data.inAcimutOptimo}
                    name="inAcimutOptimo"
                    onChange={setOptimalAzimut}
                    color="primary"
                  />
                }
                label={t('LOCATION.LABEL_OPTIMUM_AZIMUT')}
              />
            </Tooltip>
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
