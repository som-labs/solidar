import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, IconButton, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

// REACT Solidar Global Components
import { useDialog } from '../../components/DialogProvider'

// REACT Solidar local Components
import DialogPanelsType from './DialogPanelsType'

// REACT Solidar contexts
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
          tipoPanelActivo={tipoPanelActivo}
          onClose={(cause, formData) => processFormData(cause, formData)}
        ></DialogPanelsType>
      ),
    })
  }

  function processFormData(reason, formData) {
    if (reason === 'save') {
      //Si el usuario ha definido o cambiado el userPanel lo copiamos a TCB.tipoPaneles[0]
      if (formData.id === 0) Object.assign(TCB.tipoPaneles[0], formData)

      //Si se ha cambiado el tipo de panel activo en el form y hay bases ya creadas hay que aplicar el cambio a todas
      if (formData.id !== tipoPanelActivo.id || formData.id === 0) {
        bases.forEach((base) => {
          base.tipoPanel = TCB.tipoPaneles[formData.id]

          //If we are changing panel technology need to update PVGIS data for existing bases
          if (tipoPanelActivo.tecnologia !== formData.tecnologia)
            base.requierePVGIS = true

          //If there is any change in panel size need to reconfigure base
          if (
            tipoPanelActivo.ancho !== formData.ancho ||
            tipoPanelActivo.largo !== formData.largo
          ) {
            formData.ancho = UTIL.returnFloat(formData.ancho)
            formData.largo = UTIL.returnFloat(formData.largo)
            const newConfiguration = BaseSolar.configuraPaneles(base)
            base.columnas = newConfiguration.columnas
            base.filas = newConfiguration.filas
            base.modoInstalacion = newConfiguration.modoInstalacion
            modifyBase(base)
          }
          setNewPanelActivo(true)
        })
        setTipoPanelActivo({ ...formData })
      }
    }
    closeDialog()
  }

  return (
    <>
      <Box
        sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', padding: 1 }}
      >
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('DIALOG_PANELS.DESCRIPTION_1', {
              potencia: UTIL.formatoValor('potenciaWp', tipoPanelActivo.potencia),
            }),
          }}
        ></Typography>
        <IconButton onClick={changePanelsType}>
          <EditIcon />
        </IconButton>
      </Box>
    </>
  )
}
