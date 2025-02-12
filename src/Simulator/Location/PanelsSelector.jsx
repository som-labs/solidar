import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, IconButton, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import DialogPanelsType from './DialogPanelsType'
import { BasesContext } from '../BasesContext'
import { GlobalContext } from '../GlobalContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import BaseSolar from '../classes/BaseSolar'

export default function PanelsSelector() {
  const { t } = useTranslation()
  const [openDialog, closeDialog] = useDialog()
  const { setNewPanelActivo } = useContext(GlobalContext)

  const { tipoPanelActivo, setTipoPanelActivo, bases, modifyBase } =
    useContext(BasesContext)

  function changePanelsType() {
    openDialog({
      children: (
        <DialogPanelsType
          data={tipoPanelActivo}
          onClose={(cause, formData) => processFormData(cause, formData)}
        ></DialogPanelsType>
      ),
    })
  }

  function processFormData(reason, formData) {
    let newPanel = tipoPanelActivo

    if (reason === 'save') {
      //If we are changing panel technology need to update PVGIS data for existing bases
      if (tipoPanelActivo.tecnologia !== formData.tecnologia) {
        bases.forEach((base) => {
          base.requierePVGIS = true
        })
        newPanel.tecnologia = formData.tecnologia
        setNewPanelActivo(true)
      }

      //If the panel peak power has changes optimizer has to be executed
      if (tipoPanelActivo.potencia !== formData.potencia) {
        newPanel.potencia = UTIL.returnFloat(formData.potencia)
        TCB.requiereOptimizador = true
        setNewPanelActivo(true)
      }

      //If there is any change in panel size need to reconfigura exisiting bases
      if (
        tipoPanelActivo.ancho !== formData.ancho ||
        tipoPanelActivo.largo !== formData.largo
      ) {
        newPanel.ancho = UTIL.returnFloat(formData.ancho)
        newPanel.largo = UTIL.returnFloat(formData.largo)

        //If panel ancho or largo has changed need to update bases configuration

        bases.forEach((base) => {
          const newConfiguration = BaseSolar.configuraPaneles(base, newPanel)
          base.columnas = newConfiguration.columnas
          base.filas = newConfiguration.filas
          base.modoInstalacion = newConfiguration.modoInstalacion
          //Update in bases state
          modifyBase(base)
        })
        TCB.requiereOptimizador = true
        setNewPanelActivo(true)
      }
    }

    setTipoPanelActivo({ ...newPanel })
    closeDialog()
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', padding: 1 }}>
      <Typography
        variant="body"
        dangerouslySetInnerHTML={{
          __html: t('Instalacion.DESCRIPTION.paneles', {
            potencia: UTIL.formatoValor('potenciaWp', tipoPanelActivo.potencia),
          }),
        }}
      ></Typography>
      <IconButton onClick={changePanelsType}>
        <EditIcon />
      </IconButton>
    </Box>
  )
}
