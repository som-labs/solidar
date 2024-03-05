/**
 * @module  projectMenu
 * @fileoverview Módulo para la gestion de la información general de proyecto.

 * @version      
 * @author       José Luis García (SOM Madrid)
 * @copyright
 */

import { useTranslation } from 'react-i18next'
import { useContext } from 'react'

// MUI objects
import ImportExport from '@mui/icons-material/ImportExport'
import IconButton from '@mui/material/IconButton'

// REACT Solidar Components
import { useDialog } from '../../components/DialogProvider'
import DialogProject from './DialogProject'

//Solidar objects
import TCB from '../classes/TCB'
import * as UTIL from '../classes/Utiles'
import { exportProject, importProject } from './ImportExport'
import { AlertContext } from '../components/Alert'
import { BasesContext } from '../BasesContext'
import { ConsumptionContext } from '../ConsumptionContext'
import { EconomicContext } from '../EconomicContext'

import PreparaEnergyBalance from '../EnergyBalance/PreparaEnergyBalance.jsx'

export default function ProjectMenu() {
  const { t } = useTranslation()
  const [openDialog, closeDialog] = useDialog()
  const { SLDRAlert } = useContext(AlertContext)
  const { map, bases, setBases, addTCBBaseToState } = useContext(BasesContext)
  const { setTipoConsumo, addTCBTipoToState } = useContext(ConsumptionContext)
  const { setEcoData } = useContext(EconomicContext)

  function openDialogProject() {
    openDialog({
      children: (
        <DialogProject recoverFormData={getDataFromDialog} onClose={closeDialog} />
      ),
    })
  }

  async function getDataFromDialog(reason, formData) {
    let rFile
    let mapView
    let returnCondition

    switch (reason) {
      case 'importProject':
        UTIL.debugLog('Importando :', formData)
        //Si ya existe alguna base o punto de consumo pedimos confirmación de borrado
        if (TCB.BaseSolar.length > 0) {
          if (!confirm(t('Proyecto.MSG_confirmaReemplazo'))) return false
        }

        // Will get bases and tipoConsumo from solimp file
        returnCondition = await importProject(formData)

        if (!returnCondition.status) {
          alert(t(returnCondition.error))
          return false
        }

        //Fit map view to imported bases window
        mapView = map.getView()
        mapView.fit(TCB.origenDatosSolidar.getExtent())
        if (mapView.getZoom() > 18) mapView.setZoom(18)

        // State cleaning done here becasue importProject is not React
        setBases([])
        //Add imported bases to bases context
        for (let base of TCB.BaseSolar) {
          addTCBBaseToState(base)
        }
        // State cleaning done here because importProject is not React
        setTipoConsumo([])
        //Add imported tipoconsumo to consumption context
        for (let tipo of TCB.TipoConsumo) {
          addTCBTipoToState(tipo)
        }

        //Compute economico if there are bases and consumos
        if (TCB.BaseSolar.length > 0 && TCB.TipoConsumo.length > 0) {
          await PreparaEnergyBalance()
          setEcoData(TCB.economico)
        }

        //SLDRAlert(t('Proyecto.MSG_success'), 'ABC', 'Info')
        alert(TCB.i18next.t('Proyecto.MSG_success'))
        break

      case 'exportProject':
        UTIL.debugLog('Exportando :', formData)
        //If any proyecto property has been edited it will be included in solimp file
        for (let key in formData) {
          TCB[key] = formData[key]
        }
        rFile = await exportProject()
        //REVISAR: se genera loop infinito de renderizacion
        //SLDRAlert(t('Fichero generado'), rFile, 'Info')
        alert(t('Fichero generado -> ') + rFile)
        break
      case 'save':
        for (let key in formData) {
          TCB[key] = formData[key]
        }
        break
      default:
        break
    }
    closeDialog()
  }

  return (
    <>
      <IconButton
        color={'inherit'}
        aria-label={t('APP_FRAME.IMPORT_EXPORT')}
        title={t('APP_FRAME.IMPORT_EXPORT')}
        onClick={openDialogProject}
      >
        <ImportExport />
      </IconButton>
    </>
  )
}
