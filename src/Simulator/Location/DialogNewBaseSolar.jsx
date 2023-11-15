import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

// OpenLayers objects
import { LineString } from 'ol/geom'
import Feature from 'ol/Feature'

// MUI objects
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import FormControlLabel from '@mui/material/FormControlLabel'
import HomeIcon from '@mui/icons-material/Home'
import ApartmentIcon from '@mui/icons-material/Apartment'
import Switch from '@mui/material/Switch'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'

// REACT Solidar Components
import TCB from '../classes/TCB'
import TCBContext from '../TCBContext'

// Solidar objects
import * as UTIL from '../classes/Utiles'
import BaseSolar from '../classes/BaseSolar'

export default function DialogNewBaseSolar({ data, editing, onClose }) {
  const { t, i18n } = useTranslation()

  const [formData, setFormData] = useState(data)
  const { bases, setBases } = useContext(TCBContext)

  console.log(data)
  let newData

  const changeRoofType = (e, roofType) => {
    handleChange({ name: 'roofType', value: roofType })
    if (roofType === 'coplanar') {
      newData = {
        roofType: 'coplanar',
        inclinacionOptima: false,
        inclinacion: 0,
        areaReal: formData.areaMapa,
      }
    } else if (roofType === 'horizontal') {
      newData = {
        roofType: 'horizontal',
        inclinacionOptima: true,
        inclinacion: 32, //El angulo optimo definitivo lo dará PVGIS pero para la peninsula esta entre 31º y 32º
        areaReal: formData.areaMapa,
      }
    }
    multiChange(newData)
  }

  const changeTilt = (event) => {
    const newData = {
      inclinacion: event.target.value,
      inclinacionOptima: false,
    }
    multiChange(newData)
  }

  const setOptimalAzimut = () => {
    const componente = 'BaseSolar.acimut.' + formData.idBaseSolar
    const featAcimut = TCB.origenDatosSolidar.getFeatureById(componente)
    TCB.origenDatosSolidar.removeFeature(featAcimut)
    handleChange({ name: 'inAcimut', value: 'Optima' })
    handleChange({ name: 'inAcimutOptimo', value: true })
  }

  const changeAzimut = (event) => {
    const azimutLength = 100
    let featAcimut
    let geomAcimut
    let componente
    let angle

    componente = 'BaseSolar.acimut.' + formData.idBaseSolar
    featAcimut = TCB.origenDatosSolidar.getFeatureById(componente)
    console.log(featAcimut)
    if (featAcimut) {
      geomAcimut = featAcimut.getGeometry().clone()
      angle = ((event.target.value - data.inAcimut) / 180) * Math.PI
    } else {
      const componente = 'BaseSolar.area.' + formData.idBaseSolar
      const featBase = TCB.origenDatosSolidar.getFeatureById(componente)
      const puntoAplicacion = featBase.getGeometry().getInteriorPoint().getCoordinates()
      const finAcimut = [puntoAplicacion[0], puntoAplicacion[1] - azimutLength]
      geomAcimut = new LineString([puntoAplicacion, finAcimut])
      angle = event.target.value

      featAcimut = new Feature({
        geometry: geomAcimut,
      })
      featAcimut.setId('BaseSolar.acimut.' + formData.idBaseSolar)
      TCB.origenDatosSolidar.addFeature(featAcimut)
      console.log(featAcimut)
    }

    console.log(geomAcimut.getCoordinates()[0])
    geomAcimut.rotate(angle, geomAcimut.getCoordinates()[0])
    featAcimut.setGeometry(geomAcimut)

    handleChange({ name: 'inAcimutOptimo', value: false })
    handleChange({ name: 'inAcimut', value: parseFloat(event.target.value) })
  }

  async function handleChange(target) {
    const { name, value } = target
    console.log(name, value)
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }))
  }

  function multiChange(newData) {
    let prevData = { ...formData }
    for (const prop in newData) {
      prevData[prop] = newData[prop]
    }
    setFormData(prevData)
  }

  const handleCancel = () => {
    if (!editing) {
      //Cancelling a new base creation => delete previos geometry
      UTIL.deleteBaseGeometries(data.idBaseSolar)
    }
    onClose()
  }

  async function handleClose() {
    let baseIndex

    // En caso de roofType coplanar pedimos confirmacion si la inclinacion es cero
    if (formData.roofType === 'coplanar' && formData.inclinacion === 0) {
      if (!window.confirm(t('LOCATION.ERROR_COPLANAR_NOANGLE'))) {
        return
      }
    }

    // Update label in source with nombreBaseSolar
    const componentId = 'BaseSolar.label.' + data.idBaseSolar
    const labelFeature = TCB.origenDatosSolidar.getFeatureById(componentId)
    await UTIL.setLabel(
      labelFeature,
      formData.nombreBaseSolar,
      TCB.baseLabelColor,
      TCB.baseLabelBGColor,
    )

    if (!editing) {
      // We are creating a new base
      baseIndex = TCB.BaseSolar.push(new BaseSolar(formData)) - 1
      formData.potenciaMaxima = TCB.BaseSolar[baseIndex].potenciaMaxima
      formData.areaReal = TCB.BaseSolar[baseIndex].areaReal
      setBases([...bases, formData])
    } else {
      // Find this edited base in TCB
      const baseIndex = TCB.BaseSolar.findIndex((x) => {
        return x.idBaseSolar === formData.idBaseSolar
      })
      // Update all attributes in TCB
      TCB.BaseSolar[baseIndex].updateBase(formData)
      formData.potenciaMaxima = TCB.BaseSolar[baseIndex].potenciaMaxima
      formData.areaReal = TCB.BaseSolar[baseIndex].areaReal
      // Substitute new base in context
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
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('LOCATION.DESCRIPTION_ROOFTYPE'),
            }}
          />
          {/* PENDIENTE: hay que crear los iconos de los botones coplanar u horizontal */}
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              sx={{ flex: 2 }}
              value={formData.roofType}
              color="primary"
              exclusive
              onChange={changeRoofType}
              orientation="horizontal"
            >
              <ToggleButton
                value="coplanar"
                sx={{ flex: 1 }}
                className={'roofTypeButton'}
              >
                <HomeIcon />
              </ToggleButton>
              <ToggleButton
                value="horizontal"
                sx={{ flex: 1 }}
                className={'roofTypeButton'}
              >
                <ApartmentIcon />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* <Box
              sx={{ display: 'flex', flex: 2, flexDirection: 'column', flexWrap: 'wrap' }}
            > */}
          </Box>

          {formData.roofType === 'coplanar' ? (
            <>
              <Box
                sx={{ display: 'flex', flex: 2, flexDirection: 'row', flexWrap: 'wrap' }}
              >
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <br />
                  <Tooltip title={t('LOCATION.TOOLTIP_TILT')} placement="top">
                    <TextField
                      required
                      type="text"
                      onChange={changeTilt}
                      label={t('LOCATION.LABEL_TILT')}
                      name="inclinacion"
                      value={formData.inclinacion}
                    />
                  </Tooltip>
                </FormControl>
              </Box>
            </>
          ) : (
            <>
              <Box>
                <Typography variant="body">{t('LOCATION.HORIZONTAL_ROOF')}</Typography>
                <br />
              </Box>
            </>
          )}

          <Typography variant="body">{t('LOCATION.DESCRIPTION_AZIMUT')}</Typography>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <TextField
              required
              type="text"
              onChange={(e) => handleChange(e.target)}
              onBlur={changeAzimut}
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
        <Button onClick={handleCancel}>{t('BASIC.LABEL_CANCEL')}</Button>
        <Button onClick={handleClose}>{t('BASIC.LABEL_OK')}</Button>
      </DialogActions>
    </div>
  )
}
