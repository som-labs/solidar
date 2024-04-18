import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import { Typography, IconButton, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import DialogPanelsType from './DialogPanelsType'
import { BasesContext } from '../BasesContext'

// Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import BaseSolar from '../classes/BaseSolar'

export default function PanelsSelector() {
  const { t } = useTranslation()
  const [openDialog, closeDialog] = useDialog()
  //const [tipo, setTipo] = useState(TCB.tipoPanelActivo)
  const { tipoPanelActivo, setTipoPanelActivo, updateTCBBasesToState } =
    useContext(BasesContext)

  function changePanelsType() {
    openDialog({
      children: (
        <DialogPanelsType
          data={TCB.tipoPanelActivo}
          onClose={(cause, formData) => endDialog(cause, formData)}
        ></DialogPanelsType>
      ),
    })
  }

  function endDialog(reason, formData) {
    if (reason === 'save') {
      //setTipo(formData)
      setTipoPanelActivo(formData)
      //If we are changing panel technology need to update PVGIS data for existing bases
      if (TCB.tipoPanelActivo.tecnologia !== formData.tecnologia) {
        TCB.tipoPanelActivo.tecnologia = formData.tecnologia
        TCB.BaseSolar.forEach((base) => {
          base.requierePVGIS = true
        })
      }

      //If the panel peak power has changes optimizer has to be executed
      if (TCB.tipoPanelActivo.potencia !== formData.potencia) {
        TCB.tipoPanelActivo.potencia = UTIL.returnFloat(formData.potencia)
        TCB.requiereOptimizador = true
      }

      //If there is any change in panel size need to reconfigura exisiting bases
      if (
        TCB.tipoPanelActivo.ancho !== formData.ancho ||
        TCB.tipoPanelActivo.largo !== formData.largo
      ) {
        TCB.tipoPanelActivo.ancho = UTIL.returnFloat(formData.ancho)
        TCB.tipoPanelActivo.largo = UTIL.returnFloat(formData.largo)

        //If panel ancho or largo has changed need to update bases configuration

        TCB.BaseSolar.forEach((TCBbase) => {
          const config = BaseSolar.configuraPaneles(TCBbase)
          //Update in TCB
          TCBbase.updateBase(config)
        })
      }

      updateTCBBasesToState()
      TCB.requiereOptimizador = true
    }
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
