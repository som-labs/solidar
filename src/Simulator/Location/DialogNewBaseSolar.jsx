import React, { useState, useContext, useEffect } from 'react'
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

  //REVISAR: falta controlar la salida con backdrop click para borrar la geometria previamente creada
  useEffect(() => {
    setFormData(data)
  }, [])
  let newData

  const changeRoofType = (e, roofType) => {
    handleChange({ name: 'roofType', value: roofType })
    //Al crear la geometria de la base hemos construido un acimut.
    //El acimut se debe dibujar solo si la configuración no es de angulos optimos
    //Cuando cambia la configuracion debemos hacer aparecer el acimut
    const componente = 'BaseSolar.acimut.' + formData.idBaseSolar
    const featAcimut = TCB.origenDatosSolidar.getFeatureById(componente)
    const geomAcimut = featAcimut.getGeometry()
    const alfa = 50 / geomAcimut.getLength()

    switch (roofType) {
      case 'Coplanar':
        newData = {
          roofType: 'Coplanar',
          inclinacionOptima: false,
          angulosOptimos: false,
          inclinacion: 0,
          requierePVGIS: true,
        }
        geomAcimut.scale(alfa, alfa, geomAcimut.getCoordinates()[0])
        break
      case 'Horizontal': {
        newData = {
          roofType: 'Horizontal',
          inclinacionOptima: true,
          angulosOptimos: false,
          inclinacion: '', //El angulo optimo definitivo lo dará PVGIS pero para la peninsula esta entre 31º y 32º
          requierePVGIS: true,
        }

        geomAcimut.scale(alfa, alfa, geomAcimut.getCoordinates()[0])
        break
      }
      case 'Optimos': {
        newData = {
          roofType: 'Optimos',
          angulosOptimos: true,
          inclinacionOptima: true,
          requierePVGIS: true,
        }
        geomAcimut.scale(0.01, 0.01, geomAcimut.getCoordinates()[0])
        break
      }
    }
    multiChange(newData)
  }

  const changeTilt = (event) => {
    const newData = {
      inclinacion: event.target.value,
      inclinacionOptima: false,
      angulosOptimos: false,
      requierePVGIS: true,
    }
    multiChange(newData)
  }

  const setOptimalTilt = (event) => {
    const newData = {
      inclinacion: event.target.checked ? '' : 0,
      inclinacionOptima: event.target.checked,
      angulosOptimos: false,
      requierePVGIS: true,
    }
    multiChange(newData)
  }

  const changeAzimut = (event) => {
    const azimutLength = 100
    let featAcimut
    let geomAcimut
    let componente
    let angle

    componente = 'BaseSolar.acimut.' + formData.idBaseSolar
    featAcimut = TCB.origenDatosSolidar.getFeatureById(componente)
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

    geomAcimut.rotate(angle, geomAcimut.getCoordinates()[0])
    featAcimut.setGeometry(geomAcimut)
    const newData = {
      angulosOptimos: false,
      inAcimut: parseFloat(event.target.value),
      requierePVGIS: true,
    }
    multiChange(newData)
  }

  async function handleChange(target) {
    const { name, value } = target
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
      UTIL.deleteBaseGeometries(formData.idBaseSolar)
    }
    onClose('Cancel')
  }

  async function handleClose() {
    let baseIndex

    // En caso de roofType coplanar pedimos confirmacion si la inclinacion es cero
    if (formData.roofType === 'Coplanar' && formData.inclinacion === 0) {
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
      console.log(formData)
      baseIndex = TCB.BaseSolar.push(new BaseSolar(formData)) - 1
      formData.potenciaMaxima = TCB.BaseSolar[baseIndex].potenciaMaxima
      formData.areaReal = TCB.BaseSolar[baseIndex].areaReal
      formData.panelesMaximo = TCB.BaseSolar[baseIndex].panelesMaximo
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
      formData.panelesMaximo = TCB.BaseSolar[baseIndex].panelesMaximo

      // Substitute new base in context
      let prevBases = [...bases]
      prevBases.splice(baseIndex, 1, formData)
      setBases(prevBases)
    }

    onClose('Save')
  }

  return (
    <div>
      <DialogTitle>{t('LOCATION.TITLE_DIALOG_NEW_BASE')}</DialogTitle>{' '}
      <DialogContent>
        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}
        >
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Tooltip title={t('BaseSolar.TOOLTIP_nombreBaseSolar')} placement="top">
              <TextField
                required
                type="text"
                onChange={(e) => handleChange(e.target)}
                label={t('BaseSolar.LABEL_nombreBaseSolar')}
                name="nombreBaseSolar"
                value={formData.nombreBaseSolar}
              />
            </Tooltip>
          </FormControl>
          <Typography
            variant="body"
            dangerouslySetInnerHTML={{
              __html: t('BaseSolar.DESCRIPTION_roofType'),
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
                value="Coplanar"
                sx={{ flex: 1 }}
                className={'roofTypeButton'}
              >
                <HomeIcon />
              </ToggleButton>
              <ToggleButton
                value="Horizontal"
                sx={{ flex: 1 }}
                className={'roofTypeButton'}
              >
                <ApartmentIcon />
              </ToggleButton>
              <ToggleButton value="Optimos" sx={{ flex: 1 }} className={'roofTypeButton'}>
                {t('BaseSolar.LABEL_angulosOptimos')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {formData.roofType === 'Coplanar' && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flex: 2,
                  flexDirection: 'column',
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant="body">
                  {t('BaseSolar.DESCRIPTION_inclinacionTejado')}
                </Typography>
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <br />
                  <Tooltip title={t('BaseSolar.TOOLTIP_inclinacion')} placement="top">
                    <TextField
                      required
                      type="text"
                      onChange={changeTilt}
                      label={t('BaseSolar.LABEL_inclinacionTejado')}
                      name="inclinacion"
                      value={formData.inclinacion}
                    />
                  </Tooltip>
                </FormControl>
                <br />
                <Typography variant="body">
                  {t('BaseSolar.DESCRIPTION_inAcimut')}
                </Typography>
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <Tooltip title={t('BaseSolar.TOOLTIP_inAcimut')} placement="top">
                    <TextField
                      required
                      type="text"
                      onChange={(e) => handleChange(e.target)}
                      onBlur={changeAzimut}
                      label={t('BaseSolar.LABEL_inAcimut')}
                      name="inAcimut"
                      value={formData.inAcimut}
                    />
                  </Tooltip>
                </FormControl>
              </Box>
            </>
          )}

          {formData.roofType === 'Horizontal' && (
            <>
              <Typography variant="body">
                {t('BaseSolar.DESCRIPTION_inclinacionPaneles')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FormControl sx={{ display: 'flex', flex: 1, mr: 6 }}>
                  <Tooltip title={t('BaseSolar.TOOLTIP_inclinacion')} placement="top">
                    <TextField
                      type="text"
                      onChange={changeTilt}
                      label={t('BaseSolar.LABEL_inclinacionPaneles')}
                      name="inclinacion"
                      value={formData.inclinacion}
                    />
                  </Tooltip>
                </FormControl>
                <Tooltip
                  title={t('BaseSolar.TOOLTIP_inclinacionOptima')}
                  placement="bottom"
                >
                  <FormControlLabel
                    sx={{ display: 'flex', flex: 1 }}
                    control={
                      <Switch
                        checked={formData.inclinacionOptima}
                        name="inclinacionOptima"
                        onChange={setOptimalTilt}
                        color="primary"
                      />
                    }
                    label={t('BaseSolar.LABEL_inclinacionOptima')}
                  />
                </Tooltip>

                <Typography variant="body">
                  {t('BaseSolar.DESCRIPTION_inAcimut')}
                </Typography>
                <Tooltip title={t('BaseSolar.TOOLTIP_inAcimut')} placement="top">
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <TextField
                      required
                      type="text"
                      onChange={(e) => handleChange(e.target)}
                      onBlur={changeAzimut}
                      label={t('BaseSolar.LABEL_inAcimut')}
                      name="inAcimut"
                      value={formData.inAcimut}
                    />
                  </FormControl>
                </Tooltip>
              </Box>
            </>
          )}

          {formData.roofType === 'Optimos' && (
            <>
              <Box>
                <Typography variant="body">
                  {t('BaseSolar.DESCRIPTION_angulosOptimos')}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>{t('BASIC.LABEL_CANCEL')}</Button>
        <Button onClick={handleClose}>{t('BASIC.LABEL_OK')}</Button>
      </DialogActions>
    </div>
  )
}
