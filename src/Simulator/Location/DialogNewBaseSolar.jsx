import React, { useState, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { Style, Fill, Stroke, Text } from 'ol/style'

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
import BaseSolar from '../classes/BaseSolar'
import * as UTIL from '../classes/Utiles'

// Solidar objects
import TCBContext from '../TCBContext'
import TCB from '../classes/TCB'

export default function DialogNewBaseSolar({ data, editing, onClose }) {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState(data)
  const { bases, setBases } = useContext(TCBContext)

  const setOptimalTilt = (event) => {
    const localEvent = { name: 'inclinacionPaneles', value: 'Optima' }
    handleChange(localEvent)
    handleChange(event.target)
  }

  const changeTilt = (event) => {
    const localEvent = { name: 'inclinacionOptima', value: false }
    handleChange(localEvent)
    handleChange(event.target)
  }

  const setOptimalAzimut = (event) => {
    const localEvent = { name: 'inAcimut', value: 'Optima' }
    handleChange(localEvent)
    handleChange(event.target)
  }

  const changeAzimut = (event) => {
    const localEvent = { name: 'inAcimutOptimo', value: false }
    handleChange(localEvent)
    handleChange(event.target)
  }

  async function handleChange(target) {
    const { name, value } = target
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }))
  }

  const handleCancel = () => {
    if (!editing) {
      //Cancelling a new base creation => delete previos geometry
      UTIL.deleteBaseGeometries(data.idBaseSolar)
    }
    onClose()
  }

  async function handleClose() {
    //Update label in source with nombreBaseSolar
    const componentId = 'BaseSolar.label.' + data.idBaseSolar
    const labelFeature = TCB.origenDatosSolidar.getFeatureById(componentId)
    await UTIL.setLabel(
      labelFeature,
      formData.nombreBaseSolar,
      TCB.baseLabelColor,
      TCB.baseLabelBGColor,
    )

    if (!editing) {
      //We are creating a new base
      TCB.BaseSolar.push(new BaseSolar(formData))
      setBases([...bases, formData])
    } else {
      //Find this edited base in TCB
      const baseIndex = TCB.BaseSolar.findIndex((x) => {
        return x.idBaseSolar === formData.idBaseSolar
      })
      // Update all attributes in TCB
      TCB.BaseSolar[baseIndex].updateBase(formData)
      //Substitute new base in context
      let prevBases = [...bases]
      prevBases.splice(baseIndex, 1, formData)
      setBases(prevBases)
    }
    onClose()
  }

  return (
    <div>
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
                onChange={(e) => handleChange(e.target)}
                label={t('LOCATION.LABEL_BASE_NAME')}
                name="nombreBaseSolar"
                value={formData.nombreBaseSolar}
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
                value={formData.inclinacionPaneles}
              />
            </Tooltip>
          </FormControl>
          <Tooltip title={t('LOCATION.TOOLTIP_OPTIMUM_TILT')} placement="bottom">
            <FormControlLabel
              control={
                <Switch
                  checked={formData.inclinacionOptima}
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
              value={formData.inAcimut}
            />
          </FormControl>
          <Tooltip title={t('LOCATION.TOOLTIP_OPTIMUM_AZIMUT')} placement="bottom">
            <FormControlLabel
              control={
                <Switch
                  checked={formData.inAcimutOptimo}
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
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleClose}>Ok</Button>
      </DialogActions>
    </div>
  )
}
