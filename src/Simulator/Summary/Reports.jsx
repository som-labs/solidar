import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import { forwardRef } from 'react'

// MUI objects
import Container from '@mui/material/Container'
import Download from '@mui/icons-material/Download'
import Print from '@mui/icons-material/Print'
import { Button } from '@mui/material'

//
import { GeneraInformePDF } from './GeneraInformePDF'
import { exportProject } from '../Project/ImportExport'
import { useDialog } from '../../components/DialogProvider'
import ReportSOM from './Report/ReportSOM'

// eslint-disable-next-line react/display-name
const Reports = forwardRef((props, ref) => {
  const { t } = useTranslation()

  const [openDialog, closeDialog] = useDialog()

  const printSummary = useReactToPrint({
    content: () => ref.current,
  })

  //window.print()

  function pdfSummary() {
    GeneraInformePDF()
  }

  function SOMSummary() {
    openDialog({
      children: <ReportSOM fullScreen={true} onClose={closeDialog}></ReportSOM>,
    })
  }

  return (
    <Container>
      <Button
        sx={{ mr: '1rem' }}
        variant="contained"
        startIcon={<Print />}
        size="large"
        onClick={printSummary}
      >
        {t('SUMMARY.LABEL_PRINT')}
      </Button>
      <Button
        sx={{ mr: '1rem' }}
        variant="contained"
        startIcon={<Download />}
        size="large"
        onClick={
          pdfSummary
          // setReporting(true)
        }
      >
        {t('SUMMARY.LABEL_PDF_REPORT')}
      </Button>
      <Button sx={{ mr: '1rem' }} variant="contained" size="large" onClick={SOMSummary}>
        {t('SUMMARY.LABEL_SOM_REPORT')}
      </Button>
      <Button variant="contained" size="large" onClick={exportProject}>
        {t('Proyecto.LABEL.exportarProyecto')}
      </Button>
    </Container>
  )
})

export default Reports
