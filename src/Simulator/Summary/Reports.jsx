import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

// MUI objects
import Container from '@mui/material/Container'
import Download from '@mui/icons-material/Download'
import { Button } from '@mui/material'

//
import { GeneraInformePDF } from './GeneraInformePDF'
//import { ExportProject } from '../Project/ImportExport'
import { useDialog } from '../../components/DialogProvider'
import ReportSOM from './Report/ReportSOM'

// REACT Solidar Components
import { EconomicContext } from '../EconomicContext'
import { BasesContext } from '../BasesContext'
import { EnergyContext } from '../EnergyContext'

import TCB from '../classes/TCB'
// eslint-disable-next-line react/display-name
export default function Reports() {
  const { t } = useTranslation()
  // const { consumoGlobal, produccionGlobal, balanceGlobal } = useContext(EnergyContext)
  // const { bases } = useContext(BasesContext)
  // const { economicoGlobal } = useContext(economicoGlobal)
  const [openDialog, closeDialog] = useDialog()

  function pdfSummary() {
    GeneraInformePDF()
  }

  function SOMSummary() {
    openDialog({
      children: <ReportSOM fullScreen={true} onClose={closeDialog}></ReportSOM>,
    })
  }

  return (
    <Container sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Button
        sx={{ mr: '1rem' }}
        variant="contained"
        startIcon={<Download />}
        size="large"
        onClick={pdfSummary}
      >
        {t('SUMMARY.LABEL_PDF_REPORT')}
      </Button>
      <Button sx={{ mr: '1rem' }} variant="contained" size="large" onClick={SOMSummary}>
        {t('SUMMARY.LABEL_SOM_REPORT')}
      </Button>
      {/* <Button variant="contained" size="large" onClick={ExportProject}>
        {t('Proyecto.LABEL.exportarProyecto')}
      </Button> */}
    </Container>
  )
}
