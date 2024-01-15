import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'

// MUI objects
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Download from '@mui/icons-material/Download'
import Print from '@mui/icons-material/Print'
import { Button } from '@mui/material'

//
import { GeneraInformePDF } from './GeneraInformePDF'
import MonthEnergyBalance from '../EnergyBalance/MonthEnergyBalance'

// Solidar objects
import TCB from '../classes/TCB'

export default function FinalNote() {
  const { t } = useTranslation()
  // const graph_1 = useRef()

  // const [reporting, setReporting] = useState(false)

  function printSummary() {
    window.print()
  }

  function pdfSummary() {
    console.log('PDFSUMMARY') //, value)
    // setReporting(value)
    GeneraInformePDF()
  }

  // useEffect(() => {
  //   console.log('USEEFFECT FINALNOTE', graph_1.current)
  //   TCB.globalChartContainer.graph_1 = graph_1.current
  // }, [])

  return (
    <>
      <Container>
        <Button
          variant="contained"
          startIcon={<Print />}
          size="large"
          onClick={printSummary}
        >
          {t('SUMMARY.LABEL_PRINT')}
        </Button>
        <Button
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

        {/* REVISAR: Esto esta aqui para poder copiar el grafico al pdf usando plotly.toimage
        <div ref={graph_1}>
          {/* {style={{ display: 'none' }}> 
          <MonthEnergyBalance></MonthEnergyBalance>
        </div> */}

        <Typography variant="h4">{t('BASIC.LABEL_AVISO')}</Typography>
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('SUMMARY.LABEL_disclaimer1'),
          }}
        />
        <Typography
          variant="body"
          dangerouslySetInnerHTML={{
            __html: t('SUMMARY.LABEL_disclaimer2'),
          }}
        />
        {/* {reporting && ( 
        <>
          {console.log('A GENERA INFORM')}
          <GeneraInformePDF pdfSummary={pdfSummary} />
        </>
         )} */}
      </Container>
    </>
  )
}
